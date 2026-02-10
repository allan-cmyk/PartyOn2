/**
 * Seed test discount codes for Group Ordering V2 testing
 *
 * Creates 3 discount codes:
 * - GROUPTEST10 - 10% off (PERCENTAGE)
 * - GROUPTEST5OFF - $5 off (FIXED_AMOUNT)
 * - FREEDELIVERY - Free shipping (FREE_SHIPPING)
 *
 * Usage: node scripts/seed-test-discounts.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testDiscounts = [
  {
    code: 'GROUPTEST10',
    name: '10% Off Group Order',
    description: 'Test discount: 10% off for group order testing',
    type: 'PERCENTAGE',
    value: 10.00,
    appliesToAll: true,
    isActive: true,
  },
  {
    code: 'GROUPTEST5OFF',
    name: '$5 Off Group Order',
    description: 'Test discount: $5 off for group order testing',
    type: 'FIXED_AMOUNT',
    value: 5.00,
    appliesToAll: true,
    isActive: true,
  },
  {
    code: 'FREEDELIVERY',
    name: 'Free Delivery',
    description: 'Test discount: Free shipping for group order testing',
    type: 'FREE_SHIPPING',
    value: 0.00,
    appliesToAll: true,
    isActive: true,
  },
];

async function main() {
  console.log('Checking existing discounts...');
  const existing = await prisma.discount.findMany({
    select: { code: true, type: true, value: true, isActive: true },
  });
  console.log(`Found ${existing.length} existing discount(s):`);
  for (const d of existing) {
    console.log(`  - ${d.code} (${d.type}, value: ${d.value}, active: ${d.isActive})`);
  }

  console.log('\nSeeding test discount codes...');
  for (const discount of testDiscounts) {
    const result = await prisma.discount.upsert({
      where: { code: discount.code },
      update: {
        isActive: true,
        value: discount.value,
        type: discount.type,
      },
      create: discount,
    });
    console.log(`  ✓ ${result.code} (${result.type}) - ID: ${result.id}`);
  }

  console.log('\nDone! Test discount codes are ready.');
  console.log('\nCodes for testing:');
  console.log('  GROUPTEST10   - 10% off items');
  console.log('  GROUPTEST5OFF - $5 off items');
  console.log('  FREEDELIVERY  - Waives delivery fee');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
