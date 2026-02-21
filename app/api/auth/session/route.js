// app/api/auth/session/route.js
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '../../../../lib/db'
import { verifyToken } from '../../../../lib/auth'
import { toUserContext } from '../../../../lib/access-control'

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    let verifiedUser
    try {
      verifiedUser = await verifyToken(token)
    } catch (error) {
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
    const contextUser = toUserContext({
      ...verifiedUser,
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization
    })

    return NextResponse.json({
      user: contextUser,
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
