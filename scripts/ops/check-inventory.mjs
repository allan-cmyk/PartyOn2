#!/usr/bin/env node
/**
 * Check inventory for a product (three-tier: In Stock / Committed / Available)
 * Usage: node scripts/ops/check-inventory.mjs <product-id>
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const productId = process.argv[2];

if (!productId) {
  console.error('Usage: node scripts/ops/check-inventory.mjs <product-id>');
  process.exit(1);
}

const product = await prisma.product.findUnique({
  where: { id: productId },
  select: { title: true },
});

const variants = await prisma.productVariant.findMany({
  where: { productId },
  select: {
    id: true,
    title: true,
    sku: true,
    inventoryQuantity: true,
    committedQuantity: true,
    trackInventory: true,
  },
  orderBy: { title: 'asc' },
});

console.log(JSON.stringify({
  productTitle: product?.title || 'Unknown',
  inventory: variants.map(v => ({
    variantId: v.id,
    variant: v.title || 'Default',
    sku: v.sku || null,
    inStock: v.inventoryQuantity,
    committed: v.committedQuantity,
    available: v.inventoryQuantity - v.committedQuantity,
    trackInventory: v.trackInventory,
  })),
}, null, 2));

await prisma.$disconnect();
