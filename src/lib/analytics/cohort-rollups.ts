/**
 * Cohort rollups — repeat rate and LTV bucketed by customer segment.
 *
 * Definitions:
 * - Repeat purchase rate: of orders placed in the window, what fraction are from a customer
 *   who had a prior order (any time before the order's createdAt). Bucketed by the order's segment.
 * - LTV: for each customer, sum lifetime revenue across all orders. Bucketed by the segment
 *   of their FIRST order — answers "what's a customer worth long-term if they enter via X?"
 */

import { prisma } from '@/lib/database/client';

export interface RepeatRateRow {
  segment: string;
  orders: number;
  repeatOrders: number;
  repeatRatePct: number;
}

export interface LtvRow {
  segment: string;          // segment of the customer's FIRST order
  customers: number;
  totalRevenue: number;
  averageLtv: number;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Repeat rate per segment for orders in the last `windowDays`.
 * "Repeat" = the customer has at least one earlier order.
 */
export async function getRepeatRateBySegment(windowDays = 30): Promise<RepeatRateRow[]> {
  const since = daysAgo(windowDays);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    select: { customerId: true, segment: true, createdAt: true },
  });

  if (orders.length === 0) return [];

  // For each (customer, order), check if they have an earlier order. Pull each customer's
  // earliest createdAt once and compare.
  const customerIds = Array.from(new Set(orders.map((o) => o.customerId)));
  const earliestByCustomer = await prisma.order.groupBy({
    by: ['customerId'],
    where: { customerId: { in: customerIds }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    _min: { createdAt: true },
  });
  const firstOrderAt = new Map(earliestByCustomer.map((r) => [r.customerId, r._min.createdAt]));

  const buckets = new Map<string, { orders: number; repeatOrders: number }>();
  for (const o of orders) {
    const seg = o.segment ?? 'unknown';
    const b = buckets.get(seg) ?? { orders: 0, repeatOrders: 0 };
    b.orders += 1;
    const first = firstOrderAt.get(o.customerId);
    if (first && first.getTime() < o.createdAt.getTime()) {
      b.repeatOrders += 1;
    }
    buckets.set(seg, b);
  }

  return Array.from(buckets.entries())
    .map(([segment, b]) => ({
      segment,
      orders: b.orders,
      repeatOrders: b.repeatOrders,
      repeatRatePct: b.orders > 0 ? Number(((b.repeatOrders / b.orders) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.orders - a.orders);
}

/**
 * Customer lifetime revenue, bucketed by the segment of their FIRST order.
 * Looks at customers whose first order was within `monthsBack` months — capped by the data we have.
 */
export async function getLtvBySegment(monthsBack = 12): Promise<LtvRow[]> {
  const since = daysAgo(monthsBack * 30);

  // First-order date per customer (across all time, not just window).
  const firstOrders = await prisma.order.groupBy({
    by: ['customerId'],
    where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    _min: { createdAt: true },
  });

  // Customers whose first order falls inside the window.
  const customerIds = firstOrders
    .filter((r) => r._min.createdAt && r._min.createdAt >= since)
    .map((r) => r.customerId);

  if (customerIds.length === 0) return [];

  const allOrders = await prisma.order.findMany({
    where: { customerId: { in: customerIds }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    select: { customerId: true, segment: true, total: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const firstSegmentByCustomer = new Map<string, string>();
  const totalByCustomer = new Map<string, number>();
  for (const o of allOrders) {
    if (!firstSegmentByCustomer.has(o.customerId)) {
      firstSegmentByCustomer.set(o.customerId, o.segment ?? 'unknown');
    }
    totalByCustomer.set(
      o.customerId,
      (totalByCustomer.get(o.customerId) ?? 0) + Number(o.total)
    );
  }

  const buckets = new Map<string, { customers: number; totalRevenue: number }>();
  for (const customerId of customerIds) {
    const seg = firstSegmentByCustomer.get(customerId) ?? 'unknown';
    const rev = totalByCustomer.get(customerId) ?? 0;
    const b = buckets.get(seg) ?? { customers: 0, totalRevenue: 0 };
    b.customers += 1;
    b.totalRevenue += rev;
    buckets.set(seg, b);
  }

  return Array.from(buckets.entries())
    .map(([segment, b]) => ({
      segment,
      customers: b.customers,
      totalRevenue: Number(b.totalRevenue.toFixed(2)),
      averageLtv: b.customers > 0 ? Number((b.totalRevenue / b.customers).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.averageLtv - a.averageLtv);
}
