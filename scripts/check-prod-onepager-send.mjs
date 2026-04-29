/**
 * Show all partner_inquiries from the last hour with one-pager-relevant fields,
 * to diagnose whether prod form submits are firing the outbound email.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/check-prod-onepager-send.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h
  const rows = await prisma.partnerInquiry.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      contactName: true,
      businessName: true,
      businessType: true,
      signupQrId: true,
      emailSentAt: true,
      createdAt: true,
    },
  });
  console.log(`Inquiries in last 2h (${rows.length} rows):`);
  console.table(rows);

  const oneagerSourceRows = rows.filter((r) => r.businessType === 'Vacation Rental');
  console.log(`\nVacation Rental inquiries (${oneagerSourceRows.length}):`);
  oneagerSourceRows.forEach((r) => {
    const status = r.emailSentAt ? `✓ sent ${r.emailSentAt.toISOString()}` : '✗ NOT SENT';
    console.log(`  ${r.createdAt.toISOString()}  ${r.email.padEnd(35)} ${status}`);
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
