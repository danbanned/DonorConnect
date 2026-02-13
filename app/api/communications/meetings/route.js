import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';
import prisma from '../../../../lib/db';
 
/* ========================
   GET /meetings
======================== */
export async function GET(req) {
  // ✅ Custom JWT auth
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const date = searchParams.get('date');
  const donorId = searchParams.get('donorId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const status = searchParams.get('status') || 'all';
  const limit = Number(searchParams.get('limit') || 50);
  const page = Number(searchParams.get('page') || 1);

  const organizationId = user.organizationId;

  try {
    const where = {
      organizationId,

      ...(donorId && { donorId }),

      ...(status !== 'all' && { status }),

      ...(date && {
        startTime: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(
            new Date(date).setDate(new Date(date).getDate() + 1)
          ),
        },
      }),

      ...(startDate &&
        endDate && {
          startTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,

        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },

          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          communication: {
            select: {
              id: true,
              type: true,
              subject: true,
              status: true,

            },
          },
        },

        orderBy: { startTime: 'asc' },

        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.meeting.count({ where }),
    ]);

    const upcomingCount = await prisma.meeting.count({
      where: {
        organizationId,
        startTime: { gt: new Date() },
        status: 'SCHEDULED',
      },
    });

    return NextResponse.json({
      success: true,

      meetings,

      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },

      counts: {
        total,
        upcoming: upcomingCount,
        today: date ? meetings.length : 0,
      },
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

/* ========================
   POST /meetings
======================== */
export async function POST(req) {
  // ✅ Custom JWT auth
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await req.json();

   // ADD DEBUG LOGGING
  console.log('=== BACKEND RECEIVED ===');
  console.log('Body:', body);
  console.log('donorId:', body.donorId);
  console.log('title:', body.title);
  console.log('startTime:', body.startTime);
  console.log('=====================');

  const {
    donorId,
    title,
    description,
    startTime,
    duration = 30,
    meetingType = 'VIRTUAL', // ✅ CORRECT

    zoomMeetingId,
    zoomJoinUrl,
    zoomStartUrl,

    notes,
    status = 'SCHEDULED',
  } = body;

  const userId = user.id;
  const organizationId = user.organizationId;

  if (!donorId || !title || !startTime) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const donor = await prisma.donor.findFirst({
      where: {
        id: donorId,
        organizationId,
      },
    });

    if (!donor) {
      return NextResponse.json(
        { error: 'Donor not found' },
        { status: 404 }
      );
    }

    const meeting = await prisma.meeting.create({
      data: {
        donorId,
        userId,
        organizationId,

        title,
        description,

        startTime: new Date(startTime),

        endTime: new Date(
          new Date(startTime).getTime() + duration * 60000
        ),

        duration,
        meetingType, // ✅ CORRECT FIELD


        zoomMeetingId,
        zoomJoinUrl,
        zoomStartUrl,

        notes,
        status,
      },

      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await prisma.activityFeed.create({
      data: {
        userId,
        organizationId,
        donorId,

        action: 'MEETING_SCHEDULED',

        title: `Meeting scheduled with ${donor.firstName} ${donor.lastName}`,

        description: `Scheduled ${title}`,

        metadata: {
          meetingId: meeting.id,
          meetingTitle: title,
          startTime,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        meeting,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
