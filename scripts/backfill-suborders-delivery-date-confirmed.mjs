/**
 * One-time backfill: flip delivery_date_confirmed = true for every existing
 * sub_orders row at the moment this migration runs.
 *
 * Why: the column was added with default=false, but pre-existing orders all had
 * customer-visible delivery dates (sometimes auto-filled, sometimes picked).
 * Treating them as "unconfirmed" would hide the date from the dashboard UI
 * post-deploy — which is unacceptable for orders we can't reach back out about.
 *
 * Safe to run multiple times — only updates rows where the column is currently
 * false, so a re-run is a no-op once everything is true.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/backfill-suborders-delivery-date-confirmed.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Backfill delivery_date_confirmed = true for existing sub_orders ===\n');

  const beforeCount = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS unconfirmed FROM "sub_orders" WHERE "delivery_date_confirmed" = false`
  );
  console.log('Rows currently unconfirmed:', beforeCount[0].unconfirmed);

  const result = await prisma.$executeRawUnsafe(
    `UPDATE "sub_orders" SET "delivery_date_confirmed" = true WHERE "delivery_date_confirmed" = false`
  );
  console.log('Rows updated:', result);

  const afterCount = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS unconfirmed FROM "sub_orders" WHERE "delivery_date_confirmed" = false`
  );
  console.log('Rows still unconfirmed:', afterCount[0].unconfirmed);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
