/**
 * One-shot DDL applier for the OrderItemPickState table.
 *
 * Backs the cross-device persistent pick/pack checkboxes on /ops/orders.
 * Run BEFORE deploying so the new Prisma client has its table.
 *
 * Usage:
 *   DATABASE_URL=<prod> npx tsx scripts/apply-pick-state-schema.ts
 *
 * Idempotent — safe to run multiple times.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STATEMENTS: Array<[string, string]> = [
  [
    'order_item_pick_states table',
    `CREATE TABLE IF NOT EXISTS order_item_pick_states (
      order_id TEXT NOT NULL,
      item_key TEXT NOT NULL,
      in_stock BOOLEAN NOT NULL DEFAULT FALSE,
      packed BOOLEAN NOT NULL DEFAULT FALSE,
      short_by INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (order_id, item_key),
      CONSTRAINT order_item_pick_states_order_fk
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )`,
  ],
  [
    'order_item_pick_states order_idx',
    'CREATE INDEX IF NOT EXISTS order_item_pick_states_order_idx ON order_item_pick_states(order_id)',
  ],
];

async function main() {
  console.log('[apply-pick-state-schema] applying additive DDL…');
  for (const [label, sql] of STATEMENTS) {
    process.stdout.write(`  • ${label.padEnd(40)} `);
    await prisma.$executeRawUnsafe(sql);
    console.log('OK');
  }
  console.log('[apply-pick-state-schema] done. Safe to deploy now.');
}

main()
  .catch((err) => {
    console.error('[apply-pick-state-schema] FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
