/**
 * POST /api/admin/finance/ap/[id]/edit-ap
 *
 * Body: `{ invoiceTotalCents?: number | null, dueDate?: 'YYYY-MM-DD' | null }`
 *
 * Edit the AP-side fields on a ReceivingInvoice. Used:
 *   - inline on /admin/finance/ap (operator fixes totals after the fact)
 *   - from the receiving review flow (set total + due date at apply time)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { updateApFields } from '@/lib/finance/ap-service';

interface Body {
  invoiceTotalCents?: number | null;
  dueDate?: string | null;
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

    let dueDate: Date | null | undefined;
    if (body.dueDate === undefined) {
      dueDate = undefined;
    } else if (body.dueDate === null) {
      dueDate = null;
    } else {
      dueDate = new Date(`${body.dueDate}T00:00:00Z`);
      if (Number.isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'dueDate must be YYYY-MM-DD' },
          { status: 400 }
        );
      }
    }

    let invoiceTotalCents: number | null | undefined;
    if (body.invoiceTotalCents === undefined) {
      invoiceTotalCents = undefined;
    } else if (body.invoiceTotalCents === null) {
      invoiceTotalCents = null;
    } else if (
      typeof body.invoiceTotalCents !== 'number' ||
      !Number.isFinite(body.invoiceTotalCents) ||
      body.invoiceTotalCents < 0
    ) {
      return NextResponse.json(
        { success: false, error: 'invoiceTotalCents must be a non-negative integer in cents' },
        { status: 400 }
      );
    } else {
      invoiceTotalCents = Math.round(body.invoiceTotalCents);
    }

    await updateApFields({ invoiceId: id, invoiceTotalCents, dueDate });
    return NextResponse.json({ success: true, data: { updated: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Finance AP edit-ap] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
