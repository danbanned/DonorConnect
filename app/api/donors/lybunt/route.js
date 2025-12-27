import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


const prisma = new PrismaClient()

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const startOfThisYear = new Date(now.getFullYear(), 0, 1)
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1)

    /**
     * LYBUNT:
     * - gave last year
     * - did NOT give this year
     */
    const lybuntDonors = await prisma.donor.findMany({
      where: {
        organizationId,
        donations: {
          some: {
            date: {
              gte: startOfLastYear,
              lt: startOfThisYear,
            },
          },
          none: {
            date: {
              gte: startOfThisYear,
            },
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    return NextResponse.json(lybuntDonors)
  } catch (error) {
    console.error('LYBUNT error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate LYBUNT donors' },
      { status: 500 }
    )
  }
}
