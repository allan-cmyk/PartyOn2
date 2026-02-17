/**
 * One-off script: Update Welcome to Austin package product-level basePrice in local DB
 * (Variant prices already updated in prior run)
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update product-level basePrice
  const products = await prisma.product.findMany({
    where: {
      title: { startsWith: 'Welcome to Austin' },
      basePrice: 39.99,
    },
  });

  console.log(`Found ${products.length} product(s) to update`);

  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { basePrice: 49.99 },
    });
    console.log(`Updated product price: ${p.title} → $49.99`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
