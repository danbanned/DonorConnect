import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  const donorId = params.id

  try {
    // 1️⃣ Get donor with donations + communications
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      include: {
        donations: {
          where: { status: 'COMPLETED' },
          orderBy: { date: 'desc' },
        },
        communications: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    // 2️⃣ Total given
    const totalGiven = donor.donations.reduce(
      (sum, d) => sum + d.amount,
      0
    )

    // 3️⃣ Donation frequency
    let givingFrequency = 'one-time'
    if (donor.donations.length >= 4) givingFrequency = 'quarterly'
    if (donor.donations.length >= 8) givingFrequency = 'monthly'

    // 4️⃣ Engagement score (simple but logical)
    let engagementScore = 0

    if (donor.donations.length > 0) engagementScore += 40
    if (donor.donations.length >= 5) engagementScore += 20
    if (donor.communications.length > 0) engagementScore += 20
    if (totalGiven >= 1000) engagementScore += 20

    engagementScore = Math.min(100, engagementScore)

    // 5️⃣ Engagement level
    let engagementLevel = 'Low'
    if (engagementScore >= 75) engagementLevel = 'High'
    else if (engagementScore >= 50) engagementLevel = 'Medium'

    // 6️⃣ Last contact
    const lastContact =
      donor.communications[0]?.sentAt ?? null

    // 7️⃣ Suggested ask (very common CRM logic)
    const suggestedAskAmount =
      donor.donations.length > 0
        ? Math.round(
            totalGiven / donor.donations.length * 1.25
          )
        : 100

    // 8️⃣ Next best action
    const nextBestAction =
      engagementLevel === 'High'
        ? 'Invite to meeting'
        : engagementLevel === 'Medium'
        ? 'Send update email'
        : 'Send thank you note'

    return NextResponse.json({
      status: {
        engagementScore,
        engagementLevel,
      },
      givingFrequency,
      suggestedAskAmount,
      lastContact,
      nextBestAction,
    })
  } catch (error) {
    console.error('Donor insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
