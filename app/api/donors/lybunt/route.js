import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../../lib/auth'


const prisma = new PrismaClient()

export async function GET(req) {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    const organizationId = user?.orgId
    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        ...(user.role === 'viewer' ? { assignedToId: user.userId } : {}),
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
