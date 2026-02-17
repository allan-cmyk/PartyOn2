/**
 * One-off script: Create PARTYONPREMIER discount code
 * $49.99 off + free shipping on orders $300+
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if already exists
  const existing = await prisma.discount.findUnique({
    where: { code: 'PARTYONPREMIER' },
  });

  if (existing) {
    console.log('Discount PARTYONPREMIER already exists:', existing.id);
    console.log('  Active:', existing.isActive);
    console.log('  Value:', Number(existing.value));
    console.log('  Free Shipping:', existing.freeShipping);
    return;
  }

  const discount = await prisma.discount.create({
    data: {
      code: 'PARTYONPREMIER',
      name: 'Premier Party Cruises - Free Welcome Package + Delivery',
      description: 'Free welcome package and free delivery on orders $300+',
      type: 'FIXED_AMOUNT',
      value: 49.99,
      freeShipping: true,
      minOrderAmount: 300,
      isActive: true,
      combinable: false,
      appliesToAll: true,
    },
  });

  console.log('Created discount:', discount.id);
  console.log('  Code:', discount.code);
  console.log('  Type:', discount.type);
  console.log('  Value:', Number(discount.value));
  console.log('  Free Shipping:', discount.freeShipping);
  console.log('  Min Order:', Number(discount.minOrderAmount));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
