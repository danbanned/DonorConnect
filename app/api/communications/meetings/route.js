import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fetch from "node-fetch";

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

async function getZoomAccessToken() {
  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Failed to get Zoom access token: " + err);
  }

  const data = await res.json();
  return data.access_token;
}

async function createZoomMeeting({ topic, startTime, duration }) {
  const accessToken = await getZoomAccessToken();

  const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      type: 2,
      start_time: startTime,
      duration,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      settings: {
        join_before_host: true,
        approval_type: 0,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Zoom API failed");
  }

  return response.json();
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { donorId, startsAt, duration = 30, meetingType, notes, title, userId } = data;

    if (!donorId || !startsAt || !title || !userId) {
      return NextResponse.json(
        { error: "donorId, startsAt, title, and userId are required" },
        { status: 400 }
      );
    }

    // Fetch donor to get organizationId
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
    });

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }

    const organizationId = donor.organizationId;

    // Calculate endTime
    const startTime = new Date(startsAt);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Create Zoom meeting
    const zoomMeeting = await createZoomMeeting({
      topic: title,
      startTime,
      duration,
    });

    // Save meeting in DB
    const meeting = await prisma.meeting.create({
      data: {
        organizationId,
        userId,
        donorId,
        title,
        startTime,
        endTime,
        duration,
        meetingType,
        notes,
        zoomJoinUrl: zoomMeeting.join_url,
        zoomStartUrl: zoomMeeting.start_url,
        zoomMeetingId: zoomMeeting.id.toString(),
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (err) {
    console.error("Failed to schedule meeting:", err);
    return NextResponse.json(
      { error: err.message || "Failed to schedule meeting" },
      { status: 500 }
    );
  }
}
