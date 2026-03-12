#!/usr/bin/env node
/**
 * Check inventory for a product
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

const items = await prisma.inventoryItem.findMany({
  where: { productId },
  include: {
    location: { select: { name: true } },
    variant: { select: { title: true, sku: true } },
  },
});

console.log(JSON.stringify({
  productTitle: product?.title || 'Unknown',
  inventory: items.map(item => ({
    location: item.location.name,
    variant: item.variant?.title || 'Default',
    sku: item.variant?.sku || null,
    quantity: item.quantity,
    reserved: item.reservedQuantity,
    available: item.quantity - item.reservedQuantity,
    lowStockThreshold: item.lowStockThreshold,
  })),
}, null, 2));

await prisma.$disconnect();
