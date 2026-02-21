export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { prisma } from '../../../../lib/db.js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../../lib/auth.js'

export async function GET(req, { params }) {
  
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const where = {
      id,
      organizationId: user.orgId,
      ...(user.role === 'viewer' ? { assignedToId: user.userId } : {})
    }

    const donor = await prisma.donor.findFirst({
      where,
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
