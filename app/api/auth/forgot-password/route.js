// app/api/auth/forgot-password/route.js

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../../lib/db';
import validator from 'validator';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Note: You'll need to set up email service (nodemailer, sendgrid, etc.)

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const sanitizedEmail = validator.normalizeEmail(validator.trim(email));
    
    if (!validator.isEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    });
    
    // Don't reveal if user exists (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, reset instructions have been sent'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token expiration (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });
    
    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt
      }
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }
    });
    
    // In production, send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    
    // Example email sending (you need to implement email service)
    // await sendResetEmail(user.email, resetUrl);
    
    console.log('Reset URL:', resetUrl); // Remove this in production
    
    return NextResponse.json({
      success: true,
      message: 'If an account exists, reset instructions have been sent'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}