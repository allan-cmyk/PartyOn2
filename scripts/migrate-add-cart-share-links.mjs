/**
 * Add cart_share_links table for short-link share URLs.
 *
 * Customer-facing share links resolve via /s/<slug> → 302 → /cart/shared?c=...&t=...
 * Storing the encoded cart payload + token + expiration in Postgres lets us shorten
 * the visible URL from ~110 chars to ~35 chars and survive the serverless cold-start
 * problem the prior in-memory implementation had.
 *
 * Idempotent — uses CREATE TABLE IF NOT EXISTS. Safe to re-run.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/migrate-add-cart-share-links.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Add cart_share_links table ===\n');

  const statements = [
    `CREATE TABLE IF NOT EXISTS "cart_share_links" (
       "id"          TEXT PRIMARY KEY,
       "slug"        TEXT NOT NULL UNIQUE,
       "cart_data"   TEXT NOT NULL,
       "token"       TEXT NOT NULL,
       "expires_at"  TIMESTAMPTZ NOT NULL,
       "view_count"  INTEGER NOT NULL DEFAULT 0,
       "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`,
    `CREATE INDEX IF NOT EXISTS "cart_share_links_expires_at_idx" ON "cart_share_links"("expires_at")`,
  ];

  for (const sql of statements) {
    console.log(`>> ${sql.split('\n')[0].trim()}...`);
    await prisma.$executeRawUnsafe(sql);
  }

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'cart_share_links'
    ORDER BY ordinal_position
  `);
  console.log('\nTable structure:');
  console.table(cols);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
