export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../lib/auth'
import { hasPermission } from '../../../lib/access-control'

export async function GET(request) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user?.orgId || !hasPermission(user, 'view_audit_logs')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const logs = await prisma.auditLog.findMany({
      where: { organizationId: user.orgId },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json(logs)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
