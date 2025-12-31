export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, entityType, entityId, details } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const headers = request.headers
    const userId = headers.get('x-user-id') || null
    const organizationId = headers.get('x-organization-id') || null
    const ipAddress = headers.get('x-forwarded-for') || 'unknown'

    await prisma.auditLog.create({
      data: {
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        details: details || null,
        userId,
        organizationId,
        ipAddress,
        userAgent: headers.get('user-agent'),
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audit log error:', error)
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 })
  }
}
