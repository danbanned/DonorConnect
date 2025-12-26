import 'server-only'
import { prisma } from '@/lib/db'
import { Prisma } from "@prisma/client";

/////////////////////////////////////////////////
// GET DONATIONS (Updated to accept filters)
/////////////////////////////////////////////////

export async function getDonations(filters = {}) {
  const {
    timeframe = '30days',
    page = 1,
    limit = 50,
    donorId,
    donorIds,
    campaignId,
    organizationId,
  } = filters

  // Build where clause
  const where = {}

  // Always include organizationId if provided
  if (organizationId) {
    where.organizationId = organizationId
  }

  // Add donor filter if provided
  if (donorId) {
    where.donorId = donorId
  }

  // Handle multiple donor IDs
  if (donorIds && donorIds.length > 0) {
    where.donorId = { in: donorIds }
  } else if (donorId) {
    where.donorId = donorId
  }

  // Add campaign filter if provided
  if (campaignId) {
    where.campaignId = campaignId
  }

  // Add date filter based on timeframe
  if (timeframe !== 'all') {
    const dateFilter = {}
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

    where.date = dateFilter
  }

  const skip = (page - 1) * limit

  return prisma.donation.findMany({
    where,
    include: {
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          //“For each Donation, also fetch the related Donor record,
          //  and from that Donor record, return these fields.”
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
  })
}

/////////////////////////////////////////////////
// DONATIONS BY DONOR (kept for backward compatibility)
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
// DONATION SUMMARY (Updated to accept filters)
/////////////////////////////////////////////////

export async function getDonationSummary(filters = {}) {
  const {
    timeframe = '30days',
    donorId,
    campaignId,
    organizationId,
  } = filters

  // Build where clause
  const where = {}

  // Always include organizationId if provided
  if (organizationId) {
    where.organizationId = organizationId
  }

  // Add donor filter if provided
  if (donorId) {
    where.donorId = donorId
  }

  // Add campaign filter if provided
  if (campaignId) {
    where.campaignId = campaignId
  }

  // Add date filter based on timeframe
  if (timeframe !== 'all') {
    const dateFilter = {}
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

    where.date = dateFilter
  }

  // For backward compatibility, run both queries
  const [
    total,
    thisYear,
    lastYear,
    recurring,
    lybuntStats,
    recentDonations,
  ] = await Promise.all([
    // Basic aggregates with current filters
    prisma.donation.aggregate({
      where,
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
    }),

    // This year stats (always calculate for dashboard)
    prisma.donation.aggregate({
      where: {
        ...where,
        date: { gte: new Date(new Date().getFullYear(), 0, 1) },
      },
      _sum: { amount: true },
      _count: true,
    }),

    // Last year stats (always calculate for dashboard)
    prisma.donation.aggregate({
      where: {
        ...where,
        date: {
          gte: new Date(new Date().getFullYear() - 1, 0, 1),
          lt: new Date(new Date().getFullYear(), 0, 1),
        },
      },
      _sum: { amount: true },
    }),

    // Recurring stats with current filters
    prisma.donation.aggregate({
      where: {
        ...where,
        isRecurring: true,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    }),

    // LY BUNT stats (only calculate if no specific donor filter)
    donorId ? Promise.resolve([{ count: 0, total: 0 }]) : prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT d."donorId") AS count,
        SUM(d.amount) AS total
      FROM "Donation" d
      WHERE EXTRACT(YEAR FROM d.date) = ${new Date().getFullYear() - 1}
        AND d."donorId" NOT IN (
          SELECT DISTINCT "donorId"
          FROM "Donation"
          WHERE EXTRACT(YEAR FROM date) = ${new Date().getFullYear()}
        )
        ${organizationId ? Prisma.sql`AND d."organizationId" = ${organizationId}` : Prisma.empty}
    `,

    // Recent donations with current filters
    prisma.donation.findMany({
      where,
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
    totalCount: total._count, // For pagination
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
      // Add additional fields from your data structure
      isRecurring: data.isRecurring ?? false,
      type: data.type ?? 'ONE_TIME',
      fees: data.fees ?? 0,
      netAmount: data.netAmount ?? null,
      transactionId: data.transactionId ?? null,
    },
    include: {
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      campaign: true,
    },
  })
}

/////////////////////////////////////////////////
// GET DONATIONS (Backward compatibility wrapper)
/////////////////////////////////////////////////

// Keep the old function signature for backward compatibility
export async function getDonationsOld(timeframe = '30days', page = 1, limit = 50) {
  return getDonations({ timeframe, page, limit })
}