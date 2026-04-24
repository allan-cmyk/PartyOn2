#!/usr/bin/env node
/**
 * One-shot: apply cost + (optional) retail price updates for the April 2026
 * distributor invoice batch, and backfill historical margins.
 *
 * For each row:
 *   1. Update ProductVariant.costPerUnit (always)
 *   2. Update ProductVariant.price (if newPrice provided, per 27% margin rule)
 *   3. Set OrderItem.unitCost / totalCost on any historical items with this
 *      variantId that don't already have cost captured
 *   4. Recompute Order.marginAmount for any order whose items were backfilled
 *
 * Safe to re-run — idempotent via "only backfill where unitCost IS NULL".
 */

import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

const ROWS = [
  // label, variantId, cost, newPrice?
  ['Espolon Blanco 1.75L',          'c6c92d72-a784-436c-8a57-cb7709e528e1', 39.01, null],
  ['Espolon Blanco 750ml',          'e4b31a4b-e870-46eb-9c9b-b137ca9087bd', 24.00, null],
  ['Tito\'s Handmade 1.75L',        'c8462511-2753-42d3-85c5-15095b46f0c1', 28.67, null],
  ['Tito\'s Handmade 1L',           '99ca61d0-3754-4919-ac88-12004169dce2', 21.33, 29.99],
  ['Aperol Aperitivo 1L',           '5191ab48-940d-49dd-8e5f-6707eb43790b', 25.00, 34.99],
  ['Chateau Ste Michelle Cab 750',  '83d4f7a8-561d-49f9-a4e8-9b0902636c6b', 11.25, 15.99],
  ['Wycliff Brut Champagne 750',    '78502c15-9aed-4707-a45f-ffc807a0dfd7',  4.75, null],
  ['Lunazul Blanco 750',            '14d3327c-107e-4604-8f46-e65508d553f5', 17.25, null],
  ['Lunazul Blanco 1.75L',          '0c6a4a6a-8957-4031-b81c-c4a4399f0a7e', 31.50, null],
  ['Bacardi Light Superior 750',    '7934ffa4-58ec-4814-a6d5-4fc38bbea96b', 14.25, 19.99],
  ['Casamigos Blanco 750',          '9b4ba44d-d1b8-44db-8178-4527530a0dc6', 36.00, null],
  ['Lalo Blanco 750',               '1d1836a1-fd4f-458d-a634-fc6ca9e7f7e7', 36.99, 50.99],
  ['Still Austin Straight Bourbon', 'bcc036c0-995a-4b72-9440-f65f41e80633', 35.79, 49.99],
  ['Four Roses Bourbon 750',        '355bd5a8-e635-451a-ac94-51cc8bda11cc', 21.74, null],
  ['Island Getaway Coconut 750',    '27a0742b-aaa9-4cee-8b98-fec35d31e435', 14.99, 20.99],
  ['Dripping Springs Artisan Gin',  'a7c251af-f899-4328-9dca-16efbdab2fe7', 23.99, null],
  ['Deep Eddy Vodka 750',           'b9d73b0c-6579-4888-965c-7a8d0995722b', 16.49, null],
  ['Dark Horse Pinot Grigio 375',   '836b7c71-d7da-4e05-abd5-4a6dfd8f598a',  4.20,  5.99],
  ['House Wine Red Blend 355',      '75b4bfbc-8df1-4c01-8d90-5e2e5d16f65b',  4.50,  6.99],
  ['High Noon Tequila Variety 8pk', 'c2ec0735-f30f-4598-8be0-3790273b6e62', 18.00, 24.99],
  ['High Noon Variety 8pk (Day Pk)','4061d5b7-7b23-4c65-8ed2-a35c6be8dff0', 16.50, 22.99],
  ['High Noon Variety Pack 12pk',   '3714a896-c410-4085-83bf-e8fb688b970d', 23.25, null],
  ['Twisted X McConauhaze 12pk',    'a972ce8c-1008-4fca-8845-37340cef0197', 18.37, 25.99],
  ['White Claw Variety 24pk',       '2d74f923-3a80-4f49-a0ec-fd173e977a70', 27.97, 38.99],
  ['Michelob Ultra 24pk',           '42a7f559-386e-4835-b0f3-962e9db379af', 25.30, 34.99],
  ['Coors Light 24pk',              '77fce20d-344b-417a-b409-d8ca8ed36a0a', 24.95, 34.99],
  ['Miller Lite 24pk',              'dd44b927-8dcd-4336-9a1e-2df3cb67ec13', 24.95, 34.99],
  ['Modelo Especial 24pk Can',      '7d7c3edc-bbeb-4bda-9a51-58c84f6d4761', 26.10, 35.99],
  ['Pacifico 12pk',                 'd25bc225-1ccc-45fd-9709-9082d8f5451d', 15.83, 21.99],
  ['Dos Equis Lager 24pk',          'ff8ae9e6-3c2b-4543-bc19-c5663aa24566', 26.10, null],
  ['Topo Chico Variety 24pk',       '4f040e3d-83d3-4ce1-914a-bccd67d8abb1', 27.97, 38.99],
  ['Live Oak Hefeweizen 12pk',      '37c2f549-9cc2-40b9-9a98-e05f8de20927', 15.20, null],
  ['Lone Star 24pk',                'd07dd8ec-b3c6-4413-bd55-5a49f91bbc52', 18.80, null],
  ['Rambler Lemon Lime 12pk',       '46c98e53-d7be-4bcd-bb9f-a54ba2c6d341',  7.25, null],
  ['Rambler Grapefruit 12pk',       'bec78036-950c-4be3-a2b2-aae17acf8d8c',  7.25, null],
  ['Cutwater Mango Margarita 4pk',  'c37da472-446f-4c35-b853-5e5606c89374', 10.16, 13.99],
  ['Cutwater Lime Margarita 4pk',   '18edd6f2-2ecb-4cd8-8f40-9a8e79c325e7', 10.16, 13.99],
  ['Cutwater Paloma 4pk',           '3cd22e9a-a426-4bff-a4b6-461262cf6f5f', 10.16, 13.99],
  ['Cutwater Tiki Mai Tai 4pk',     '599fe063-2e2a-4208-8aa7-47401d8658a6', 10.16, 13.99],
  ['Independence Native Texan 12pk','5091af1c-9379-46b0-a35a-e4f2dd355ada', 14.80, 20.99],
  ['Austin Beerworks Variety 12pk', '0331b752-9497-4553-8c44-bdcc30647787', 14.25, null],
  ['ABW Pearl Snap Keg 1/6',        '24fe1872-8379-4c8c-913b-684e0dae776a', 65.00, null],
  ['High Brew Mexican Vanilla 12pk','94cc3e6c-ec7c-4cbd-9848-f9515d755088', 24.20, 33.99],
];

let totalItemsBackfilled = 0;
let totalOrdersRecomputed = 0;
const touchedOrders = new Set();

for (const [label, variantId, cost, newPrice] of ROWS) {
  // 1. Update variant
  const updateData = { costPerUnit: new Prisma.Decimal(cost) };
  if (newPrice != null) updateData.price = new Prisma.Decimal(newPrice);
  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: updateData,
    select: { id: true, title: true, price: true, costPerUnit: true },
  });

  // 2. Backfill historical order items missing cost
  const items = await prisma.orderItem.findMany({
    where: { variantId, unitCost: null },
    select: { id: true, orderId: true, quantity: true },
  });
  for (const item of items) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        unitCost: new Prisma.Decimal(cost),
        totalCost: new Prisma.Decimal(cost).mul(item.quantity),
      },
    });
    totalItemsBackfilled++;
    touchedOrders.add(item.orderId);
  }

  const margin = Number(variant.price) - cost;
  const marginPct = Number(variant.price) > 0 ? (margin / Number(variant.price) * 100) : 0;
  console.log(`✓ ${label.padEnd(38)}  cost $${cost.toFixed(2)}  retail $${Number(variant.price).toFixed(2)}${newPrice ? ' (updated)' : ''}  margin ${marginPct.toFixed(1)}%  backfilled ${items.length} items`);
}

// 3. Recompute margin on all touched orders
for (const orderId of touchedOrders) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { totalPrice: true, totalCost: true },
  });
  const withCost = items.filter((x) => x.totalCost !== null);
  if (withCost.length === 0) continue;
  const marginAmount = withCost.reduce(
    (acc, x) => acc.add(new Prisma.Decimal(x.totalPrice)).sub(new Prisma.Decimal(x.totalCost)),
    new Prisma.Decimal(0)
  );
  await prisma.order.update({
    where: { id: orderId },
    data: { marginAmount },
  });
  totalOrdersRecomputed++;
}

console.log('');
console.log(`─────────────────────────────────────────────`);
console.log(`Variants updated:       ${ROWS.length}`);
console.log(`Retail prices bumped:   ${ROWS.filter(r => r[3] != null).length}`);
console.log(`Order items backfilled: ${totalItemsBackfilled}`);
console.log(`Orders recomputed:      ${totalOrdersRecomputed}`);
console.log(`─────────────────────────────────────────────`);

await prisma.$disconnect();
