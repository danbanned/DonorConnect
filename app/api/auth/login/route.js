export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs' // Change from 'bcrypt' to 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import prisma from '../../../../lib/db'
import { toUserContext } from '../../../../lib/access-control'


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    console.log('Login attempt for:', email)

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      )
    }

    const sanitizedEmail = validator.normalizeEmail(validator.trim(email))
    const sanitizedPassword = validator.trim(password)

    if (!validator.isEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { email: sanitizedEmail },
      include: {
        organization: true,
        sessions: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { lastActivityAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' }, 
        { status: 401 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Please use the password reset function to set a password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await bcrypt.compare(sanitizedPassword, user.password)
    
    if (!passwordValid) {
      // Log failed attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId,
          action: 'LOGIN_FAILED',
          entityType: 'USER',
          entityId: user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent'),
          details: { reason: 'Invalid password' }
        }
      })
      
      return NextResponse.json(
        { error: 'Invalid email or password' }, 
        { status: 401 }
      )
    }

    // Check if user is active
    if (user.status && user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is not active. Please contact support.' },
        { status: 403 }
      )
    }

    // Create tokens
    const tokenExpiry = rememberMe ? '30d' : '1d'
    const refreshExpiry = '90d'

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role, 
        organizationId: user.organizationId 
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    )

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: refreshExpiry }
    )

    const tokenExpires = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000))
    const refreshExpires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        refreshToken,
        expiresAt: tokenExpires,
        lastActivityAt: new Date(),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    // Clean up old sessions (keep only 5 most recent)
    const activeSessions = await prisma.session.findMany({
      where: { 
        userId: user.id,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActivityAt: 'desc' }
    })

    if (activeSessions.length > 5) {
      const sessionsToDelete = activeSessions.slice(5)
      await prisma.session.deleteMany({
        where: { id: { in: sessionsToDelete.map(s => s.id) } }
      })
    }

    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'LOGIN_SUCCESS',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }
    })

    // Update user last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Create response
    const response = NextResponse.json({
      success: true,
      user: toUserContext({
        id: user.id,
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization
      })
    })

    // Set cookies
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: tokenExpires,
      path: '/'
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: refreshExpires,
      path: '/'
    })

    console.log('Login successful for:', email)
    return response

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    )
  }
}

// Add GET method for health check
// Add GET method to retrieve user info from token
export async function GET(request) {
  try {
    // Get auth token from cookies
    const authToken = request.cookies.get('auth_token')?.value
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'No authentication token found' }, 
        { status: 401 }
      )
    }

    // Verify and decode the token
    const decoded = jwt.verify(authToken, JWT_SECRET)
    
    // Find the user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    // Return user information including login name (email)
    return NextResponse.json({
      success: true,
      user: toUserContext({
        id: user.id,
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organization?.id,
        organization: user.organization
      })
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' }, 
        { status: 401 }
      )
    }
    
    console.error('❌ GET USER INFO ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    )
  }
}
