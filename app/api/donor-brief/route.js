// app/api/donor-brief/route.js
import { NextResponse } from 'next/server';
import donorDataContext from '../../../lib/donordatacontext';

export async function POST(request) {
  try {
    const body = await request.json();
    const { donorId, context = 'meeting_preparation', orgId } = body;
    
    if (!donorId) {
      return NextResponse.json(
        { error: 'Donor ID is required' },
        { status: 400 }
      );
    }
    
    // Get donor data
    const donor = await donorDataContext.Donor.findUnique({
      where: { id: donorId },
      include: {
        donations: {
          take: 10,
          orderBy: { date: 'desc' }
        },
        communications: {
          take: 10,
          orderBy: { sentAt: 'desc' }
        },
        interests: {
          include: {
            interest: true
          }
        }
      }
    });
    
    if (!donor) {
      return NextResponse.json(
        { error: 'Donor not found' },
        { status: 404 }
      );
    }
    
    // Calculate stats
    const totalDonations = donor.donations.reduce((sum, d) => sum + d.amount, 0);
    const avgDonation = donor.donations.length > 0 
      ? totalDonations / donor.donations.length 
      : 0;
    
    const lastDonation = donor.donations[0];
    const lastCommunication = donor.communications[0];
    
    // Generate AI insights based on context
    const aiInsights = await generateAIInsights(donor, context);
    
    // Compile brief
    const brief = {
      donor: {
        id: donor.id,
        name: `${donor.firstName} ${donor.lastName}`,
        email: donor.email,
        phone: donor.phone,
        status: donor.status,
        relationshipStage: donor.relationshipStage,
        notes: donor.notes,
        interests: donor.interests.map(i => i.interest.name)
      },
      stats: {
        totalDonations,
        donationCount: donor.donations.length,
        avgDonation,
        lastDonationDate: lastDonation?.date,
        lastContactDate: lastCommunication?.sentAt,
        communicationCount: donor.communications.length
      },
      recentActivity: donor.donations.slice(0, 5).map(d => ({
        type: 'DONATION',
        date: d.date,
        amount: d.amount,
        description: `${d.type} donation of $${d.amount}`
      })),
      aiInsights,
      generatedAt: new Date().toISOString(),
      context
    };
    
    return NextResponse.json({
      success: true,
      data: brief
    });
    
  } catch (error) {
    console.error('Donor brief error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function generateAIInsights(donor, context) {
  // Calculate giving frequency
  let givingFrequency = 'one-time';
  if (donor.donations.length >= 3) {
    const dates = donor.donations.map(d => new Date(d.date)).sort((a, b) => a - b);
    const timeSpans = [];
    
    for (let i = 1; i < dates.length; i++) {
      timeSpans.push(dates[i] - dates[i-1]);
    }
    
    const avgSpan = timeSpans.reduce((a, b) => a + b, 0) / timeSpans.length;
    const avgDays = avgSpan / (1000 * 60 * 60 * 24);
    
    if (avgDays <= 35) givingFrequency = 'monthly';
    else if (avgDays <= 100) givingFrequency = 'quarterly';
    else if (avgDays <= 400) givingFrequency = 'annually';
  }
  
  // Calculate suggested ask amount
  let suggestedAsk = 0;
  if (donor.donations.length > 0) {
    const recentDonations = donor.donations.slice(0, 3).map(d => d.amount);
    const avgRecent = recentDonations.reduce((a, b) => a + b, 0) / recentDonations.length;
    suggestedAsk = Math.round(avgRecent * 1.5); // 50% increase from average
  }
  
  // Determine next best action
  let nextBestAction = 'Send thank you note';
  const daysSinceLastDonation = donor.donations[0] 
    ? Math.floor((new Date() - new Date(donor.donations[0].date)) / (1000 * 60 * 60 * 24))
    : null;
  
  if (daysSinceLastDonation > 365) {
    nextBestAction = 'Schedule re-engagement call';
  } else if (daysSinceLastDonation > 180) {
    nextBestAction = 'Send impact update';
  } else if (donor.donations.length >= 3) {
    nextBestAction = 'Discuss recurring giving';
  }
  
  // Generate recommendations based on context
  const recommendations = [];
  const interests = donor.interests.map(i => i.interest.name);
  
  if (context === 'meeting_preparation') {
    recommendations.push({
      title: 'Personalized Opening',
      description: `Start by thanking them for supporting ${interests[0] || 'our programs'}`,
      priority: 'high',
      confidence: 85
    });
    
    recommendations.push({
      title: 'Impact Sharing',
      description: `Share specific outcomes related to ${interests.join(' and ')}`,
      priority: 'medium',
      confidence: 75
    });
    
    if (suggestedAsk > 0) {
      recommendations.push({
        title: 'Suggested Ask',
        description: `Consider asking for $${suggestedAsk} for ${interests[0] || 'general support'}`,
        priority: 'high',
        confidence: 70,
        actionItems: [
          'Frame ask around specific impact',
          'Connect to donor interests',
          'Provide giving options'
        ]
      });
    }
  }
  
  return {
    givingFrequency,
    suggestedAsk,
    nextBestAction,
    engagementLevel: donor.donations.length >= 3 ? 'High' : 'Medium',
    interests,
    recommendations,
    nextBestTime: donor.donations.length > 0 ? 'this quarter' : 'when appropriate'
  };
}