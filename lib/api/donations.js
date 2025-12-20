import 'server-only'
import { prisma } from '@/lib/db'

/////////////////////////////////////////////////
// GET DONATIONS
/////////////////////////////////////////////////

export async function getDonations(timeframe = '30days', page = 1, limit = 50) {
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
      dateFilter.gte = new Date(new Date().getFullYear(), 0, 1)
      break
  }

  const where =
    Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}

  return prisma.donation.findMany({
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
}

/////////////////////////////////////////////////
// DONATIONS BY DONOR
/////////////////////////////////////////////////

export async function getDonationsByDonor(donorId) {
  return prisma.donation.findMany({
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
}

/////////////////////////////////////////////////
// DONATION SUMMARY
/////////////////////////////////////////////////

export async function getDonationSummary() {
  const currentYear = new Date().getFullYear()

  const [
    total,
    thisYear,
    lastYear,
    recurring,
    lybuntStats,
    recentDonations,
  ] = await Promise.all([
    prisma.donation.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
    }),

    prisma.donation.aggregate({
      where: {
        date: { gte: new Date(currentYear, 0, 1) },
      },
      _sum: { amount: true },
      _count: true,
    }),

    prisma.donation.aggregate({
      where: {
        date: {
          gte: new Date(currentYear - 1, 0, 1),
          lt: new Date(currentYear, 0, 1),
        },
      },
      _sum: { amount: true },
    }),

    prisma.donation.aggregate({
      where: {
        isRecurring: true,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    }),

    prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT d."donorId") AS count,
        SUM(d.amount) AS total
      FROM "Donation" d
      WHERE EXTRACT(YEAR FROM d.date) = ${currentYear - 1}
        AND d."donorId" NOT IN (
          SELECT DISTINCT "donorId"
          FROM "Donation"
          WHERE EXTRACT(YEAR FROM date) = ${currentYear}
        )
    `,

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

  const growth =
    lastYear._sum.amount && lastYear._sum.amount > 0
      ? ((thisYear._sum.amount - lastYear._sum.amount) /
          lastYear._sum.amount) *
        100
      : 0

  return {
    total: total._sum.amount ?? 0,
    average: total._avg.amount ?? 0,
    count: total._count,
    thisYear: thisYear._sum.amount ?? 0,
    thisYearCount: thisYear._count,
    growth,
    recurring: recurring._sum.amount ?? 0,
    recurringCount: recurring._count,
    lybuntCount: lybuntStats?.[0]?.count ?? 0,
    lybuntValue: lybuntStats?.[0]?.total ?? 0,
    recentDonations,
  }
}

/////////////////////////////////////////////////
// CREATE DONATION
/////////////////////////////////////////////////

export async function createDonation(data) {
  return prisma.donation.create({
    data: {
      organizationId: data.organizationId,
      donorId: data.donorId,
      amount: data.amount,
      currency: data.currency ?? 'USD',
      paymentMethod: data.paymentMethod,
      campaignId: data.campaignId ?? null,
      date: data.date ? new Date(data.date) : new Date(),
      status: data.status ?? 'COMPLETED',
      notes: data.notes ?? null,
    },
    include: {
      donor: true,
      campaign: true,
    },
  })
}
