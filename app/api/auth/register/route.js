export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import prisma from '../../../../lib/db'
import { sendWelcomeEmail, sendAdminNotification } from '../../../../lib/api/email.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      organizationName, 
      phone, 
      password 
    } = body

    console.log('📝 Registration attempt for:', email)

    // Validation
    if (!name || !email || !organizationName || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          details: 'Name, email, organization name, and password are required'
        }, 
        { status: 400 }
      )
    }

    // Sanitize and validate inputs
    const sanitizedName = validator.trim(name)
    const sanitizedEmail = validator.normalizeEmail(validator.trim(email))
    const sanitizedOrgName = validator.trim(organizationName)
    const sanitizedPhone = phone ? validator.trim(phone) : null
    const sanitizedPassword = validator.trim(password)

    // Validate email
    if (!validator.isEmail(sanitizedEmail)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format' 
        }, 
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email already registered',
          suggestion: 'Please use a different email or try logging in'
        }, 
        { status: 409 }
      )
    }

    // Validate organization name uniqueness (optional)
    const existingOrg = await prisma.organization.findFirst({
      where: { 
        name: { 
          equals: sanitizedOrgName,
          mode: 'insensitive'
        }
      }
    })

    if (existingOrg) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Organization name already exists',
          suggestion: 'Please use a different organization name'
        }, 
        { status: 409 }
      )
    }

    // Validate password strength
    if (sanitizedPassword.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 8 characters' 
        }, 
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(sanitizedPassword)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must include uppercase, lowercase, and numbers',
          suggestion: 'Try adding at least one uppercase letter and one number'
        }, 
        { status: 400 }
      )
    }

    // Generate organization slug
    const orgSlug = sanitizedOrgName
      .toLowerCase()
      .replace(/[^\w\s-]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)

    // Calculate trial end date (30 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 30)

    // Start transaction to create organization and user
    const result = await prisma.$transaction(async (tx) => {
      // Create organization first
      const organization = await tx.organization.create({
        data: {
          name: sanitizedOrgName,
          slug: orgSlug,
          plan: 'FREE',
          donorCount: 0,
          staffCount: 1,
          trialEndsAt: trialEndsAt,
          subscriptionEndsAt: null,
          settings: {
            defaultSenderName: sanitizedOrgName,
            defaultSenderEmail: sanitizedEmail,
            timeZone: 'America/New_York',
            language: 'en',
            currency: 'USD',
            emailFrequency: 'INSTANT',
            notificationPreferences: {
              donorUpdates: true,
              taskReminders: true,
              systemAlerts: true,
              emailNotifications: true,
              pushNotifications: false
            }
          }
        }
      })

      // Hash password
      const hashedPassword = await bcrypt.hash(sanitizedPassword, 12)

      // Create user as ADMIN (first user of organization)
      const user = await tx.user.create({
        data: {
          name: sanitizedName,
          email: sanitizedEmail,
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          phone: sanitizedPhone,
          timeZone: 'America/New_York',
          language: 'en',
          defaultDashboardView: 'overview',
          emailFrequency: 'INSTANT',
          notificationPreferences: {
            donorUpdates: true,
            taskReminders: true,
            systemAlerts: true,
            emailNotifications: true,
            pushNotifications: false
          },
          organizationId: organization.id,
          lastPasswordChangeAt: new Date(),
          lastLoginAt: new Date()
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: true,
              trialEndsAt: true,
              createdAt: true
            }
          }
        }
      })

      // Create welcome audit log
      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          action: 'USER_REGISTERED',
          entityType: 'USER',
          entityId: user.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent'),
          details: { 
            registrationType: 'organization_creation',
            organizationName: organization.name
          }
        }
      })

      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          name: user.name,
          role: user.role, 
          organizationId: user.organizationId 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Create session
      const session = await tx.session.create({
        data: {
          userId: user.id,
          token: token,
          refreshToken: jwt.sign({ userId: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' }),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastActivityAt: new Date(),
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      })

      return { user, organization, token, session }
    })

    // Send welcome email (in background, don't wait for it)
    if (process.env.NODE_ENV === 'production' || process.env.SEND_EMAILS_IN_DEV === 'true') {
      try {
        await sendWelcomeEmail({
          to: result.user.email,
          name: result.user.name,
          organizationName: result.organization.name,
          loginUrl: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/login`
        })
        console.log('✅ Welcome email sent to:', result.user.email)
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError.message)
        // Don't fail registration if email fails
      }
    } else {
      console.log('🟡 Skipping email in development mode')
    }

    // Send admin notification (in background)
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendAdminNotification({
          type: 'NEW_ORGANIZATION',
          organizationName: result.organization.name,
          userEmail: result.user.email,
          userCount: 1
        })
        console.log('✅ Admin notification sent')
      } catch (notificationError) {
        console.error('⚠️ Failed to send admin notification:', notificationError.message)
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Your account has been created.',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
          plan: result.organization.plan,
          trialEndsAt: result.organization.trialEndsAt,
          createdAt: result.organization.createdAt
        }
      },
      nextSteps: [
        'Check your email for a welcome message',
        'Complete your profile setup',
        'Invite team members to join your organization',
        'Start adding your first donors'
      ],
      trialInfo: {
        daysRemaining: Math.ceil((new Date(result.organization.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)),
        endDate: result.organization.trialEndsAt
      }
    }, { status: 201 })

    // Set auth cookies (same as login endpoint)
    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      path: '/'
    })

    response.cookies.set('refresh_token', result.session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      path: '/'
    })

    console.log('✅ Registration successful for:', email)
    console.log('✅ Organization created:', result.organization.name)
    console.log('✅ User ID:', result.user.id)
    console.log('✅ Organization ID:', result.organization.id)
    
    return response

  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error)
    console.error('❌ Error details:', error.message)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database constraint violation',
          details: 'A unique constraint failed. This email or organization may already exist.',
          code: error.code
        }, 
        { status: 409 }
      )
    }

    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error',
          details: 'Invalid data format provided. Please check all fields.',
          code: 'VALIDATION_ERROR'
        }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Registration failed', 
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        code: 'INTERNAL_ERROR'
      }, 
      { status: 500 }
    )
  }
}

// GET endpoint for checking registration status
export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'active',
    message: 'Registration endpoint is ready',
    requirements: {
      requiredFields: ['name', 'email', 'organizationName', 'password'],
      optionalFields: ['phone'],
      passwordRules: [
        'Minimum 8 characters',
        'At least one uppercase letter',
        'At least one lowercase letter',
        'At least one number'
      ]
    },
    trialPeriod: '30 days',
    emailService: process.env.SMTP_HOST ? 'Configured' : 'Not configured',
    environment: process.env.NODE_ENV || 'development'
  })
}