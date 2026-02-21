import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../../lib/auth.js'
import prisma from '../../../../lib/db.js'

// GET /api/campaigns/[id]
export async function GET(request, { params }) {
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
    const { id } = params

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        donations: {
          where: { status: 'COMPLETED' },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { date: 'desc' }
        },
        communications: {
          select: {
            id: true,
            type: true,
            subject: true,
            sentAt: true,
            status: true
          },
          orderBy: { sentAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            donations: true,
            communications: true
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    // Calculate campaign stats
    const totalRaised = campaign.donations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const uniqueDonors = new Set(campaign.donations.map(d => d.donorId)).size
    const averageGift = campaign.donations.length > 0 
      ? totalRaised / campaign.donations.length 
      : 0

    const campaignWithStats = {
      ...campaign,
      raised: totalRaised,
      uniqueDonors,
      averageGift,
      progress: campaign.goal ? (totalRaised / campaign.goal) * 100 : 0
    }

    return NextResponse.json({
      success: true,
      campaign: campaignWithStats
    })

  } catch (error) {
    console.error('[GET /api/campaigns/[id]]', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch campaign'
    }, { status: 500 })
  }
}

// PUT /api/campaigns/[id]
export async function PUT(request, { params }) {
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
    const { id } = params
    const data = await request.json()

    // Verify campaign exists
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id,
        organizationId
      }
    })

    if (!existingCampaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : existingCampaign.name,
        description: data.description !== undefined ? data.description : existingCampaign.description,
        goal: data.goal !== undefined ? parseFloat(data.goal) : existingCampaign.goal,
        startDate: data.startDate !== undefined ? new Date(data.startDate) : existingCampaign.startDate,
        endDate: data.endDate !== undefined ? new Date(data.endDate) : existingCampaign.endDate,
        status: data.status !== undefined ? data.status : existingCampaign.status
      }
    })

    // Create activity feed
    await prisma.activityFeed.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'CAMPAIGN_UPDATED',
        title: 'Campaign Updated',
        description: `Campaign "${campaign.name}" updated`,
        metadata: {
          campaignId: campaign.id,
          previousStatus: existingCampaign.status,
          newStatus: campaign.status
        },
        priority: 'NORMAL',
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign updated successfully'
    })

  } catch (error) {
    console.error('[PUT /api/campaigns/[id]]', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update campaign'
    }, { status: 500 })
  }
}

// DELETE /api/campaigns/[id]
export async function DELETE(request, { params }) {
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
    const { id } = params

    // Verify campaign exists
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        organizationId
      }
    })

    if (!campaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    // Check if campaign has donations
    const donationCount = await prisma.donation.count({
      where: { campaignId: id }
    })

    if (donationCount > 0) {
      // Instead of deleting, archive it
      await prisma.campaign.update({
        where: { id },
        data: { status: 'ARCHIVED' }
      })

      return NextResponse.json({
        success: true,
        message: 'Campaign archived (has existing donations)'
      })
    }

    // Delete campaign if no donations
    await prisma.campaign.delete({
      where: { id }
    })

    // Create activity feed
    await prisma.activityFeed.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'CAMPAIGN_DELETED',
        title: 'Campaign Deleted',
        description: `Campaign "${campaign.name}" deleted`,
        metadata: {
          campaignId: campaign.id
        },
        priority: 'NORMAL',
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('[DELETE /api/campaigns/[id]]', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete campaign'
    }, { status: 500 })
  }
}
