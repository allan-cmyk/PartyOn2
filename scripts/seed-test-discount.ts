/**
 * Seed a 100% test discount for webhook testing
 * Run with: npx ts-node scripts/seed-test-discount.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const code = 'TEST100';

  // Check if already exists
  const existing = await prisma.discount.findUnique({
    where: { code },
  });

  if (existing) {
    console.log(`Discount code ${code} already exists`);
    return;
  }

  // Create 100% discount
  const discount = await prisma.discount.create({
    data: {
      code,
      name: 'Test 100% Off',
      description: 'Test discount for webhook testing - 100% off entire order',
      type: 'PERCENTAGE',
      value: 100,
      appliesToAll: true,
      applicableProducts: [],
      applicableCategories: [],
      minOrderAmount: null,
      minQuantity: null,
      maxUsageCount: null, // Unlimited uses
      usagePerCustomer: null, // Unlimited per customer
      startsAt: new Date(),
      expiresAt: null, // No expiry
      isActive: true,
    },
  });

  console.log('Created test discount:', {
    id: discount.id,
    code: discount.code,
    name: discount.name,
    type: discount.type,
    value: Number(discount.value),
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
