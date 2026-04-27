import { Prisma, type PrismaClient } from '@prisma/client';

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Look up the current COGS for a variant. Returns null if not set.
 */
export async function getVariantUnitCost(
  tx: Tx,
  variantId: string
): Promise<Prisma.Decimal | null> {
  const variant = await tx.productVariant.findUnique({
    where: { id: variantId },
    select: { costPerUnit: true },
  });
  return variant?.costPerUnit ?? null;
}

/**
 * Compute unitCost / totalCost snapshot for an order item.
 * Call at order-item creation time and spread into the create input.
 */
export async function snapshotItemCost(
  tx: Tx,
  variantId: string,
  quantity: number
): Promise<{ unitCost: Prisma.Decimal | null; totalCost: Prisma.Decimal | null }> {
  const unitCost = await getVariantUnitCost(tx, variantId);
  if (!unitCost) return { unitCost: null, totalCost: null };
  const totalCost = new Prisma.Decimal(unitCost).mul(quantity);
  return { unitCost, totalCost };
}

/**
 * Sum item-level margins and write Order.marginAmount + Order.marginCoveragePct.
 *
 * Behavior:
 *  - margin = sum(totalPrice - totalCost) across items where totalCost is non-null.
 *  - Items with null cost are EXCLUDED from the margin calculation (treated as unknown,
 *    not zero) — so marginAmount represents only the portion of revenue we have cost
 *    data for.
 *  - marginCoveragePct = (revenue from items with known cost) / (total order revenue) × 100.
 *    A 100% coverage means margin is fully computed; 0% means no cost data; partial
 *    values mean the calculation is partial.
 *
 * Contract for callers: always inspect marginCoveragePct alongside marginAmount.
 * Low coverage (< ~70%) means any margin-derived metric on this order is unreliable.
 */
export async function finalizeOrderMargin(tx: Tx, orderId: string): Promise<void> {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { totalPrice: true, totalCost: true },
  });

  if (items.length === 0) return;

  const itemsWithCost = items.filter((i) => i.totalCost !== null);
  const totalRevenue = items.reduce(
    (acc, i) => acc.add(new Prisma.Decimal(i.totalPrice)),
    new Prisma.Decimal(0)
  );
  const knownRevenue = itemsWithCost.reduce(
    (acc, i) => acc.add(new Prisma.Decimal(i.totalPrice)),
    new Prisma.Decimal(0)
  );
  const coveragePct = totalRevenue.gt(0)
    ? Number(knownRevenue.div(totalRevenue).mul(100).toFixed(2))
    : 0;

  if (itemsWithCost.length === 0) {
    // No cost data at all — record coverage = 0 but leave marginAmount null.
    await tx.order.update({
      where: { id: orderId },
      data: { marginCoveragePct: new Prisma.Decimal(coveragePct) },
    });
    return;
  }

  const margin = itemsWithCost.reduce(
    (acc, i) =>
      acc.add(new Prisma.Decimal(i.totalPrice)).sub(new Prisma.Decimal(i.totalCost!)),
    new Prisma.Decimal(0)
  );

  await tx.order.update({
    where: { id: orderId },
    data: {
      marginAmount: margin,
      marginCoveragePct: new Prisma.Decimal(coveragePct),
    },
  });
}
