/**
 * One-shot backfill: classify Order.segment for existing rows from landingPage + utmCampaign.
 *
 * Usage:
 *   npx tsx scripts/backfill-order-segments.ts [--dry-run]
 *
 * Run after the prod DB has the `segment` column added (the analytics-snapshot cron
 * applies the `ALTER TABLE` automatically on first run, but this script can also
 * apply it idempotently below).
 */

import { PrismaClient } from '@prisma/client';
import { classifySegment, type Segment } from '../src/lib/analytics/segment-classifier';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`[backfill-segments] starting${DRY_RUN ? ' (DRY RUN)' : ''}`);

  // Idempotent column add — same DDL the cron runs.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS segment TEXT`
  );

  const orders = await prisma.order.findMany({
    where: { segment: null },
    select: { id: true, landingPage: true, utmCampaign: true },
  });
  console.log(`[backfill-segments] ${orders.length} orders with null segment`);

  const counts: Record<Segment, number> = {
    bach: 0, wedding: 0, corporate: 0, boat: 0, kegs: 0, general: 0,
  };

  for (const o of orders) {
    const segment = classifySegment(o.landingPage, o.utmCampaign);
    counts[segment]++;
    if (!DRY_RUN) {
      await prisma.order.update({ where: { id: o.id }, data: { segment } });
    }
  }

  console.log('[backfill-segments] distribution:');
  for (const [seg, n] of Object.entries(counts)) {
    console.log(`  ${seg.padEnd(10)} ${n}`);
  }
  console.log('[backfill-segments] done');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
