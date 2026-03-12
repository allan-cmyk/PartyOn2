#!/usr/bin/env node
/**
 * List upcoming draft orders with future delivery dates
 * Usage: node scripts/ops/upcoming-orders.mjs [days-ahead]
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const daysAhead = parseInt(process.argv[2]) || 7;

const now = new Date();
const future = new Date(now);
future.setDate(future.getDate() + daysAhead);

const orders = await prisma.draftOrder.findMany({
  where: {
    deliveryDate: { gte: now, lte: future },
    status: { notIn: ['CANCELLED', 'EXPIRED'] },
  },
  orderBy: { deliveryDate: 'asc' },
  take: 30,
});

const output = orders.map(o => ({
  id: o.id,
  status: o.status,
  customer: o.customerName,
  email: o.customerEmail,
  deliveryDate: o.deliveryDate.toISOString().split('T')[0],
  deliveryTime: o.deliveryTime,
  address: `${o.deliveryAddress}, ${o.deliveryCity} ${o.deliveryZip}`,
  subtotal: Number(o.subtotal),
  total: Number(o.total),
  items: Array.isArray(o.items) ? o.items.length : 0,
}));

console.log(JSON.stringify(output, null, 2));
await prisma.$disconnect();
