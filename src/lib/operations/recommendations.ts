/**
 * Operations Director recommendation orchestrator.
 *
 * Composes the 10 drift detectors (detectors.ts) with the snooze/reject
 * suppression filter described in §5d, then hands the result to the store
 * for upsert. The crons stay thin — they call generateAll / generateHourly,
 * call upsertRecommendations, and return a summary.
 *
 * Suppression rules (per §5d, "snooze/dismiss feeds back into scoring"):
 *   - snoozed + snoozeUntil in the future  → drop entirely
 *   - rejected | invalidated in last 30d   → still surface, severity -1 tier
 *   - otherwise                            → pass through unchanged
 */

import {
  detectAiNoteBacklog,
  detectCostCoverageGap,
  detectCycleCountOverdue,
  detectNegativeAvailable,
  detectPickInventoryLag,
  detectPreFulfillmentShortage,
  detectReceivingLag,
  detectRepeatedShorts,
  detectVariantMismapping,
  detectVelocityAnomaly,
} from './detectors';
import { findRecentResolved } from './recommendation-store';
import {
  buildDedupeKey,
  knockDownSeverity,
  type OperationsRecommendationInput,
  type SignalKind,
} from './types';

type DetectorFn = (now?: Date) => Promise<OperationsRecommendationInput[]>;

/** Daily snapshot — all 10 detectors. */
export const ALL_DETECTORS: ReadonlyArray<readonly [SignalKind, DetectorFn]> = [
  ['receiving-lag', detectReceivingLag],
  ['pick-inventory-lag', detectPickInventoryLag],
  ['repeated-shorts', detectRepeatedShorts],
  ['negative-available', detectNegativeAvailable],
  ['velocity-anomaly', detectVelocityAnomaly],
  ['ai-note-backlog', detectAiNoteBacklog],
  ['variant-mismapping', detectVariantMismapping],
  ['cost-coverage-gap', detectCostCoverageGap],
  ['cycle-count-overdue', detectCycleCountOverdue],
  ['pre-fulfillment-shortage', detectPreFulfillmentShortage],
] as const;

/** Hourly fast loop — only the time-sensitive signals (§7 Phase 1B). */
export const HOURLY_DETECTORS: ReadonlyArray<readonly [SignalKind, DetectorFn]> = [
  ['receiving-lag', detectReceivingLag],
  ['pick-inventory-lag', detectPickInventoryLag],
  ['ai-note-backlog', detectAiNoteBacklog],
  ['pre-fulfillment-shortage', detectPreFulfillmentShortage],
] as const;

export interface GenerateResult {
  proposals: OperationsRecommendationInput[];
  bySignal: Record<string, number>;
  suppressedSnoozed: number;
  suppressedKnockdown: number;
}

/**
 * Apply suppression to a list of detector outputs. Pure-ish: only reads
 * recently-resolved rows from the store, never writes.
 */
export async function applySuppression(
  candidates: OperationsRecommendationInput[],
  now: Date = new Date()
): Promise<{ kept: OperationsRecommendationInput[]; suppressedSnoozed: number; suppressedKnockdown: number }> {
  const kept: OperationsRecommendationInput[] = [];
  let suppressedSnoozed = 0;
  let suppressedKnockdown = 0;
  for (const c of candidates) {
    const dedupeKey = c.dedupeKey ?? buildDedupeKey(c.signalKind, c.targetEntityId);
    const recent = await findRecentResolved(dedupeKey, 30);
    if (!recent) {
      kept.push(c);
      continue;
    }
    if (recent.status === 'snoozed' && recent.snoozeUntil && recent.snoozeUntil.getTime() > now.getTime()) {
      suppressedSnoozed += 1;
      continue;
    }
    if (recent.status === 'rejected' || recent.status === 'invalidated') {
      kept.push({ ...c, severity: knockDownSeverity(c.severity) });
      suppressedKnockdown += 1;
      continue;
    }
    // Expired snooze → fall through, surface again.
    kept.push(c);
  }
  return { kept, suppressedSnoozed, suppressedKnockdown };
}

async function runDetectors(
  detectors: ReadonlyArray<readonly [SignalKind, DetectorFn]>,
  now: Date,
  source: 'auto-snapshot' | 'auto-hourly'
): Promise<GenerateResult> {
  const proposals: OperationsRecommendationInput[] = [];
  const bySignal: Record<string, number> = {};
  for (const [kind, fn] of detectors) {
    const raw = await fn(now);
    bySignal[kind] = raw.length;
    for (const r of raw) proposals.push({ ...r, source });
  }
  const { kept, suppressedSnoozed, suppressedKnockdown } = await applySuppression(proposals, now);
  return { proposals: kept, bySignal, suppressedSnoozed, suppressedKnockdown };
}

export function generateAll(now: Date = new Date()): Promise<GenerateResult> {
  return runDetectors(ALL_DETECTORS, now, 'auto-snapshot');
}

export function generateHourly(now: Date = new Date()): Promise<GenerateResult> {
  return runDetectors(HOURLY_DETECTORS, now, 'auto-hourly');
}
