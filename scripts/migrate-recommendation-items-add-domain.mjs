/**
 * Add `domain` column to recommendation_items.
 *
 *   domain TEXT NOT NULL DEFAULT 'marketing' — discriminates Marketing vs. SEO recs in the
 *   shared queue. Per ADR S0001 (Memory/SEO/Decisions/) we extend the existing table
 *   rather than create a parallel SeoRecommendation model.
 *
 * Also adds a partial index on (domain, status) for the queue-filter query path:
 * `WHERE domain = 'seo' AND status IN ('open','approved')` is the SEO Director's
 * primary read pattern.
 *
 * Idempotent — uses ADD COLUMN IF NOT EXISTS and CREATE INDEX IF NOT EXISTS.
 * Safe to re-run.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/migrate-recommendation-items-add-domain.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Add `domain` to recommendation_items ===\n');

  const statements = [
    `ALTER TABLE "recommendation_items" ADD COLUMN IF NOT EXISTS "domain" TEXT NOT NULL DEFAULT 'marketing'`,
    `CREATE INDEX IF NOT EXISTS "recommendation_items_domain_status_idx" ON "recommendation_items" ("domain", "status")`,
  ];

  for (const sql of statements) {
    console.log(`>> ${sql}`);
    await prisma.$executeRawUnsafe(sql);
  }

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'recommendation_items'
      AND column_name = 'domain'
  `);
  console.log('\nNew column:');
  console.table(cols);

  const indexes = await prisma.$queryRawUnsafe(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'recommendation_items'
      AND indexname = 'recommendation_items_domain_status_idx'
  `);
  console.log('\nNew index:');
  console.table(indexes);

  const counts = await prisma.$queryRawUnsafe(`
    SELECT domain, COUNT(*)::int AS rows
    FROM recommendation_items
    GROUP BY domain
    ORDER BY domain
  `);
  console.log('\nRow counts by domain (existing rows backfilled by DEFAULT):');
  console.table(counts);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
