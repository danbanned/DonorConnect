import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/api/email'

export async function getCommunications(timeframe = '30days', page = 1, limit = 50) {
  try {
    let dateFilter = {}
    const now = new Date()
    
    switch (timeframe) {
      case '7days':
        dateFilter.gte = new Date(now.setDate(now.getDate() - 7))
        break
      case '30days':
        dateFilter.gte = new Date(now.setDate(now.getDate() - 30))
        break
      case '90days':
        dateFilter.gte = new Date(now.setDate(now.getDate() - 90))
        break
      case 'year':
        const currentYear = new Date().getFullYear()
        dateFilter.gte = new Date(currentYear, 0, 1)
        break
    }

    const where = Object.keys(dateFilter).length > 0 ? { sentAt: dateFilter } : {}

    const communications = await prisma.communication.findMany({https://accounts.google.com/ServiceLogin?hl=en&passive=true&continue=https://www.google.com/search%3Fq%3Dfile%2Bmaker%26rlz%3D1C5OZZY_enUS1163US1174%26oq%3Dfile%2Bmaker%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOTIJCAEQABgKGIAEMgkIAhAAGAoYgAQyCQgDEAAYChiABDIHCAQQABiABDIHCAUQABiABDIJCAYQABgKGIAEMgkIBxAAGAoYgAQyCQgIEAAYChiABDIJCAkQABgKGIAE0gEIMTU5OWowajeoAgCwAgA%26sourceid%3Dchrome%26ie%3DUTF-8%26safe%3Dactive%26ssui%3Don&ec=futura_srp_og_si_72236_p
      where,
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        relatedDonation: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return communications
  } catch (error) {
    console.error('Error fetching communications:', error)
    throw error
  }
}

export async function getCommunicationStats() {
  try {
    const stats = await prisma.communication.groupBy({
      by: ['type', 'status'],
      _count: true,
    })

    const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "sentAt") as month,
        COUNT(*) as count,
        "type"
      FROM "Communication"
      WHERE "sentAt" IS NOT NULL
      GROUP BY DATE_TRUNC('month', "sentAt"), "type"
      ORDER BY month DESC
      LIMIT 12
    `

    return {
      byType: stats,
      monthly: monthlyStats,
    }
  } catch (error) {
    console.error('Error getting communication stats:', error)
    throw error
  }
}

export async function sendDonorCommunication(data) {
  try {
    const { donorId, type, content, subject } = data
    
    // Get donor details
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      select: { email: true, firstName: true, preferredContact: true },
    })

    if (!donor) {
      throw new Error('Donor not found')
    }

    let communication = await prisma.communication.create({
      data: {
        ...data,
        organizationId: 'test-org',
        userId: 'test-user',
        status: 'DRAFT',
      },
    })

    // Send based on type and preferred contact method
    if (type === 'EMAIL' && donor.email) {
      try {
        await sendEmail({
          to: donor.email,
          subject: subject || 'Message from your organization',
          html: content,
          text: content.replace(/<[^>]*>/g, ''),
        })

        // Update communication as sent
        communication = await prisma.communication.update({
          where: { id: communication.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        })

      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        
        // Update communication as failed
        await prisma.communication.update({
          where: { id: communication.id },
          data: { status: 'FAILED' },
        })
        
        throw emailError
      }
    }

    return communication
  } catch (error) {
    console.error('Error sending communication:', error)
    throw error
  }
}

export async function scheduleFollowUp(communicationId, followUpDate) {
  try {
    const communication = await prisma.communication.update({
      where: { id: communicationId },
      data: {
        requiresFollowUp: true,
        followUpDate: new Date(followUpDate),
      },
    })

    return communication
  } catch (error) {
    console.error('Error scheduling follow up:', error)
    throw error
  }
}

export async function getUpcomingFollowUps(days = 7) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + days)

    const followUps = await prisma.communication.findMany({
      where: {
        requiresFollowUp: true,
        followUpDate: {
          lte: cutoffDate,
          gte: new Date(),
        },
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { followUpDate: 'asc' },
    })

    return followUps
  } catch (error) {
    console.error('Error getting upcoming follow ups:', error)
    throw error
  }
}