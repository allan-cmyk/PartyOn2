/**
 * Internal database rollups for the nightly snapshot + Marketing Director.
 * Pulls what only we have: orders, margins, affiliate attribution, product mix.
 */

import { prisma } from '@/lib/database/client';

export interface ChannelRollup {
  channel: string; // direct | affiliate | group | utm source
  orders: number;
  revenue: number;
  margin: number | null;
  averageOrderValue: number;
  averageMarginPct: number | null;
}

export interface LandingPageRollup {
  landingPage: string;
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

export interface ProductMarginRow {
  productId: string;
  title: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Revenue/margin split by internal channel bucket.
 * Buckets: affiliate (has affiliateId), group (groupOrderV2Id), utm_<source>, direct.
 */
export async function getChannelRollup(windowDays = 30): Promise<ChannelRollup[]> {
  const since = daysAgo(windowDays);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    select: {
      total: true,
      marginAmount: true,
      affiliateId: true,
      groupOrderV2Id: true,
      utmSource: true,
    },
  });

  const buckets = new Map<string, { orders: number; revenue: number; margin: number; marginKnown: number }>();
  for (const o of orders) {
    let channel = 'direct';
    if (o.affiliateId) channel = 'affiliate';
    else if (o.groupOrderV2Id) channel = 'group';
    else if (o.utmSource) channel = `utm_${o.utmSource.toLowerCase()}`;

    const b = buckets.get(channel) ?? { orders: 0, revenue: 0, margin: 0, marginKnown: 0 };
    b.orders += 1;
    b.revenue += Number(o.total);
    if (o.marginAmount != null) {
      b.margin += Number(o.marginAmount);
      b.marginKnown += 1;
    }
    buckets.set(channel, b);
  }

  return Array.from(buckets.entries())
    .map(([channel, b]) => ({
      channel,
      orders: b.orders,
      revenue: Number(b.revenue.toFixed(2)),
      margin: b.marginKnown > 0 ? Number(b.margin.toFixed(2)) : null,
      averageOrderValue: b.orders > 0 ? Number((b.revenue / b.orders).toFixed(2)) : 0,
      averageMarginPct:
        b.marginKnown > 0 && b.revenue > 0 ? Number(((b.margin / b.revenue) * 100).toFixed(1)) : null,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getLandingPageRollup(windowDays = 30): Promise<LandingPageRollup[]> {
  const since = daysAgo(windowDays);
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: since },
      landingPage: { not: null },
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    select: { landingPage: true, total: true },
  });
  const buckets = new Map<string, { orders: number; revenue: number }>();
  for (const o of orders) {
    const key = (o.landingPage ?? '/').split('?')[0];
    const b = buckets.get(key) ?? { orders: 0, revenue: 0 };
    b.orders += 1;
    b.revenue += Number(o.total);
    buckets.set(key, b);
  }
  return Array.from(buckets.entries())
    .map(([landingPage, b]) => ({
      landingPage,
      orders: b.orders,
      revenue: Number(b.revenue.toFixed(2)),
      averageOrderValue: Number((b.revenue / b.orders).toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getProductMargins(windowDays = 30, limit = 25): Promise<ProductMarginRow[]> {
  const since = daysAgo(windowDays);
  const items = await prisma.orderItem.findMany({
    where: {
      createdAt: { gte: since },
      order: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    },
    select: {
      productId: true,
      quantity: true,
      totalPrice: true,
      totalCost: true,
      product: { select: { title: true } },
    },
  });

  const agg = new Map<string, ProductMarginRow>();
  for (const i of items) {
    const row = agg.get(i.productId) ?? {
      productId: i.productId,
      title: i.product?.title ?? '(unknown)',
      unitsSold: 0,
      revenue: 0,
      cost: 0,
      margin: 0,
      marginPct: 0,
    };
    row.unitsSold += i.quantity;
    row.revenue += Number(i.totalPrice);
    if (i.totalCost != null) row.cost += Number(i.totalCost);
    agg.set(i.productId, row);
  }

  return Array.from(agg.values())
    .map((r) => {
      const margin = r.revenue - r.cost;
      return {
        ...r,
        revenue: Number(r.revenue.toFixed(2)),
        cost: Number(r.cost.toFixed(2)),
        margin: Number(margin.toFixed(2)),
        marginPct: r.revenue > 0 ? Number(((margin / r.revenue) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
