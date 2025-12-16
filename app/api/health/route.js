import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { calculateLYBUNT } from '@/lib/lybunt'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const filter = searchParams.get('filter')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    let where = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (filter === 'lybunt') {
      // Get LYBUNT donor IDs
      const lybuntDonors = await calculateLYBUNT()
      const lybuntIds = lybuntDonors.map(d => d.id)
      where.id = { in: lybuntIds }
    } else if (filter === 'major') {
      where.totalGiven = { gt: 10000 }
    } else if (filter === 'recurring') {
      where.tags = { has: 'recurring' }
    } else if (filter === 'active') {
      where.status = 'ACTIVE'
    }

    // Get donors with pagination
    const [donors, total] = await Promise.all([
      prisma.donor.findMany({
        where,
        include: {
          donations: {
            take: 5,
            orderBy: { date: 'desc' },
          },
        },
        orderBy: { lastName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.donor.count({ where }),
    ])

    return NextResponse.json({
      donors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching donors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donors' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    const donor = await prisma.donor.create({
      data: {
        ...data,
        organizationId: 'test-org', // In real app, get from session
      },
    })

    return NextResponse.json(donor, { status: 201 })
  } catch (error) {
    console.error('Error creating donor:', error)
    return NextResponse.json(
      { error: 'Failed to create donor' },
      { status: 500 }
    )
  }
}