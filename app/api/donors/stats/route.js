import { NextResponse } from 'next/server'
import { getDonorStats } from '../../../../lib/api/donor-data'
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

    const stats = await getDonorStats(
      user.orgId,
      user.role === 'viewer' ? user.userId : null
    )
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching donor stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donor statistics' },
      { status: 500 }
    )
  }
}
