export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../lib/auth.js'
import {
  getDonations,
  getDonationById,
  getDonationSummary,
  createDonation,
  updateDonation,
  deleteDonation,
  logDonorActivity,
  getDonationSummaryByCampaign,
  getDonationSummaryByDonor
} from '../../../lib/api/donations'

/////////////////////////////////////////////////
// utils
/////////////////////////////////////////////////
function serializeBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  )
}

/////////////////////////////////////////////////
// GET /api/donations
/////////////////////////////////////////////////
export async function GET(request) {
  try {
    console.log('✅ /api/donations HIT')

    // Authentication
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let user
    try {
      user = await verifyToken(token)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 50
    const timeframe = searchParams.get('timeframe') || '30days'

    // Extract filter parameters
    const donorIdsParam = searchParams.get('donorIds')
    const donorId = searchParams.get('donorId')
    const campaignId = searchParams.get('campaignId')
    const requestedOrganizationId = searchParams.get('organizationId')
    const organizationId = user?.orgId
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (requestedOrganizationId && requestedOrganizationId !== organizationId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden organization scope' },
        { status: 403 }
      )
    }
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const includeSimulated = searchParams.get('includeSimulated') === 'true'
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Summary endpoints
    const summaryBy = searchParams.get('summaryBy')
    const summaryYear = searchParams.get('summaryYear') ? parseInt(searchParams.get('summaryYear')) : null
    const summaryLimit = searchParams.get('summaryLimit') ? parseInt(searchParams.get('summaryLimit')) : 10

    // Single donation endpoint
    const singleId = searchParams.get('id')

    // If requesting a single donation by ID
    if (singleId) {
      if (!organizationId) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        )
      }

      const donation = await getDonationById(singleId, organizationId)
      
      if (!donation) {
        return NextResponse.json(
          { error: 'Donation not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        serializeBigInt({ success: true, donation }),
        { status: 200 }
      )
    }

    // Campaign summary endpoint
    if (summaryBy === 'campaign') {
      if (!organizationId) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        )
      }

      const campaignSummary = await getDonationSummaryByCampaign(organizationId, summaryYear)
      
      return NextResponse.json(
        serializeBigInt({ 
          success: true, 
          summary: campaignSummary 
        }),
        { status: 200 }
      )
    }

    // Donor summary endpoint
    if (summaryBy === 'donor') {
      if (!organizationId) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        )
      }

      const donorSummary = await getDonationSummaryByDonor(organizationId, summaryLimit)
      
      return NextResponse.json(
        serializeBigInt({ 
          success: true, 
          summary: donorSummary 
        }),
        { status: 200 }
      )
    }

    let donorIds = null
    if (donorIdsParam) {
      donorIds = donorIdsParam.split(',').filter(id => id.trim())
    }

    const filters = {
      donorId,
      donorIds,
      campaignId,
      organizationId,
      timeframe,
      page,
      limit,
      status,
      type,
      minAmount,
      maxAmount,
      includeSimulated,
      assignedToUserId: user.role === 'viewer' ? user.userId : null,
      sortBy,
      sortOrder
    }

    const donations = await getDonations(filters)
    const summary = await getDonationSummary(filters)

    return NextResponse.json(
      serializeBigInt({
        success: true,
        donations,
        summary,
        pagination: {
          page,
          limit,
          totalCount: summary.totalCount ?? donations.length,
          totalPages: Math.ceil(
            (summary.totalCount ?? donations.length) / limit
          ),
          hasNextPage: page < Math.ceil((summary.totalCount ?? donations.length) / limit),
          hasPrevPage: page > 1
        },
        filters: {
          timeframe,
          donorId: donorId || null,
          donorIds: donorIds || null,
          campaignId: campaignId || null,
          status: status || null,
          type: type || null,
          minAmount: minAmount || null,
          maxAmount: maxAmount || null,
          includeSimulated
        }
      })
    )
  } catch (error) {
    console.error('[GET /api/donations]', error.message, error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch donations',
        donations: [],
        summary: {
          total: 0,
          average: 0,
          count: 0,
          thisYear: 0,
          thisYearCount: 0,
          growth: 0,
          recurring: 0,
          recurringCount: 0,
          lybuntCount: 0,
          lybuntValue: 0,
          recentDonations: [],
          totalCount: 0
        },
        pagination: {
          page: 1,
          limit: 50,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      },
      { status: 500 }
    )
  }
}

/////////////////////////////////////////////////
// POST /api/donations
/////////////////////////////////////////////////
export async function POST(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const data = await request.json()

    if (!data.amount || !data.donorId) {
      return NextResponse.json(
        { success: false, error: 'Amount and donorId are required' },
        { status: 400 }
      )
    }

    if (!data.paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      )
    }

    // Use organization from authenticated user if not provided
    const organizationId = user.orgId

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId is required' },
        { status: 400 }
      )
    }

    if (data.organizationId && data.organizationId !== organizationId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden organization scope' },
        { status: 403 }
      )
    }

    // 1️⃣ Create the donation using the lib
    const donation = await createDonation({
      ...data,
      organizationId
    })

    // 2️⃣ Log donor activity using the lib
    await logDonorActivity({
      organizationId: donation.organizationId,
      donorId: donation.donorId,
      donationId: donation.id,
      userId: user.id,
      action: 'DONATION_RECEIVED',
      title: 'Donation received',
      description: `Received $${donation.amount.toFixed(2)} donation`,
      amount: donation.amount,
      metadata: {
        source: 'ui',
        paymentMethod: donation.paymentMethod,
        type: donation.type,
        ...(donation.campaign && { campaignName: donation.campaign.name })
      },
      priority: 'NORMAL'
    })

    // 3️⃣ Create donor activity entry
    try {
      const { prisma } = await import('../../../lib/db.js')
      await prisma.donorActivity.create({
        data: {
          donorId: donation.donorId,
          organizationId: donation.organizationId,
          type: 'DONATION',
          action: 'DONATION_RECEIVED',
          title: 'Donation Received',
          description: `Donation of $${donation.amount.toFixed(2)} received`,
          relatedDonationId: donation.id,
          amount: donation.amount,
          metadata: {
            paymentMethod: donation.paymentMethod,
            type: donation.type,
            campaignId: donation.campaignId
          },
          importance: 'HIGH'
        }
      })
    } catch (activityError) {
      console.error('Failed to create donor activity:', activityError)
      // Don't fail the request if activity logging fails
    }

    return NextResponse.json(
      serializeBigInt({
        success: true,
        donation,
        message: 'Donation created successfully'
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/donations]', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create donation' 
      },
      { status: 500 }
    )
  }
}

/////////////////////////////////////////////////
// PUT /api/donations
/////////////////////////////////////////////////
export async function PUT(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Donation ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const organizationId = user.orgId

    // Update the donation
    const donation = await updateDonation(id, organizationId, data)

    // Log activity
    await logDonorActivity({
      organizationId,
      donorId: donation.donorId,
      donationId: donation.id,
      userId: user.id,
      action: 'DONATION_UPDATED',
      title: 'Donation Updated',
      description: `Donation #${donation.id.substring(0, 8)} was updated`,
      amount: donation.amount,
      metadata: {
        previousData: data._previousData,
        updates: Object.keys(data).filter(k => !k.startsWith('_'))
      },
      priority: 'NORMAL'
    })

    return NextResponse.json(
      serializeBigInt({
        success: true,
        donation,
        message: 'Donation updated successfully'
      }),
      { status: 200 }
    )

  } catch (error) {
    console.error('[PUT /api/donations]', error)
    
    if (error.message === 'Donation not found') {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update donation' 
      },
      { status: 500 }
    )
  }
}

/////////////////////////////////////////////////
// DELETE /api/donations
/////////////////////////////////////////////////
export async function DELETE(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Donation ID is required' },
        { status: 400 }
      )
    }

    const organizationId = user.orgId

    // Delete the donation
    const donation = await deleteDonation(id, organizationId)

    // Log activity
    await logDonorActivity({
      organizationId,
      donorId: donation.donorId,
      userId: user.id,
      action: 'DONATION_DELETED',
      title: 'Donation Deleted',
      description: `Donation of $${donation.amount.toFixed(2)} was deleted`,
      amount: donation.amount,
      metadata: {
        deletedAt: new Date().toISOString()
      },
      priority: 'HIGH'
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Donation deleted successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[DELETE /api/donations]', error)
    
    if (error.message === 'Donation not found') {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete donation' 
      },
      { status: 500 }
    )
  }
}
