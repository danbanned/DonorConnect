export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from "next/server";
import { prisma } from '../../../lib/db'
import { getSession } from '../../../lib/api/getSession'



/**
 * Convert BigInt to string so JSON.stringify works
 */
function serializeBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

/**
 * Get action display text
 */
function getActionDisplay(type, action) {
  const actionMap = {
    'DONATION_RECEIVED': 'Made a donation',
    'MEETING_SCHEDULED': 'Meeting scheduled',
    'MEETING_COMPLETED': 'Meeting completed',
    'EMAIL_SENT': 'Email sent',
    'PHONE_CALL_SENT': 'Phone call made',
    'THANK_YOU_SENT': 'Thank you note sent',
    'FOLLOW_UP_SENT': 'Follow-up sent',
    'NOTE_ADDED': 'Note added',
    'STATUS_CHANGED': 'Status changed'
  };
  
  return actionMap[action] || `${type} ${action}`.toLowerCase().replace(/_/g, ' ');
}

/**
 * Get icon for action
 */
function getIconForAction(action) {
  const iconMap = {
    'DONATION_RECEIVED': '💰',
    'MEETING_SCHEDULED': '📅',
    'MEETING_COMPLETED': '✅',
    'EMAIL_SENT': '📧',
    'PHONE_CALL_SENT': '📞',
    'THANK_YOU_SENT': '🙏',
    'FOLLOW_UP_SENT': '🔄',
    'NOTE_ADDED': '📝',
    'STATUS_CHANGED': '🔄'
  };
  return iconMap[action] || '📋';
}

/**
 * GET /api/donor-activity
 * Query params:
 *   organizationId (required)
 *   donorId (optional)
 *   timeframe (optional: '7days', '30days', '90days', 'year', 'all')
 *   limit (optional, default 25)
 *   types (optional, comma-separated: DONATION,MEETING,COMMUNICATION,NOTE,STATUS)
 *   page (optional, default 1)
 */
export async function GET(request) {

  const session = await getSession()

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id: userId, organizationId } = session

  try {
    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get("donorId");
    const timeframe = searchParams.get("timeframe") || '30days';
    const limit = parseInt(searchParams.get("limit")) || 25;
    const page = parseInt(searchParams.get("page")) || 1;
    const types = searchParams.get("types")?.split(',') || [];
    
    const skip = (page - 1) * limit;

    // Validate organizationId
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Base where clause
    const baseWhere = { organizationId };
    if (donorId) baseWhere.donorId = donorId;

    // Date filter
    let dateFilter = {};
    if (timeframe !== 'all') {
      const now = new Date();
      const baseDate = new Date(now);

      switch (timeframe) {
        case '7days':
          dateFilter.gte = new Date(baseDate.setDate(baseDate.getDate() - 7));
          break;
        case '30days':
          dateFilter.gte = new Date(baseDate.setDate(baseDate.getDate() - 30));
          break;
        case '90days':
          dateFilter.gte = new Date(baseDate.setDate(baseDate.getDate() - 90));
          break;
        case 'year':
          dateFilter.gte = new Date(new Date().getFullYear(), 0, 1);
          break;
      }
    }

    console.log(`Fetching activities for org: ${organizationId}, timeframe: ${timeframe}`);

    // Fetch all activity data in parallel
    const [
      donorActivities,
      recentDonations,
      recentCommunications,
      recentMeetings,
      activityStats
    ] = await Promise.all([
      // 1. Donor Activities (from DonorActivity model)
      prisma.donorActivity.findMany({
        where: {
          ...baseWhere,
          ...(types.length > 0 && { type: { in: types } }),
          ...(dateFilter.gte && { createdAt: dateFilter })
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          relatedDonation: {
            select: {
              id: true,
              amount: true,
              date: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),

      // 2. Recent Donations (if DONATION type is requested or all types)
      (!types.length || types.includes('DONATION')) ? prisma.donation.findMany({
        where: {
          ...baseWhere,
          status: 'COMPLETED',
          ...(dateFilter.gte && { date: dateFilter })
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          campaign: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { date: "desc" },
        take: limit,
      }) : Promise.resolve([]),

      // 3. Recent Communications (if COMMUNICATION type is requested or all types)
      (!types.length || types.includes('COMMUNICATION')) ? prisma.communication.findMany({
        where: {
          ...baseWhere,
          ...(dateFilter.gte && { sentAt: dateFilter })
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { sentAt: "desc" },
        take: limit,
      }) : Promise.resolve([]),

      // 4. Recent Meetings (if MEETING type is requested or all types)
      (!types.length || types.includes('MEETING')) ? prisma.meeting.findMany({
        where: {
          ...baseWhere,
          ...(dateFilter.gte && { startTime: dateFilter })
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { startTime: "desc" },
        take: limit,
      }) : Promise.resolve([]),

      // 5. Activity Statistics
      prisma.donorActivity.groupBy({
        by: ['type', 'action'],
        where: {
          ...baseWhere,
          ...(dateFilter.gte && { createdAt: dateFilter })
        },
        _count: true,
      })
    ]);

    console.log(`Found: ${donorActivities.length} activities, ${recentDonations.length} donations, ${recentCommunications.length} communications, ${recentMeetings.length} meetings`);

    // Combine all data into a unified activity feed
    const allActivities = [];

    // Add donor activities
    donorActivities.forEach(activity => {
      allActivities.push({
        id: `activity_${activity.id}`,
        type: 'ACTIVITY',
        action: activity.action,
        donor: activity.donor ? `${activity.donor.firstName} ${activity.donor.lastName}` : 'Unknown',
        donorId: activity.donorId,
        amount: activity.amount || activity.relatedDonation?.amount,
        description: activity.description || activity.title,
        time: getTimeAgo(activity.createdAt),
        createdAt: activity.createdAt,
        icon: getIconForAction(activity.action),
        displayAction: getActionDisplay(activity.type, activity.action),
        rawData: activity
      });
    });

    // Add recent donations as activities
    recentDonations.forEach(donation => {
      allActivities.push({
        id: `donation_${donation.id}`,
        type: 'DONATION',
        action: 'DONATION_RECEIVED',
        donor: `${donation.donor.firstName} ${donation.donor.lastName}`,
        donorId: donation.donorId,
        amount: donation.amount,
        description: `Donation received${donation.campaign ? ` for ${donation.campaign.name}` : ''}`,
        time: getTimeAgo(donation.date),
        createdAt: donation.date,
        icon: '💰',
        displayAction: 'Made a donation',
        rawData: donation
      });
    });

    // Add recent communications as activities
    recentCommunications.forEach(comm => {
      allActivities.push({
        id: `comm_${comm.id}`,
        type: 'COMMUNICATION',
        action: `${comm.type}_SENT`,
        donor: `${comm.donor.firstName} ${comm.donor.lastName}`,
        donorId: comm.donorId,
        amount: null,
        description: comm.subject || `Communication sent`,
        time: getTimeAgo(comm.sentAt || comm.createdAt),
        createdAt: comm.sentAt || comm.createdAt,
        icon: comm.type === 'EMAIL' ? '📧' : comm.type === 'PHONE_CALL' ? '📞' : '💬',
        displayAction: `${comm.type.replace('_', ' ').toLowerCase()} sent`,
        rawData: comm
      });
    });

    // Add recent meetings as activities
    recentMeetings.forEach(meeting => {
      allActivities.push({
        id: `meeting_${meeting.id}`,
        type: 'MEETING',
        action: 'MEETING_SCHEDULED',
        donor: `${meeting.donor.firstName} ${meeting.donor.lastName}`,
        donorId: meeting.donorId,
        amount: null,
        description: meeting.title || `Meeting scheduled`,
        time: getTimeAgo(meeting.startTime),
        createdAt: meeting.startTime,
        icon: '📅',
        displayAction: meeting.status === 'COMPLETED' ? 'Meeting completed' : 'Meeting scheduled',
        rawData: meeting
      });
    });

    // Sort all activities by date (newest first)
    allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate the combined results
    const paginatedActivities = allActivities.slice(skip, skip + limit);
    const total = allActivities.length;
    const pages = Math.ceil(total / limit);

    // Format activity stats
    const formattedStats = activityStats.reduce((acc, stat) => {
      const key = `${stat.type}_${stat.action}`;
      acc[key] = stat._count;
      return acc;
    }, {});

    // Create response
    const response = {
      success: true,
      data: {
        activities: paginatedActivities,
        summary: {
          totalActivities: total,
          totalPages: pages,
          currentPage: page,
          pageSize: limit,
          hasMore: page < pages,
          stats: {
            totalActivities: total,
            byType: {
              DONATION: recentDonations.length,
              COMMUNICATION: recentCommunications.length,
              MEETING: recentMeetings.length,
              ACTIVITY: donorActivities.length
            },
            detailedStats: formattedStats
          }
        },
        rawCounts: {
          donorActivities: donorActivities.length,
          donations: recentDonations.length,
          communications: recentCommunications.length,
          meetings: recentMeetings.length
        }
      },
      filters: {
        organizationId,
        donorId,
        timeframe,
        types,
        limit,
        page
      }
    };

    return NextResponse.json(serializeBigInt(response));

  } catch (error) {
    console.error("[GET /api/donor-activity]", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch donor activity",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/donor-activity
 * Create a new donor activity
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      donorId,
      organizationId,
      type,
      action,
      title,
      description = '',
      amount = null,
      relatedDonationId = null,
      relatedMeetingId = null,
      relatedCommunicationId = null,
      metadata = {}
    } = body;

    // Validate required fields
    if (!donorId || !organizationId || !type || !action || !title) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required fields: donorId, organizationId, type, action, title" 
        },
        { status: 400 }
      );
    }

    const activity = await prisma.donorActivity.create({
      data: {
        donorId,
        organizationId,
        type,
        action,
        title,
        description,
        amount,
        relatedDonationId,
        relatedMeetingId,
        relatedCommunicationId,
        metadata,
        importance: 'NORMAL'
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Activity created successfully",
      data: serializeBigInt(activity)
    }, { status: 201 });

  } catch (error) {
    console.error("[POST /api/donor-activity]", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create activity",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}