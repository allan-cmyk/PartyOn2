import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { getExperimentRollup, getPageEngagement } from '@/lib/analytics/variant-rollup';
import { prisma } from '@/lib/database/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/experiments
 *   ?metric=rollup&experimentId=<id>&days=30    → per-variant stats + significance
 *   ?metric=list&days=30                         → rollup for all active experiments
 *   ?metric=pages&days=30                        → per-page sessions / bounce / CTA
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireOpsAuth();
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const metric = sp.get('metric') ?? 'list';
  const days = Math.max(1, Math.min(365, parseInt(sp.get('days') ?? '30', 10)));

  try {
    switch (metric) {
      case 'rollup': {
        const experimentId = sp.get('experimentId');
        if (!experimentId) {
          return NextResponse.json({ error: 'experimentId required' }, { status: 400 });
        }
        return NextResponse.json({ metric, days, data: await getExperimentRollup(experimentId, days) });
      }
      case 'list': {
        const experiments = await prisma.experiment.findMany({
          where: { status: { in: ['RUNNING', 'PAUSED'] } },
          select: { id: true, name: true, page: true, status: true },
        });
        const rollups = await Promise.all(
          experiments.map((e) => getExperimentRollup(e.id, days).then((r) => ({ ...e, rollup: r })))
        );
        return NextResponse.json({ metric, days, data: rollups });
      }
      case 'pages':
        return NextResponse.json({ metric, days, data: await getPageEngagement(days) });
      default:
        return NextResponse.json({ error: `unknown metric: ${metric}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[admin/analytics/experiments]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 500 });
  }
}
