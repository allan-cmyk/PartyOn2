/**
 * POST /api/v1/affiliate/me/client-orders/[id]/cancel
 * Affiliate-initiated cancellation of one of their GroupOrderV2 dashboards.
 * Blocked when any ParticipantPayment on the group is already PAID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';
import { cancelGroupOrderByAffiliate } from '@/lib/group-orders-v2/service';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getAffiliateSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  const { id } = await params;

  try {
    await cancelGroupOrderByAffiliate(session.affiliateId, id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'UNKNOWN';
    if (msg === 'NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    if (msg === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Not your order' }, { status: 403 });
    }
    if (msg === 'ALREADY_CLOSED') {
      return NextResponse.json({ success: false, error: 'Already cancelled or completed' }, { status: 409 });
    }
    if (msg === 'HAS_PAID_PAYMENT') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel — at least one participant has paid' },
        { status: 409 }
      );
    }
    console.error('[Affiliate Cancel] Error:', e);
    return NextResponse.json({ success: false, error: 'Failed to cancel' }, { status: 500 });
  }
}
