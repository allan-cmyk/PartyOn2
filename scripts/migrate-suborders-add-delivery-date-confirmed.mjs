/**
 * Add delivery_date_confirmed column to sub_orders.
 *
 *   delivery_date_confirmed BOOLEAN — false until customer explicitly saves a delivery date/time.
 *   Used by the dashboard hero to show "Pick a delivery date" instead of the
 *   service-side default placeholder (7 days from creation).
 *
 * Idempotent — uses ADD COLUMN IF NOT EXISTS. Safe to re-run.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/migrate-suborders-add-delivery-date-confirmed.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Add delivery_date_confirmed to sub_orders ===\n');

  const statements = [
    `ALTER TABLE "sub_orders" ADD COLUMN IF NOT EXISTS "delivery_date_confirmed" BOOLEAN NOT NULL DEFAULT FALSE`,
  ];

  for (const sql of statements) {
    console.log(`>> ${sql}`);
    await prisma.$executeRawUnsafe(sql);
  }

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'sub_orders'
      AND column_name = 'delivery_date_confirmed'
  `);
  console.log('\nNew column:');
  console.table(cols);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
