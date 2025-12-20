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

    // Optional filters (future)
    //const donorId = searchParams.get('donorId')
    //const campaignId = searchParams.get('campaignId')

    // NOTE: filters not yet supported by lib
    const donations = await getDonations(timeframe, page, limit)
    const summary = await getDonationSummary(timeframe)

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

    const donation = await createDonation({
      ...data,
      organizationId: data.organizationId ?? 'org_test_123',
    })

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
