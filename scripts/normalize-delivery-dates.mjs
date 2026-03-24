/**
 * Normalize delivery dates to noon UTC.
 *
 * Dates stored as midnight UTC (00:00) display as the previous day
 * in US timezones (e.g. April 11 00:00 UTC = April 10 in CDT).
 * This script adds 12 hours to all midnight-UTC delivery dates.
 *
 * Tables: orders, draft_orders, carts, sub_orders, group_orders_v2, order_analytics
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/normalize-delivery-dates.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TABLES = [
  { name: 'orders', column: 'delivery_date' },
  { name: 'draft_orders', column: 'delivery_date' },
  { name: 'carts', column: 'delivery_date' },
  { name: 'sub_orders', column: 'delivery_date' },
  { name: 'group_orders_v2', column: 'delivery_date' },
  { name: 'order_analytics', column: 'delivery_date' },
];

async function main() {
  console.log('=== Normalize Delivery Dates to Noon UTC ===\n');

  for (const { name, column } of TABLES) {
    try {
      // Check if table exists by attempting a count
      const countResult = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as cnt FROM "${name}" WHERE "${column}" IS NOT NULL AND EXTRACT(HOUR FROM "${column}") = 0 AND EXTRACT(MINUTE FROM "${column}") = 0`
      );
      const count = Number(countResult[0]?.cnt ?? 0);

      if (count === 0) {
        console.log(`  ${name}: no midnight dates found, skipping`);
        continue;
      }

      const result = await prisma.$executeRawUnsafe(
        `UPDATE "${name}" SET "${column}" = "${column}" + INTERVAL '12 hours' WHERE EXTRACT(HOUR FROM "${column}") = 0 AND EXTRACT(MINUTE FROM "${column}") = 0`
      );
      console.log(`  ${name}: updated ${result} rows`);
    } catch (err) {
      // Table may not exist (e.g. group_orders legacy)
      console.log(`  ${name}: skipped (${err.message?.split('\n')[0]})`);
    }
  }

  // Also handle legacy group_orders table if it exists
  try {
    const countResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as cnt FROM "group_orders" WHERE "delivery_date" IS NOT NULL AND EXTRACT(HOUR FROM "delivery_date") = 0 AND EXTRACT(MINUTE FROM "delivery_date") = 0`
    );
    const count = Number(countResult[0]?.cnt ?? 0);
    if (count > 0) {
      const result = await prisma.$executeRawUnsafe(
        `UPDATE "group_orders" SET "delivery_date" = "delivery_date" + INTERVAL '12 hours' WHERE EXTRACT(HOUR FROM "delivery_date") = 0 AND EXTRACT(MINUTE FROM "delivery_date") = 0`
      );
      console.log(`  group_orders (legacy): updated ${result} rows`);
    } else {
      console.log(`  group_orders (legacy): no midnight dates found, skipping`);
    }
  } catch (err) {
    console.log(`  group_orders (legacy): skipped (${err.message?.split('\n')[0]})`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
