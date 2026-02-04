import axios from 'axios';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

/**
 * POST /api/zoom/create
 */
export async function POST(request) {
  try {
    // ✅ Auth
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      topic,
      startTime,
      duration = 30,
      timezone = 'America/New_York',
      agenda,
      donorName,
    } = body;

    if (!topic || !startTime) {
      return NextResponse.json(
        { error: 'Missing topic or startTime' },
        { status: 400 }
      );
    }

    // ✅ Env check
    const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
    const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;

    if (!ZOOM_API_KEY || !ZOOM_API_SECRET) {
      return NextResponse.json(
        { error: 'Zoom credentials missing' },
        { status: 500 }
      );
    }

    // ✅ JWT for Zoom
    const payload = {
      iss: ZOOM_API_KEY,
      exp: Math.floor(Date.now() / 1000) + 60,
    };

    const zoomToken = jwt.sign(payload, ZOOM_API_SECRET);

    // ✅ Create meeting
    const zoomResponse = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic,
        type: 2,
        start_time: new Date(startTime).toISOString(),
        duration,
        timezone,
        agenda: agenda || `Meeting with ${donorName || 'Donor'}`,
      },
      {
        headers: {
          Authorization: `Bearer ${zoomToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const meeting = zoomResponse.data;

    // ✅ Match your meetings API format
    return NextResponse.json({
      success: true,
      meeting: {
        id: meeting.id,
        topic: meeting.topic,
        joinUrl: meeting.join_url,
        startUrl: meeting.start_url,
        startTime: meeting.start_time,
        duration: meeting.duration,
        timezone: meeting.timezone,
        createdBy: user.id,
        organizationId: user.organizationId,
      },
    });

  } catch (error) {
    console.error('Zoom error:', error?.response?.data || error);

    return NextResponse.json(
      {
        error: 'Failed to create Zoom meeting',
        details: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
