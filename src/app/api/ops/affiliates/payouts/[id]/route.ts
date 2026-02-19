/**
 * GET /api/ops/affiliates/payouts/[id] -- payout detail
 * PUT /api/ops/affiliates/payouts/[id] -- mark completed or failed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayoutById, markPayoutCompleted, markPayoutFailed } from '@/lib/affiliates/payout-service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const payout = await getPayoutById(id);
    if (!payout) {
      return NextResponse.json({ success: false, error: 'Payout not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: payout });
  } catch (error) {
    console.error('[Ops Payout Detail API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get payout' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    if (status === 'COMPLETED') {
      const payout = await markPayoutCompleted(id);
      return NextResponse.json({ success: true, data: payout });
    }

    if (status === 'FAILED') {
      const payout = await markPayoutFailed(id, notes);
      return NextResponse.json({ success: true, data: payout });
    }

    return NextResponse.json({ success: false, error: 'Invalid status. Use COMPLETED or FAILED.' }, { status: 400 });
  } catch (error) {
    console.error('[Ops Payout Update API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update payout' }, { status: 500 });
  }
}
