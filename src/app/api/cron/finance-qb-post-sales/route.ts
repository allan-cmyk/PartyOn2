/**
 * GET /api/cron/finance-qb-post-sales
 *
 * Phase 2B — daily 08:00 UTC. Drafts a QB sales journal for yesterday but
 * does NOT post it. Operator must approve via /admin/finance/journals.
 *
 * Idempotent: if a PENDING_APPROVAL entry already exists for yesterday,
 * the new draft supersedes it (the prior is marked SUPERSEDED). POSTED /
 * REJECTED entries are not touched.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  computeDailySalesJournal,
  getJournalConfig,
  persistDraft,
} from '@/lib/finance/qb-journal-service';
import { getStoredTokens } from '@/lib/finance/qb-client';

export const maxDuration = 60;

const ONE_DAY_MS = 86_400_000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  const errors: string[] = [];
  let drafted: { id: string; entryDate: string } | null = null;
  let skipped: string | null = null;

  try {
    const tokens = await getStoredTokens();
    if (!tokens) {
      skipped = 'QuickBooks not connected';
      return NextResponse.json({
        success: false,
        data: { skipped, durationMs: Date.now() - startedAt },
      });
    }
    const config = await getJournalConfig();
    if (!config.enabled) {
      skipped = 'Journal config not enabled (set enabled=true on /admin/finance/journals/settings)';
      return NextResponse.json({
        success: false,
        data: { skipped, durationMs: Date.now() - startedAt },
      });
    }

    // Allow ?date=YYYY-MM-DD override; default = yesterday in UTC.
    const dateParam = request.nextUrl.searchParams.get('date');
    let target: string;
    if (dateParam) {
      const d = new Date(`${dateParam}T00:00:00Z`);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { success: false, error: 'date must be YYYY-MM-DD' },
          { status: 400 }
        );
      }
      target = dateParam;
    } else {
      const now = new Date();
      const todayUtcMidnight = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
      target = new Date(todayUtcMidnight.getTime() - ONE_DAY_MS)
        .toISOString()
        .slice(0, 10);
    }

    const draft = await computeDailySalesJournal(target);
    if (!draft) {
      skipped = `No paid orders on ${target} — nothing to journal`;
    } else {
      const saved = await persistDraft(draft);
      drafted = { id: saved.id, entryDate: saved.entryDate };
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const report = {
    drafted,
    skipped,
    errors,
    durationMs: Date.now() - startedAt,
  };
  console.log('[finance-qb-post-sales] report:', JSON.stringify(report));
  return NextResponse.json({
    success: errors.length === 0,
    data: report,
  });
}
