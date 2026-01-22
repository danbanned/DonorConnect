// app/api/ai/route.js
import { NextResponse } from 'next/server';
import donorDataContext from '../../../lib/donordatacontext.js';

// Helper to get organization ID from request
function getOrganizationId(request) {
  const url = new URL(request.url);
  const orgId = url.searchParams.get('orgId') || 
                request.headers.get('x-org-id') || 
                'default-org';
  return orgId;
}


// AI Helper Functions
function calculateDonorHealth(donorData) {
  if (!donorData || !donorData.summary) return 50;
  
  const { summary } = donorData;
  let score = 50;
  
  // Recency of last donation
  if (summary.lastDonation) {
    const daysSinceDonation = Math.floor((new Date() - new Date(summary.lastDonation.date)) / (1000 * 60 * 60 * 24));
    if (daysSinceDonation <= 30) score += 25;
    else if (daysSinceDonation <= 90) score += 15;
    else if (daysSinceDonation <= 180) score += 5;
  }
  
  // Total donations
  if (summary.totalDonations > 10000) score += 25;
  else if (summary.totalDonations > 5000) score += 20;
  else if (summary.totalDonations > 1000) score += 15;
  else if (summary.totalDonations > 500) score += 10;
  else if (summary.totalDonations > 100) score += 5;
  
  // Communication frequency
  if (summary.communicationCount > 10) score += 25;
  else if (summary.communicationCount > 5) score += 15;
  else if (summary.communicationCount > 2) score += 10;
  else if (summary.communicationCount > 0) score += 5;
  
  // Activity recency
  if (summary.recentActivity && summary.recentActivity.length > 0) {
    const recentActivity = summary.recentActivity[0];
    const daysSinceActivity = Math.floor((new Date() - new Date(recentActivity.createdAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity <= 7) score += 25;
    else if (daysSinceActivity <= 30) score += 15;
    else if (daysSinceActivity <= 90) score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

function determineEngagementLevel(donorData) {
  const score = calculateDonorHealth(donorData);
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'very_low';
}

function generateRecommendations(donorData) {
  const recommendations = [];
  const healthScore = calculateDonorHealth(donorData);
  
  if (healthScore < 60) {
    recommendations.push({
      priority: 'high',
      action: 'reengagement',
      title: 'Re-engage Donor',
      description: 'Donor engagement is low. Send personalized update.'
    });
  }
  
  if (donorData.summary?.lastDonation) {
    const daysSince = Math.floor((new Date() - new Date(donorData.summary.lastDonation.date)) / (1000 * 60 * 60 * 24));
    if (daysSince > 365) {
      recommendations.push({
        priority: 'high',
        action: 'lapsed_outreach',
        title: 'Reconnect with Lapsed Donor',
        description: 'Donor hasn\'t given in over a year.'
      });
    } else if (daysSince > 180 && donorData.summary.totalDonations > 100) {
      recommendations.push({
        priority: 'medium',
        action: 'upgrade_ask',
        title: 'Consider Upgrade',
        description: 'Regular donor may be ready for increased giving.'
      });
    }
  }
  
  if (donorData.summary?.communicationCount === 0) {
    recommendations.push({
      priority: 'medium',
      action: 'initial_contact',
      title: 'Establish Communication',
      description: 'No communication history. Send welcome message.'
    });
  }
  
  return recommendations;
}

function predictNextDonation(donorData) {
  if (!donorData.summary?.lastDonation) return null;
  
  const lastDonationDate = new Date(donorData.summary.lastDonation.date);
  const averageDaysBetween = 90; // Default assumption
  
  const nextDonationDate = new Date(lastDonationDate);
  nextDonationDate.setDate(nextDonationDate.getDate() + averageDaysBetween);
  
  return {
    predictedDate: nextDonationDate.toISOString().split('T')[0],
    confidence: 65,
    factors: ['historical_pattern', 'giving_frequency']
  };
}

function predictNextMonth(stats) {
  if (!stats.monthlyTrend || stats.monthlyTrend.length === 0) {
    return { amount: 0, confidence: 0 };
  }
  
  const recentMonths = stats.monthlyTrend.slice(0, 3);
  const total = recentMonths.reduce((sum, month) => sum + (month._sum?.amount || 0), 0);
  const average = total / recentMonths.length;
  
  // Simple seasonality adjustment
  const currentMonth = new Date().getMonth();
  const nextMonth = (currentMonth + 1) % 12;
  const seasonality = getSeasonalityFactor(nextMonth);
  
  return {
    amount: Math.round(average * seasonality),
    confidence: Math.min(85, 50 + (recentMonths.length * 10)),
    seasonalityFactor: seasonality
  };
}

function getSeasonalityFactor(month) {
  const factors = {
    0: 1.1, 1: 0.9, 2: 1.0, 3: 1.0, 4: 0.95, 5: 0.9,
    6: 0.85, 7: 0.9, 8: 1.0, 9: 1.2, 10: 1.3, 11: 1.4
  };
  return factors[month] || 1.0;
}

function calculateConfidence(stats) {
  if (!stats.monthlyTrend) return 0;
  
  const monthsWithData = stats.monthlyTrend.filter(m => m._sum?.amount > 0).length;
  const consistency = calculateConsistency(stats.monthlyTrend);
  
  return Math.min(100, (monthsWithData * 10) + (consistency * 40));
}

function calculateConsistency(monthlyTrend) {
  if (monthlyTrend.length < 2) return 0;
  
  const amounts = monthlyTrend.map(m => m._sum?.amount || 0).filter(a => a > 0);
  if (amounts.length < 2) return 0;
  
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;
  
  // Coefficient of variation (lower = more consistent)
  return Math.max(0, 1 - cv);
}

function identifyKeyFactors(stats) {
  const factors = [];
  
  if (stats.total?._count < 50) factors.push('small_sample_size');
  if (stats.monthlyTrend && stats.monthlyTrend.length < 6) factors.push('limited_history');
  
  // Check for seasonality
  if (stats.monthlyTrend && stats.monthlyTrend.length >= 12) {
    const currentMonth = new Date().getMonth();
    const lastYearSameMonth = stats.monthlyTrend.find(m => {
      const date = new Date(m.date);
      return date.getMonth() === currentMonth && date.getFullYear() === new Date().getFullYear() - 1;
    });
    
    if (lastYearSameMonth && lastYearSameMonth._sum?.amount > 0) {
      factors.push('seasonal_pattern');
    }
  }
  
  if (stats.averageDonation > 1000) factors.push('high_value_donations');
  if (stats.stats && stats.stats.some(s => s.paymentMethod === 'RECURRING')) {
    factors.push('recurring_donations');
  }
  
  return factors;
}

function generateAIRecommendations(donors, activities) {
  const recommendations = [];
  
  if (donors.length < 100) {
    recommendations.push({
      priority: 'high',
      category: 'acquisition',
      title: 'Expand Donor Base',
      description: `Only ${donors.length} donors. Focus on acquisition campaigns.`,
      expectedImpact: 'high'
    });
  }
  
  const activeDonors = donors.filter(d => d.status === 'ACTIVE').length;
  const activationRate = donors.length > 0 ? (activeDonors / donors.length) * 100 : 0;
  
  if (activationRate < 70) {
    recommendations.push({
      priority: 'medium',
      category: 'activation',
      title: 'Increase Donor Activation',
      description: `Only ${activationRate.toFixed(1)}% of donors are active.`,
      expectedImpact: 'medium'
    });
  }
  
  const recentActivity = activities.filter(a => {
    const daysAgo = (new Date() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  }).length;
  
  if (recentActivity < 20) {
    recommendations.push({
      priority: 'medium',
      category: 'engagement',
      title: 'Boost Engagement',
      description: `Only ${recentActivity} activities in the last 30 days.`,
      expectedImpact: 'medium'
    });
  }
  
  return recommendations;
}

// Main API Handlers
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const method = url.searchParams.get('method');
    const orgId = getOrganizationId(request);

    if (!method) {
      return NextResponse.json(
        { error: 'Method parameter required' },
        { status: 400 }
      );
    }

    let result;

    switch (method) {
      case 'health':
        result = await donorDataContext.healthCheck();
        break;

      case 'donorSummary':
        const donorId = url.searchParams.get('donorId');
        if (!donorId) {
          return NextResponse.json(
            { error: 'donorId parameter required' },
            { status: 400 }
          );
        }
        result = await donorDataContext.models.Donor.getDonorSummary(donorId);
        break;

      case 'donationStats':
        const filtersParam = url.searchParams.get('filters');
        const filters = filtersParam ? JSON.parse(filtersParam) : {};
        result = await donorDataContext.models.Donation.getDonationStats(orgId, filters);
        break;

      case 'recentDonations':
        const limit = parseInt(url.searchParams.get('limit') || '10');
        result = await donorDataContext.models.Donation.getRecentDonations(orgId, limit);
        break;

      case 'campaignStats':
        const campaignId = url.searchParams.get('campaignId');
        if (!campaignId) {
          return NextResponse.json(
            { error: 'campaignId parameter required' },
            { status: 400 }
          );
        }
        result = await donorDataContext.models.Campaign.getCampaignStats(campaignId);
        break;

      case 'organizationActivity':
        const activityLimit = parseInt(url.searchParams.get('limit') || '20');
        result = await donorDataContext.models.ActivityFeed.getOrganizationActivity(orgId, activityLimit);
        break;

      case 'donorTimeline':
        const timelineDonorId = url.searchParams.get('donorId');
        if (!timelineDonorId) {
          return NextResponse.json(
            { error: 'donorId parameter required' },
            { status: 400 }
          );
        }
        result = await donorDataContext.models.DonorActivity.getDonorTimeline(timelineDonorId);
        break;

      case 'upcomingMeetings':
        const userId = url.searchParams.get('userId') || '';
        result = await donorDataContext.models.Meeting.getUpcomingMeetings(userId, orgId);
        break;

      case 'pendingTasks':
        const taskUserId = url.searchParams.get('userId') || '';
        result = await donorDataContext.models.Task.getPendingTasks(taskUserId, orgId);
        break;

        // Add to switch statement
        case 'generateFakeDonorData':
        return NextResponse.json(await generateFakeDonorData());

      case 'searchDonors':
        const searchTerm = url.searchParams.get('searchTerm') || '';
        const searchFilters = url.searchParams.get('filters') || '{}';
        const parsedFilters = JSON.parse(searchFilters);
        result = await donorDataContext.models.Donor.searchDonors(orgId, searchTerm, parsedFilters);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown method: ${method}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { method, params = {} } = body;
    const orgId = getOrganizationId(request);

    if (!method) {
      return NextResponse.json(
        { error: 'Method parameter required' },
        { status: 400 }
      );
    }

    let result;

    switch (method) {
      case 'batch':
        const operations = params.operations || [];
        const batchResults = [];
        
        for (const op of operations) {
          switch (op.type) {
            case 'getDonorSummary':
              const donorResult = await donorDataContext.models.Donor.getDonorSummary(op.donorId);
              batchResults.push({ type: op.type, data: donorResult });
              break;
            case 'getDonationStats':
              const statsResult = await donorDataContext.models.Donation.getDonationStats(orgId, op.filters || {});
              batchResults.push({ type: op.type, data: statsResult });
              break;
            case 'getOrganizationActivity':
              const activityResult = await donorDataContext.models.ActivityFeed.getOrganizationActivity(orgId, op.limit || 20);
              batchResults.push({ type: op.type, data: activityResult });
              break;
            default:
              batchResults.push({ type: op.type, error: 'Unknown operation type' });
          }
        }
        result = batchResults;
        break;

      case 'aiInitialize':
        const [donors, donations, campaigns, activities] = await Promise.all([
          donorDataContext.models.Donor.findMany({ 
            where: { organizationId: orgId },
            take: 100
          }),
          donorDataContext.models.Donation.getRecentDonations(orgId, 50),
          donorDataContext.models.Campaign.findMany({
            where: { organizationId: orgId },
            take: 10
          }),
          donorDataContext.models.ActivityFeed.getOrganizationActivity(orgId, 50)
        ]);

        result = {
          donors: donors.length,
          donations: donations.length,
          campaigns: campaigns.length,
          recentActivity: activities.length,
          summary: {
            totalDonors: await donorDataContext.models.Donor.count({ where: { organizationId: orgId } }),
            totalDonations: await donorDataContext.models.Donation.count({ where: { organizationId: orgId } }),
            activeCampaigns: await donorDataContext.models.Campaign.count({ 
              where: { 
                organizationId: orgId,
                status: 'ACTIVE'
              }
            })
          }
        };
        break;

      case 'analyzeDonor':
        const donorData = await donorDataContext.models.Donor.getDonorSummary(params.donorId);
        result = {
          healthScore: calculateDonorHealth(donorData),
          engagementLevel: determineEngagementLevel(donorData),
          recommendations: generateRecommendations(donorData),
          predictedNextDonation: predictNextDonation(donorData),
          analysisDate: new Date().toISOString()
        };
        break;

      case 'predictDonations':
        const stats = await donorDataContext.models.Donation.getDonationStats(orgId);
        const prediction = predictNextMonth(stats);
        result = {
          nextMonth: prediction,
          confidence: calculateConfidence(stats),
          factors: identifyKeyFactors(stats),
          historicalDataPoints: stats.monthlyTrend?.length || 0
        };
        break;

      case 'getRecommendations':
        const [orgDonors, orgActivities] = await Promise.all([
          donorDataContext.models.Donor.findMany({
            where: { organizationId: orgId },
            take: 50
          }),
          donorDataContext.models.ActivityFeed.getOrganizationActivity(orgId, 100)
        ]);
        result = {
          recommendations: generateAIRecommendations(orgDonors, orgActivities),
          metrics: {
            totalDonors: orgDonors.length,
            recentActivities: orgActivities.filter(a => {
              const daysAgo = (new Date() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24);
              return daysAgo <= 30;
            }).length,
            activeDonors: orgDonors.filter(d => d.status === 'ACTIVE').length
          }
        };
        break;

      case 'simulationData':
        const simulationParams = params;
        const [simDonors, simDonations, simActivities] = await Promise.all([
          donorDataContext.models.Donor.withRelations({
            where: { organizationId: orgId },
            take: simulationParams.donorLimit || 50
          }),
          donorDataContext.models.Donation.withRelations({
            where: { organizationId: orgId },
            take: simulationParams.donationLimit || 100,
            orderBy: { date: 'desc' }
          }),
          donorDataContext.models.ActivityFeed.findMany({
            where: { organizationId: orgId },
            take: simulationParams.activityLimit || 100,
            orderBy: { createdAt: 'desc' }
          })
        ]);

        result = {
          donors: simDonors,
          donations: simDonations,
          activities: simActivities,
          metadata: {
            fetchedAt: new Date().toISOString(),
            organizationId: orgId,
            counts: {
              donors: simDonors.length,
              donations: simDonations.length,
              activities: simActivities.length
            }
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown method: ${method}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('POST API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


// app/api/ai/route.js - Add this handler
async function generateFakeDonorData() {
  try {
    // Use OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/openai/generate-donor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate realistic fake donor data with: first name, last name, email, phone, address, city, state, zip code, interests (2-4 from: Education, Arts, Healthcare, Environment, Youth Programs, Community Development, Scholarships, Technology), preferredCommunication (email/phone/mail/ANY), notes (1-2 sentences), tags (1-2 from: Major Donor, Recurring, Volunteer, Board Member, Alumni, Parent, Community Partner). Make it diverse and realistic.`
        })
      });
      
      const data = await response.json();
      if (data.success) {
        return data;
      }
    }
    
    // Fallback to local generation
    return {
      success: true,
      data: generateFallbackDonorDataLocal()
    };
    
  } catch (error) {
    console.error('Error generating fake donor data:', error);
    return {
      success: false,
      error: error.message,
      fallback: true,
      data: generateFallbackDonorDataLocal()
    };
  }
}

function generateFallbackDonorDataLocal() {
  // Same fallback generation as above
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    address: `${Math.floor(Math.random() * 9999) + 1} Main St`,
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    interests: ['Education', 'Youth Programs'],
    preferredCommunication: 'email',
    notes: `${firstName} ${lastName} is interested in supporting education initiatives.`,
    tags: ['Community Partner']
  };
}

