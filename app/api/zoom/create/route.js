export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function POST(req) {
  const { topic, startTime } = await req.json()

  // Get token
  const tokenRes = await fetch('http://localhost:3000/api/zoom/token', {
    method: 'POST',
  })
  const { access_token } = await tokenRes.json()

  // Create meeting
  const zoomRes = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2,
      start_time: startTime,
      settings: {
        join_before_host: true,
      },
    }),
  })

  const meeting = await zoomRes.json()
  return NextResponse.json(meeting)
}
