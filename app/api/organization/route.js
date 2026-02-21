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
  if (!user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const org = await prisma.organization.findUnique({
    where: { id: user.orgId }
  })

  return NextResponse.json({
    ...org,
    ...(org?.settings || {})
  })
}

export async function PUT(request) {
  const token = cookies().get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user?.orgId || !hasPermission(user, 'manage_org_data')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await request.json()
  const { name, ...settings } = payload

  const org = await prisma.organization.update({
    where: { id: user.orgId },
    data: {
      ...(name ? { name } : {}),
      settings
    }
  })

  return NextResponse.json(org)
}
