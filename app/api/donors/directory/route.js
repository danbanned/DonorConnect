import { NextResponse } from 'next/server'
import { getAllDonors } from  '../../../../lib/api/donor-data'
import { cookies } from 'next/headers'
import { verifyToken } from '../../../../lib/auth'

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const donors = await getAllDonors(
      user.orgId,
      user.role === 'viewer' ? user.userId : null
    )
    return NextResponse.json(donors)
  } catch (error) {
    console.error('Error fetching donors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donors' },
      { status: 500 }
    )
  }
}
