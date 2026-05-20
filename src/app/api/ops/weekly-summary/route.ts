/**
 * GET /api/ops/weekly-summary?start=YYYY-MM-DD&days=7
 *
 * Returns the weekly delivery summary (paid orders, grouped into coolers)
 * for the /ops/weekly-summary tab. Refresh = re-call this endpoint.
 *
 * Auth: ops session cookie required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { getWeeklySummary, todayCT } from '@/lib/ops/weekly-summary-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const startRaw = searchParams.get('start');
  const daysRaw = searchParams.get('days');

  const start = /^\d{4}-\d{2}-\d{2}$/.test(startRaw || '') ? startRaw! : todayCT();
  const daysParsed = parseInt(daysRaw || '', 10);
  const days = Number.isFinite(daysParsed) ? daysParsed : 7;

  try {
    const summary = await getWeeklySummary({ startDate: start, days });
    return NextResponse.json(
      { ok: true, ...summary, fetchedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
