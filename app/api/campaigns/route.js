import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../lib/auth.js'
import prisma from '../../../lib/db.js'

// Helper: Calculate campaign summary
async function calculateCampaignSummary(organizationId, filters = {}) {
  const where = {
    organizationId,
    ...filters
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      donations: {
        where: { status: 'COMPLETED' },
        select: { amount: true, donorId: true }
      }
    }
  })

  const activeCount = campaigns.filter(c => c.status === 'ACTIVE').length
  const totalRaised = campaigns.reduce((sum, c) => 
    sum + c.donations.reduce((s, d) => s + (d.amount || 0), 0), 0
  )
  
  const totalGoal = campaigns.reduce((sum, c) => sum + (c.goal || 0), 0)
  const overallProgress = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0

  const uniqueDonors = new Set()
  campaigns.forEach(c => {
    c.donations.forEach(d => uniqueDonors.add(d.donorId))
  })

  const byStatus = {}
  campaigns.forEach(c => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
  })

  return {
    activeCount,
    totalRaised,
    overallProgress,
    uniqueDonors: uniqueDonors.size,
    byStatus
  }
}

// GET /api/campaigns
export async function GET(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 })
    }

    const organizationId = user.orgId
    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized organization scope'
      }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where = { organizationId }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Date range filter
    if (dateRange === 'active') {
      where.status = 'ACTIVE'
    } else if (dateRange === 'upcoming') {
      where.startDate = { gte: new Date() }
    } else if (dateRange === 'completed') {
      where.status = 'COMPLETED'
    }

    // Get total count
    const totalCount = await prisma.campaign.count({ where })

    // Get campaigns with donations
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        donations: {
          where: { status: 'COMPLETED' },
          select: { amount: true, donorId: true, date: true },
          orderBy: { date: 'desc' }
        },
        _count: {
          select: { donations: true }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    })

    // Calculate raised amount for each campaign
    const campaignsWithStats = campaigns.map(campaign => ({
      ...campaign,
      raised: campaign.donations.reduce((sum, d) => sum + (d.amount || 0), 0),
      donationCount: campaign.donations.length,
      donors: new Set(campaign.donations.map(d => d.donorId)).size
    }))

    // Calculate summary
    const summary = await calculateCampaignSummary(organizationId, where)

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats,
      summary,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      },
      filters: {
        status: status || null,
        type: type || null,
        search: search || null,
        dateRange: dateRange || null
      }
    })

  } catch (error) {
    console.error('[GET /api/campaigns]', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch campaigns',
      campaigns: [],
      summary: {
        activeCount: 0,
        totalRaised: 0,
        overallProgress: 0,
        uniqueDonors: 0,
        byStatus: {}
      },
      pagination: {
        page: 1,
        limit: 20,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }, { status: 500 })
  }
}

// POST /api/campaigns
export async function POST(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 })
    }

    const organizationId = user.orgId
    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized organization scope'
      }, { status: 401 })
    }
    const data = await request.json()

    // Validation
    if (!data.name) {
      return NextResponse.json({
        success: false,
        error: 'Campaign name is required'
      }, { status: 400 })
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description || null,
        goal: data.goal ? parseFloat(data.goal) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'DRAFT'
      }
    })

    // Create activity feed entry
    await prisma.activityFeed.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'CAMPAIGN_CREATED',
        title: 'New Campaign Created',
        description: `Campaign "${campaign.name}" created`,
        metadata: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          goal: campaign.goal
        },
        priority: 'NORMAL',
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('[POST /api/campaigns]', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create campaign'
    }, { status: 500 })
  }
}
