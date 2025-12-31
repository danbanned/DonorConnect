export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')
  const organizationId = request.headers.get('x-organization-id')

  const donors = await prisma.donor.findMany({
    where: { organizationId },
    include: { donations: true }
  })

  return NextResponse.json(donors)
}
