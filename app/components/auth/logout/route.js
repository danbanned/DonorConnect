import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const authToken = request.cookies.get('auth_token')?.value
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (authToken || refreshToken) {
      // Delete any sessions matching the token
      await prisma.session.deleteMany({
        where: {
          OR: [
            { token: authToken },
            { refreshToken: refreshToken }
          ]
        }
      })
    }

    // Create response
    const response = NextResponse.json({ success: true })

    // Delete cookies
    response.cookies.delete('auth_token', { path: '/' })
    response.cookies.delete('refresh_token', { path: '/' })

    return response
  } catch (err) {
    console.error('Logout error:', err)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
