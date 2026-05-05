/**
 * One-off: reject the W19 "affiliate margin coverage too low" recs and the
 * "negative ROI" affiliate recs, with notes pointing at marketing ADR M0001.
 *
 * Why: M0001 establishes that affiliate ROI is currently under-attributed
 * (middleware doesn't set ref_code on /partners/<code> visits, repeat-customer
 * LTV is missed, group-dashboard sub-orders may not all carry affiliateId).
 * Until those are fixed and margin coverage hits 70%, we don't pause
 * affiliates from this heuristic.
 *
 * Run: npx tsx scripts/marketing/dismiss-affiliate-coverage-recs.ts [--dry-run]
 */

import { prisma } from '../../src/lib/database/client';
import { updateRecommendationStatus } from '../../src/lib/analytics/recommendation-store';
import { mirrorRecommendation } from '../../src/lib/analytics/recommendation-mirror';

const ADR = 'M0001';
const NOTES = [
  `Dismissed per marketing ADR ${ADR} (Do not pause affiliates based on current ROI heuristic — revenue under-attributed).`,
  `Three attribution leaks identified: (1) /partners/<code> pages don't set ref_code cookie,`,
  `(2) 30-day cookie-only attribution misses repeat-customer LTV,`,
  `(3) group-dashboard sub-orders may not all carry affiliateId.`,
  `Re-evaluate after P0 middleware fix ships, PREMIER sub-order audit closes, and margin coverage ≥70%.`,
].join(' ');

const DRY_RUN = process.argv.includes('--dry-run');

async function main(): Promise<void> {
  const open = await prisma.recommendationItem.findMany({
    where: {
      status: 'open',
      OR: [
        { metric: { startsWith: 'affiliate-coverage:' } },
        { metric: { startsWith: 'affiliate-roi:' } },
      ],
    },
    select: { id: true, title: true, metric: true },
  });

  if (open.length === 0) {
    console.log('[dismiss-affiliate-coverage-recs] no open affiliate recs found — nothing to do.');
    return;
  }

  const banner = DRY_RUN ? '[DRY RUN] would dismiss' : 'dismissing';
  console.log(`[dismiss-affiliate-coverage-recs] ${banner} ${open.length} rec(s):`);
  for (const r of open) console.log(`  - ${r.metric ?? '(no metric)'} — ${r.title}`);

  if (DRY_RUN) {
    console.log('[dismiss-affiliate-coverage-recs] dry-run complete — no changes made.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  let mirrored = 0;
  let mirrorErrors = 0;

  for (const r of open) {
    const { updated, priorStatus } = await updateRecommendationStatus(r.id, 'rejected', NOTES);
    if (priorStatus !== 'rejected') {
      const result = await mirrorRecommendation(updated, {
        date: today,
        fromStatus: priorStatus,
        toStatus: 'rejected',
        notes: NOTES,
        actor: 'operator',
      });
      if (result.mirrored) mirrored += 1;
      else {
        mirrorErrors += 1;
        console.warn(`  mirror failed for ${r.id}: ${result.error ?? 'unknown'}`);
      }
    }
  }

  console.log(
    `[dismiss-affiliate-coverage-recs] done. dismissed=${open.length} mirrored=${mirrored} mirror_errors=${mirrorErrors}`
  );
}

main()
  .catch((err) => {
    console.error('[dismiss-affiliate-coverage-recs] failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
