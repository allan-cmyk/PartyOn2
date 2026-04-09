// One-shot: backfill Order.groupOrderV2Id from ParticipantPayment.orderId -> SubOrder.groupOrderId
// Run with: node scripts/backfill-group-v2-id.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching ParticipantPayment records with linked orders...');

  const payments = await prisma.participantPayment.findMany({
    where: { orderId: { not: null } },
    select: {
      orderId: true,
      subOrder: { select: { groupOrderId: true } },
    },
  });

  console.log(`Found ${payments.length} payments with orderId set.`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of payments) {
    if (!p.orderId || !p.subOrder?.groupOrderId) {
      skipped++;
      continue;
    }

    try {
      const res = await prisma.order.updateMany({
        where: { id: p.orderId, groupOrderV2Id: null },
        data: { groupOrderV2Id: p.subOrder.groupOrderId },
      });
      updated += res.count;
    } catch (err) {
      errors++;
      console.error(`Failed to update order ${p.orderId}:`, err.message);
    }
  }

  console.log('');
  console.log('Backfill complete:');
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors:  ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
