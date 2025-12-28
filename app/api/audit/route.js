export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request) {
  try {
    const headers = request.headers
    const organizationId = headers.get('x-organization-id')

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const logs = await prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json(logs)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
