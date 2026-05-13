/**
 * Hourly Operations drift cron.
 *
 * Runs the time-sensitive subset of detectors every hour:
 *   - receiving-lag, pick-inventory-lag, ai-note-backlog, pre-fulfillment-shortage
 *
 * Same upsert flow as the daily snapshot, just no snapshot row. Keeps the
 * triage queue fresh between Monday plan runs and lets urgent shortages
 * surface within an hour of a paid order landing.
 *
 * Auth: Bearer CRON_SECRET.
 *
 * vercel.json: { "path": "/api/cron/operations-drift-hourly", "schedule": "0 * * * *" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateHourly } from '@/lib/operations/recommendations';
import { upsertRecommendations } from '@/lib/operations/recommendation-store';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  try {
    const result = await generateHourly(now);
    const summary = await upsertRecommendations(result.proposals);
    return NextResponse.json({
      ok: true,
      detectors: {
        bySignal: result.bySignal,
        proposals: result.proposals.length,
        suppressedSnoozed: result.suppressedSnoozed,
        suppressedKnockdown: result.suppressedKnockdown,
      },
      upsert: summary,
    });
  } catch (err) {
    console.error('[operations-drift-hourly] failed:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
