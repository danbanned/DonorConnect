// app/api/auth/refresh/route.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { refreshToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const refreshTokenCookie = cookieStore.get('refresh_token')?.value
    
    if (!refreshTokenCookie) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }
    
    const newToken = await refreshToken(refreshTokenCookie)
    
    const response = NextResponse.json({ success: true })
    
    // Set new access token cookie
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    )
  }
}