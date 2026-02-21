export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../lib/auth'
import { hasPermission } from '../../../lib/access-control'

export async function GET(request) {
  const token = cookies().get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user?.orgId || !hasPermission(user, 'manage_integrations')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const integrations = await prisma.integration.findMany({
    where: { organizationId: user.orgId }
  })

  return NextResponse.json(integrations)
}

export async function POST(request) {
  const token = cookies().get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user?.orgId || !hasPermission(user, 'manage_integrations')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await request.json()

  const integration = await prisma.integration.create({
    data: { ...data, organizationId: user.orgId }
  })

  return NextResponse.json(integration)
}
