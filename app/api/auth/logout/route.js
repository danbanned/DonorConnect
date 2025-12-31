// app/api/auth/logout/route.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

export async function POST(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      // Optionally, find session by token and delete it
      await prisma.session.deleteMany({
        where: {
          token
        }
      });
    }

    // Clear cookies
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
