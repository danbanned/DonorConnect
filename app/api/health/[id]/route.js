import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get basic stats
    const [donorCount, donationCount, recentDonations] = await Promise.all([
      prisma.donor.count(),
      prisma.donation.count(),
      prisma.donation.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { donor: true },
      })
    ])

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        donors: donorCount,
        donations: donationCount,
        recentDonations: recentDonations.map(d => ({
          id: d.id,
          amount: d.amount,
          donor: d.donor?.firstName + ' ' + d.donor?.lastName,
          date: d.date,
        })),
      },
      uptime: process.uptime(),
      version: '1.0.0',
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      },
      { status: 500 }
    )
  }
}