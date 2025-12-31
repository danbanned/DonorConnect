export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET(request) {
  const organizationId = request.headers.get('x-organization-id')

  const org = await prisma.organization.findUnique({
    where: { id: organizationId }
  })

  return NextResponse.json(org)
}
