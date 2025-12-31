export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function POST(request) {
  const organizationId = request.headers.get('x-organization-id')
  const data = await request.json()

  const user = await prisma.user.create({
    data: { ...data, organizationId }
  })

  return NextResponse.json(user)
}
