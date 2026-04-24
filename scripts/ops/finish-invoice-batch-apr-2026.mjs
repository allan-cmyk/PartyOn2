#!/usr/bin/env node
/**
 * Wrap-up for the April 2026 invoice batch:
 *   1. Map ABW Peacemaker keg ($60 cost) → existing "Austin Beerworks Anytime Ale Keg 1/6 Barrel"
 *      and backfill historical orders.
 *   2. Create new product "Saint Arnold Summer Pils • 6 Pack 12oz Can" at retail $12.99,
 *      cost $8.60 (32% margin).
 */

import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

// ─── 1. ABW Peacemaker keg → Anytime Ale Keg ─────────────────────────────────
const ANYTIME_ALE_KEG_VARIANT_ID = '9edecd63-6659-439c-84ef-1eb92eb33232';
const PEACEMAKER_COST = 60.00;

const variant = await prisma.productVariant.update({
  where: { id: ANYTIME_ALE_KEG_VARIANT_ID },
  data: { costPerUnit: new Prisma.Decimal(PEACEMAKER_COST) },
  select: { id: true, title: true, price: true },
});

// Backfill historical items
const items = await prisma.orderItem.findMany({
  where: { variantId: ANYTIME_ALE_KEG_VARIANT_ID, unitCost: null },
  select: { id: true, orderId: true, quantity: true },
});
const touchedOrders = new Set();
for (const item of items) {
  await prisma.orderItem.update({
    where: { id: item.id },
    data: {
      unitCost: new Prisma.Decimal(PEACEMAKER_COST),
      totalCost: new Prisma.Decimal(PEACEMAKER_COST).mul(item.quantity),
    },
  });
  touchedOrders.add(item.orderId);
}
for (const orderId of touchedOrders) {
  const all = await prisma.orderItem.findMany({
    where: { orderId },
    select: { totalPrice: true, totalCost: true },
  });
  const withCost = all.filter((x) => x.totalCost !== null);
  if (withCost.length === 0) continue;
  const marginAmount = withCost.reduce(
    (acc, x) => acc.add(new Prisma.Decimal(x.totalPrice)).sub(new Prisma.Decimal(x.totalCost)),
    new Prisma.Decimal(0)
  );
  await prisma.order.update({ where: { id: orderId }, data: { marginAmount } });
}

const peaceMargin = ((Number(variant.price) - PEACEMAKER_COST) / Number(variant.price) * 100).toFixed(1);
console.log(`✓ Mapped Peacemaker keg → Anytime Ale Keg  cost $${PEACEMAKER_COST}  retail $${variant.price}  margin ${peaceMargin}%  (${items.length} items, ${touchedOrders.size} orders backfilled)`);

// ─── 2. Create Saint Arnold Summer Pils 6pk ──────────────────────────────────
const handle = 'saint-arnold-summer-pils-6-pack-12oz-can';
const title = 'Saint Arnold Summer Pils • 6 Pack 12oz Can';
const RETAIL = 12.99;
const COST = 8.60;

const newProduct = await prisma.product.upsert({
  where: { handle },
  update: {
    title,
    basePrice: new Prisma.Decimal(RETAIL),
  },
  create: {
    handle,
    title,
    description: 'Saint Arnold Summer Pils — crisp Texas pilsner, 6 pack 12oz cans.',
    productType: 'Craft Beer',
    vendor: 'Brown Distributing Company',
    status: 'ACTIVE',
    basePrice: new Prisma.Decimal(RETAIL),
  },
});

// Upsert single variant
const existingVariant = await prisma.productVariant.findFirst({
  where: { productId: newProduct.id },
});
let summerPilsVariant;
if (existingVariant) {
  summerPilsVariant = await prisma.productVariant.update({
    where: { id: existingVariant.id },
    data: {
      price: new Prisma.Decimal(RETAIL),
      costPerUnit: new Prisma.Decimal(COST),
    },
  });
} else {
  summerPilsVariant = await prisma.productVariant.create({
    data: {
      productId: newProduct.id,
      title: 'Default Title',
      option1Name: 'Title',
      option1Value: 'Default Title',
      price: new Prisma.Decimal(RETAIL),
      costPerUnit: new Prisma.Decimal(COST),
      inventoryQuantity: 0,
      committedQuantity: 0,
      trackInventory: true,
      allowBackorder: false,
      availableForSale: true,
      weight: 0,
      weightUnit: 'POUNDS',
    },
  });
}

// Attach to Craft Beer category
const craftBeerCat = await prisma.category.findFirst({
  where: { handle: 'craft-beer' },
  select: { id: true },
});
if (craftBeerCat) {
  await prisma.productCategory
    .create({
      data: { productId: newProduct.id, categoryId: craftBeerCat.id, position: 0 },
    })
    .catch(() => { /* already linked */ });
}

const sumMargin = ((RETAIL - COST) / RETAIL * 100).toFixed(1);
console.log(`✓ Created/updated "${title}"`);
console.log(`   productId  ${newProduct.id}`);
console.log(`   variantId  ${summerPilsVariant.id}`);
console.log(`   cost $${COST}  retail $${RETAIL}  margin ${sumMargin}%`);
console.log(`   category: Craft Beer`);
console.log('');
console.log('NOTE: no product image yet — add one via /ops admin or by dropping a file');
console.log('      into public/images/products/ and creating a ProductImage record.');

await prisma.$disconnect();
