import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    await prisma.$queryRaw`SELECT 1`

    const [donorCount, donationCount, recentDonations] = await Promise.all([
      prisma.donor.count(),
      prisma.donation.count(),
      prisma.donation.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { donor: true },
      }),
    ])

    return NextResponse.json({
      status: 'healthy',
      id: params.id,
      database: 'connected',
      stats: {
        donors: donorCount,
        donations: donationCount,
        recentDonations: recentDonations.map(d => ({
          id: d.id,
          amount: d.amount,
          donor: d.donor
            ? `${d.donor.firstName} ${d.donor.lastName}`
            : null,
          date: d.date,
        })),
      },
      uptime: process.uptime(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
