export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function PUT(request) {
  try {
    const headers = request.headers
    const userId = headers.get('x-user-id')

    const updates = await request.json()

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates
    })

    return NextResponse.json(user)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Profile update failed' }, { status: 500 })
  }
}
