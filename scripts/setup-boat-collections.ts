/**
 * One-time setup script for boat party collections
 *
 * Creates 6 collections (5 tabs + 1 essentials) and auto-assigns products
 * by searching titles and product types.
 *
 * Usage: npx tsx scripts/setup-boat-collections.ts
 *
 * After running, refine product membership via /ops/collections admin UI.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CollectionDef {
  handle: string;
  title: string;
  description: string;
}

const COLLECTIONS: CollectionDef[] = [
  {
    handle: 'boat-best-sellers',
    title: 'Boat Best Sellers',
    description: 'Top picks for boat parties — crowd favorites for groups of 8-12',
  },
  {
    handle: 'boat-seltzers-rtds',
    title: 'Seltzers & RTDs',
    description: 'Light, refreshing ready-to-drink options perfect for the lake',
  },
  {
    handle: 'boat-beer',
    title: 'Beer & Variety Packs',
    description: 'Cold beer and variety packs for your boat crew',
  },
  {
    handle: 'boat-cocktails-spirits',
    title: 'Cocktails & Spirits',
    description: 'Cocktail kits, spirits, and mixers for boat-side drinks',
  },
  {
    handle: 'boat-bubbles-wine',
    title: 'Bubbles & Wine',
    description: 'Champagne, prosecco, rosé, and wine for celebrations on the water',
  },
  {
    handle: 'boat-essentials',
    title: 'Boat Essentials',
    description: 'Ice, water, cups, limes — the must-haves for any boat day',
  },
];

// Helper: search products by title
async function searchByTitle(term: string, limit?: number) {
  return prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      title: { contains: term, mode: 'insensitive' },
    },
    orderBy: { basePrice: 'asc' },
    take: limit ?? 50,
    select: { id: true, title: true, basePrice: true, productType: true },
  });
}

// Helper: search products by productType
async function searchByType(term: string, limit?: number) {
  return prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      productType: { contains: term, mode: 'insensitive' },
    },
    orderBy: { basePrice: 'asc' },
    take: limit ?? 50,
    select: { id: true, title: true, basePrice: true, productType: true },
  });
}

// Helper: assign products to a collection
async function assignProducts(
  categoryId: string,
  handle: string,
  productIds: string[]
) {
  // Remove dupes while preserving order
  const unique = [...new Set(productIds)];
  let assigned = 0;

  for (let i = 0; i < unique.length; i++) {
    try {
      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: unique[i],
            categoryId,
          },
        },
        update: { position: i },
        create: {
          productId: unique[i],
          categoryId,
          position: i,
        },
      });
      assigned++;
    } catch (e) {
      // Product may not exist; skip
      console.warn(`  Skipped product ${unique[i]}: ${(e as Error).message}`);
    }
  }

  console.log(`  ${handle}: assigned ${assigned} products`);
}

// Pick first N from search results, return their IDs
function pickIds(
  results: Array<{ id: string; title: string }>,
  n: number
): string[] {
  return results.slice(0, n).map((p) => p.id);
}

async function main() {
  console.log('=== Boat Collections Setup ===\n');

  // Phase A: Create collections (idempotent)
  console.log('Phase A: Creating collections...');
  const categoryMap: Record<string, string> = {};

  for (const col of COLLECTIONS) {
    const existing = await prisma.category.findUnique({
      where: { handle: col.handle },
    });

    if (existing) {
      console.log(`  [exists] ${col.handle} (${existing.id})`);
      categoryMap[col.handle] = existing.id;
    } else {
      const created = await prisma.category.create({
        data: {
          handle: col.handle,
          title: col.title,
          description: col.description,
        },
      });
      console.log(`  [created] ${col.handle} (${created.id})`);
      categoryMap[col.handle] = created.id;
    }
  }

  console.log('\nPhase B: Auto-assigning products...\n');

  // --- boat-best-sellers ---
  {
    const ids: string[] = [];
    const highNoon = await searchByTitle('High Noon', 5);
    const varietyHN = highNoon.find((p) => /variety|sampler|pack/i.test(p.title));
    if (varietyHN) ids.push(varietyHN.id);
    else if (highNoon[0]) ids.push(highNoon[0].id);

    const whiteClaw = await searchByTitle('White Claw', 5);
    const varietyWC = whiteClaw.find((p) => /variety|sampler|pack/i.test(p.title));
    if (varietyWC) ids.push(varietyWC.id);
    else if (whiteClaw[0]) ids.push(whiteClaw[0].id);

    const millerLite = await searchByTitle('Miller Lite', 3);
    if (millerLite[0]) ids.push(millerLite[0].id);

    const modelo = await searchByTitle('Modelo', 3);
    if (modelo[0]) ids.push(modelo[0].id);

    const margKit = await searchByTitle('Margarita Kit', 3);
    if (margKit[0]) ids.push(margKit[0].id);

    const champagne = await searchByTitle('champagne', 5);
    const prosecco = await searchByTitle('prosecco', 5);
    const bubbles = [...champagne, ...prosecco].sort(
      (a, b) => Number(a.basePrice) - Number(b.basePrice)
    );
    if (bubbles[0]) ids.push(bubbles[0].id);

    // Fill to ~20
    const moreBeer = await searchByType('Beer', 10);
    const moreRtd = await searchByType('Seltzer', 10);
    const moreCocktail = await searchByTitle('Kit', 10);
    const fill = [...moreBeer, ...moreRtd, ...moreCocktail];
    for (const p of fill) {
      if (ids.length >= 20) break;
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    await assignProducts(categoryMap['boat-best-sellers'], 'boat-best-sellers', ids);
  }

  // --- boat-seltzers-rtds ---
  {
    const ids: string[] = [];
    const highNoon = await searchByTitle('High Noon', 10);
    const hnVariety = highNoon.find((p) => /variety|sampler/i.test(p.title));
    if (hnVariety) ids.push(hnVariety.id);
    const hnTequila = highNoon.find((p) => /tequila/i.test(p.title));
    if (hnTequila) ids.push(hnTequila.id);
    // fallback if neither found
    if (ids.length === 0 && highNoon[0]) ids.push(highNoon[0].id);

    const whiteClaw = await searchByTitle('White Claw', 5);
    const wcVariety = whiteClaw.find((p) => /variety|sampler/i.test(p.title));
    if (wcVariety) ids.push(wcVariety.id);
    else if (whiteClaw[0]) ids.push(whiteClaw[0].id);

    const surfside = await searchByTitle('Surfside', 5);
    if (surfside[0]) ids.push(surfside[0].id);

    // Fill from productType
    const seltzers = await searchByType('Seltzer', 30);
    const rtds = await searchByType('RTD', 20);
    const readyToDrink = await searchByType('Ready to Drink', 20);
    const all = [...seltzers, ...rtds, ...readyToDrink];
    for (const p of all) {
      if (ids.length >= 25) break;
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    await assignProducts(categoryMap['boat-seltzers-rtds'], 'boat-seltzers-rtds', ids);
  }

  // --- boat-beer ---
  {
    const ids: string[] = [];
    const searches = ['Miller Lite', 'Modelo', 'Michelob Ultra', 'Corona'];
    for (const term of searches) {
      const results = await searchByTitle(term, 3);
      if (results[0]) ids.push(results[0].id);
    }

    // Fill variety packs / beers
    const beers = await searchByType('Beer', 30);
    const varietyPacks = beers.filter((p) => /variety|pack|12|18|24/i.test(p.title));
    for (const p of varietyPacks) {
      if (ids.length >= 6) break;
      if (!ids.includes(p.id)) ids.push(p.id);
    }
    for (const p of beers) {
      if (ids.length >= 22) break;
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    await assignProducts(categoryMap['boat-beer'], 'boat-beer', ids);
  }

  // --- boat-cocktails-spirits ---
  {
    const ids: string[] = [];
    const kitSearches = ['Margarita Kit', 'Paloma Kit', 'Vodka Lemonade Kit'];
    for (const term of kitSearches) {
      const results = await searchByTitle(term, 3);
      if (results[0]) ids.push(results[0].id);
    }

    const tequila = await searchByTitle('Tequila', 10);
    if (tequila[0]) ids.push(tequila[0].id); // cheapest
    if (tequila[1]) ids.push(tequila[1].id); // mid-price

    const margMix = await searchByTitle('margarita mix', 5);
    if (margMix[0]) ids.push(margMix[0].id);

    // Fill: more kits, spirits, mixers
    const kits = await searchByTitle('Kit', 15);
    const vodka = await searchByTitle('Vodka', 10);
    const spirits = await searchByType('Liquor', 10);
    const fill = [...kits, ...vodka, ...spirits, ...tequila];
    for (const p of fill) {
      if (ids.length >= 20) break;
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    await assignProducts(categoryMap['boat-cocktails-spirits'], 'boat-cocktails-spirits', ids);
  }

  // --- boat-bubbles-wine ---
  {
    const ids: string[] = [];
    const champagne = await searchByTitle('champagne', 10);
    const prosecco = await searchByTitle('prosecco', 10);
    const bubbles = [...champagne, ...prosecco].sort(
      (a, b) => Number(a.basePrice) - Number(b.basePrice)
    );
    ids.push(...pickIds(bubbles, 2));

    const rose = await searchByTitle('ros', 10); // matches rosé and rose
    const roseByPrice = rose.sort(
      (a, b) => Number(a.basePrice) - Number(b.basePrice)
    );
    ids.push(
      ...pickIds(
        roseByPrice.filter((p) => !ids.includes(p.id)),
        2
      )
    );

    const sparkling = await searchByTitle('sparkling', 10);
    for (const p of sparkling) {
      if (ids.length >= 6) break;
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    // Fill with remaining wine
    const wine = await searchByType('Wine', 20);
    const wineChamp = await searchByType('champagne', 10);
    const fill = [...wine, ...wineChamp, ...bubbles, ...roseByPrice];
    for (const p of fill) {
      if (ids.length >= 18) break;
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    await assignProducts(categoryMap['boat-bubbles-wine'], 'boat-bubbles-wine', ids);
  }

  // --- boat-essentials ---
  {
    const ids: string[] = [];

    const ice = await searchByType('ice', 10);
    ids.push(...ice.map((p) => p.id));

    const water = await searchByType('water', 5);
    if (water[0]) ids.push(water[0].id);

    const cups = await searchByType('Cup', 10);
    const cupsByTitle = await searchByTitle('cup', 10);
    for (const p of [...cups, ...cupsByTitle]) {
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    const limes = await searchByTitle('lime', 5);
    for (const p of limes) {
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    const straws = await searchByTitle('straw', 5);
    for (const p of straws) {
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    const napkins = await searchByTitle('napkin', 5);
    for (const p of napkins) {
      if (!ids.includes(p.id)) ids.push(p.id);
    }

    await assignProducts(categoryMap['boat-essentials'], 'boat-essentials', ids);
  }

  // Summary
  console.log('\n=== Summary ===');
  for (const col of COLLECTIONS) {
    const count = await prisma.productCategory.count({
      where: { category: { handle: col.handle } },
    });
    console.log(`  ${col.handle}: ${count} products`);
  }

  console.log('\nDone! Review and refine via /ops/collections');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Script failed:', e);
  prisma.$disconnect();
  process.exit(1);
});
