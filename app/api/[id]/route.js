import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Force dynamic so Next.js doesn't pre-render at build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use a global Prisma client to avoid exhausting connections in development
let prisma
if (!global.prisma) {
  global.prisma = new PrismaClient()
}
prisma = global.prisma

export async function GET(request, { params }) {
  try {
    // Test the database connection
    await prisma.$queryRaw`SELECT 1`

    // Fetch donor stats
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
    console.error('API error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
