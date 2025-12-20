import { prisma } from '@/lib/db'

// Existing function for single donor
export async function getDonorWithDetails(id) {
  if (!id) {
    throw new Error('getDonorWithDetails called with undefined id')
  }
  
  return await prisma.donor.findUnique({
    where: { id },
    include: {
      address: true,
      donations: {
        include: {
          campaign: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
      pledges: true,
      interests: {
        include: {
          interest: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      communications: {
        orderBy: {
          sentAt: 'desc',
        },
        take: 10,
      },
    },
  })
}

// NEW: Function to get all donors with summary data
export async function getAllDonors() {
  try {
    const donors = await prisma.donor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        relationshipStage: true,
        preferredContact: true,
        createdAt: true,
        donations: {
          select: {
            amount: true,
            date: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
        address: {
          select: {
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    // Calculate totals and add derived fields
    const donorsWithCalculations = donors.map(donor => {
      const totalDonations = donor.donations.reduce((sum, donation) => sum + donation.amount, 0)
      const lastDonation = donor.donations[0]
      
      return {
        ...donor,
        totalDonations,
        lastDonationDate: lastDonation?.date || null,
        donationCount: donor.donations.length,
        location: donor.address ? `${donor.address.city}, ${donor.address.state}` : 'No address'
      }
    })

    return donorsWithCalculations
  } catch (error) {
    console.error('Error fetching all donors:', error)
    throw new Error('Failed to fetch donors')
  }
}

// NEW: Function to get donor stats
export async function getDonorStats() {
  try {
    const [totalDonors, activeDonors, totalDonations] = await Promise.all([
      prisma.donor.count(),
      prisma.donor.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.donation.aggregate({
        _sum: { amount: true }
      })
    ])

    const averageDonation = await prisma.donation.aggregate({
      _avg: { amount: true }
    })

    const statusDistribution = await prisma.donor.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const stageDistribution = await prisma.donor.groupBy({
      by: ['relationshipStage'],
      _count: {
        relationshipStage: true
      }
    })

    return {
      totalDonors,
      activeDonors,
      totalDonations: totalDonations._sum.amount || 0,
      averageDonation: averageDonation._avg.amount || 0,
      statusDistribution,
      stageDistribution
    }
  } catch (error) {
    console.error('Error fetching donor stats:', error)
    throw new Error('Failed to fetch donor statistics')
  }
}

// NEW: Function to search donors
export async function searchDonors(filters = {}) {
  const {
    searchTerm = '',
    status = null,
    relationshipStage = null,
    minAmount = 0,
    maxAmount = null,
    sortBy = 'lastName',
    sortOrder = 'asc'
  } = filters

  const whereClause = {
    AND: []
  }

  // Add search term filter
  if (searchTerm) {
    whereClause.AND.push({
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm } }
      ]
    })
  }

  // Add status filter
  if (status) {
    whereClause.AND.push({ status })
  }

  // Add relationship stage filter
  if (relationshipStage) {
    whereClause.AND.push({ relationshipStage })
  }

  // Handle empty AND array
  if (whereClause.AND.length === 0) {
    delete whereClause.AND
  }

  // Build orderBy clause
  let orderBy = {}
  switch (sortBy) {
    case 'totalDonations':
      // This would require a more complex query with aggregation
      orderBy = { lastName: sortOrder }
      break
    case 'lastDonation':
      // Would require joining with donations table
      orderBy = { lastName: sortOrder }
      break
    default:
      orderBy = { [sortBy]: sortOrder }
  }

  try {
    const donors = await prisma.donor.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        relationshipStage: true,
        preferredContact: true,
        donations: {
          select: {
            amount: true,
            date: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy,
      take: 100, // Limit results for performance
    })

    // Calculate totals
    const donorsWithTotals = donors.map(donor => {
      const totalDonations = donor.donations.reduce((sum, d) => sum + d.amount, 0)
      const lastDonation = donor.donations[0]
      
      return {
        ...donor,
        totalDonations,
        lastDonationDate: lastDonation?.date || null,
        donationCount: donor.donations.length
      }
    })

    // Apply amount filters in JavaScript (for now)
    let filtered = donorsWithTotals
    if (minAmount > 0) {
      filtered = filtered.filter(d => d.totalDonations >= minAmount)
    }
    if (maxAmount) {
      filtered = filtered.filter(d => d.totalDonations <= maxAmount)
    }

    return filtered
  } catch (error) {
    console.error('Error searching donors:', error)
    throw new Error('Failed to search donors')
  }
}