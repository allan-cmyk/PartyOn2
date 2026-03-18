#!/usr/bin/env node
/**
 * List upcoming orders from all three systems:
 *   1. Confirmed Orders (paid via Stripe, what shows in /ops/orders)
 *   2. Pending Invoices (DraftOrder, awaiting payment)
 *   3. Draft Dashboard orders (SubOrder tabs with items but not yet paid)
 *
 * Usage: node scripts/ops/upcoming-orders.mjs [days-ahead]
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const daysAhead = parseInt(process.argv[2]) || 7;

const now = new Date();
const future = new Date(now);
future.setDate(future.getDate() + daysAhead);

// =============================================
// 1. CONFIRMED ORDERS (Order table -- paid, need delivery)
// =============================================
const confirmedOrders = await prisma.order.findMany({
  where: {
    deliveryDate: { gte: now, lte: future },
    status: { in: ['CONFIRMED', 'PENDING'] },
    financialStatus: 'PAID',
    fulfillmentStatus: 'UNFULFILLED',
  },
  include: { items: true },
  orderBy: { deliveryDate: 'asc' },
});

const confirmedRows = confirmedOrders.map(o => {
  const addr = o.deliveryAddress || {};
  const addressParts = [addr.address1, addr.city, addr.zip].filter(Boolean);
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    source: 'confirmed',
    status: 'PAID',
    customer: o.customerName,
    email: o.customerEmail,
    deliveryDate: o.deliveryDate.toISOString().split('T')[0],
    deliveryTime: o.deliveryTime,
    address: addressParts.join(', '),
    subtotal: Number(o.subtotal),
    tax: Number(o.taxAmount),
    tip: Number(o.tipAmount),
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
    items: o.items.reduce((sum, i) => sum + i.quantity, 0),
    itemDetails: o.items.map(i => `${i.quantity}x ${i.title}`),
  };
});

// =============================================
// 2. PENDING INVOICES (DraftOrder -- sent but not yet paid)
// =============================================
const invoiceOrders = await prisma.draftOrder.findMany({
  where: {
    deliveryDate: { gte: now, lte: future },
    status: { notIn: ['CANCELLED', 'EXPIRED', 'PAID'] },
  },
  orderBy: { deliveryDate: 'asc' },
});

const invoiceRows = invoiceOrders.map(o => {
  const items = Array.isArray(o.items) ? o.items : [];
  return {
    id: o.id,
    orderNumber: null,
    source: 'invoice',
    status: o.status,
    customer: o.customerName,
    email: o.customerEmail,
    deliveryDate: o.deliveryDate.toISOString().split('T')[0],
    deliveryTime: o.deliveryTime,
    address: `${o.deliveryAddress}, ${o.deliveryCity} ${o.deliveryZip}`,
    subtotal: Number(o.subtotal),
    tax: Number(o.taxAmount),
    tip: 0,
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
    items: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
    itemDetails: items.map(i => `${i.quantity}x ${i.title}`),
  };
});

// =============================================
// 3. DRAFT DASHBOARD ORDERS (SubOrder tabs -- items added but not paid)
//    Exclude any SubOrder that already produced a confirmed Order
//    (to avoid double-counting)
// =============================================

// Collect subOrderIds that have confirmed Order records in our date range
const confirmedSubOrderIds = new Set();
for (const o of confirmedOrders) {
  // Find the ParticipantPayment -> SubOrder link
  if (o.stripeCheckoutSessionId) {
    const payment = await prisma.participantPayment.findFirst({
      where: { stripeCheckoutSessionId: o.stripeCheckoutSessionId },
      select: { subOrderId: true },
    });
    if (payment) confirmedSubOrderIds.add(payment.subOrderId);
  }
}

const subOrders = await prisma.subOrder.findMany({
  where: {
    deliveryDate: { gte: now, lte: future },
    status: { not: 'CANCELLED' },
    groupOrder: { status: { not: 'CANCELLED' } },
    draftItems: { some: { quantity: { gt: 0 } } },
  },
  include: {
    groupOrder: { include: { tabs: { select: { id: true } } } },
    draftItems: { where: { quantity: { gt: 0 } } },
  },
  orderBy: { deliveryDate: 'asc' },
});

const draftRows = subOrders
  .filter(tab => !confirmedSubOrderIds.has(tab.id))
  .map(tab => {
    const go = tab.groupOrder;
    const multiTab = go.tabs.length > 1;
    const customer = multiTab ? `${go.hostName} - ${tab.name}` : go.hostName;

    const addr = tab.deliveryAddress || {};
    const addressParts = [addr.address1, addr.city, addr.zip].filter(Boolean);

    const itemMap = new Map();
    for (const item of tab.draftItems) {
      itemMap.set(item.title, (itemMap.get(item.title) || 0) + item.quantity);
    }

    const itemDetails = [];
    for (const [title, qty] of itemMap) {
      itemDetails.push(`${qty}x ${title}`);
    }

    const totalItems = [...itemMap.values()].reduce((sum, q) => sum + q, 0);

    let subtotal = 0;
    for (const item of tab.draftItems) {
      subtotal += Number(item.price) * item.quantity;
    }

    const deliveryFee = tab.deliveryFeeWaived ? 0 : Number(tab.deliveryFee);

    return {
      id: tab.id,
      orderNumber: null,
      source: 'dashboard',
      status: 'DRAFT',
      customer,
      email: go.hostEmail || '',
      deliveryDate: tab.deliveryDate.toISOString().split('T')[0],
      deliveryTime: tab.deliveryTime,
      address: addressParts.join(', '),
      subtotal: Math.round(subtotal * 100) / 100,
      tax: 0,
      tip: 0,
      deliveryFee,
      total: Math.round((subtotal + deliveryFee) * 100) / 100,
      items: totalItems,
      itemDetails,
      shareCode: go.shareCode,
    };
  });

// =============================================
// Merge & output
// =============================================
const all = [...confirmedRows, ...invoiceRows, ...draftRows].sort(
  (a, b) => a.deliveryDate.localeCompare(b.deliveryDate) || a.deliveryTime.localeCompare(b.deliveryTime)
);

console.log(JSON.stringify(all, null, 2));
console.error(`\n${all.length} total orders in next ${daysAhead} days:`);
console.error(`  ${confirmedRows.length} confirmed (paid, need delivery)`);
console.error(`  ${invoiceRows.length} pending invoices`);
console.error(`  ${draftRows.length} draft dashboard orders`);
await prisma.$disconnect();
