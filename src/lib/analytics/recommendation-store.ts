/**
 * RecommendationItem persistence — stores generated recommendations so they:
 *  - aren't re-suggested every snapshot run (dedupe by title+segment when an open/approved row exists)
 *  - have an audit trail (status history, shippedAt, result metrics before/after)
 *  - support the Phase 2 autonomy ramp: a worker can pick up `approved` + `autonomous` rows
 *
 * Heuristic recommendations (from `recommendations.ts`) and Director-generated recommendations
 * both flow through `persistRecommendations()` with a different `source` tag.
 */

import { prisma } from '@/lib/database/client';

export type RecommendationSource = 'auto-snapshot' | 'director' | 'manual';
export type RiskTier = 'autonomous' | 'recommend' | 'hard_stop';
export type RecommendationStatus = 'open' | 'approved' | 'shipped' | 'rejected' | 'invalidated';

export interface RecommendationInput {
  title: string;
  body?: string;
  segment?: string | null;
  metric?: string;
  currentValue?: string;
  targetValue?: string;
  impactDollarsMonthly?: number;
  effortTier?: 's' | 'm' | 'l';
  riskTier?: RiskTier;
}

export interface PersistResult {
  inserted: number;
  skippedExisting: number;
}

/**
 * Insert recommendations with title+segment dedupe: if there's already an open or approved row
 * with the same title+segment, skip. (Rejected/invalidated rows do NOT block re-insertion —
 * the heuristic may now have stronger evidence.)
 */
export async function persistRecommendations(
  recs: RecommendationInput[],
  source: RecommendationSource
): Promise<PersistResult> {
  let inserted = 0;
  let skippedExisting = 0;

  for (const rec of recs) {
    const existing = await prisma.recommendationItem.findFirst({
      where: {
        title: rec.title,
        segment: rec.segment ?? null,
        status: { in: ['open', 'approved'] },
      },
      select: { id: true },
    });

    if (existing) {
      skippedExisting += 1;
      continue;
    }

    await prisma.recommendationItem.create({
      data: {
        source,
        title: rec.title,
        body: rec.body ?? null,
        segment: rec.segment ?? null,
        metric: rec.metric ?? null,
        currentValue: rec.currentValue ?? null,
        targetValue: rec.targetValue ?? null,
        impactDollarsMonthly: rec.impactDollarsMonthly ?? null,
        effortTier: rec.effortTier ?? null,
        riskTier: rec.riskTier ?? 'recommend',
      },
    });
    inserted += 1;
  }

  return { inserted, skippedExisting };
}

export async function listRecommendations(opts?: {
  status?: RecommendationStatus | RecommendationStatus[];
  segment?: string;
  limit?: number;
}) {
  const where: {
    status?: RecommendationStatus | { in: RecommendationStatus[] };
    segment?: string;
  } = {};
  if (opts?.status) {
    where.status = Array.isArray(opts.status) ? { in: opts.status } : opts.status;
  }
  if (opts?.segment) where.segment = opts.segment;

  return prisma.recommendationItem.findMany({
    where,
    orderBy: [{ status: 'asc' }, { impactDollarsMonthly: 'desc' }, { generatedAt: 'desc' }],
    take: opts?.limit ?? 100,
  });
}

export async function updateRecommendationStatus(
  id: string,
  status: RecommendationStatus,
  notes?: string
) {
  return prisma.recommendationItem.update({
    where: { id },
    data: {
      status,
      ...(status === 'shipped' ? { shippedAt: new Date() } : {}),
      ...(notes ? { notes } : {}),
    },
  });
}
