/**
 * Backfill — manually fire the partner one-pager email for inquiries that
 * were saved but never got the email (because PARTNER_CALENDLY_URL wasn't
 * set in Vercel and the old code failed closed).
 *
 * For each row this:
 *   1. Sends sendPartnerOnePagerEmail
 *   2. Stamps emailSentAt = now on the row, so future re-submits respect
 *      the 24h dedupe window
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/backfill-partner-onepager-sends.ts <inquiryId> [<inquiryId>...]
 *
 * For the recent missed leads (2026-04-29):
 *   npx tsx scripts/backfill-partner-onepager-sends.ts \
 *     4dd8ed01-0f37-412e-9194-eb1d2c2ca342 \
 *     fbb7f13f-d102-4736-902f-0b4e8601bcba
 */

import { PrismaClient } from '@prisma/client';
import { sendPartnerOnePagerEmail } from '../src/lib/email/email-service';

const prisma = new PrismaClient();

async function main() {
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error('Usage: npx tsx scripts/backfill-partner-onepager-sends.ts <inquiryId>...');
    process.exit(1);
  }

  for (const id of ids) {
    const row = await prisma.partnerInquiry.findUnique({ where: { id } });
    if (!row) {
      console.error(`✗ ${id} — row not found`);
      continue;
    }
    if (row.emailSentAt) {
      console.log(`- ${id} ${row.email} — already has emailSentAt=${row.emailSentAt.toISOString()}, skipping`);
      continue;
    }

    console.log(`→ ${id} ${row.email} (${row.businessName || row.contactName})`);
    const resendId = await sendPartnerOnePagerEmail({
      to: row.email,
      companyName: row.businessName || undefined,
      source: 'vacation-rental-onepager-backfill',
      signupQrId: row.signupQrId || undefined,
    });

    if (resendId) {
      await prisma.partnerInquiry.update({
        where: { id },
        data: { emailSentAt: new Date() },
      });
      console.log(`  ✓ sent (resendId: ${resendId})`);
    } else {
      console.error(`  ✗ send failed — leaving emailSentAt null so it can be retried`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
