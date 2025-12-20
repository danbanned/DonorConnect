import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';
import validator from 'validator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    console.log('Login attempt started');
    console.log('Request body:', body);

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const sanitizedEmail = validator.normalizeEmail(validator.trim(email));
    const sanitizedPassword = validator.trim(password);

    if (!validator.isEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
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
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Please use the password reset function to set a password' },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(sanitizedPassword, user.password);
    console.log('Password valid?', passwordValid);

    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Failed attempts check
    const failedAttempts = await prisma.auditLog.count({
      where: {
        userId: user.id,
        action: 'LOGIN_FAILED',
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } // last 30 min
      }
    });
    console.log('Failed attempts in last 30min:', failedAttempts);

    if (failedAttempts >= 10) {
      return NextResponse.json(
        { error: 'Account temporarily locked due to too many failed attempts' },
        { status: 423 }
      );
    }

    // Create tokens
    const tokenExpiry = rememberMe ? '30d' : '1d';
    const refreshExpiry = '90d';

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: refreshExpiry }
    );

    const tokenExpires = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    const refreshExpires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    console.log('Tokens created');

    // ✅ Create a new session instead of upsert
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        refreshToken,
        expiresAt: tokenExpires,
        lastActivityAt: new Date(),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    // Optional: delete expired sessions (keep only last 5 active)
    const sessionsToDelete = await prisma.session.findMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
      orderBy: { lastActivityAt: 'desc' },
      skip: 5
    });

    if (sessionsToDelete.length > 0) {
      await prisma.session.deleteMany({
        where: { id: { in: sessionsToDelete.map(s => s.id) } }
      });
      console.log(`Deleted ${sessionsToDelete.length} expired sessions`);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'LOGIN_SUCCESS',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }
    });

    // Response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: tokenExpires,
      path: '/'
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: refreshExpires,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
