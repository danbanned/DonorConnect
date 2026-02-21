import 'server-only'
import { prisma, Prisma } from '../db.js'

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
    assignedToUserId,
    status,
    type,
    minAmount,
    maxAmount,
    includeSimulated = false,
    sortBy = 'date',
    sortOrder = 'desc'
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

  if (assignedToUserId) {
    where.donor = { assignedToId: assignedToUserId }
  }

  // Add status filter
  if (status) {
    where.status = status
  }

  // Add type filter
  if (type) {
    where.type = type
  }

  // Add amount range filters
  if (minAmount || maxAmount) {
    where.amount = {}
    if (minAmount) where.amount.gte = parseFloat(minAmount)
    if (maxAmount) where.amount.lte = parseFloat(maxAmount)
  }

  // Add simulated filter
  if (!includeSimulated) {
    where.isSimulated = false
  }

  // Add date filter based on timeframe
  if (timeframe !== 'all' && timeframe !== 'ytd') {
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
  } else if (timeframe === 'ytd') {
    where.date = {
      gte: new Date(new Date().getFullYear(), 0, 1)
    }
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
          organizationId: true
          //“For each Donation, also fetch the related Donor record,
          //  and from that Donor record, return these fields.”
        },
      },
      campaign: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      softCredits: {
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      },
      communications: {
        select: {
          id: true,
          type: true,
          sentAt: true,
          subject: true
        },
        take: 3,
        orderBy: { sentAt: 'desc' }
      }
    },
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
  })
}

/////////////////////////////////////////////////
// GET SINGLE DONATION
/////////////////////////////////////////////////

export async function getDonationById(id, organizationId) {
  return prisma.donation.findFirst({
    where: {
      id,
      organizationId
    },
    include: {
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          relationshipStage: true
        }
      },
      campaign: {
        select: {
          id: true,
          name: true,
          description: true,
          goal: true,
          status: true
        }
      },
      softCredits: {
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      },
      communications: {
        select: {
          id: true,
          type: true,
          direction: true,
          subject: true,
          content: true,
          sentAt: true,
          status: true
        },
        orderBy: { sentAt: 'desc' }
      }
    }
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
    donorIds,
    campaignId,
    organizationId,
    assignedToUserId,
    includeSimulated = false
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
  }

  if (assignedToUserId) {
    where.donor = { assignedToId: assignedToUserId }
  }

  // Add campaign filter if provided
  if (campaignId) {
    where.campaignId = campaignId
  }

  // Add simulated filter
  if (!includeSimulated) {
    where.isSimulated = false
  }

  // Add date filter based on timeframe
  if (timeframe !== 'all' && timeframe !== 'ytd') {
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
  } else if (timeframe === 'ytd') {
    where.date = {
      gte: new Date(new Date().getFullYear(), 0, 1)
    }
  }

  // For backward compatibility, run both queries
  const [
    total,
    thisYear,
    lastYear,
    recurring,
    lybuntStats,
    recentDonations,
    allDonationsForSummary
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
        ${!includeSimulated ? Prisma.sql`AND d."isSimulated" = false` : Prisma.empty}
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

    // All donations for additional summary stats
    prisma.donation.findMany({
      where: {
        ...where,
        status: 'COMPLETED'
      },
      select: {
        id: true,
        amount: true,
        donorId: true,
        date: true,
        status: true,
        paymentMethod: true,
        type: true
      }
    })
  ])

  const growth =
    lastYear._sum.amount && lastYear._sum.amount > 0
      ? ((thisYear._sum.amount - lastYear._sum.amount) /
          lastYear._sum.amount) *
        100
      : 0

  // Calculate additional summary stats
  const completedDonations = allDonationsForSummary.filter(d => d.status === 'COMPLETED')
  const completedAmount = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
  const completedCount = completedDonations.length

  // Group by month for charting
  const donationsByMonth = {}
  allDonationsForSummary.forEach(donation => {
    const date = new Date(donation.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!donationsByMonth[monthKey]) {
      donationsByMonth[monthKey] = {
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        amount: 0,
        count: 0
      }
    }
    donationsByMonth[monthKey].amount += donation.amount || 0
    donationsByMonth[monthKey].count += 1
  })

  const monthlyData = Object.values(donationsByMonth).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return new Date(`${a.month} 1, ${a.year}`) - new Date(`${b.month} 1, ${b.year}`)
  })

  // Group by payment method
  const paymentMethodBreakdown = {}
  allDonationsForSummary.forEach(donation => {
    const method = donation.paymentMethod
    if (!paymentMethodBreakdown[method]) {
      paymentMethodBreakdown[method] = {
        method,
        totalAmount: 0,
        donationCount: 0
      }
    }
    paymentMethodBreakdown[method].totalAmount += donation.amount || 0
    paymentMethodBreakdown[method].donationCount += 1
  })

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
    completedAmount,
    completedCount,
    monthlyData,
    paymentMethodBreakdown: Object.values(paymentMethodBreakdown)
  }
}

/////////////////////////////////////////////////
// CREATE DONATION
/////////////////////////////////////////////////

export async function createDonation(data) {
  if (!data.organizationId) {
    throw new Error('organizationId must be injected by server')
  }

  if (!data.donorId) {
    throw new Error('donorId is required')
  }

  if (!data.amount || data.amount <= 0) {
    throw new Error('Valid amount is required')
  }

  if (!data.paymentMethod) {
    throw new Error('Payment method is required')
  }

  // Calculate net amount if fees provided
  const netAmount = data.amount - (data.fees || 0)

  return prisma.donation.create({
    data: {
      organization: {
        connect: { id: data.organizationId },
      },
      donor: {
        connect: { id: data.donorId },
      },
      campaign: data.campaignId
        ? { connect: { id: data.campaignId } }
        : undefined,

      amount: data.amount,
      currency: data.currency ?? 'USD',

      // ✅ REQUIRED ENUM — always default
      paymentMethod: data.paymentMethod,

      date: data.date ? new Date(data.date) : new Date(),
      status: data.status ?? 'COMPLETED',
      notes: data.notes ?? null,

      isRecurring: data.isRecurring ?? false,
      type: data.type ?? 'ONE_TIME',
      fees: data.fees ?? 0,
      netAmount: data.netAmount ?? netAmount,
      transactionId: data.transactionId ?? null,
      isTribute: data.isTribute ?? false,
      tributeName: data.tributeName ?? null,
      tributeType: data.tributeType ?? null,
      isSimulated: data.isSimulated ?? false
    },
    include: {
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      campaign: true,
    },
  })
}

/////////////////////////////////////////////////
// UPDATE DONATION
/////////////////////////////////////////////////

export async function updateDonation(id, organizationId, data) {
  // Verify donation exists and belongs to organization
  const existingDonation = await prisma.donation.findFirst({
    where: {
      id,
      organizationId
    }
  })

  if (!existingDonation) {
    throw new Error('Donation not found')
  }

  // Calculate net amount if amount or fees are updated
  let netAmount = existingDonation.netAmount
  if (data.amount !== undefined || data.fees !== undefined) {
    const newAmount = data.amount !== undefined ? data.amount : existingDonation.amount
    const newFees = data.fees !== undefined ? data.fees : existingDonation.fees
    netAmount = newAmount - (newFees || 0)
  }

  return prisma.donation.update({
    where: { id },
    data: {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod }),
      ...(data.transactionId !== undefined && { transactionId: data.transactionId }),
      ...(data.campaignId !== undefined && { campaignId: data.campaignId || null }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      ...(data.recurringId !== undefined && { recurringId: data.recurringId }),
      ...(data.isTribute !== undefined && { isTribute: data.isTribute }),
      ...(data.tributeName !== undefined && { tributeName: data.tributeName }),
      ...(data.tributeType !== undefined && { tributeType: data.tributeType }),
      ...(data.fees !== undefined && { fees: data.fees }),
      ...(netAmount !== undefined && { netAmount }),
      ...(data.isSimulated !== undefined && { isSimulated: data.isSimulated })
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
      campaign: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
}

/////////////////////////////////////////////////
// DELETE DONATION
/////////////////////////////////////////////////

export async function deleteDonation(id, organizationId) {
  // Verify donation exists and belongs to organization
  const donation = await prisma.donation.findFirst({
    where: {
      id,
      organizationId
    },
    include: {
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  })

  if (!donation) {
    throw new Error('Donation not found')
  }

  // Delete related records in a transaction
  await prisma.$transaction([
    // Delete soft credits
    prisma.softCredit.deleteMany({
      where: { donationId: id }
    }),
    // Update communications to remove donation reference
    prisma.communication.updateMany({
      where: { relatedDonationId: id },
      data: { relatedDonationId: null }
    }),
    // Delete activity feed entries
    prisma.activityFeed.deleteMany({
      where: { donationId: id }
    }),
    // Delete donor activities
    prisma.donorActivity.deleteMany({
      where: { relatedDonationId: id }
    }),
    // Finally delete the donation
    prisma.donation.delete({
      where: { id }
    })
  ])

  return donation
}

/////////////////////////////////////////////////
// LOG DONOR ACTIVITY
/////////////////////////////////////////////////

export async function logDonorActivity({
  organizationId,
  donorId,
  donationId,
  userId,
  action,
  title,
  description,
  amount,
  metadata = {},
  priority = 'NORMAL'
}) {
  return prisma.activityFeed.create({
    data: {
      organizationId,
      donorId,
      donationId,
      userId,
      action,
      title,
      description: description || title,
      amount,
      metadata,
      priority,
      isRead: false,
      createdAt: new Date()
    },
  })
}

/////////////////////////////////////////////////
// LOG DONOR ACTIVITY (Legacy - kept for backward compatibility)
/////////////////////////////////////////////////

export async function logDonorActivityLegacy({
  organizationId,
  donorId,
  donationId,
  action,
  title,
  amount,
  metadata = {},
}) {
  return logDonorActivity({
    organizationId,
    donorId,
    donationId,
    action,
    title,
    amount,
    metadata
  })
}

/////////////////////////////////////////////////
// GET DONATION SUMMARY BY CAMPAIGN
/////////////////////////////////////////////////

export async function getDonationSummaryByCampaign(organizationId, year = null) {
  const where = {
    organizationId,
    status: 'COMPLETED',
    isSimulated: false
  }

  if (year) {
    where.date = {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1)
    }
  }

  const campaignStats = await prisma.donation.groupBy({
    by: ['campaignId'],
    where: {
      ...where,
      campaignId: { not: null }
    },
    _sum: { amount: true },
    _count: true,
    _avg: { amount: true }
  })

  const campaignIds = campaignStats.map(c => c.campaignId).filter(Boolean)
  const campaigns = await prisma.campaign.findMany({
    where: { id: { in: campaignIds } },
    select: { id: true, name: true, goal: true }
  })

  const campaignMap = Object.fromEntries(campaigns.map(c => [c.id, c]))

  return campaignStats.map(stat => ({
    campaignId: stat.campaignId,
    campaignName: campaignMap[stat.campaignId]?.name || 'Unknown Campaign',
    campaignGoal: campaignMap[stat.campaignId]?.goal || 0,
    totalAmount: stat._sum.amount || 0,
    donationCount: stat._count,
    averageAmount: stat._avg.amount || 0,
    progress: campaignMap[stat.campaignId]?.goal 
      ? ((stat._sum.amount || 0) / campaignMap[stat.campaignId].goal) * 100 
      : null
  }))
}

/////////////////////////////////////////////////
// GET DONATION SUMMARY BY DONOR
/////////////////////////////////////////////////

export async function getDonationSummaryByDonor(organizationId, limit = 10) {
  const donorStats = await prisma.donation.groupBy({
    by: ['donorId'],
    where: {
      organizationId,
      status: 'COMPLETED',
      isSimulated: false
    },
    _sum: { amount: true },
    _count: true,
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    },
    take: limit
  })

  const donorIds = donorStats.map(d => d.donorId)
  const donors = await prisma.donor.findMany({
    where: { id: { in: donorIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      relationshipStage: true
    }
  })

  const donorMap = Object.fromEntries(donors.map(d => [d.id, d]))

  return donorStats.map(stat => ({
    donorId: stat.donorId,
    donorName: donorMap[stat.donorId] 
      ? `${donorMap[stat.donorId].firstName} ${donorMap[stat.donorId].lastName}`
      : 'Unknown Donor',
    donorEmail: donorMap[stat.donorId]?.email,
    relationshipStage: donorMap[stat.donorId]?.relationshipStage,
    totalAmount: stat._sum.amount || 0,
    donationCount: stat._count
  }))
}

/////////////////////////////////////////////////
// GET DONATIONS (Backward compatibility wrapper)
/////////////////////////////////////////////////

// Keep the old function signature for backward compatibility
export async function getDonationsOld(timeframe = '30days', page = 1, limit = 50) {
  return getDonations({ timeframe, page, limit })
}
