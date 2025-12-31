export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET(request) {
  const organizationId = request.headers.get('x-organization-id')

  const integrations = await prisma.integration.findMany({
    where: { organizationId }
  })

  return NextResponse.json(integrations)
}

export async function POST(request) {
  const organizationId = request.headers.get('x-organization-id')
  const data = await request.json()

  const integration = await prisma.integration.create({
    data: { ...data, organizationId }
  })

  return NextResponse.json(integration)
}
