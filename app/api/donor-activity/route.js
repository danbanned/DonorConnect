export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";



const prisma = new PrismaClient();

/**
 * Convert BigInt to string so JSON.stringify works
 */
function serializeBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

/**
 * GET /api/donor-activity
 * Query params:
 *   donorId (optional)
 *   limit (optional, default 25)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get("donorId");
    const limit = Number(searchParams.get("limit")) || 25;

    const activity = await prisma.donorActivity.findMany({
      where: donorId ? { donorId } : undefined,
      include: {
        donor: {
             select: {
                 id: true,
                 firstName: true,
                 lastName: true,
                 email: true,
                } }, // include donor name
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(serializeBigInt(activity));
  } catch (error) {
    console.error("[GET /api/donor-activity]", error);
    return NextResponse.json(
      { error: "Failed to fetch donor activity" },
      { status: 500 }
    );
  }
}
