// app/api/ai/route.js - Main AI API endpoint
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db'

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
};

const rateLimitStore = new Map();



export async function POST(request) {
  console.log('=== AI API POST REQUEST DEBUG ===');

  // Log headers
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Headers:', headers);

  try {
    // Get organization ID from headers
    const orgId = request.headers.get('x-org-id') || 
                  request.headers.get('organization-id') || 
                  'default-org';

          console.log('Organization ID:', orgId);
                  
    const requestClone = request.clone();
    
    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.windowMs;
    
    const requests = (rateLimitStore.get(ip) || []).filter(time => time > windowStart);
    if (requests.length >= RATE_LIMIT.maxRequests) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    requests.push(now);
    rateLimitStore.set(ip, requests);

    // Parse request body
    // Parse request body
   
      let method;
let params = {};

try {
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);

    method = searchParams.get('method');
    params = Object.fromEntries(searchParams.entries());

  } else {
    const body = await request.json();

    method = body.method;
    params = body.params || {};
  }
} catch (err) {
  console.error('❌ Failed to parse AI request:', err);

  return NextResponse.json(
    {
      success: false,
      error: 'Invalid request format',
      details: err.message
    },
    { status: 400 }
  );
}

console.log('🤖 AI METHOD:', method);
console.log('📦 AI PARAMS:', params);

   

    // Check if method exists
    
    console.log('Extracted method:', method);
    console.log('Extracted params:', params);
    
    if (!method) {
      console.error('❌ No method provided in request body');
      console.error('Full body received:', body);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Method parameter is required in request body',
          receivedBody: body,
          expectedFormat: {
            method: 'string (e.g., "generateBrief")',
            params: 'object (optional)'
          }
        },
        { status: 400 }
      );
    }
    
    console.log(`🤖 AI API: ${method} called for org ${orgId}`, params);

    // Route to appropriate method handler
    let result;
    switch (method) {
      // Your existing methods
      case 'predictions':
        result = await handlePredictions(orgId, params);
        break;
      
      case 'recommendations':
        result = await handleRecommendations(orgId, params);
        break;
      
      case 'health':
        result = await handleHealthCheck(orgId, params);
        break;
      
      // Data Generation Methods
      case 'generateFakeDonorData':
        console.log(`📊 Handling organizationActivity for org ${orgId} with limit ${params.limit}`);
        result = await generateFakeDonorData(orgId, params);
        console.log(`📊 organizationActivity result:`, result.success ? 'Success' : result.error);
        break;
      case 'generateDonorData':
        result = await generateDonorData(orgId, params);
        break;
      
      // Simulation Methods
      case 'startSimulation':
        result = await startSimulation(orgId, params);
        break;
      case 'stopSimulation':
        result = await stopSimulation(orgId, params);
        break;
      case 'pauseSimulation':
        result = await pauseSimulation(orgId, params);
        break;
      case 'getSimulationStats':
        result = await getSimulationStats(orgId, params);
        break;
      case 'getSimulatedActivities':
        result = await getSimulatedActivities(orgId, params);
        break;
      case 'simulateDonor':
        result = await simulateDonor(orgId, params);
        break;

            // Add this to your existing switch statement in the POST handler
      case 'getRoleplaySessions':
        result = await getRoleplaySessions(orgId, params);
        break;

      case 'generateBrief':  // Add this for DonorBrief
        result = await generateDonorBrief(orgId, params);
        console.log('📝 Handling generateBrief request');
        break;

      case 'analyzeDonor':  // Add this for AI analysis
        result = await analyzeDonor(orgId, params);
        break;
      
      // Bonding Methods
      case 'startRoleplay':
        result = await startRoleplay(orgId, params);
        break;
      case 'askDonor':
        result = await askDonor(orgId, params);
        break;
      
      // Data Methods
      case 'aiInitialize':
        result = await aiInitialize(orgId, params);
        break;
      case 'simulationData':
        result = await getSimulationData(orgId, params);
        break;
      case 'donorSummary':
        result = await getDonorSummary(orgId, params);
        break;
      case 'donationStats':
        result = await getDonationStats(orgId, params);
        break;
      case 'organizationActivity':
        result = await getOrganizationActivity(orgId, params);
        break;
      case 'quickSimulate':
        result = await quickSimulate(orgId, params);
        break;
      case 'batch':
        result = await handleBatchOperations(orgId, params);
        break;
      
     default:
        console.log(`❌ Unknown method: ${method}`);
        return NextResponse.json(
          { 
            success: false, 
            error: `Unknown method: ${method}`,
            availableMethods: [
              'generateBrief',
              'donorSummary',
              'predictions',
              'recommendations',
              'health',
              'getRoleplaySessions',
              'startRoleplay',
              'analyzeDonor'
              // Add others
            ]
          },
          { status: 400 }
        );
    }
    
    console.log(`✅ ${method} completed successfully`);
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI API Error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET handler for methods that don't need POST
// GET handler for methods that don't need POST
export async function GET(request) {
  try {
    // Get organization ID from headers
    const orgId = request.headers.get('x-org-id') || 'default-org';

    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method');

    // Parse params from query string
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'method') {
        try {
          params[key] = JSON.parse(value);
        } catch {
          params[key] = value;
        }
      }
    }

    // Attach orgId if needed for older endpoints
    if (!params.orgId) params.orgId = orgId;

    // First, handle AI methods
    const aiMethods = ['generateBrief', 'getRoleplaySessions'];
    if (aiMethods.includes(method)) {
      return handleAIMethod(method, params);
    }

    // Then handle your existing GET endpoints
    let result;
    switch (method) {
      case 'health':
        result = await handleHealthCheck(orgId, params);
        break;

      case 'getSimulationStats':
        result = await getSimulationStats(orgId, params);
        break;

      case 'getSimulatedActivities':
        result = await getSimulatedActivities(orgId, params);
        break;

      case 'donorSummary':
        result = await getDonorSummary(orgId, params);
        break;

      case 'donationStats':
        result = await getDonationStats(orgId, params);
        break;

      default:
        if (!method) {
          // Default GET response (health check)
          return NextResponse.json({
            success: true,
            message: 'AI API is running',
            timestamp: new Date().toISOString(),
            endpoints: [
              'POST /api/ai - Main AI endpoint with method parameter',
              'GET /api/ai - Health check',
              'GET /api/ai?method=health - Health check with details',
              'GET /api/ai?method=getSimulationStats - Get simulation stats',
              'GET /api/ai?method=getSimulatedActivities - Get simulated activities',
              'GET /api/ai?method=donorSummary&donorId=xxx - Get donor summary',
              'GET /api/ai?method=donationStats - Get donation statistics',
              'GET /api/ai?method=generateBrief&donorId=xxx - Generate donor brief'
            ]
          });
        }
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
    console.error('AI API GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}


// ============================================
// YOUR EXISTING HANDLER FUNCTIONS (UPDATED)
// ============================================

async function handlePredictions(orgId, params) {
  const { timeframe = 'next_quarter' } = params;
  
  console.log(`📊 Generating predictions for ${timeframe}, org: ${orgId}`);
  
  // Get actual data for predictions
  const donationStats = await prisma.donation.aggregate({
    where: { 
      organizationId: orgId,
      date: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      }
    },
    _sum: { amount: true },
    _count: true
  });
  
  // Enhanced prediction logic with real data
  const baseAmount = donationStats._sum.amount || 50000;
  const growthFactor = 1.1 + (Math.random() * 0.2); // 10-30% growth
  
  return {
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
    prediction: Math.floor(baseAmount * growthFactor),
    timeframe,
    generatedAt: new Date().toISOString(),
    factors: [
      'Historical donation patterns',
      'Current donor engagement levels',
      'Seasonal fundraising trends',
      'Economic indicators',
      'Campaign effectiveness'
    ],
    breakdown: {
      newDonors: Math.floor(Math.random() * 30) + 10,
      returningDonors: Math.floor(Math.random() * 40) + 20,
      majorGifts: Math.floor(Math.random() * 5) + 1,
      monthlyRecurring: Math.floor(Math.random() * 15) + 5
    },
    recommendations: [
      'Focus on re-engaging LYBUNT donors',
      'Launch a monthly giving campaign',
      'Personalize outreach to top 20% donors'
    ],
    basedOnData: {
      recentAmount: baseAmount,
      recentCount: donationStats._count,
      dataPoints: donationStats._count
    }
  };
}

async function handleRecommendations(orgId, params) {
  const { limit = 5 } = params;
  
  console.log(`💡 Generating recommendations for org: ${orgId}, limit: ${limit}`);
  
  // Get actual data for recommendations
  const donorStats = await prisma.donor.count({
    where: { organizationId: orgId }
  });
  
  const recentDonations = await prisma.donation.aggregate({
    where: { 
      organizationId: orgId,
      date: {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
      }
    },
    _count: true
  });
  
  // Enhanced recommendations based on real data
  const allRecommendations = [
    {
      id: 1,
      title: 'Re-engage LYBUNT donors',
      description: `${Math.floor(donorStats * 0.3)} donors from last year haven't donated this year. Target them with a special appeal before year-end.`,
      priority: 'high',
      impact: 'high',
      estimatedValue: Math.floor(recentDonations._count * 150), // $150 per donor
      timeframe: '30 days',
      actionItems: [
        'Create personalized email sequence',
        'Schedule follow-up calls',
        'Offer matching gift incentive'
      ],
      dataBased: true
    },
    {
      id: 2,
      title: 'Increase monthly giving program',
      description: 'Only 15% of donors are monthly givers. Promote recurring donations in your next campaign.',
      priority: 'medium',
      impact: 'medium',
      estimatedValue: 15000,
      timeframe: '60 days',
      actionItems: [
        'Add recurring option to donation forms',
        'Create monthly donor benefits page',
        'Send "Why monthly?" testimonial emails'
      ]
    },
    {
      id: 3,
      title: 'Personalize major donor outreach',
      description: '12 donors have high capacity but haven\'t been contacted in 6 months.',
      priority: 'high',
      impact: 'high',
      estimatedValue: 30000,
      timeframe: '14 days',
      actionItems: [
        'Research donor interests and capacity',
        'Schedule personal meetings',
        'Create customized proposal packages'
      ]
    },
    {
      id: 4,
      title: 'Optimize donation page',
      description: 'Your donation form has a 35% abandonment rate. Simple UX improvements could increase conversions.',
      priority: 'medium',
      impact: 'medium',
      estimatedValue: 12000,
      timeframe: '45 days',
      actionItems: [
        'Simplify form fields',
        'Add trust indicators',
        'Implement exit-intent popup'
      ]
    },
    {
      id: 5,
      title: 'Launch peer-to-peer campaign',
      description: 'Your donor network is highly engaged. A peer-to-peer campaign could expand reach significantly.',
      priority: 'low',
      impact: 'high',
      estimatedValue: 40000,
      timeframe: '90 days',
      actionItems: [
        'Identify potential ambassadors',
        'Create campaign toolkit',
        'Set up referral tracking'
      ]
    },
    {
      id: 6,
      title: 'Improve donor retention',
      description: 'First-year donor retention is below industry average. Implement a welcome series for new donors.',
      priority: 'high',
      impact: 'medium',
      estimatedValue: 18000,
      timeframe: '30 days',
      actionItems: [
        'Create welcome email sequence',
        'Send impact report after 30 days',
        'Make thank-you calls to new donors'
      ]
    }
  ];
  
  return {
    recommendations: allRecommendations.slice(0, limit),
    generatedAt: new Date().toISOString(),
    totalRecommendations: allRecommendations.length,
    filtersApplied: { orgId, limit },
    dataSummary: {
      totalDonors: donorStats,
      recentDonations: recentDonations._count
    }
  };
}

async function handleHealthCheck(orgId, params) {
  console.log('🏥 Health check requested');
  
  // Check database connection
  let dbStatus = 'healthy';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'unhealthy';
    console.error('Database health check failed:', error);
  }
  
  return {
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    apiVersion: '2.0.0',
    features: {
      predictions: true,
      recommendations: true,
      simulation: true,
      donorBonding: true,
      dataGeneration: true,
      batchOperations: true,
      rateLimiting: true
    },
    database: {
      status: dbStatus,
      provider: process.env.DATABASE_URL ? 'connected' : 'not configured'
    }
  };
}

// ============================================
// METHOD IMPLEMENTATIONS FROM PROVIDED FILE
// ============================================

// Add these functions after your existing helper functions

// Get active roleplay sessions
async function getRoleplaySessions(orgId, params) {
  const { donorId, limit = 10 } = params;
  
  console.log(`Getting roleplay sessions for org ${orgId}, donor ${donorId}`);
  
  // In a real app, you'd store sessions in a database
  // For now, return mock or empty sessions
  const mockSessions = donorId ? [
    {
      sessionId: `session_${Date.now()}`,
      donorId,
      donorName: 'Mock Donor',
      status: 'ACTIVE',
      startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      lastActivity: new Date().toISOString(),
      messageCount: 5
    }
  ] : [];
  
  return {
    sessions: mockSessions,
    count: mockSessions.length,
    lastUpdated: new Date().toISOString()
  };
}

// Generate donor brief (for DonorBrief component)
async function generateDonorBrief(orgId, params) {
  const { donorId, context = 'meeting_preparation' } = params;
  
  console.log(`Generating donor brief for ${donorId}, context: ${context}`);
  
  try {
    const { donorId, context = 'meeting_preparation' } = params;
    
    if (!donorId) {
      throw new Error('donorId is required');
    }

    console.log('Fetching donor summary for:', donorId);

    // Get donor data first
    const donorSummary = await getDonorSummary(orgId, { donorId });
    
    if (!donorSummary || !donorSummary.donor) {
      throw new Error(`Donor ${donorId} not found`);
    }
    
    const donor = donorSummary.donor;
    const stats = donorSummary.stats;
    const activity = donorSummary.recentActivity || [];
    
    // Generate AI insights
    const aiInsights = await generateAIInsights(donor, stats, activity, context);
    
    
    return {
      donor,
      stats,
      activity,
      aiInsights,
      context,
      generatedAt: new Date().toISOString(),
      sections: {
        overview: true,
        givingHistory: true,
        communication: true,
        recommendations: true,
        talkingPoints: true,
        notes: true
      }
    };
  } catch (error) {
    console.error('Error generating donor brief:', error);
    
    // Return fallback data
    return {
      donor: {
        id: donorId,
        name: 'Sample Donor',
        email: 'donor@example.com',
        status: 'ACTIVE',
        relationshipStage: 'ENGAGED',
        notes: 'Important donor with consistent giving history.'
      },
      stats: {
        totalDonations: 5000,
        donationCount: 8,
        lastDonation: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        avgDonation: 625,
        givingFrequency: 'QUARTERLY'
      },
      activity: [
        {
          type: 'DONATION',
          amount: 750,
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Quarterly donation'
        }
      ],
      aiInsights: {
        recommendations: [
          {
            title: 'Personalized Meeting',
            description: 'Schedule a personal meeting to discuss program impact',
            priority: 'high',
            confidence: 92
          }
        ],
        suggestedAsk: 850,
        nextBestTime: 'Early next quarter',
        recommendedPurpose: 'Program expansion',
        isMock: true
      },
      generatedAt: new Date().toISOString(),
      isFallback: true,
      error: error.message
    };
  }
}

// Generate AI insights for donor
async function generateAIInsights(donor, stats, activity, context) {
  // Simple AI insights generation
  const total = stats.totalDonations || 0;
  const count = stats.donationCount || 0;
  const avg = stats.avgDonation || 0;
  const lastDonation = stats.lastDonation;
  
  // Calculate suggested ask
  let suggestedAsk = avg * 1.5; // 50% increase from average
  if (total > 10000) suggestedAsk = avg * 2; // 100% increase for major donors
  
  // Generate recommendations
  const recommendations = [];
  
  if (count === 0) {
    recommendations.push({
      title: 'First-time Donor Outreach',
      description: 'This donor hasn\'t made any donations yet. Consider a welcome package.',
      priority: 'high',
      confidence: 90,
      actionItems: ['Send welcome email', 'Schedule introductory call']
    });
  } else if (lastDonation) {
    const daysSinceLast = Math.floor((Date.now() - new Date(lastDonation).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLast > 365) {
      recommendations.push({
        title: 'Re-engage Lapsed Donor',
        description: `Donor hasn't given in ${Math.floor(daysSinceLast/30)} months. Time for re-engagement.`,
        priority: 'high',
        confidence: 85,
        actionItems: ['Send personalized re-engagement email', 'Offer matching gift opportunity']
      });
    } else if (daysSinceLast > 180) {
      recommendations.push({
        title: 'Check-in with Donor',
        description: 'Consider checking in with donor before next expected donation cycle.',
        priority: 'medium',
        confidence: 75,
        actionItems: ['Send impact update', 'Ask for feedback on programs']
      });
    }
  }
  
  if (total > 5000) {
    recommendations.push({
      title: 'Major Donor Stewardship',
      description: 'This donor has given significantly. Consider exclusive stewardship opportunities.',
      priority: 'high',
      confidence: 95,
      actionItems: ['Invite to exclusive event', 'Arrange meeting with leadership', 'Provide detailed impact report']
    });
  }
  
  // Add generic recommendations
  if (recommendations.length < 3) {
    recommendations.push({
      title: 'Personalized Thank You',
      description: 'Send a personalized thank you referencing their specific interests.',
      priority: 'medium',
      confidence: 80,
      actionItems: ['Draft personalized email', 'Include impact metrics specific to their interests']
    });
    
    recommendations.push({
      title: 'Increase Recurring Donation',
      description: 'Based on giving pattern, suggest moving to monthly recurring donation.',
      priority: 'medium',
      confidence: 70,
      actionItems: ['Prepare recurring donation proposal', 'Highlight convenience and impact']
    });
  }
  
  return {
    recommendations: recommendations.slice(0, 5), // Limit to 5
    suggestedAsk: Math.round(suggestedAsk),
    nextBestTime: 'Within the next 30 days',
    recommendedPurpose: 'General operating support',
    engagementScore: Math.floor(Math.random() * 30) + 70, // 70-100%
    interests: donor.interests || ['General'],
    communicationPreference: 'Email',
    bestContactTime: 'Weekday afternoons'
  };
}

// Analyze donor (for AI analysis)
async function analyzeDonor(orgId, params) {
  const { donorId } = params;
  
  console.log(`Analyzing donor ${donorId} for AI insights`);
  
  try {
    // Get donor data
    const donorData = await getDonorSummary(orgId, { donorId });
    
    if (!donorData) {
      throw new Error(`Donor ${donorId} not found`);
    }
    
    // Perform analysis
    const total = donorData.stats.totalDonations || 0;
    const count = donorData.stats.donationCount || 0;
    const avg = donorData.stats.avgDonation || 0;
    
    // Calculate engagement score
    let engagementScore = 50; // Base score
    
    if (count > 5) engagementScore += 20;
    if (total > 10000) engagementScore += 15;
    if (donorData.stats.communicationCount > 5) engagementScore += 10;
    if (donorData.donor.relationshipStage === 'ENGAGED') engagementScore += 5;
    
    engagementScore = Math.min(engagementScore, 100);
    
    // Determine engagement level
    let engagementLevel = 'LOW';
    if (engagementScore >= 80) engagementLevel = 'HIGH';
    else if (engagementScore >= 60) engagementLevel = 'MEDIUM';
    
    // Determine giving frequency
    let givingFrequency = 'OCCASIONAL';
    if (count >= 4) givingFrequency = 'QUARTERLY';
    if (count >= 12) givingFrequency = 'MONTHLY';
    
    // Suggest next best action
    let nextBestAction = 'Send thank you note';
    if (engagementScore < 40) nextBestAction = 'Re-engagement campaign';
    if (count === 0) nextBestAction = 'Welcome package';
    if (total > 5000) nextBestAction = 'Personal meeting invitation';
    
    // Suggest ask amount
    const suggestedAskAmount = avg > 0 ? Math.round(avg * 1.5) : 100;
    
    return {
      engagementScore,
      engagementLevel,
      givingFrequency,
      suggestedAskAmount,
      lastContact: donorData.stats.lastCommunication,
      nextBestAction,
      hasAIInsights: true,
      analysisDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing donor:', error);
    
    // Return fallback analysis
    return {
      engagementScore: 50,
      engagementLevel: 'MEDIUM',
      givingFrequency: 'QUARTERLY',
      suggestedAskAmount: 100,
      lastContact: null,
      nextBestAction: 'Send thank you note',
      hasAIInsights: false,
      isFallback: true,
      error: error.message
    };
  }
}

// Generate fake donor data
async function generateFakeDonorData(orgId, params) {
  const { count = 20, includeCommunications = true, includeDonations = true } = params;
  
  console.log(`Generating ${count} fake donors for org ${orgId}`);
  
  // First names for realistic data
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Margaret', 'Anthony', 'Betty', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Dorothy', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
  ];
  
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA'];
  
  const fakeDonors = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domains[Math.floor(Math.random() * domains.length)]}`;
    
    // Random donor type distribution
    const donorTypes = ['INDIVIDUAL', 'CORPORATE', 'FOUNDATION'];
    const typeWeights = [0.7, 0.2, 0.1]; // 70% individual, 20% corporate, 10% foundation
    
    let donorType = 'INDIVIDUAL';
    const rand = Math.random();
    if (rand < typeWeights[0]) donorType = 'INDIVIDUAL';
    else if (rand < typeWeights[0] + typeWeights[1]) donorType = 'CORPORATE';
    else donorType = 'FOUNDATION';
    
    // Create donor object
    const donor = {
      id: `fake_donor_${Date.now()}_${i}`,
      firstName,
      lastName,
      email,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Maple', 'Cedar'][Math.floor(Math.random() * 5)]} St`,
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: 'USA',
      type: donorType,
      status: 'ACTIVE',
      relationshipStage: Math.random() > 0.7 ? 'CULTIVATION' : Math.random() > 0.5 ? 'ASK_READY' : 'NEW',
      organizationId: orgId,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `${firstName} is interested in ${['education', 'healthcare', 'environment', 'arts'][Math.floor(Math.random() * 4)]} initiatives.`
    };
    
    fakeDonors.push(donor);
    
    // Optionally create donations
    if (includeDonations) {
      const donationCount = Math.floor(Math.random() * 5) + 1; // 1-5 donations per donor
      const donations = [];
      
      for (let j = 0; j < donationCount; j++) {
        const donationDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        const amount = Math.floor(Math.random() * 5000) + 50; // $50 - $5050
        
        donations.push({
          id: `fake_donation_${Date.now()}_${i}_${j}`,
          donorId: donor.id,
          amount,
          currency: 'USD',
          date: donationDate.toISOString(),
          status: 'COMPLETED',
          type: Math.random() > 0.7 ? 'RECURRING' : 'ONE_TIME',
          purpose: ['General Fund', 'Scholarship', 'Research', 'Emergency Relief'][Math.floor(Math.random() * 4)],
          paymentMethod: ['CREDIT_CARD', 'BANK_TRANSFER', 'CHECK'][Math.floor(Math.random() * 3)],
          organizationId: orgId,
          createdAt: donationDate.toISOString()
        });
      }
      
      donor.donations = donations;
    }
    
    // Optionally create communications
    if (includeCommunications) {
      const commCount = Math.floor(Math.random() * 3) + 1; // 1-3 communications
      const communications = [];
      
      for (let j = 0; j < commCount; j++) {
    const commDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Last 6 months
    const direction = Math.random() > 0.5 ? 'INBOUND' : 'OUTBOUND'; // Changed from 'INCOMING'/'OUTGOING'
    const type = direction === 'INBOUND' ? 
      ['EMAIL', 'PHONE', 'MEETING'][Math.floor(Math.random() * 3)] : 
      ['THANK_YOU', 'UPDATE', 'NEWSLETTER'][Math.floor(Math.random() * 3)];
        
        const subjects = {
          EMAIL: ['Question about donation', 'Program update request', 'Impact report feedback'],
          PHONE: ['Follow-up call', 'Thank you call', 'Annual check-in'],
          MEETING: ['Site visit', 'Board meeting', 'Program tour'],
          THANK_YOU: ['Thank you for your donation', 'Appreciation letter', 'Gratitude note'],
          UPDATE: ['Quarterly update', 'Program milestone', 'Success story'],
          NEWSLETTER: ['Monthly newsletter', 'Annual report', 'Impact digest']
        };
        
        const contents = {
          EMAIL: `Dear team, I had a question about the recent ${['scholarship program', 'research initiative', 'community project'][Math.floor(Math.random() * 3)]}.`,
          PHONE: `We spoke about the ${['upcoming campaign', 'recent donation', 'program visit'][Math.floor(Math.random() * 3)]}.`,
          MEETING: `Met to discuss ${['future collaboration', 'impact measurement', 'strategic planning'][Math.floor(Math.random() * 3)]}.`,
          THANK_YOU: `Thank you for your generous support of our ${['education program', 'healthcare initiative', 'environmental work'][Math.floor(Math.random() * 3)]}.`,
          UPDATE: `We're excited to share that our ${['program', 'initiative', 'campaign'][Math.floor(Math.random() * 3)]} has reached ${Math.floor(Math.random() * 1000)} beneficiaries.`,
          NEWSLETTER: `In this edition: ${['Success stories', 'Upcoming events', 'Volunteer opportunities'][Math.floor(Math.random() * 3)]}`
        };
        
        // ... rest of the code remains the same
        communications.push({
          id: `fake_comm_${Date.now()}_${i}_${j}`,
          donorId: donor.id,
          type,
          direction, // This will now be 'INBOUND' or 'OUTBOUND'
          subject: subjects[type] ? subjects[type][Math.floor(Math.random() * subjects[type].length)] : 'Communication',
          content: contents[type] || 'Communication content',
          timestamp: commDate.toISOString(),
          organizationId: orgId,
          status: 'COMPLETED',
          metadata: {
            sentiment: Math.random() > 0.3 ? 'POSITIVE' : Math.random() > 0.5 ? 'NEUTRAL' : 'NEGATIVE',
            followUpRequired: Math.random() > 0.7
          }
        });
      }
      
      donor.communications = communications;
    }}
  
  return {
    donors: fakeDonors,
    totalDonations: fakeDonors.reduce((sum, donor) => sum + (donor.donations?.length || 0), 0),
    totalCommunications: fakeDonors.reduce((sum, donor) => sum + (donor.communications?.length || 0), 0),
    generatedAt: new Date().toISOString()
  };
}

// Alias for generateDonorData (calls the same function)
async function generateDonorData(orgId, params) {
  return generateFakeDonorData(orgId, params);
}

// Start simulation
async function startSimulation(orgId, params) {
  const { 
    donorLimit = 20, 
    speed = 'normal', 
    activityTypes = ['donations', 'communications'],
    resume = false 
  } = params;
  
  console.log(`Starting simulation for org ${orgId} with ${donorLimit} donors`);
  
  // Get real donors to simulate
  const donors = await prisma.donor.findMany({
    where: { organizationId: orgId },
    take: Math.min(donorLimit, 100),
    include: {
      donations: {
        take: 10,
        orderBy: { date: 'desc' }
      },
      communications: {
        take: 10,
        orderBy: { sentAt: 'desc' }
      }
    }
  });
  
  if (donors.length === 0) {
    // If no real donors, use fake ones
    const fakeData = await generateFakeDonorData(orgId, { count: donorLimit });
    return {
      activeDonors: fakeData.donors.length,
      speed,
      activityTypes,
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      message: `Started simulation with ${fakeData.donors.length} fake donors`
    };
  }
  
  return {
    activeDonors: donors.length,
    speed,
    activityTypes,
    status: 'RUNNING',
    startedAt: new Date().toISOString(),
    message: `Started simulation with ${donors.length} real donors`
  };
}

// Stop simulation
async function stopSimulation(orgId, params) {
  console.log(`Stopping simulation for org ${orgId}`);
  
  return {
    status: 'STOPPED',
    stoppedAt: new Date().toISOString(),
    message: 'Simulation stopped successfully'
  };
}

// Pause simulation
async function pauseSimulation(orgId, params) {
  console.log(`Pausing simulation for org ${orgId}`);
  
  return {
    status: 'PAUSED',
    pausedAt: new Date().toISOString(),
    message: 'Simulation paused'
  };
}

// Get simulation stats
async function getSimulationStats(orgId, params) {
  // Get actual simulation data from database if available
  const donors = await prisma.donor.count({
    where: { organizationId: orgId }
  });
  
  const recentDonations = await prisma.donation.aggregate({
    where: { 
      organizationId: orgId,
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    _sum: { amount: true },
    _count: true
  });
  
  const recentCommunications = await prisma.communication.count({
    where: { 
      organizationId: orgId,
      sentAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });
  
  return {
    activeDonors: Math.min(donors, 50),
    totalDonations: recentDonations._count || Math.floor(Math.random() * 500) + 100,
    totalActivities: recentCommunications + recentDonations._count || Math.floor(Math.random() * 100) + 20,
    speed: 'normal',
    status: 'RUNNING',
    startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    recentActivities: generateRecentActivities(10),
    dataBased: true
  };
}

// Get simulated activities
async function getSimulatedActivities(orgId, params) {
  const { limit = 20 } = params;
  return generateRecentActivities(limit);
}

// Simulate a specific donor
async function simulateDonor(orgId, params) {
  const { donorId, scenario = 'default' } = params;
  
  console.log(`Simulating donor ${donorId} with scenario ${scenario}`);
  
  // Get donor data
  const donor = await prisma.donor.findUnique({
    where: { id: donorId },
    include: {
      donations: { take: 5 },
      communications: { take: 5 }
    }
  });
  
  if (!donor) {
    throw new Error(`Donor ${donorId} not found`);
  }
  
  // Generate simulation activity based on scenario
  const scenarios = {
    default: generateDonationActivity,
    communication: generateCommunicationActivity,
    engagement: generateEngagementActivity,
    lapsed: generateLapsedDonorActivity
  };
  
  const activityGenerator = scenarios[scenario] || generateDonationActivity;
  const activity = activityGenerator(donor);
  
  return {
    donor: {
      id: donor.id,
      name: `${donor.firstName} ${donor.lastName}`
    },
    activity,
    scenario,
    simulatedAt: new Date().toISOString()
  };
}

// Start roleplay session
async function startRoleplay(orgId, params) {
  const { donorId, context = {} } = params;
  
  console.log(`Starting roleplay for donor ${donorId}`);
  
  try {
    // Get donor data with valid relations only
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: {
        donations: {
          take: 10,
          orderBy: { date: 'desc' }
        },
        communications: {
          where: { direction: 'INBOUND' },
          take: 10,
          orderBy: { sentAt: 'desc' }
        },
        // Add other valid relations if needed
        interests: {
          include: {
            interest: true
          },
          take: 5
        },
        tags: {
          include: {
            tag: true
          },
          take: 5
        }
        // Removed: preferences: true - doesn't exist in your schema
      }
    });
    
    if (!donor) {
      throw new Error(`Donor ${donorId} not found`);
    }
    
    // Analyze donor communication patterns
    const persona = analyzeDonorPersona(donor);
    
    return {
      sessionId: `roleplay_${Date.now()}_${donorId}`,
      donor: {
        id: donor.id,
        name: `${donor.firstName} ${donor.lastName}`,
        email: donor.email,
        phone: donor.phone
      },
      persona,
      greeting: generateGreeting(persona, context),
      context,
      startedAt: new Date().toISOString(),
      donorData: {
        interests: donor.interests?.map(i => i.interest?.name).filter(Boolean) || [],
        tags: donor.tags?.map(t => t.tag?.name).filter(Boolean) || []
      }
    };
  } catch (error) {
    console.error('Error in startRoleplay:', error);
    throw error;
  }
}


// Ask donor a question (roleplay)
async function askDonor(orgId, params) {
  const { donorId, question } = params;
  
  console.log(`Donor ${donorId} asked: ${question.substring(0, 50)}...`);
  
  // In a real implementation, you'd use AI/ML to generate response
  // For now, generate a context-aware response
  
  const responses = [
    "That's a great question! I've been following your organization's work closely.",
    "I appreciate you asking. Based on what I've seen, I think...",
    "Thanks for reaching out. I'd love to learn more about that aspect.",
    "That's interesting. From my perspective as a donor...",
    "I'm glad you asked. I've been thinking about this recently..."
  ];
  
  // Check for keywords in question
  const lowerQuestion = question.toLowerCase();
  let response = responses[Math.floor(Math.random() * responses.length)];
  
  if (lowerQuestion.includes('donation')) {
    response = "I believe in supporting causes that make a tangible difference, which is why I donate.";
  } else if (lowerQuestion.includes('impact')) {
    response = "What matters most to me is seeing the real-world impact of my contributions.";
  } else if (lowerQuestion.includes('future')) {
    response = "I'm excited about the future direction and would love to be part of it.";
  }
  
  return {
    response,
    question,
    respondedAt: new Date().toISOString(),
    sentiment: 'POSITIVE',
    followUpQuestions: [
      "Could you share more about your recent initiatives?",
      "How can I help beyond financial contributions?"
    ]
  };
}

// AI initialization data
// AI initialization data
async function aiInitialize(orgId, params) {
  console.log(`Initializing AI for org ${orgId}`);
  
  // Get organization data
  const organization = await prisma.organization.findUnique({
    where: { id: orgId }
  });
  
  // Get donor stats
  const donorCount = await prisma.donor.count({
    where: { organizationId: orgId }
  });
  
  const donationStats = await prisma.donation.aggregate({
    where: { 
      organizationId: orgId,
      date: {
        gte: new Date(new Date().getFullYear(), 0, 1) // This year
      }
    },
    _sum: { amount: true },
    _count: true
  });
  
  return {
    organization: organization || { id: orgId, name: 'Default Organization' },
    summary: {
      totalDonors: donorCount,
      ytdDonations: donationStats._sum.amount || 0,
      ytdDonationCount: donationStats._count || 0,
      lastUpdated: new Date().toISOString()
    },
    aiCapabilities: {
      simulation: true,
      bonding: true,
      predictions: true,
      analytics: true,
      recommendations: true,
      dataGeneration: true
    },
    recommendations: [
      "Consider setting up automated thank-you messages for new donors",
      "LYBUNT donors may need re-engagement campaigns",
      "Top donors could be invited to exclusive updates"
    ]
  };
}

// Get simulation data
// Get simulation data
async function getSimulationData(orgId, params) {
  const { donorLimit = 100, donationLimit = 200, activityLimit = 150 } = params;
  
  const donors = await prisma.donor.findMany({
    where: { organizationId: orgId },
    take: Math.min(donorLimit, 500),
    include: {
      donations: {
        take: Math.min(10, donationLimit / donorLimit),
        orderBy: { date: 'desc' }
      },
      communications: {
        take: Math.min(5, activityLimit / donorLimit),
        orderBy: { sentAt: 'desc' }
      }
      // No preferences relation
    }
  });
  
  return {
    donors: donors.map(donor => ({
      id: donor.id,
      name: `${donor.firstName} ${donor.lastName}`,
      email: donor.email,
      totalDonations: donor.donations.reduce((sum, d) => sum + d.amount, 0),
      donationCount: donor.donations.length,
      communicationCount: donor.communications.length,
      lastDonation: donor.donations[0]?.date || null,
      lastCommunication: donor.communications[0]?.sentAt || null
    })),
    totalDonors: donors.length,
    summary: {
      totalDonations: donors.reduce((sum, donor) => 
        sum + donor.donations.reduce((s, d) => s + d.amount, 0), 0
      ),
      avgDonation: donors.length > 0 ? 
        donors.reduce((sum, donor) => 
          sum + donor.donations.reduce((s, d) => s + d.amount, 0), 0
        ) / donors.reduce((sum, donor) => sum + donor.donations.length, 0) : 0
    }
  };
}

// Get donor summary
// Get donor summary
async function getDonorSummary(orgId, params) {
  const { donorId } = params;
  
  try {
    const donor = await prisma.donor.findUnique({
      where: { 
        id: donorId,
        organizationId: orgId 
      },
      include: {
        donations: {
          orderBy: { date: 'desc' },
          take: 20
        },
        communications: {
          orderBy: { sentAt: 'desc' },
          take: 20
        },
        interests: {
          include: {
            interest: true
          },
          take: 10
        },
        tags: {
          include: {
            tag: true
          },
          take: 10
        }
        // Removed: preferences: true - doesn't exist
      }
    });
    
    if (!donor) {
      throw new Error(`Donor ${donorId} not found in organization ${orgId}`);
    }
    
    return {
      donor: {
        id: donor.id,
        name: `${donor.firstName} ${donor.lastName}`,
        email: donor.email,
        phone: donor.phone,
        type: donor.type,
        status: donor.status,
        relationshipStage: donor.relationshipStage,
        notes: donor.notes,
        personalNotes: donor.personalNotes,
        interests: donor.interests?.map(i => i.interest?.name).filter(Boolean) || [],
        tags: donor.tags?.map(t => t.tag?.name).filter(Boolean) || []
      },
      stats: {
        totalDonations: donor.donations.reduce((sum, d) => sum + d.amount, 0),
        donationCount: donor.donations.length,
        communicationCount: donor.communications.length,
        avgDonation: donor.donations.length > 0 ? 
          donor.donations.reduce((sum, d) => sum + d.amount, 0) / donor.donations.length : 0,
        lastDonation: donor.donations[0]?.date || null,
        lastCommunication: donor.communications[0]?.sentAt || null
      },
      recentActivity: [
        ...donor.donations.slice(0, 5).map(d => ({
          type: 'DONATION',
          date: d.date,
          amount: d.amount,
          description: `Donation of $${d.amount}`
        })),
        ...donor.communications.slice(0, 5).map(c => ({
          type: 'COMMUNICATION',
          date: c.sentAt,
          direction: c.direction,
          description: `${c.direction === 'INBOUND' ? 'Received' : 'Sent'} ${c.type.toLowerCase()}`
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  } catch (error) {
    console.error('Error in getDonorSummary:', error);
    throw error;
  }
}


// Get donation stats
async function getDonationStats(orgId, params) {
  const { timeframe = 'year', filters = {} } = params;
  
  // Calculate date range based on timeframe
  let startDate;
  const now = new Date();
  
  switch (timeframe) {
    case '30days':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90days':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
    default:
      startDate = new Date(0); // Beginning of time
  }
  
  const where = {
    organizationId: orgId,
    date: { gte: startDate },
    ...filters
  };
  
  const donations = await prisma.donation.findMany({
    where,
    orderBy: { date: 'desc' },
    take: 1000
  });
  
  // Group by month for chart data
  const monthlyData = {};
  donations.forEach(donation => {
    const date = new Date(donation.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: 0,
        count: 0
      };
    }
    
    monthlyData[monthKey].amount += donation.amount;
    monthlyData[monthKey].count += 1;
  });
  
  const monthlyArray = Object.values(monthlyData).sort((a, b) => 
    new Date(a.month) - new Date(b.month)
  );
  
  return {
    total: donations.reduce((sum, d) => sum + d.amount, 0),
    count: donations.length,
    average: donations.length > 0 ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0,
    largest: donations.length > 0 ? Math.max(...donations.map(d => d.amount)) : 0,
    monthlyData: monthlyArray,
    recentDonations: donations.slice(0, 10).map(d => ({
      id: d.id,
      amount: d.amount,
      date: d.date,
      donorId: d.donorId,
      type: d.type
    }))
  };
}

// Get organization activity
async function getOrganizationActivity(orgId, params) {
  const { limit = 5 } = params;
  
  // Get recent donations
  const recentDonations = await prisma.donation.findMany({
    where: { organizationId: orgId },
    orderBy: { date: 'desc' },
    take: Math.floor(limit / 2),
    include: {
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
  
  // Get recent communications
  const recentCommunications = await prisma.communication.findMany({
    where: { organizationId: orgId },
    orderBy: { sentAt: 'desc' },
    take: Math.floor(limit / 2),
    include: {
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
  
  // Combine and sort
  const activities = [
    ...recentDonations.map(d => ({
      type: 'DONATION',
      id: d.id,
      donor: d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : 'Unknown Donor',
      description: `Donated $${d.amount}`,
      date: d.date,
      icon: 'CurrencyDollarIcon'
    })),
    ...recentCommunications.map(c => ({
      type: 'COMMUNICATION',
      id: c.id,
      donor: c.donor ? `${c.donor.firstName} ${c.donor.lastName}` : 'Unknown Donor',
      description: `${c.direction === 'INBOUND' ? 'Received' : 'Sent'} ${c.type.toLowerCase()}`, // Updated
      date: c.sentAt,
      icon: c.type === 'EMAIL' ? 'EnvelopeIcon' : 
            c.type === 'PHONE' ? 'PhoneIcon' : 
            c.type === 'MEETING' ? 'CalendarIcon' : 'DocumentTextIcon'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date))
   .slice(0, limit);
  
  return {
    activities,
    total: activities.length,
    lastUpdated: new Date().toISOString()
  };
}

// Quick simulate
async function quickSimulate(orgId, params) {
  const { type = 'donation' } = params;
  
  const activityTypes = {
    donation: generateDonationActivity,
    communication: generateCommunicationActivity,
    profile_update: generateProfileUpdateActivity,
    engagement: generateEngagementActivity
  };
  
  const generator = activityTypes[type] || generateDonationActivity;
  const mockDonor = {
    id: `mock_${Date.now()}`,
    firstName: ['Alex', 'Maria', 'James', 'Sarah'][Math.floor(Math.random() * 4)],
    lastName: ['Johnson', 'Smith', 'Williams', 'Brown'][Math.floor(Math.random() * 4)],
    email: 'mock@example.com'
  };
  
  const activity = generator(mockDonor);
  
  return {
    type,
    data: activity,
    simulatedAt: new Date().toISOString(),
    message: `Simulated ${type} activity`
  };
}

// Batch operations handler
async function handleBatchOperations(orgId, params) {
  const { operations } = params;
  
  if (!Array.isArray(operations) || operations.length === 0) {
    throw new Error('No operations provided');
  }
  
  if (operations.length > 10) {
    throw new Error('Maximum 10 operations allowed per batch');
  }
  
  const results = [];
  
  for (const operation of operations) {
    try {
      // Reuse existing methods
      let result;
      switch (operation.method) {
        case 'donorSummary':
          result = await getDonorSummary(orgId, operation.params);
          break;
        case 'donationStats':
          result = await getDonationStats(orgId, operation.params);
          break;
        case 'predictions':
          result = await handlePredictions(orgId, operation.params);
          break;
        case 'recommendations':
          result = await handleRecommendations(orgId, operation.params);
          break;
        case 'organizationActivity':
          result = await getOrganizationActivity(orgId, operation.params);
          break;
        default:
          result = { error: `Unknown batch method: ${operation.method}` };
      }
      
      results.push({
        method: operation.method,
        success: true,
        data: result
      });
    } catch (error) {
      results.push({
        method: operation.method,
        success: false,
        error: error.message
      });
    }
  }
  
  return {
    operations: results,
    completedAt: new Date().toISOString()
  };
}

// ============================================
// HELPER FUNCTIONS FROM PROVIDED FILE
// ============================================

function generateRecentActivities(limit) {
  const activities = [];
  const activityTypes = ['donation', 'communication', 'profile_update'];
  const donorNames = [
    'Alex Johnson', 'Maria Chen', 'Robert Williams', 'Sarah Miller',
    'James Wilson', 'Emily Davis', 'Michael Brown', 'Jennifer Taylor'
  ];
  
  for (let i = 0; i < limit; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const donorName = donorNames[Math.floor(Math.random() * donorNames.length)];
    const timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString(); // Last hour
    
    let activity;
    switch (type) {
      case 'donation':
        const amount = Math.floor(Math.random() * 5000) + 50;
        activity = {
          type: 'donation',
          donorName,
          amount,
          message: `Donated $${amount}`,
          timestamp
        };
        break;
      case 'communication':
        activity = {
          type: 'communication',
          donorName,
          message: 'Sent a message',
          timestamp
        };
        break;
      case 'profile_update':
        activity = {
          type: 'profile_update',
          donorName,
          message: 'Updated profile information',
          timestamp
        };
        break;
    }
    
    activities.push(activity);
  }
  
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateDonationActivity(donor) {
  const amount = Math.floor(Math.random() * 5000) + 50;
  return {
    type: 'donation',
    donorId: donor.id,
    donorName: `${donor.firstName} ${donor.lastName}`,
    amount,
    currency: 'USD',
    date: new Date().toISOString(),
    message: `Made a donation of $${amount}`,
    isRecurring: Math.random() > 0.7
  };
}

function generateCommunicationActivity(donor) {
  const types = ['EMAIL', 'PHONE', 'MEETING'];
  const type = types[Math.floor(Math.random() * types.length)];
  const direction = Math.random() > 0.5 ? 'INBOUND' : 'OUTBOUND'; // Updated
  
  return {
    type: 'communication',
    donorId: donor.id,
    donorName: `${donor.firstName} ${donor.lastName}`,
    communicationType: type,
    direction,
    message: direction === 'INBOUND' ? 'Received a message' : 'Sent a message', // Updated
    timestamp: new Date().toISOString()
  };
}

function generateProfileUpdateActivity(donor) {
  const updates = ['contact information', 'communication preferences', 'donation preferences', 'interests'];
  const update = updates[Math.floor(Math.random() * updates.length)];
  
  return {
    type: 'profile_update',
    donorId: donor.id,
    donorName: `${donor.firstName} ${donor.lastName}`,
    update,
    message: `Updated ${update}`,
    timestamp: new Date().toISOString()
  };
}

function generateEngagementActivity(donor) {
  const engagements = ['visited website', 'opened newsletter', 'attended event', 'shared on social media'];
  const engagement = engagements[Math.floor(Math.random() * engagements.length)];
  
  return {
    type: 'engagement',
    donorId: donor.id,
    donorName: `${donor.firstName} ${donor.lastName}`,
    engagement,
    message: `Donor ${engagement}`,
    timestamp: new Date().toISOString()
  };
}

function generateLapsedDonorActivity(donor) {
  return {
    type: 'communication',
    donorId: donor.id,
    donorName: `${donor.firstName} ${donor.lastName}`,
    communicationType: 'EMAIL',
    direction: 'OUTBOUND', // Updated
    message: 'Re-engagement outreach sent',
    timestamp: new Date().toISOString(),
    metadata: {
      category: 'RE_ENGAGEMENT',
      priority: 'HIGH'
    }
  };
}

function analyzeDonorPersona(donor) {
  // Simple persona analysis based on donor data
  const totalDonations = donor.donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const donationCount = donor.donations?.length || 0;
  const communicationCount = donor.communications?.length || 0;
  
  let personaType = 'SUPPORTER';
  let traits = ['generous'];
  
  if (totalDonations > 10000) {
    personaType = 'MAJOR_DONOR';
    traits.push('philanthropic', 'influential');
  } else if (donationCount > 5) {
    personaType = 'LOYAL_SUPPORTER';
    traits.push('consistent', 'committed');
  }
  
  if (communicationCount > 10) {
    traits.push('engaged', 'communicative');
  }
  
  // Analyze communication sentiment
  const positiveWords = ['thank', 'great', 'appreciate', 'happy', 'excited'];
  let positiveCount = 0;
  
  donor.communications?.forEach(comm => {
    const content = comm.content?.toLowerCase() || '';
    positiveWords.forEach(word => {
      if (content.includes(word)) positiveCount++;
    });
  });
  
  if (positiveCount > 3) {
    traits.push('positive', 'appreciative');
  }

  // Get interests from donor interests relation
  let interests = ['general'];
  if (donor.interests && donor.interests.length > 0) {
    interests = donor.interests
      .map(i => i.interest?.name)
      .filter(Boolean)
      .slice(0, 3); // Limit to 3 interests
  }
  
  // If no interests found, try to extract from notes
  if (interests.length === 0 && donor.notes) {
    const interestKeywords = ['education', 'healthcare', 'environment', 'arts', 'research', 'scholarship'];
    const foundInterests = interestKeywords.filter(keyword => 
      donor.notes.toLowerCase().includes(keyword)
    );
    if (foundInterests.length > 0) {
      interests = foundInterests;
    }
  }

    const tags = donor.tags?.map(t => t.tag?.name).filter(Boolean) || [];

  
  return {
    type: personaType,
    traits,
    communicationStyle: communicationCount > 5 ? 'engaged' : 'reserved',
    givingPattern: donationCount > 2 ? 'regular' : 'occasional',
    interests,
    tags,
    description: `${personaType.replace('_', ' ')} interested in ${interests.join(', ')}${tags.length > 0 ? ` (tags: ${tags.join(', ')})` : ''}`
  };
}

function generateGreeting(persona, context) {
  const greetings = {
    SUPPORTER: "Hi there! Thanks for reaching out. I'm glad to connect.",
    MAJOR_DONOR: "Hello! It's great to hear from you. I've been following your organization's progress closely.",
    LOYAL_SUPPORTER: "Hi! Wonderful to connect. I always appreciate your updates."
  };
  
  const baseGreeting = greetings[persona.type] || "Hello! Thanks for getting in touch.";
  
  if (context.topic) {
    return `${baseGreeting} I'd love to discuss ${context.topic}.`;
  }
  
  return baseGreeting;
}