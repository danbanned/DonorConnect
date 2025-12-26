import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

/**
 * GET /api/donors
 */
export async function GET() {
  try {
    const donors = await prisma.donor.findMany({
      orderBy: { lastName: 'asc' },
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
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    const organizationId = user.organizationId ?? null
    const body = await req.json()

    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const donor = await prisma.donor.create({
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone || null,
            preferredContact: body.preferredContact || 'EMAIL',
            status: 'ACTIVE',
            relationshipStage: 'NEW',
            personalNotes: body.personalNotes || null,
            organizationId,
            

            address: body.address
              ? { create: body.address }
              : undefined,

            interests: body.interests
              ? {
                  create: body.interests.map(i => ({
                    interest: {
                      connectOrCreate: {
                        where: { name: i.name ?? i },
                        create: { name: i.name ?? i },
                      },
                    },
                  })),
                }
              : undefined,

            tags: body.tags
              ? {
                  create: body.tags.map(t => ({
                    tag: {
                      connectOrCreate: {
                        where: { name: t.name ?? t },
                        create: { name: t.name ?? t },
                      },
                    },
                  })),
                }
              : undefined,
          },
})


    return NextResponse.json(donor, { status: 201 })
  } catch (error) {
    console.error('🔥 Prisma donor create failed:', error)
    return NextResponse.json({ error: 'Failed to create donor' }, { status: 500 })
  }
}
