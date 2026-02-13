import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth.js';

// ============================================
// SINGLE DONATION API
// ============================================
// GET: Fetch a single donation by ID
// PUT: Update a donation
// DELETE: Delete a donation
// ============================================

// ============================================
// GET: Fetch single donation
// ============================================
export async function GET(request, { params }) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const { id } = params;

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
    });

    if (!donation) {
      return NextResponse.json({
        success: false,
        error: 'Donation not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      donation
    });

  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch donation'
    }, { status: 500 });
  }
}

// ============================================
// PUT: Update a donation
// ============================================
export async function PUT(request, { params }) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const { id } = params;
    const body = await request.json();

    // Verify donation exists and belongs to organization
    const existingDonation = await prisma.donation.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingDonation) {
      return NextResponse.json({
        success: false,
        error: 'Donation not found'
      }, { status: 404 });
    }

    // Update fields
    const {
      amount,
      date,
      paymentMethod,
      transactionId,
      campaignId,
      type,
      status,
      notes,
      isRecurring,
      recurringId,
      isTribute,
      tributeName,
      tributeType,
      fees
    } = body;

    // Calculate net amount if fees are updated
    let netAmount = existingDonation.netAmount;
    if (amount || fees) {
      const newAmount = amount || existingDonation.amount;
      const newFees = fees !== undefined ? fees : existingDonation.fees;
      netAmount = newAmount - (newFees || 0);
    }

    const donation = await prisma.donation.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(transactionId !== undefined && { transactionId }),
        ...(campaignId !== undefined && { campaignId: campaignId || null }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurringId !== undefined && { recurringId }),
        ...(isTribute !== undefined && { isTribute }),
        ...(tributeName !== undefined && { tributeName }),
        ...(tributeType !== undefined && { tributeType }),
        ...(fees !== undefined && { fees }),
        ...(netAmount !== undefined && { netAmount })
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        campaign: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create activity feed for update
    await prisma.activityFeed.create({
      data: {
        organizationId,
        userId: user.id,
        donorId: donation.donorId,
        donationId: donation.id,
        action: 'DONATION_UPDATED',
        title: 'Donation Updated',
        description: `Donation #${donation.id.substring(0, 8)} was updated`,
        amount: donation.amount,
        metadata: {
          previousAmount: existingDonation.amount,
          newAmount: donation.amount,
          previousStatus: existingDonation.status,
          newStatus: donation.status
        },
        priority: 'NORMAL',
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      donation,
      message: 'Donation updated successfully'
    });

  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update donation'
    }, { status: 500 });
  }
}

// ============================================
// DELETE: Delete a donation
// ============================================
export async function DELETE(request, { params }) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const { id } = params;

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
    });

    if (!donation) {
      return NextResponse.json({
        success: false,
        error: 'Donation not found'
      }, { status: 404 });
    }

    // Delete related records first
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
    ]);

    // Create activity feed for deletion
    await prisma.activityFeed.create({
      data: {
        organizationId,
        userId: user.id,
        donorId: donation.donorId,
        action: 'DONATION_DELETED',
        title: 'Donation Deleted',
        description: `Donation of $${donation.amount.toFixed(2)} from ${donation.donor.firstName} ${donation.donor.lastName} was deleted`,
        amount: donation.amount,
        metadata: {
          deletedAt: new Date().toISOString()
        },
        priority: 'HIGH',
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Donation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete donation'
    }, { status: 500 });
  }
}