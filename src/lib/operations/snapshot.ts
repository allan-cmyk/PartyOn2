/**
 * Snapshot metric computations for OperationsSnapshot.
 *
 * Each function isolated + DB-only so it can be tested + replaced. The cron
 * route calls these in parallel, then writes a single row.
 *
 * See docs/OPERATIONS-DIRECTOR-AGENT-BUILDOUT.md §12 for metric definitions.
 */

import { prisma } from '@/lib/database/client';

const MS_PER_HOUR = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Proxy from §12. Count-type adjustments where the delta was within ±50 units
 * of zero are "confirmation" counts (ledger was right). Larger deltas measure
 * how wrong it was. Rolling 30 days. Null if no counts yet.
 */
export async function computeInventoryAccuracyPct(now: Date = new Date()): Promise<number | null> {
  const cutoff = new Date(now.getTime() - 30 * DAY_MS);
  const counts = await prisma.inventoryMovement.findMany({
    where: {
      createdAt: { gte: cutoff },
      OR: [
        { type: 'AI_COUNT' },
        { type: 'ADJUSTMENT', reason: { contains: 'count', mode: 'insensitive' } },
      ],
    },
    select: { quantity: true },
  });
  if (counts.length === 0) return null;
  const within = counts.filter((c) => Math.abs(c.quantity) <= 50).length;
  return Math.round((within / counts.length) * 10000) / 100; // 2dp
}

/**
 * variants_with_costPerUnit_set / variants_sold_in_30d * 100.
 * "Sold in 30d" = appears in OrderItem with order.financialStatus = PAID.
 */
export async function computeCostCoveragePct(now: Date = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - 30 * DAY_MS);
  const variantIds = await prisma.orderItem.findMany({
    where: {
      order: { financialStatus: 'PAID', createdAt: { gte: cutoff } },
    },
    distinct: ['variantId'],
    select: { variantId: true },
  });
  if (variantIds.length === 0) return 0;
  const withCost = await prisma.productVariant.count({
    where: {
      id: { in: variantIds.map((v) => v.variantId) },
      costPerUnit: { not: null },
    },
  });
  return Math.round((withCost / variantIds.length) * 10000) / 100;
}

export interface ReceivingLagPercentiles {
  p50: number | null;
  p90: number | null;
}

/**
 * Hours from ReceivingInvoice.createdAt → appliedAt for invoices applied in
 * last 30d. Null when fewer than 2 samples — percentile of 1 is meaningless.
 */
export async function computeReceivingLagPercentiles(
  now: Date = new Date()
): Promise<ReceivingLagPercentiles> {
  const cutoff = new Date(now.getTime() - 30 * DAY_MS);
  const invoices = await prisma.receivingInvoice.findMany({
    where: {
      status: 'APPLIED',
      appliedAt: { gte: cutoff, not: null },
    },
    select: { createdAt: true, appliedAt: true },
  });
  const hours = invoices
    .map((i) => (i.appliedAt!.getTime() - i.createdAt.getTime()) / MS_PER_HOUR)
    .filter((h) => Number.isFinite(h) && h >= 0)
    .sort((a, b) => a - b);
  if (hours.length < 2) return { p50: null, p90: null };
  return {
    p50: pickPercentile(hours, 0.5),
    p90: pickPercentile(hours, 0.9),
  };
}

function pickPercentile(sorted: number[], q: number): number {
  // Nearest-rank — simple, deterministic, plenty for a 30d operational metric.
  const idx = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return Math.round(sorted[idx] * 100) / 100;
}

/**
 * Count of distinct PAID order line items in the next 14 days where the variant
 * would have negative available stock (inventoryQuantity - committedQuantity < 0).
 *
 * Uses raw SQL — Prisma can't express a column-column comparison without N round
 * trips. Counts at the line-item level, mirroring the buildout doc's wording.
 */
export async function computePaidOrders14dShortageCount(
  now: Date = new Date()
): Promise<number> {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + 14);
  end.setUTCHours(23, 59, 59, 999);

  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::bigint AS count
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN product_variants v ON v.id = oi.variant_id
      WHERE o.financial_status = 'PAID'
        AND o.status <> 'CANCELLED'
        AND o.delivery_date >= $1::timestamp
        AND o.delivery_date <= $2::timestamp
        AND v.track_inventory = TRUE
        AND (v.inventory_quantity - v.committed_quantity) < 0`,
    start,
    end
  );
  return Number(rows[0]?.count ?? 0);
}

/**
 * Count of cycle-count InventoryNote rows processed in last 7 days.
 * Used by the dashboard to track operator follow-through on count
 * recommendations.
 */
export async function computeCycleCountsCompletedLast7d(
  now: Date = new Date()
): Promise<number> {
  const cutoff = new Date(now.getTime() - 7 * DAY_MS);
  // Treat any processed InventoryNote OR any count-flavored InventoryMovement
  // as evidence the operator completed a physical count.
  const notes = await prisma.inventoryNote.count({
    where: { status: 'processed', updatedAt: { gte: cutoff } },
  });
  const movements = await prisma.inventoryMovement.count({
    where: {
      createdAt: { gte: cutoff },
      OR: [
        { type: 'AI_COUNT' },
        { type: 'ADJUSTMENT', reason: { contains: 'count', mode: 'insensitive' } },
      ],
    },
  });
  return notes + movements;
}
