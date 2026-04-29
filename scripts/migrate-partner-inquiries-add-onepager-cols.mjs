/**
 * Add columns to partner_inquiries to track partner one-pager email sends.
 *
 *   email_sent_at  TIMESTAMPTZ — when the one-pager email last fired (24h dedupe key)
 *   meeting_booked BOOLEAN     — flips true when the partner books via Calendly (set later, manually or via webhook)
 *   signup_qr_id   TEXT        — optional QR code id, lets us attribute back to a specific boat / placement
 *
 * Idempotent — uses ADD COLUMN IF NOT EXISTS. Safe to re-run.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/migrate-partner-inquiries-add-onepager-cols.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Add partner one-pager columns to partner_inquiries ===\n');

  const statements = [
    `ALTER TABLE "partner_inquiries" ADD COLUMN IF NOT EXISTS "email_sent_at" TIMESTAMPTZ`,
    `ALTER TABLE "partner_inquiries" ADD COLUMN IF NOT EXISTS "meeting_booked" BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE "partner_inquiries" ADD COLUMN IF NOT EXISTS "signup_qr_id" TEXT`,
  ];

  for (const sql of statements) {
    console.log(`>> ${sql}`);
    await prisma.$executeRawUnsafe(sql);
  }

  // Verify
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'partner_inquiries'
      AND column_name IN ('email_sent_at', 'meeting_booked', 'signup_qr_id')
    ORDER BY column_name
  `);
  console.log('\nNew columns:');
  console.table(cols);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
