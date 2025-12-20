import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/donors
 */
export async function GET() {
  try {
    const donors = await prisma.donor.findMany({
      orderBy: { lastName: 'desc' },
    })

    return NextResponse.json(donors)
  } catch (error) {
    console.error('Failed to fetch donors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donors' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/donors
 */
export async function POST(req) {
  try {
    const body = await req.json()

    const donor = await prisma.donor.create({
      data: {
        // REQUIRED by schema
        organizationId: 'org_test_123',

        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,

        preferredContact: body.preferredContact || 'EMAIL',
        relationshipStage: 'NEW',
        status: 'ACTIVE',

        // ✅ Correct address relation
        address: body.street || body.city
          ? {
              create: {
                street: body.street || null,
                city: body.city || null,
                state: body.state || null,
                zipCode: body.zipCode || null,
              },
            }
          : undefined,
      },
    })

    return NextResponse.json(donor, { status: 201 })
  } catch (error) {
    console.error('Failed to create donor:', error)
    return NextResponse.json(
      { error: 'Failed to create donor' },
      { status: 500 }
    )
  }
}
