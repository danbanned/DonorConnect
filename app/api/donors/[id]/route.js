import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req, { params }) {
  try {
    const donor = await prisma.donor.findUnique({
      where: { id: params.id },
      include: {
        address: true,

        donations: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            campaign: true,
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
      },
    })

    if (!donor) {
      return NextResponse.json(
        { error: 'Donor not found' },
        { status: 404 }
      )
    }

    // ✅ Computed values (NOT stored in DB)
    const totalGiven = donor.donations.reduce(
      (sum, d) => sum + (d.amount ?? 0),
      0
    )

    const lastGiftDate = donor.donations[0]?.date ?? null

    return NextResponse.json({
      ...donor,

      // flatten interests & tags for frontend
      interests: donor.interests.map(i => i.interest),
      tags: donor.tags.map(t => t.tag),

      totalGiven,
      lastGiftDate,
      hasActivePledge: donor.pledges.length > 0,
    })
  } catch (error) {
    console.error('GET donor failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donor' },
      { status: 500 }
    )
  }
}
