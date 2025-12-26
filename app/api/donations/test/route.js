import { NextResponse } from 'next/server';
import { createDonation } from '@/lib/api/donations';

export async function POST(req) {
  try {
    const { donorId, organizationId } = await req.json();

    // create a random test donation
    const donation = await createDonation({
      donorId,
      organizationId,
      amount: Math.floor(Math.random() * 500) + 10, // $10-$510
      currency: 'USD',
      paymentMethod: 'CREDIT_CARD',
      notes: 'Test donation',
    });

    return NextResponse.json({ success: true, donation });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
