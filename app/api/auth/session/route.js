// app/api/auth/session/route.js
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '/lib/db.js'



const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Token is invalid or expired
      return NextResponse.json({ user: null });
    }
    
    // Check if session exists in database
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          include: {
            organization: true
          }
        }
      }
    });
    
    if (!session) {
      return NextResponse.json({ user: null });
    }
    
    // Update last activity
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() }
    });
    
    // Return user data (without sensitive info)
    const user = session.user;
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      },
      lastActivityAt: session.lastActivityAt
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}