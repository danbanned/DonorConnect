export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/db'

export async function GET(request, { params }) {
  const donorId = params.id

  const notes = await prisma.personalNote.findMany({
    where: { donorId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(notes)
}

export async function POST(request, { params }) {
  const donorId = params.id
  const body = await request.json()

  const note = await prisma.personalNote.create({
    data: {
      donorId,
      content: body.content,
    },
  })

  return NextResponse.json(note)
}
