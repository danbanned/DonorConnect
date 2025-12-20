import { NextResponse } from 'next/server'
import { getAllDonors } from '@/lib/api/donor-data'

export async function GET() {
  try {
    const donors = await getAllDonors()
    return NextResponse.json(donors)
  } catch (error) {
    console.error('Error fetching donors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donors' },
      { status: 500 }
    )
  }
}