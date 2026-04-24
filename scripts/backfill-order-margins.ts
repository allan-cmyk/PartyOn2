/**
 * One-shot backfill: snapshot unitCost/totalCost onto existing OrderItems
 * (using ProductVariant.costPerUnit as-of-now) and compute Order.marginAmount.
 *
 * Usage: npx tsx scripts/backfill-order-margins.ts [--dry-run]
 *
 * NOTE: This uses CURRENT variant cost for historical orders. COGS may have
 * changed since the order was placed; backfilled margin is an approximation.
 * New orders (created after this ships) snapshot cost at order time and are accurate.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { finalizeOrderMargin } from '../src/lib/analytics/margin-service';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`[backfill-margins] starting${DRY_RUN ? ' (DRY RUN)' : ''}`);

  const items = await prisma.orderItem.findMany({
    where: { unitCost: null },
    include: { variant: { select: { costPerUnit: true } } },
  });
  console.log(`[backfill-margins] ${items.length} order items missing unitCost`);

  let updated = 0;
  for (const item of items) {
    const unitCost = item.variant?.costPerUnit ?? null;
    if (!unitCost) continue;
    const totalCost = new Prisma.Decimal(unitCost).mul(item.quantity);
    if (!DRY_RUN) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { unitCost, totalCost },
      });
    }
    updated++;
  }
  console.log(`[backfill-margins] updated ${updated} items`);

  const ordersToFinalize = await prisma.order.findMany({
    where: { marginAmount: null },
    select: { id: true },
  });
  console.log(`[backfill-margins] finalizing margin on ${ordersToFinalize.length} orders`);

  if (!DRY_RUN) {
    for (const o of ordersToFinalize) {
      await finalizeOrderMargin(prisma, o.id);
    }
  }

  console.log('[backfill-margins] done');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
