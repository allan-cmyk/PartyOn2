#!/usr/bin/env node
/**
 * List products with low available stock (inStock - committed <= threshold)
 * Usage: node scripts/ops/low-stock.mjs [threshold]
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const threshold = parseInt(process.argv[2]) || 10;

const variants = await prisma.productVariant.findMany({
  where: { trackInventory: true },
  include: {
    product: { select: { title: true } },
  },
  orderBy: { inventoryQuantity: 'asc' },
});

const lowStock = variants
  .map(v => ({
    productTitle: v.product.title,
    variant: v.title || 'Default',
    sku: v.sku || null,
    inStock: v.inventoryQuantity,
    committed: v.committedQuantity,
    available: v.inventoryQuantity - v.committedQuantity,
  }))
  .filter(v => v.available <= threshold)
  .sort((a, b) => a.available - b.available);

console.log(JSON.stringify(lowStock, null, 2));
console.error(`\n${lowStock.length} items with available stock <= ${threshold}`);
await prisma.$disconnect();
