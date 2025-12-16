import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const timeframe = searchParams.get('timeframe') || '30days'
    const campaignId = searchParams.get('campaignId')
    const donorId = searchParams.get('donorId')

    const skip = (page - 1) * limit

    // Build date filter based on timeframe
    let dateFilter = {}
    const now = new Date()
    
    switch (timeframe) {
      case '7days':
        dateFilter.gte = new Date(now.setDate(now.getDate() - 7))
        break
      case '30days':
        dateFilter.gte = new Date(now.setDate(now.getDate() - 30))
        break
      case '90days':
        dateFilter.gte = new Date(now.setDate(now.getDate() - 90))
        break
      case 'year':
        const currentYear = new Date().getFullYear()
        dateFilter.gte = new Date(currentYear, 0, 1)
        dateFilter.lte = new Date(currentYear, 11, 31)
        break
      // 'all' - no date filter
    }

    // Build where clause
    let where = {}
    
    if (Object.keys(dateFilter).length > 0) {
      where.date = dateFilter
    }
    
    if (campaignId) {
      where.campaignId = campaignId
    }
    
    if (donorId) {
      where.donorId = donorId
    }

    // Get donations with pagination
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ])

    // Calculate summary stats
    const summary = await prisma.donation.aggregate({
      where,
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
    })

    // Get LYBUNT stats for current year
    const currentYear = new Date().getFullYear()
    const lybuntDonors = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT d.id) as count, SUM(d.amount) as total
      FROM "Donation" d
      WHERE EXTRACT(YEAR FROM d.date) = ${currentYear - 1}
      AND d.donorId NOT IN (
        SELECT DISTINCT donorId 
        FROM "Donation" 
        WHERE EXTRACT(YEAR FROM date) = ${currentYear}
      )
    `

    return NextResponse.json({
      donations,
      summary: {
        total: summary._sum.amount || 0,
        average: summary._avg.amount || 0,
        count: summary._count,
        lybuntCount: lybuntDonors[0]?.count || 0,
        lybuntValue: lybuntDonors[0]?.total || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.amount || !data.donorId) {
      return NextResponse.json(
        { error: 'Amount and donor ID are required' },
        { status: 400 }
      )
    }

    // Calculate net amount if fees are provided
    if (data.fees) {
      data.netAmount = data.amount - data.fees
    }

    // Create donation
    const donation = await prisma.donation.create({
      data: {
        ...data,
        organizationId: 'test-org', // In real app, get from session
        status: data.status || 'COMPLETED',
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        donor: true,
        campaign: true,
      },
    })

    // Update donor's giving statistics
    await updateDonorStats(donation.donorId)

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error('Error creating donation:', error)
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}

async function updateDonorStats(donorId) {
  const stats = await prisma.donation.aggregate({
    where: { donorId },
    _sum: { amount: true },
    _count: true,
    _min: { date: true },
    _max: { date: true },
  })

  await prisma.donor.update({
    where: { id: donorId },
    data: {
      totalGiven: stats._sum.amount || 0,
      giftsCount: stats._count,
      firstGiftDate: stats._min.date,
      lastGiftDate: stats._max.date,
    },
  })
}