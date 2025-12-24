import { NextResponse } from 'next/server'

export async function POST() {
  const auth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  )

  const data = await res.json()
  return NextResponse.json(data)
}
