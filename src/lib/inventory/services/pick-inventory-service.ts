/**
 * Pick Inventory Service
 *
 * Couples ops/orders pack actions to physical inventory. When an operator
 * toggles `packed` on a pick row (or adjusts `shortBy` while already packed),
 * we move units off the shelf — decrementing both `inventoryQuantity` and
 * `committedQuantity` on the relevant ProductVariant and writing an
 * `InventoryMovement` row for the audit trail.
 *
 * Pre-Phase-1 for the Ops Director (see
 * docs/OPERATIONS-DIRECTOR-AGENT-BUILDOUT.md §7).
 *
 * NOTE on coordination with `fulfillInventoryForOrder`: once pack-time
 * decrements ship, marking an order DELIVERED via the existing fulfillment
 * path would double-decrement units that were already packed. Reconciling
 * the fulfillment path is Phase 1A and intentionally NOT in this PR. The
 * Ops Director's drift signal #2 surfaces pre-deploy packed orders for
 * one-click reconciliation.
 */

import { prisma } from '@/lib/database/client';

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface PickStateLike {
  packed: boolean;
  shortBy: number;
}

export type PickInventoryReason = 'pack' | 'unpack' | 'pack-short-adjust';

/**
 * Units physically off the shelf for a given pick state.
 * packed=false → 0. packed=true → max(0, orderQty - shortBy).
 */
export function unitsOffShelf(state: PickStateLike, orderQty: number): number {
  if (!state.packed) return 0;
  return Math.max(0, orderQty - state.shortBy);
}

/**
 * Inventory delta for a pick-state transition.
 * Positive = units leaving the shelf (decrement). Negative = units returning.
 * Null = no movement required (idempotent re-saves, or only `inStock` changed).
 */
export function computePickInventoryChange(
  prev: PickStateLike,
  next: PickStateLike,
  orderQty: number,
): { delta: number; reason: PickInventoryReason } | null {
  const delta = unitsOffShelf(next, orderQty) - unitsOffShelf(prev, orderQty);
  if (delta === 0) return null;

  let reason: PickInventoryReason;
  if (!prev.packed && next.packed) reason = 'pack';
  else if (prev.packed && !next.packed) reason = 'unpack';
  else reason = 'pack-short-adjust';

  return { delta, reason };
}

export interface ResolvedPickTarget {
  variantId: string;
  trackInventory: boolean;
  orderQty: number;
}

/**
 * Map an `(orderId, itemKey)` pair from the picker UI to the variant whose
 * stock should move. itemKey is either an OrderItem title (line item) or
 * `${itemTitle}::${bcTitle}` (bundle component).
 *
 * Returns null when the key doesn't map cleanly to a single tracked variant:
 *   - Bundle parent rows (the components carry their own pick rows).
 *   - Custom/placeholder items whose variant doesn't exist.
 *   - Variants flagged `trackInventory: false`.
 *
 * Edge case: multiple OrderItems sharing a title. The cart deduplicates by
 * (productId, variantId) so this is exceedingly rare; we take the first
 * match and log a warning. Ops Director drift signal #2 will catch any drift.
 */
export async function resolvePickInventoryTarget(
  tx: TransactionClient,
  orderId: string,
  itemKey: string,
): Promise<ResolvedPickTarget | null> {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: {
      id: true,
      title: true,
      variantId: true,
      quantity: true,
      product: {
        select: {
          title: true,
          isBundle: true,
          bundleComponents: {
            select: {
              componentProductId: true,
              componentVariantId: true,
              quantity: true,
              componentProduct: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  const sepIdx = itemKey.indexOf('::');
  if (sepIdx >= 0) {
    const parentTitle = itemKey.slice(0, sepIdx);
    const bcTitle = itemKey.slice(sepIdx + 2);

    const parents = items.filter(
      (it) => it.title === parentTitle || it.product.title === parentTitle,
    );
    if (parents.length === 0) return null;
    if (parents.length > 1) {
      console.warn(
        `[pickInventory] Multiple OrderItems match bundle parent "${parentTitle}" on order ${orderId}; using first.`,
      );
    }
    const parent = parents[0];
    if (!parent.product.isBundle) return null;

    const bc = parent.product.bundleComponents.find(
      (c) => c.componentProduct.title === bcTitle,
    );
    if (!bc) return null;

    let variantId = bc.componentVariantId;
    if (!variantId) {
      const fallback = await tx.productVariant.findFirst({
        where: { productId: bc.componentProductId },
        select: { id: true },
      });
      variantId = fallback?.id ?? null;
    }
    if (!variantId) return null;

    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { trackInventory: true },
    });
    if (!variant) return null;

    return {
      variantId,
      trackInventory: variant.trackInventory,
      orderQty: parent.quantity * bc.quantity,
    };
  }

  const matches = items.filter(
    (it) => it.title === itemKey || it.product.title === itemKey,
  );
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    console.warn(
      `[pickInventory] Multiple OrderItems match "${itemKey}" on order ${orderId}; using first.`,
    );
  }
  const match = matches[0];
  if (match.product.isBundle) return null;

  const variant = await tx.productVariant.findUnique({
    where: { id: match.variantId },
    select: { trackInventory: true },
  });
  if (!variant) return null;

  return {
    variantId: match.variantId,
    trackInventory: variant.trackInventory,
    orderQty: match.quantity,
  };
}

/**
 * Apply a pick-state transition to inventory inside an existing transaction.
 * Caller must already have upserted (or planned to upsert) the
 * OrderItemPickState row. Both ops succeed or fail together.
 *
 * Skips silently when the itemKey doesn't resolve to a tracked variant.
 */
export async function applyPickInventoryTransition(
  tx: TransactionClient,
  args: {
    orderId: string;
    itemKey: string;
    prev: PickStateLike;
    next: PickStateLike;
  },
): Promise<void> {
  const { orderId, itemKey, prev, next } = args;

  if (prev.packed === next.packed && prev.shortBy === next.shortBy) {
    return;
  }

  const target = await resolvePickInventoryTarget(tx, orderId, itemKey);
  if (!target || !target.trackInventory) return;

  const change = computePickInventoryChange(prev, next, target.orderQty);
  if (!change) return;

  const variant = await tx.productVariant.findUnique({
    where: { id: target.variantId },
    select: { id: true, inventoryQuantity: true, committedQuantity: true },
  });
  if (!variant) return;

  const newInventory = Math.max(0, variant.inventoryQuantity - change.delta);
  const newCommitted = Math.max(0, variant.committedQuantity - change.delta);

  await tx.productVariant.update({
    where: { id: variant.id },
    data: { inventoryQuantity: newInventory, committedQuantity: newCommitted },
  });

  await tx.inventoryMovement.create({
    data: {
      variantId: variant.id,
      type: 'ADJUSTMENT',
      quantity: -change.delta,
      previousQuantity: variant.inventoryQuantity,
      newQuantity: newInventory,
      reason: change.reason,
      referenceId: orderId,
      referenceType: 'Order',
    },
  });
}
