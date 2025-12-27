import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendEmail } from '@/lib/api/email'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const timeframe = searchParams.get('timeframe') || '30days'
    const type = searchParams.get('type')
    const donorId = searchParams.get('donorId')

    const skip = (page - 1) * limit

    // Build date filter
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

    // Build where clause
    let where = {}
    
    if (Object.keys(dateFilter).length > 0) {
      where.sentAt = dateFilter
    }
    
    if (type) {
      where.type = type.toUpperCase()
    }
    
    if (donorId) {
      where.donorId = donorId
    }

    // Get communications
    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
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
              email: true,
            },
          },
          campaign: true,
          relatedDonation: {
            select: {
              id: true,
              amount: true,
              date: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communication.count({ where }),
    ])

    // Get stats by type
    const stats = await prisma.communication.groupBy({
      by: ['type'],
      where,
      _count: true,
    })

    return NextResponse.json({
      communications,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.donorId || !data.type) {
      return NextResponse.json(
        { error: 'Donor ID and type are required' },
        { status: 400 }
      )
    }

    // Get donor information for email
    const donor = await prisma.donor.findUnique({
      where: { id: data.donorId },
      select: { email: true, firstName: true, lastName: true },
    })

    if (!donor) {
      return NextResponse.json(
        { error: 'Donor not found' },
        { status: 404 }
      )
    }

    // Create communication record
    const communication = await prisma.communication.create({
      data: {
        ...data,
        organizationId: 'test-org',
        userId: 'test-user', // In real app, get from session
        status: data.status || 'DRAFT',
        sentAt: data.status === 'SENT' ? new Date() : null,
      },
      include: {
        donor: true,
        user: true,
      },
    })

    // Send email if status is SENT and type is EMAIL
    if (data.type === 'EMAIL' && data.status === 'SENT' && donor.email) {
      try {
        await sendEmail({
          to: donor.email,
          subject: data.subject || 'Message from DonorConnect',
          html: data.content || '',
          text: data.content || '',
        })

        // Update communication status to sent
        await prisma.communication.update({
          where: { id: communication.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Update communication status to failed
        await prisma.communication.update({
          where: { id: communication.id },
          data: { status: 'FAILED' },
        })
      }
    }

    return NextResponse.json(communication, { status: 201 })
  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    )
  }
}