import { prisma } from '@/lib/db'

export async function getDonations(timeframe = '30days', page = 1, limit = 50) {
  try {
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
        break
      // 'all' - no date filter
    }

    const where = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}

    const donations = await prisma.donation.findMany({
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
      skip: (page - 1) * limit,
      take: limit,
    })

    return donations
  } catch (error) {
    console.error('Error fetching donations:', error)
    throw error
  }
}

export async function getDonationsByDonor(donorId) {
  try {
    const donations = await prisma.donation.findMany({
      where: { donorId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return donations
  } catch (error) {
    console.error('Error fetching donations by donor:', error)
    throw error
  }
}

export async function getDonationSummary() {
  try {
    const currentYear = new Date().getFullYear()
    
    const [
      total,
      thisYear,
      lastYear,
      recurring,
      lybuntStats,
      recentDonations
    ] = await Promise.all([
      // Total all-time
      prisma.donation.aggregate({
        _sum: { amount: true },
        _avg: { amount: true },
        _count: true,
      }),
      
      // This year
      prisma.donation.aggregate({
        where: {
          date: {
            gte: new Date(currentYear, 0, 1),
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
      
      // Last year
      prisma.donation.aggregate({
        where: {
          date: {
            gte: new Date(currentYear - 1, 0, 1),
            lt: new Date(currentYear, 0, 1),
          },
        },
        _sum: { amount: true },
      }),
      
      // Recurring donations
      prisma.donation.aggregate({
        where: {
          isRecurring: true,
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: true,
      }),
      
      // LYBUNT stats
      prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT d.donorId) as count,
          SUM(d.amount) as total
        FROM "Donation" d
        WHERE EXTRACT(YEAR FROM d.date) = ${currentYear - 1}
        AND d.donorId NOT IN (
          SELECT DISTINCT donorId 
          FROM "Donation" 
          WHERE EXTRACT(YEAR FROM date) = ${currentYear}
        )
      `,
      
      // Recent donations
      prisma.donation.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          donor: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ])

    const growth = lastYear._sum.amount 
      ? ((thisYear._sum.amount - lastYear._sum.amount) / lastYear._sum.amount) * 100
      : 0

    return {
      total: total._sum.amount || 0,
      average: total._avg.amount || 0,
      count: total._count,
      thisYear: thisYear._sum.amount || 0,
      thisYearCount: thisYear._count,
      growth,
      recurring: recurring._sum.amount || 0,
      recurringCount: recurring._count,
      lybuntCount: lybuntStats[0]?.count || 0,
      lybuntValue: lybuntStats[0]?.total || 0,
      recentDonations,
    }
  } catch (error) {
    console.error('Error getting donation summary:', error)
    throw error
  }
}

export async function createDonation(data) {
  try {
    const donation = await prisma.donation.create({
      data: {
        ...data,
        organizationId: 'test-org',
        date: data.date ? new Date(data.date) : new Date(),
        status: data.status || 'COMPLETED',
      },
      include: {
        donor: true,
        campaign: true,
      },
    })

    // Update donor stats
    await updateDonorStats(donation.donorId)

    return donation
  } catch (error) {
    console.error('Error creating donation:', error)
    throw error
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