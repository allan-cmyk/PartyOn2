/**
 * Daily Operations snapshot cron.
 *
 * Runs at 07:30 UTC, right after the Marketing snapshot. Computes the
 * OperationsSnapshot metrics row, runs all 10 drift detectors, and upserts
 * the resulting OperationsRecommendation rows (dedupe + suppression handled
 * by the orchestrator).
 *
 * Auth: Bearer CRON_SECRET (matches the rest of the cron family).
 *
 * vercel.json: { "path": "/api/cron/operations-snapshot", "schedule": "30 7 * * *" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { generateAll } from '@/lib/operations/recommendations';
import { upsertRecommendations } from '@/lib/operations/recommendation-store';
import {
  computeCostCoveragePct,
  computeCycleCountsCompletedLast7d,
  computeInventoryAccuracyPct,
  computePaidOrders14dShortageCount,
  computeReceivingLagPercentiles,
} from '@/lib/operations/snapshot';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const errors: string[] = [];
  const safe = async <T>(label: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (err) {
      console.error(`[operations-snapshot] ${label} failed:`, err);
      errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  };

  const [accuracy, coverage, lag, shortageCount, cycleCounts, generated] = await Promise.all([
    safe('metrics.accuracy', () => computeInventoryAccuracyPct(now)),
    safe('metrics.coverage', () => computeCostCoveragePct(now)),
    safe('metrics.receiving-lag', () => computeReceivingLagPercentiles(now)),
    safe('metrics.shortage', () => computePaidOrders14dShortageCount(now)),
    safe('metrics.cycle-counts', () => computeCycleCountsCompletedLast7d(now)),
    safe('detectors', () => generateAll(now)),
  ]);

  const driftTotal = generated?.proposals.length ?? 0;
  const urgentShortages = (generated?.proposals ?? []).filter(
    (r) => r.signalKind === 'pre-fulfillment-shortage'
  ).length;

  const snapshot = await safe('snapshot.write', () =>
    prisma.operationsSnapshot.create({
      data: {
        capturedAt: now,
        inventoryAccuracyPct: accuracy,
        driftEventsTotal: driftTotal,
        driftEventsBySignal: generated?.bySignal ?? {},
        urgentShortagesCount: urgentShortages,
        costCoveragePct: coverage ?? 0,
        receivingLagP50Hours: lag?.p50 ?? null,
        receivingLagP90Hours: lag?.p90 ?? null,
        cycleCountsCompletedLast7d: cycleCounts ?? 0,
        paidOrders14dShortageCount: shortageCount ?? 0,
      },
    })
  );

  const upsertSummary = generated
    ? await safe('store.upsert', () => upsertRecommendations(generated.proposals))
    : null;

  return NextResponse.json({
    ok: true,
    snapshotId: snapshot?.id ?? null,
    metrics: {
      inventoryAccuracyPct: accuracy,
      costCoveragePct: coverage,
      receivingLag: lag,
      paidOrders14dShortageCount: shortageCount,
      cycleCountsCompletedLast7d: cycleCounts,
    },
    detectors: {
      bySignal: generated?.bySignal ?? {},
      proposals: driftTotal,
      suppressedSnoozed: generated?.suppressedSnoozed ?? 0,
      suppressedKnockdown: generated?.suppressedKnockdown ?? 0,
    },
    upsert: upsertSummary ?? { created: 0, updated: 0, skipped: 0 },
    errors: errors.length ? errors : undefined,
  });
}
