export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../../lib/auth'
import { toUserContext } from '../../../../lib/access-control'

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user?.userId || !user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.user.findFirst({
      where: {
        id: user.userId,
        organizationId: user.orgId
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        timeZone: true,
        language: true,
        defaultDashboardView: true,
        emailFrequency: true,
        notificationPreferences: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const context = toUserContext({
      ...profile,
      organizationId: user.orgId,
      permissions: user.permissions
    })

    return NextResponse.json({
      ...profile,
      ...context
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user?.userId || !user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    const allowedFields = [
      'name',
      'phone',
      'timeZone',
      'language',
      'defaultDashboardView',
      'emailFrequency',
      'notificationPreferences',
      'profilePhoto'
    ]
    const safeUpdates = {}
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        safeUpdates[key] = updates[key]
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: 'No allowed fields to update' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: safeUpdates
    })

    return NextResponse.json(updatedUser)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Profile update failed' }, { status: 500 })
  }
}
