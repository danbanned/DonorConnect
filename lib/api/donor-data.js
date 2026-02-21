import { prisma } from './../db.js'
import { getDonorTimeline } from './donorActivity.js'

// Existing function for single donor (unchanged)
export async function getDonorWithDetails(id) {
  if (!id) {
    throw new Error('getDonorWithDetails called with undefined id')
  }
  
  console.log(`📋 Fetching basic donor details for: ${id}`)
  
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

// NEW: Function to get donor with activity timeline for the donor page
export async function getDonorWithActivity(id, organizationId) {
  if (!id) {
    throw new Error('getDonorWithActivity called with undefined id')
  }
  
  console.log(`🎯 Fetching enhanced donor data for: ${id}, org: ${organizationId || 'not provided'}`)
  
  try {
    // Get the basic donor data using the existing function
    const donor = await getDonorWithDetails(id)
    
    if (!donor) {
      console.log(`❌ Donor not found: ${id}`)
      return null
    }

    console.log(`✅ Found donor: ${donor.firstName} ${donor.lastName}`)
    console.log(`📊 Donor has: ${donor.donations?.length || 0} donations, ${donor.communications?.length || 0} communications`)

    // Get donor's activity timeline using your existing library
    let timeline = { timeline: [], summary: null }
    try {
      console.log(`🔄 Fetching activity timeline for donor: ${id}`)
      timeline = await getDonorTimeline(id, organizationId || donor.organizationId, 30)
      console.log(`✅ Activity timeline fetched: ${timeline.timeline?.length || 0} activities`)
    } catch (error) {
      console.warn('⚠️ Could not fetch activity timeline:', error.message)
      console.warn('Will continue without activity data')
      // Continue without timeline data if there's an error
    }

    // Calculate derived statistics
    const totalDonations = donor.donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
    const avgDonation = donor.donations?.length > 0 ? totalDonations / donor.donations.length : 0
    
    // Calculate last donation
    const lastDonation = donor.donations?.length > 0 
      ? donor.donations.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null

    // Determine LY BUNT/SY BUNT status based on donation history
    const currentYear = new Date().getFullYear()
    const lastYearDonations = donor.donations?.filter(d => {
      const donationYear = new Date(d.date).getFullYear()
      return donationYear === currentYear - 1
    }) || []
    const hasLastYearDonation = lastYearDonations.length > 0

    const currentYearDonations = donor.donations?.filter(d => {
      const donationYear = new Date(d.date).getFullYear()
      return donationYear === currentYear
    }) || []
    const hasCurrentYearDonation = currentYearDonations.length > 0

    // Determine relationship stage based on giving pattern
    let relationshipStage = donor.relationshipStage || 'NEW'
    
    if (hasLastYearDonation && !hasCurrentYearDonation) {
      relationshipStage = 'LYBUNT'
    } else if (!hasLastYearDonation && hasCurrentYearDonation) {
      relationshipStage = 'SYBUNT'
    } else if (hasLastYearDonation && hasCurrentYearDonation) {
      relationshipStage = 'CURRENT'
    }

    console.log(`📈 Calculated: ${relationshipStage}, ${donor.donations?.length} donations, $${totalDonations} total`)

    // Calculate quick stats
    const currentYearTotal = currentYearDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const lastYearTotal = lastYearDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

    // Generate mock activities if no real activities exist
    let activities = timeline.timeline || []
    const hasActivityData = activities.length > 0
    
    if (!hasActivityData && donor.donations?.length > 0) {
      console.log(`🔄 Generating mock activities from ${donor.donations.length} donations`)
      
      // Convert donations to activities for display
      activities = donor.donations.map((donation, index) => ({
        id: `donation_${donation.id || index}`,
        type: 'DONATION',
        action: 'DONATION_RECEIVED',
        displayAction: 'Made a donation',
        description: `Donation of $${donation.amount} received`,
        amount: donation.amount,
        createdAt: donation.date || donation.createdAt,
        date: donation.date,
        rawData: donation,
        isMock: true
      }))
      
      // Sort by date (newest first)
      activities.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    }

    const result = {
      // Original donor data
      ...donor,
      
      // Enhanced calculated fields
      totalDonations,
      donationCount: donor.donations?.length || 0,
      avgDonation,
      lastDonationDate: lastDonation?.date,
      lastDonationAmount: lastDonation?.amount,
      relationshipStage, // Override with calculated stage
      
      // Activity data (real or mock)
      activities: activities,
      activityCount: activities.length,
      
      // Stats summary
      stats: {
        totalDonations,
        donationCount: donor.donations?.length || 0,
        avgDonation,
        communicationCount: donor.communications?.length || 0,
        meetingCount: 0, // You might need to fetch meetings separately
        activityCount: activities.length,
        currentYearTotal,
        lastYearTotal,
        
        // Activity type breakdown
        activityBreakdown: {
          donations: activities.filter(a => a.type === 'DONATION').length || 0,
          communications: activities.filter(a => a.type === 'COMMUNICATION').length || 0,
          meetings: activities.filter(a => a.type === 'MEETING').length || 0,
          notes: activities.filter(a => a.type === 'NOTE').length || 0,
        }
      },
      
      // Quick access arrays
      recentDonations: donor.donations?.slice(0, 6) || [],
      recentCommunications: donor.communications?.slice(0, 5) || [],
      
      // Tag and interest summaries
      tagNames: donor.tags?.map(t => t.tag?.name).filter(Boolean) || [],
      interestNames: donor.interests?.map(i => i.interest?.name).filter(Boolean) || [],
      
      // Metadata
      _metadata: {
        hasActivityData: timeline.timeline?.length > 0,
        hasMockActivities: activities.length > 0 && timeline.timeline?.length === 0,
        timelineSource: timeline.timeline?.length > 0 ? 'activity-api' : 'mock-data',
        calculatedAt: new Date().toISOString(),
        donationCount: donor.donations?.length || 0,
        communicationCount: donor.communications?.length || 0
      }
    }

    console.log(`✅ Enhanced donor data ready: ${result.activities.length} activities, ${result.recentDonations.length} recent donations`)
    return result
    
  } catch (error) {
    console.error('❌ Error fetching donor with activity:', error)
    
    // Fall back to basic donor data if activity fetch fails
    try {
      console.log('🔄 Falling back to basic donor data')
      const basicDonor = await getDonorWithDetails(id)
      
      if (!basicDonor) {
        return null
      }
      
      const fallbackResult = {
        ...basicDonor,
        activities: [],
        totalDonations: basicDonor?.donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
        donationCount: basicDonor?.donations?.length || 0,
        avgDonation: basicDonor?.donations?.length > 0 ? 
          (basicDonor.donations.reduce((sum, d) => sum + (d.amount || 0), 0) / basicDonor.donations.length) : 0,
        stats: {
          totalDonations: basicDonor?.donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
          donationCount: basicDonor?.donations?.length || 0,
          communicationCount: basicDonor?.communications?.length || 0,
        },
        recentDonations: basicDonor?.donations?.slice(0, 6) || [],
        recentCommunications: basicDonor?.communications?.slice(0, 5) || [],
        _metadata: {
          hasActivityData: false,
          timelineSource: 'fallback',
          error: error.message,
          calculatedAt: new Date().toISOString()
        }
      }
      
      console.log(`✅ Fallback data ready for: ${basicDonor.firstName} ${basicDonor.lastName}`)
      return fallbackResult
      
    } catch (fallbackError) {
      console.error('❌ Fallback donor fetch also failed:', fallbackError)
      throw new Error(`Failed to fetch donor data: ${error.message}`)
    }
  }
}

// NEW: Function to get donor activity summary (for dashboard/list views)
export async function getDonorActivitySummary(donorId, organizationId, timeframe = '30days') {
  try {
    console.log(`📊 Getting activity summary for donor: ${donorId}`)
    
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        organizationId: true,
      }
    })

    if (!donor) {
      console.log(`❌ Donor not found for summary: ${donorId}`)
      return null
    }

    let activityStats = { stats: {}, counts: {}, timeframe }
    try {
      // Get activity summary using your existing library
      const { getActivityStats } = await import('./donorActivity.js')
      activityStats = await getActivityStats(organizationId || donor.organizationId, timeframe)
    } catch (error) {
      console.warn('⚠️ Could not fetch activity stats:', error.message)
    }
    
    // Get recent donations
    const recentDonations = await prisma.donation.findMany({
      where: { donorId },
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        date: true,
        type: true,
        status: true,
      }
    })

    // Get recent communications
    const recentCommunications = await prisma.communication.findMany({
      where: { donorId },
      orderBy: { sentAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        subject: true,
        sentAt: true,
        status: true,
      }
    })

    const result = {
      donor: {
        id: donor.id,
        name: `${donor.firstName} ${donor.lastName}`,
      },
      activityStats,
      recentDonations,
      recentCommunications,
      summary: {
        totalDonations: recentDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
        donationCount: recentDonations.length,
        communicationCount: recentCommunications.length,
        lastActivity: recentDonations[0]?.date || recentCommunications[0]?.sentAt,
      }
    }

    console.log(`✅ Activity summary ready: ${recentDonations.length} donations, ${recentCommunications.length} communications`)
    return result
    
  } catch (error) {
    console.error('❌ Error fetching donor activity summary:', error)
    throw error
  }
}

// Keep all your existing functions below...

// NEW: Function to get all donors with summary data
export async function getAllDonors(organizationId, assignedToUserId = null) {
  try {
    if (!organizationId) {
      throw new Error('organizationId is required')
    }

    console.log('📋 Fetching all donors with summary data')
    
    const donors = await prisma.donor.findMany({
      where: {
        organizationId,
        ...(assignedToUserId ? { assignedToId: assignedToUserId } : {})
      },
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

    console.log(`✅ Found ${donors.length} donors`)

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
    console.error('❌ Error fetching all donors:', error)
    throw new Error('Failed to fetch donors')
  }
}

// NEW: Function to get donor stats
export async function getDonorStats(organizationId, assignedToUserId = null) {
  try {
    if (!organizationId) {
      throw new Error('organizationId is required')
    }

    console.log('📊 Fetching donor statistics')
    
    const [totalDonors, activeDonors, totalDonations] = await Promise.all([
      prisma.donor.count({
        where: {
          organizationId,
          ...(assignedToUserId ? { assignedToId: assignedToUserId } : {})
        }
      }),
      prisma.donor.count({
        where: {
          status: 'ACTIVE',
          organizationId,
          ...(assignedToUserId ? { assignedToId: assignedToUserId } : {})
        }
      }),
      prisma.donation.aggregate({
        where: {
          organizationId,
          ...(assignedToUserId ? { donor: { assignedToId: assignedToUserId } } : {})
        },
        _sum: { amount: true }
      })
    ])

    const averageDonation = await prisma.donation.aggregate({
      where: {
        organizationId,
        ...(assignedToUserId ? { donor: { assignedToId: assignedToUserId } } : {})
      },
      _avg: { amount: true }
    })

    const statusDistribution = await prisma.donor.groupBy({
      where: {
        organizationId,
        ...(assignedToUserId ? { assignedToId: assignedToUserId } : {})
      },
      by: ['status'],
      _count: {
        status: true
      }
    })

    const stageDistribution = await prisma.donor.groupBy({
      where: {
        organizationId,
        ...(assignedToUserId ? { assignedToId: assignedToUserId } : {})
      },
      by: ['relationshipStage'],
      _count: {
        relationshipStage: true
      }
    })

    const result = {
      totalDonors,
      activeDonors,
      totalDonations: totalDonations._sum.amount || 0,
      averageDonation: averageDonation._avg.amount || 0,
      statusDistribution,
      stageDistribution
    }

    console.log(`✅ Donor stats: ${totalDonors} total, ${activeDonors} active, $${totalDonations._sum.amount || 0} total donations`)
    return result
    
  } catch (error) {
    console.error('❌ Error fetching donor stats:', error)
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

  console.log(`🔍 Searching donors with filters:`, {
    searchTerm,
    status,
    relationshipStage,
    minAmount,
    maxAmount,
    sortBy,
    sortOrder
  })

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

    console.log(`✅ Found ${donors.length} donors matching search criteria`)

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
      console.log(`💰 Applied min amount filter: ${filtered.length} donors remaining`)
    }
    if (maxAmount) {
      filtered = filtered.filter(d => d.totalDonations <= maxAmount)
      console.log(`💰 Applied max amount filter: ${filtered.length} donors remaining`)
    }

    return filtered
  } catch (error) {
    console.error('❌ Error searching donors:', error)
    throw new Error('Failed to search donors')
  }
}
