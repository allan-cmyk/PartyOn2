/**
 * GET /api/admin/finance/ap
 *
 * Returns outstanding distributor invoices + aging summary. Powers
 * /admin/finance/ap.
 */

import { NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { apSummary, listOutstanding } from '@/lib/finance/ap-service';

export async function GET(): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const [outstanding, summary] = await Promise.all([
      listOutstanding(),
      apSummary(),
    ]);

    return NextResponse.json({
      success: true,
      data: { outstanding, summary },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Finance AP] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
