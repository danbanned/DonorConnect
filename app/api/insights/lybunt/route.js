export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request) {
  const organizationId = request.headers.get('x-organization-id')

  const donors = await prisma.donor.findMany({
    where: {
      organizationId,
      lastDonationDate: { lt: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
    }
  })

  return NextResponse.json(donors)
}
