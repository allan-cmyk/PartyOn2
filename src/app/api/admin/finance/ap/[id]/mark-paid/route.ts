/**
 * POST /api/admin/finance/ap/[id]/mark-paid
 *
 * Body: `{ paidVia: 'ach' | 'check' | 'card' | 'plaid_match' | 'other', paidAt?: ISO8601 }`
 *
 * Marks a distributor invoice as paid. Inline action from /admin/finance/ap.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { markPaid, markUnpaid, type PaidVia } from '@/lib/finance/ap-service';

const VALID_PAID_VIA: PaidVia[] = ['ach', 'check', 'card', 'plaid_match', 'other'];

interface Body {
  paidVia?: string;
  paidAt?: string;
  undo?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Body;

    if (body.undo) {
      await markUnpaid(id);
      return NextResponse.json({ success: true, data: { undone: true } });
    }

    const paidVia = body.paidVia as PaidVia | undefined;
    if (!paidVia || !VALID_PAID_VIA.includes(paidVia)) {
      return NextResponse.json(
        { success: false, error: `paidVia must be one of: ${VALID_PAID_VIA.join(', ')}` },
        { status: 400 }
      );
    }

    const paidAt = body.paidAt ? new Date(body.paidAt) : undefined;
    if (paidAt && Number.isNaN(paidAt.getTime())) {
      return NextResponse.json(
        { success: false, error: 'paidAt must be a valid ISO date' },
        { status: 400 }
      );
    }

    await markPaid({ invoiceId: id, paidAt, paidVia });
    return NextResponse.json({ success: true, data: { paid: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Finance AP mark-paid] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
