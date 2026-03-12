#!/usr/bin/env node
/**
 * Search products in the catalog
 * Usage: node scripts/ops/search-products.mjs "white claw" [limit]
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const query = process.argv[2];
const limit = parseInt(process.argv[3]) || 10;

if (!query) {
  console.error('Usage: node scripts/ops/search-products.mjs <query> [limit]');
  process.exit(1);
}

const words = query.split(/\s+/).filter(w => w.length > 0);

const titleMatchAll = words.length > 1
  ? { AND: words.map(word => ({ title: { contains: word, mode: 'insensitive' } })) }
  : { title: { contains: query, mode: 'insensitive' } };

const titleMatches = await prisma.product.findMany({
  where: { status: 'ACTIVE', ...titleMatchAll },
  include: {
    variants: { select: { id: true, title: true, price: true, sku: true, inventoryQuantity: true } },
    images: { orderBy: { position: 'asc' }, take: 1, select: { url: true } },
  },
  take: limit,
});

let results = titleMatches;

if (titleMatches.length < limit) {
  const titleIds = titleMatches.map(p => p.id);
  const remaining = limit - titleMatches.length;
  const otherMatches = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      id: { notIn: titleIds },
      OR: [
        { tags: { hasSome: words } },
        { variants: { some: { sku: { contains: query, mode: 'insensitive' } } } },
      ],
    },
    include: {
      variants: { select: { id: true, title: true, price: true, sku: true, inventoryQuantity: true } },
      images: { orderBy: { position: 'asc' }, take: 1, select: { url: true } },
    },
    take: remaining,
  });
  results = [...titleMatches, ...otherMatches];
}

const output = results.map(p => ({
  id: p.id,
  title: p.title,
  handle: p.handle,
  productType: p.productType,
  vendor: p.vendor,
  basePrice: Number(p.basePrice),
  variants: p.variants.map(v => ({
    id: v.id,
    title: v.title,
    price: Number(v.price),
    sku: v.sku,
    stock: v.inventoryQuantity,
  })),
}));

console.log(JSON.stringify(output, null, 2));
await prisma.$disconnect();
