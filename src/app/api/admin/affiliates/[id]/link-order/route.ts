/**
 * POST /api/admin/affiliates/[id]/link-order
 *
 * Two modes, selected by request body:
 *
 *   { "mode": "existing", "orderNumber": 144 }
 *     -- Stamps Order.affiliateId and creates an APPROVED AffiliateCommission.
 *
 *   { "mode": "external", "label": "Rice/Gaudreau Wedding", "totalAmount": 839, "eventDate": "2026-01-10", "notes": "..." }
 *     -- Creates a placeholder Customer + Order + Commission for a sale captured
 *        outside the platform (so the commission has an Order to hang off of).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/ops-session';
import {
  linkExistingOrderToAffiliate,
  createExternalOrderForAffiliate,
} from '@/lib/affiliates/manual-attribution';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireAdminRole();
    if (auth instanceof NextResponse) return auth;

    const { id: affiliateId } = await params;
    const body = await request.json();

    if (body.mode === 'existing') {
      const orderNumber = Number(body.orderNumber);
      if (!Number.isInteger(orderNumber) || orderNumber <= 0) {
        return NextResponse.json({ success: false, error: 'orderNumber is required' }, { status: 400 });
      }
      const result = await linkExistingOrderToAffiliate({ affiliateId, orderNumber });
      if (result.alreadyAttributedTo) {
        return NextResponse.json(
          { success: false, error: `Order #${orderNumber} is already attributed to a different affiliate.` },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: true, data: result });
    }

    if (body.mode === 'external') {
      const result = await createExternalOrderForAffiliate({
        affiliateId,
        label: String(body.label ?? ''),
        totalAmount: Number(body.totalAmount),
        eventDate: String(body.eventDate ?? ''),
        notes: body.notes ? String(body.notes) : undefined,
      });
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: 'mode must be "existing" or "external"' }, { status: 400 });
  } catch (error) {
    console.error('[Admin Affiliate Link Order] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to link order';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
