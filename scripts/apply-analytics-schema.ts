/**
 * One-shot DDL applier for the analytics closed-loop schema additions.
 *
 * Run BEFORE deploying the new code so prod has the columns/tables the new
 * Prisma client references. Otherwise Stripe checkout webhooks will start
 * erroring on missing `orders.segment`.
 *
 * Usage:
 *   DATABASE_URL=<prod> npx tsx scripts/apply-analytics-schema.ts
 *
 * Idempotent — safe to run multiple times. Mirrors the inline ALTERs the
 * analytics-snapshot cron applies; this just lets you apply them on demand.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STATEMENTS: Array<[string, string]> = [
  [
    'analytics_snapshots.comparison_data',
    'ALTER TABLE analytics_snapshots ADD COLUMN IF NOT EXISTS comparison_data JSONB',
  ],
  [
    'orders.segment',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS segment TEXT',
  ],
  [
    'orders.segment idx',
    'CREATE INDEX IF NOT EXISTS orders_segment_idx ON orders(segment)',
  ],
  [
    'recommendation_items table',
    `CREATE TABLE IF NOT EXISTS recommendation_items (
      id TEXT PRIMARY KEY,
      generated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      segment TEXT,
      metric TEXT,
      current_value TEXT,
      target_value TEXT,
      impact_dollars_monthly INTEGER,
      effort_tier TEXT,
      risk_tier TEXT NOT NULL DEFAULT 'recommend',
      status TEXT NOT NULL DEFAULT 'open',
      shipped_at TIMESTAMP(3),
      result_metric_before JSONB,
      result_metric_after JSONB,
      notes TEXT,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ],
  ['rec_status_idx', 'CREATE INDEX IF NOT EXISTS rec_status_idx ON recommendation_items(status)'],
  ['rec_generated_idx', 'CREATE INDEX IF NOT EXISTS rec_generated_idx ON recommendation_items(generated_at)'],
  ['rec_segment_idx', 'CREATE INDEX IF NOT EXISTS rec_segment_idx ON recommendation_items(segment)'],
  ['rec_title_segment_idx', 'CREATE INDEX IF NOT EXISTS rec_title_segment_idx ON recommendation_items(title, segment)'],
];

async function main() {
  console.log('[apply-analytics-schema] applying additive DDL…');
  for (const [label, sql] of STATEMENTS) {
    process.stdout.write(`  • ${label.padEnd(40)} `);
    await prisma.$executeRawUnsafe(sql);
    console.log('OK');
  }
  console.log('[apply-analytics-schema] done. Safe to deploy now.');
}

main()
  .catch((err) => {
    console.error('[apply-analytics-schema] FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
