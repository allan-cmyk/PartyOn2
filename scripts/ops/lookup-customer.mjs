#!/usr/bin/env node
/**
 * Look up a customer by email, phone, or name
 * Usage: node scripts/ops/lookup-customer.mjs "jane@email.com"
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const query = process.argv[2];

if (!query) {
  console.error('Usage: node scripts/ops/lookup-customer.mjs <email|phone|name>');
  process.exit(1);
}

const customers = await prisma.customer.findMany({
  where: {
    OR: [
      { email: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query } },
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
    ],
  },
  take: 10,
});

const results = await Promise.all(customers.map(async (c) => {
  const draftOrderCount = await prisma.draftOrder.count({
    where: { customerEmail: c.email },
  });
  return {
    id: c.id,
    email: c.email,
    phone: c.phone,
    name: [c.firstName, c.lastName].filter(Boolean).join(' '),
    draftOrders: draftOrderCount,
  };
}));

console.log(JSON.stringify(results, null, 2));
await prisma.$disconnect();
