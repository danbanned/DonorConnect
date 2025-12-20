import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getDonors(filter = 'all', page = 1, limit = 50) {
  try {
    let where = {}
    
    if (filter === 'major') {
      where.totalGiven = { gt: 10000 }
    } else if (filter === 'active') {
      where.status = 'ACTIVE'
    }
    
    const donors = await prisma.donor.findMany({
      where,
      include: {
        donations: {
          take: 5,
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { lastName: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    return donors
  } catch (error) {
    console.error('Error fetching donors:', error)
    throw error
  }
}

export async function getDonorById(id) {
  try {
    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        donations: {
          orderBy: { date: 'desc' },
          include: {
            campaign: true,
          },
        },
        communications: {
          orderBy: { sentAt: 'desc' },
          take: 10,
        },
      },
    })
    
    return donor
  } catch (error) {
    console.error('Error fetching donor:', error)
    throw error
  }
}

export async function getDashboardData() {
  try {
    const [
      totalDonors,
      totalDonations,
      recentDonations,
      lybuntCount,
    ] = await Promise.all([
      prisma.donor.count(),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),
      prisma.donation.findMany({
        orderBy: { date: 'desc' },
        take: 10,
        include: {
          donor: true,
        },
      }),
      prisma.donor.count({
        where: {
          lastGiftDate: {
            lt: new Date(new Date().getFullYear(), 0, 1),
            gte: new Date(new Date().getFullYear() - 1, 0, 1),
          },
        },
      }),
    ])
    
    return {
      totalDonors,
      ytdAmount: totalDonations._sum.amount || 0,
      recentDonations,
      lybuntCount,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}