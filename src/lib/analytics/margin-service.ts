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
 * Sum item-level margins and write Order.marginAmount.
 * margin = sum(totalPrice - totalCost) across items. Items with null cost
 * are skipped (treated as unknown, not zero) — margin will be partial when
 * any item lacks cost data. Null marginAmount = no cost data at all.
 */
export async function finalizeOrderMargin(tx: Tx, orderId: string): Promise<void> {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { totalPrice: true, totalCost: true },
  });

  const itemsWithCost = items.filter((i) => i.totalCost !== null);
  if (itemsWithCost.length === 0) return;

  const margin = itemsWithCost.reduce(
    (acc, i) =>
      acc.add(new Prisma.Decimal(i.totalPrice)).sub(new Prisma.Decimal(i.totalCost!)),
    new Prisma.Decimal(0)
  );

  await tx.order.update({
    where: { id: orderId },
    data: { marginAmount: margin },
  });
}
