/**
 * Measurement loop for OperationsRecommendation.
 *
 * Parallel to the Marketing measure-recommendations cron: shares the 14-day
 * window (measurementCutoff from the shared lib) but the "result" we capture
 * is different — for ops recs, "did the underlying drift signal recur in the
 * 14 days after ship?" That answer drives the heuristic-tuning feedback loop.
 *
 * For each shipped rec older than 14 days that hasn't been measured yet:
 *   1. Re-run the matching detector
 *   2. Check whether the same dedupeKey appears in the new proposals
 *   3. Write measurement_result + stamp measuredAt
 *
 * Auth: Bearer CRON_SECRET.
 *
 * vercel.json: { "path": "/api/cron/measure-operations-recommendations", "schedule": "0 8 * * *" }
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import { measurementCutoff } from '@/lib/recommendations/measurement';
import { ALL_DETECTORS } from '@/lib/operations/recommendations';
import { buildDedupeKey, type SignalKind } from '@/lib/operations/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = measurementCutoff();
  const due = await prisma.operationsRecommendation.findMany({
    where: {
      status: 'shipped',
      shippedAt: { lte: cutoff },
      measuredAt: null,
    },
    take: 100,
  });

  if (due.length === 0) {
    return NextResponse.json({ ok: true, measured: 0, note: 'no operations recs due for measurement' });
  }

  // Group by signalKind so each detector runs at most once.
  const byKind = new Map<SignalKind, typeof due>();
  for (const rec of due) {
    const kind = rec.signalKind as SignalKind;
    const arr = byKind.get(kind) ?? [];
    arr.push(rec);
    byKind.set(kind, arr);
  }

  const now = new Date();
  const recurringDedupeKeys = new Set<string>();
  for (const [kind, recs] of byKind) {
    const detector = ALL_DETECTORS.find(([k]) => k === kind)?.[1];
    if (!detector) {
      // Unknown signal kind — mark these as not-recurring (best we can do).
      for (const r of recs) recurringDedupeKeys.delete(r.dedupeKey);
      continue;
    }
    const proposals = await detector(now);
    for (const p of proposals) {
      const key = buildDedupeKey(p.signalKind, p.targetEntityId);
      recurringDedupeKeys.add(key);
    }
  }

  const measured: Array<{ id: string; signalKind: string; recurred: boolean }> = [];
  for (const rec of due) {
    const recurred = recurringDedupeKeys.has(rec.dedupeKey);
    const result = {
      capturedAt: now.toISOString(),
      recurred,
      windowDays: 14,
    };
    await prisma.operationsRecommendation.update({
      where: { id: rec.id },
      data: {
        measuredAt: now,
        measurementResult: result as unknown as Prisma.InputJsonValue,
      },
    });
    measured.push({ id: rec.id, signalKind: rec.signalKind, recurred });
  }

  return NextResponse.json({ ok: true, measured: measured.length, items: measured });
}
