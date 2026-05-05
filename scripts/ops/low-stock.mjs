#!/usr/bin/env node
/**
 * List products with low available stock (inStock - committed <= threshold).
 * Calls out OVERSELLS (available < 0) at the top — these are paid orders we
 * cannot currently fulfill and need attention before the rest of the list.
 *
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

const annotated = variants.map(v => ({
  productTitle: v.product.title,
  variant: v.title || 'Default',
  sku: v.sku || null,
  inStock: v.inventoryQuantity,
  committed: v.committedQuantity,
  available: v.inventoryQuantity - v.committedQuantity,
}));

const oversold = annotated.filter(v => v.available < 0).sort((a, b) => a.available - b.available);
const lowStock = annotated.filter(v => v.available >= 0 && v.available <= threshold).sort((a, b) => a.available - b.available);

if (oversold.length) {
  console.error(`\n⚠  OVERSOLD: ${oversold.length} item${oversold.length === 1 ? '' : 's'} with paid commitments exceeding stock`);
  for (const v of oversold) {
    const variantSuffix = v.variant && v.variant !== 'Default' ? ' / ' + v.variant : '';
    console.error(`   • ${v.productTitle}${variantSuffix}  inStock=${v.inStock} committed=${v.committed} available=${v.available}`);
  }
  console.error('');
}

console.log(JSON.stringify({ oversold, lowStock }, null, 2));
console.error(`\n${oversold.length} oversold · ${lowStock.length} low-stock (available <= ${threshold})`);
await prisma.$disconnect();
