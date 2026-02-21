export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../../lib/auth'
import { hasPermission, normalizeRole } from '../../../../lib/access-control'
import bcrypt from 'bcryptjs'

function mapToDbRole(role) {
  const normalized = normalizeRole(role)
  if (normalized === 'viewer') return 'VIEWER'
  if (normalized === 'staff') return 'STAFF'
  return 'ADMIN'
}

export async function GET() {
  const token = cookies().get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user?.orgId || !hasPermission(user, 'manage_users')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    where: { organizationId: user.orgId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(users)
}

export async function POST(request) {
  const token = cookies().get('auth_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user?.orgId || !hasPermission(user, 'manage_users')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await request.json()
  const password = data.password ? await bcrypt.hash(data.password, 10) : null
  const safeData = {
    name: data.name || null,
    email: data.email,
    role: mapToDbRole(data.role),
    status: data.status || 'ACTIVE',
    phone: data.phone || null,
    password
  }

  if (!safeData.email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const createdUser = await prisma.user.create({
    data: {
      ...safeData,
      organizationId: user.orgId
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    },
  })

  return NextResponse.json(createdUser)
}
