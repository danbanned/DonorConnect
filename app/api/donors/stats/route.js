import { NextResponse } from 'next/server'
import { getDonorStats } from '../../../../lib/api/donor-data'

export async function GET() {
  try {
    const stats = await getDonorStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching donor stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donor statistics' },
      { status: 500 }
    )
  }
}