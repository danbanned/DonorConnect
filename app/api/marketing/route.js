export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '../../../lib/db'
import { verifyToken } from '../../../lib/auth'

const DAY_MS = 24 * 60 * 60 * 1000

function segmentCopy() {
  return {
    new_user: {
      title: 'Join the movement for change.',
      subtitle: 'See what your first gift can unlock for the community.',
      cta: 'Make First Donation',
      event: 'New Supporter Welcome Session',
      giveaway: 'First-time donor welcome pack'
    },
    recent_donor: {
      title: 'Thank you for your recent support.',
      subtitle: 'Here is what your support helped accomplish this month.',
      cta: 'See Impact Update',
      event: 'Donor Thank-You Briefing',
      giveaway: 'Priority entry into appreciation giveaway'
    },
    lapsed_donor: {
      title: "We've missed you - your impact still matters.",
      subtitle: 'Reconnect with an easy next step and fresh campaign updates.',
      cta: 'Re-Engage Now',
      event: 'Community Re-Engagement Meetup',
      giveaway: 'Reactivation campaign giveaway entry'
    },
    event_attendee_no_donation: {
      title: 'You showed up. Ready for the next step?',
      subtitle: 'Turn attendance into direct impact through a small first action.',
      cta: 'Support This Initiative',
      event: 'Volunteer-to-Donor Action Event',
      giveaway: 'Event action badge + reward draw'
    },
    recurring_donor: {
      title: 'Your recurring support builds stability.',
      subtitle: 'Consistent giving powers long-term programs and planning.',
      cta: 'View Sustained Impact',
      event: 'Recurring Donor Insider Update',
      giveaway: 'Recurring donor milestone reward'
    },
    highly_engaged: {
      title: 'You are one of our most engaged supporters.',
      subtitle: 'Help us lead the next campaign with your momentum.',
      cta: 'Become a Campaign Champion',
      event: 'Supporter Leadership Roundtable',
      giveaway: 'Champion-tier recognition and giveaway'
    }
  }
}

function impactStatementForCampaign(name = '') {
  const normalized = name.toLowerCase()

  if (normalized.includes('scholarship')) return 'funded scholarships and direct education support.'
  if (normalized.includes('food')) return 'expanded food distribution and meal coverage.'
  if (normalized.includes('clinic') || normalized.includes('health')) return 'supported health access and care services.'
  if (normalized.includes('housing') || normalized.includes('shelter')) return 'funded housing and shelter stability efforts.'
  if (normalized.includes('emergency')) return 'powered urgent response and rapid relief operations.'
  if (normalized.includes('capital')) return 'improved long-term infrastructure and facilities.'
  if (normalized.includes('youth') || normalized.includes('mentor')) return 'expanded youth mentorship and development programs.'

  return 'funded mission-critical programs and community operations.'
}

function buildWhere(orgId) {
  return orgId ? { organizationId: orgId } : {}
}

function pickPrimaryScenario(segmentCounts) {
  const ordered = [
    'lapsed_donor',
    'event_attendee_no_donation',
    'new_user',
    'recent_donor',
    'recurring_donor',
    'highly_engaged'
  ]

  for (const key of ordered) {
    if ((segmentCounts[key] || 0) > 0) return key
  }

  return 'new_user'
}

export async function GET(request) {
  try {
    const token = cookies().get('auth_token')?.value
    let user = null
    if (token) {
      try {
        user = await verifyToken(token)
      } catch {
        user = null
      }
    }

    const orgId = user?.orgId || null
    const where = buildWhere(orgId)
    const now = new Date()
    const recentCutoff = new Date(now.getTime() - 30 * DAY_MS)
    const lapsedCutoff = new Date(now.getTime() - 180 * DAY_MS)

    const [
      orgCount,
      donorCount,
      activeCampaignCount,
      completedDonationCount,
      totalDonationAgg,
      emailSentCount,
      emailOpenedCount,
      emailClickedCount,
      upcomingMeetingsCount,
      neverDonatedCount,
      recentDonorCount,
      lapsedDonorCount,
      attendeeNoDonationCount,
      recurringDonorCount,
      highlyEngagedCount,
      campaigns
    ] = await Promise.all([
      prisma.organization.count(orgId ? { where: { id: orgId } } : undefined),
      prisma.donor.count({ where }),
      prisma.campaign.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.donation.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.donation.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.communication.count({ where: { ...where, sentAt: { not: null } } }),
      prisma.communication.count({ where: { ...where, openedAt: { not: null } } }),
      prisma.communication.count({ where: { ...where, clickedAt: { not: null } } }),
      prisma.meeting.count({
        where: { ...where, status: 'SCHEDULED', startTime: { gt: now } }
      }),
      prisma.donor.count({ where: { ...where, donations: { none: {} } } }),
      prisma.donor.count({
        where: { ...where, donations: { some: { date: { gte: recentCutoff } } } }
      }),
      prisma.donor.count({
        where: {
          ...where,
          donations: { some: { date: { lt: lapsedCutoff } } },
          AND: [{ donations: { none: { date: { gte: lapsedCutoff } } } }]
        }
      }),
      prisma.donor.count({
        where: {
          ...where,
          meetings: { some: {} },
          donations: { none: {} }
        }
      }),
      prisma.donor.count({
        where: { ...where, donations: { some: { isRecurring: true } } }
      }),
      prisma.donor.count({
        where: {
          ...where,
          OR: [
            { communications: { some: { openedAt: { not: null } } } },
            { communications: { some: { clickedAt: { not: null } } } },
            { meetings: { some: {} } }
          ]
        }
      }),
      prisma.campaign.findMany({
        where,
        include: {
          donations: {
            where: { status: 'COMPLETED' },
            select: { amount: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 4
      })
    ])

    const totalRaised = totalDonationAgg?._sum?.amount || 0
    const engagementRate = emailSentCount > 0
      ? Math.round(((emailOpenedCount + emailClickedCount) / (emailSentCount * 2)) * 100)
      : 0

    const scenarioCounts = {
      new_user: neverDonatedCount,
      recent_donor: recentDonorCount,
      lapsed_donor: lapsedDonorCount,
      event_attendee_no_donation: attendeeNoDonationCount,
      recurring_donor: recurringDonorCount,
      highly_engaged: highlyEngagedCount
    }

    const copy = segmentCopy()
    const primaryScenario = pickPrimaryScenario(scenarioCounts)
    const scenario = {
      key: primaryScenario,
      ...copy[primaryScenario]
    }

    const segmentCards = Object.entries(scenarioCounts).map(([key, count]) => ({
      key,
      count,
      ...copy[key]
    }))

    const campaignProgress = campaigns.map((campaign) => {
      const raised = campaign.donations.reduce((sum, donation) => sum + (donation.amount || 0), 0)
      const goal = campaign.goal || 0
      const progress = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        raised,
        goal,
        progress
      }
    })

    const accomplishmentDetails = campaignProgress
      .filter((campaign) => campaign.raised > 0)
      .sort((a, b) => b.raised - a.raised)
      .slice(0, 4)
      .map((campaign) => ({
        title: campaign.name,
        amountRaised: campaign.raised,
        whatDone: `Funds from ${campaign.name} ${impactStatementForCampaign(campaign.name)}`
      }))

    return NextResponse.json({
      success: true,
      scope: orgId ? 'organization' : 'global',
      generatedAt: new Date().toISOString(),
      summary: {
        organizations: orgCount,
        donors: donorCount,
        activeCampaigns: activeCampaignCount,
        completedDonations: completedDonationCount,
        totalRaised,
        upcomingEvents: upcomingMeetingsCount,
        engagementRate
      },
      scenario,
      segments: segmentCards,
      automationRules: [
        'If last donation is older than 180 days, show re-engagement content.',
        'If donor gave in the last 30 days, show thank-you and impact content.',
        'If event attendance exists without donation, show low-commitment next step.',
        'If recurring donations exist, show loyalty recognition content.',
        'If engagement drops, surface reminders and incentives.'
      ],
      campaignProgress,
      accomplishments: accomplishmentDetails.length > 0
        ? accomplishmentDetails
        : [
            {
              title: 'General Fund',
              amountRaised: totalRaised,
              whatDone: 'Funds supported core programs, staff capacity, and ongoing community delivery.'
            }
          ],
      socialProof: {
        supporterCount: donorCount,
        eventParticipation: upcomingMeetingsCount,
        engagementRate
      },
      ctas: [
        { key: 'donate', label: 'Donate' },
        { key: 'event', label: 'Register for Event' },
        { key: 'giveaway', label: 'Enter Giveaway' },
        { key: 'impact', label: 'View Impact' }
      ]
    })
  } catch (error) {
    console.error('[GET /api/marketing]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load marketing data' },
      { status: 500 }
    )
  }
}
