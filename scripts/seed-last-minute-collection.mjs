import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Each entry: [label, include-substrings (all must match), exclude-substrings (none may match)]
// All matching is case-insensitive on product title.

const BEER = [
  ['Miller Lite 24pk', ['miller lite', '24']],
  ['Modelo Especial 24pk', ['modelo', '24']],
  ['Michelob Ultra 24pk', ['michelob ultra', '24']],
  ['Austin Beerworks Variety', ['austin beerworks', 'variety']],
  ['Dos Equis 24pk', ['dos equis lager', '24']],
  ['Lone Star 24pk', ['lone star', '24']],
  ['Corona Light 18pk', ['corona light', '18']],
];

const WINE = [
  ['Dark Horse Pinot Grigio 750', ['dark horse', 'pinot grigio', '750']],
  ['14 Hands Cabernet', ['14 hands', 'cabernet']],
  ['Amor Di Amanti Prosecco', ['amor di amanti']],
  ['La Marca Prosecco 750', ['la marca', '750'], ['187', '6 pack']],
  ['Wycliff Brut', ['wycliff', 'brut'], ['rose']],
  ['Wycliff Brut Rose', ['wycliff', 'rose']],
];

const SPIRITS = [
  ['Espolon Blanco 750', ['espolon', '750']],
  ['Lunazul Blanco 750', ['lunazul', '750']],
  ['Lunazul Blanco 1.75', ['lunazul', '1.75']],
  ["Tito's 750", ['tito', '750']],
  ["Tito's 1.75L", ['tito', '1.75']],
  ['Bacardi Superior 750', ['bacardi', '750']],
  ['Dripping Springs Gin 750', ['dripping springs', 'gin', '750']],
  ['Austin 85 Light Whiskey', ['austin 85']],
  ["Maker's Mark 1.75L", ["maker's mark", '1.75']],
  ["Jack Daniel's 750", ['jack daniel', '750']],
];

const SELTZERS = [
  ['Surfside Starter Variety', ['surfside', 'starter', 'variety']],
  ['Surfside Lemonade Variety', ['surfside', 'lemonade', 'variety']],
  ['High Noon Variety 12pk', ['high noon', 'variety', '12 pack']],
  ['High Noon Variety 8pk', ['high noon variety', '8 pack']],
  ['High Noon Tequila Variety', ['high noon', 'tequila', 'variety']],
  ['White Claw Variety 24', ['white claw', 'variety', '24']],
];

const MIXERS = [
  ['Coca-Cola 12pk', ['coca-cola']],
  ['Diet Coke', ['diet coke']],
  ['Coke Zero', ['coke zero']],
  ['Sprite 12pk', ['sprite', '12 pack']],
  ['Sprite 2L', ['sprite', '2l']],
  ['Orange Juice 48oz', ['orange juice', '48oz'], ['pineapple']],
  ['Lemonade 64oz', ['lemonade', '64oz']],
  ['Lemonade 89oz', ['lemonade', '89oz']],
  ['Club Soda', ['club soda']],
  ['Cranberry Juice', ['cranberry juice']],
  ['Lime Juice', ['lime juice']],
  ['Rambler Sparkling Water', ['rambler sparkling']],
  ['Fresh Victor mixers', ['fresh victor']],
  ['Red Bull 12pk', ['red bull', '12 pack']],
  ['Sugar Free Red Bull', ['sugar free red bull']],
  ['Bag of Ice', ['bag of ice']],
  ['Solo Cups', ['solo cup']],
];

const SUB_COLLECTIONS = [
  { handle: 'last-minute-beer', title: 'Beer (Last Minute)', wishlist: BEER },
  { handle: 'last-minute-wine', title: 'Wine & Sparkling (Last Minute)', wishlist: WINE },
  { handle: 'last-minute-mixers', title: 'Mixers & More (Last Minute)', wishlist: MIXERS },
];

// Categories that use existing collections intersected with the master whitelist
const EXTRA_WHITELIST = [...SPIRITS, ...SELTZERS];

async function findMatches(includes, excludes = []) {
  const where = {
    status: 'ACTIVE',
    AND: [
      ...includes.map((g) => ({ title: { contains: g, mode: 'insensitive' } })),
      ...excludes.map((g) => ({ NOT: { title: { contains: g, mode: 'insensitive' } } })),
    ],
  };
  return prisma.product.findMany({
    where,
    select: { id: true, title: true, handle: true },
    orderBy: { title: 'asc' },
  });
}

async function resolveWishlist(wishlist) {
  const resolved = [];
  const misses = [];
  const ids = new Set();
  for (const [label, includes, excludes = []] of wishlist) {
    const matches = await findMatches(includes, excludes);
    if (matches.length === 0) {
      misses.push(label);
      continue;
    }
    resolved.push({ label, matches });
    for (const m of matches) ids.add(m.id);
  }
  return { resolved, misses, ids };
}

async function upsertCollection(handle, title, description = null) {
  return prisma.category.upsert({
    where: { handle },
    create: { handle, title, description },
    update: { title },
  });
}

async function setCollectionProducts(categoryId, productIds) {
  await prisma.productCategory.deleteMany({ where: { categoryId } });
  const links = Array.from(productIds).map((pid, i) => ({
    productId: pid,
    categoryId,
    position: i,
  }));
  if (links.length) {
    await prisma.productCategory.createMany({ data: links, skipDuplicates: true });
  }
  return links.length;
}

async function main() {
  console.log('Seeding last-minute collections...\n');

  const masterIds = new Set();

  // Sub-collections: beer, wine, mixers
  for (const sub of SUB_COLLECTIONS) {
    const { resolved, misses, ids } = await resolveWishlist(sub.wishlist);
    console.log(`\n=== ${sub.handle} (${resolved.length}/${sub.wishlist.length}) ===`);
    for (const r of resolved) {
      console.log(`  ${r.label} -> ${r.matches.map((m) => m.title).join(' | ')}`);
    }
    for (const m of misses) console.log(`  MISS: ${m}`);

    const cat = await upsertCollection(sub.handle, sub.title);
    const linked = await setCollectionProducts(cat.id, ids);
    console.log(`  Linked ${linked} products to ${sub.handle}`);

    for (const id of ids) masterIds.add(id);
  }

  // Extra products that belong to the master whitelist but aren't in a sub-collection
  // (spirits and seltzers reuse the main category collection, filtered by the whitelist)
  console.log('\n=== spirits + seltzers (whitelist only; uses existing collections) ===');
  const { resolved: extraResolved, misses: extraMisses, ids: extraIds } =
    await resolveWishlist(EXTRA_WHITELIST);
  for (const r of extraResolved) {
    console.log(`  ${r.label} -> ${r.matches.map((m) => m.title).join(' | ')}`);
  }
  for (const m of extraMisses) console.log(`  MISS: ${m}`);
  for (const id of extraIds) masterIds.add(id);

  // All cocktail kits (always show in full, no filter)
  const kitsCategory = await prisma.category.findUnique({ where: { handle: 'cocktail-kits' } });
  let kitCount = 0;
  if (kitsCategory) {
    const kits = await prisma.productCategory.findMany({
      where: { categoryId: kitsCategory.id, product: { status: 'ACTIVE' } },
      select: { productId: true },
    });
    for (const k of kits) masterIds.add(k.productId);
    kitCount = kits.length;
  }

  // Master last-minute collection (union — drives the whitelist filter)
  const master = await upsertCollection(
    'last-minute',
    'Last Minute',
    'All products allowed in last-minute (48-72h) ordering mode.'
  );
  const linked = await setCollectionProducts(master.id, masterIds);
  console.log(`\n=== master 'last-minute' collection ===`);
  console.log(`  Cocktail kits included: ${kitCount}`);
  console.log(`  Total unique products linked: ${linked}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
