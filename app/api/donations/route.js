import { NextResponse } from 'next/server'
import {
  getDonations,
  getDonationSummary,
  createDonation,
} from '@/lib/api/donations'

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

    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 50
    const timeframe = searchParams.get('timeframe') || '30days'

    // Extract filter parameters
    const donorIdsParam = searchParams.get('donorIds')
    const donorId = searchParams.get('donorId')
    const campaignId = searchParams.get('campaignId')
    const organizationId = searchParams.get('organizationId')

    // Parse donorIds if provided
    let donorIds = null
      if (donorIdsParam) {
        donorIds = donorIdsParam.split(',').filter(id => id.trim())
      }

    // Create filters object to pass to library functions
    const filters = {
      donorId,
      donorIds,
      campaignId,
      organizationId,
      timeframe,
      page,
      limit
    }

    // Pass filters to the library functions
    const donations = await getDonations(filters)
    const summary = await getDonationSummary(filters)

    return NextResponse.json(
      serializeBigInt({
        donations,
        summary,
        pagination: {
          page,
          limit,
          totalCount: summary.totalCount ?? donations.length,
          totalPages: Math.ceil(
            (summary.totalCount ?? donations.length) / limit
          ),
        },
      })
    )
  } catch (error) {
    console.error('[GET /api/donations]', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

/////////////////////////////////////////////////
// POST /api/donations
/////////////////////////////////////////////////
export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.amount || !data.donorId) {
      return NextResponse.json(
        { error: 'Amount and donorId are required' },
        { status: 400 }
      )
    }

    if (!data.organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      )
    }

    const donation = await createDonation(data)

    await prisma.donorActivity.create({
      data: {
        donorId: donation.donorId,
        action: "Made a donation",
        amount: donation.amount,
        details: { donationId: donation.id },
      },
    });

    return NextResponse.json(
      serializeBigInt(donation),
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/donations]', error)
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}