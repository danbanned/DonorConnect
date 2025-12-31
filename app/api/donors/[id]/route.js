export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { prisma } from '../../../../lib/db.js'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    const { id } = params
    const donor = await prisma.donor.findUnique({
      where: { id },
    })

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    return NextResponse.json(donor)
  } catch (error) {
    console.error('Failed to fetch donor by ID:', error)
    return NextResponse.json({ error: 'Failed to fetch donor' }, { status: 500 })
  }
}
