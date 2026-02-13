import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth.js';

// ============================================
// DONATION SUMMARY API
// ============================================
// GET: Get donation summary statistics and charts
// ============================================

export async function GET(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const { searchParams } = new URL(request.url);
    
    const donorId = searchParams.get('donorId');
    const campaignId = searchParams.get('campaignId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear());

    // Build where clause
    const where = {
      organizationId,
      status: 'COMPLETED',
      ...(donorId && { donorId }),
      ...(campaignId && { campaignId })
    };

    // ============ Overall Stats ============
    const allTimeStats = await prisma.donation.aggregate({
      where: {
        ...where,
        isSimulated: false
      },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true }
    });

    // ============ Year to Date Stats ============
    const ytdStart = new Date(year, 0, 1);
    const ytdStats = await prisma.donation.aggregate({
      where: {
        ...where,
        date: { gte: ytdStart },
        isSimulated: false
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    // ============ Monthly Breakdown ============
    const monthlyDonations = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM date) as month,
        EXTRACT(YEAR FROM date) as year,
        SUM(amount) as total,
        COUNT(*) as count
      FROM "Donation"
      WHERE "organizationId" = ${organizationId}
        AND status = 'COMPLETED'
        AND isSimulated = false
        ${donorId ? `AND "donorId" = ${donorId}` : ''}
        ${campaignId ? `AND "campaignId" = ${campaignId}` : ''}
        AND EXTRACT(YEAR FROM date) = ${year}
      GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
      ORDER BY year ASC, month ASC
    `;

    // ============ Campaign Breakdown ============
    const campaignBreakdown = await prisma.donation.groupBy({
      by: ['campaignId'],
      where: {
        organizationId,
        status: 'COMPLETED',
        isSimulated: false,
        ...(donorId && { donorId }),
        campaignId: { not: null }
      },
      _sum: { amount: true },
      _count: true
    });

    // Get campaign names
    const campaignIds = campaignBreakdown.map(c => c.campaignId).filter(Boolean);
    const campaigns = await prisma.campaign.findMany({
      where: { id: { in: campaignIds } },
      select: { id: true, name: true }
    });

    const campaignMap = Object.fromEntries(campaigns.map(c => [c.id, c.name]));

    // ============ Donor Giving Tiers ============
    const donorTiers = await prisma.$queryRaw`
      SELECT 
        CASE
          WHEN total >= 10000 THEN 'Major Donor'
          WHEN total >= 5000 THEN 'Sustainer'
          WHEN total >= 1000 THEN 'Regular'
          WHEN total >= 100 THEN 'Occasional'
          ELSE 'First Time'
        END as tier,
        COUNT(*) as count,
        SUM(total) as total
      FROM (
        SELECT 
          "donorId",
          SUM(amount) as total
        FROM "Donation"
        WHERE "organizationId" = ${organizationId}
          AND status = 'COMPLETED'
          AND isSimulated = false
          ${donorId ? `AND "donorId" = ${donorId}` : ''}
        GROUP BY "donorId"
      ) as donor_totals
      GROUP BY 
        CASE
          WHEN total >= 10000 THEN 'Major Donor'
          WHEN total >= 5000 THEN 'Sustainer'
          WHEN total >= 1000 THEN 'Regular'
          WHEN total >= 100 THEN 'Occasional'
          ELSE 'First Time'
        END
    `;

    // ============ Payment Method Breakdown ============
    const paymentMethods = await prisma.donation.groupBy({
      by: ['paymentMethod'],
      where: {
        organizationId,
        status: 'COMPLETED',
        isSimulated: false,
        ...(donorId && { donorId }),
        ...(campaignId && { campaignId })
      },
      _sum: { amount: true },
      _count: true
    });

    // ============ Format Response ============
    const summary = {
      allTime: {
        totalAmount: allTimeStats._sum.amount || 0,
        donationCount: allTimeStats._count.id || 0,
        averageAmount: allTimeStats._avg.amount || 0
      },
      yearToDate: {
        totalAmount: ytdStats._sum.amount || 0,
        donationCount: ytdStats._count.id || 0,
        year
      },
      monthly: monthlyDonations.map(m => ({
        month: parseInt(m.month),
        year: parseInt(m.year),
        monthName: new Date(parseInt(m.year), parseInt(m.month) - 1).toLocaleString('default', { month: 'short' }),
        total: parseFloat(m.total) || 0,
        count: parseInt(m.count) || 0
      })),
      campaigns: campaignBreakdown.map(c => ({
        campaignId: c.campaignId,
        campaignName: campaignMap[c.campaignId] || 'Unknown Campaign',
        totalAmount: c._sum.amount || 0,
        donationCount: c._count || 0
      })),
      donorTiers: donorTiers.map(t => ({
        tier: t.tier,
        donorCount: parseInt(t.count) || 0,
        totalAmount: parseFloat(t.total) || 0
      })),
      paymentMethods: paymentMethods.map(p => ({
        method: p.paymentMethod,
        totalAmount: p._sum.amount || 0,
        donationCount: p._count || 0
      }))
    };

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Error fetching donation summary:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch donation summary'
    }, { status: 500 });
  }
}