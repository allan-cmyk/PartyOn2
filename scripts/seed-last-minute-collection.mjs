import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Each entry: [label, include-substrings (all must match), exclude-substrings (none may match)]
// All matching is case-insensitive on product title.
const WISHLIST = [
  // Beer
  ['Miller Lite 24pk', ['miller lite', '24']],
  ['Modelo Especial 24pk', ['modelo', '24']],
  ['Michelob Ultra 24pk', ['michelob ultra', '24']],
  ['Austin Beerworks Variety', ['austin beerworks', 'variety']],
  // Wine / Sparkling
  ['Dark Horse Pinot Grigio', ['dark horse', 'pinot grigio', '750']],
  ['14 Hands Cabernet', ['14 hands', 'cabernet']],
  ['Amore Diamante Prosecco', ['amore', 'prosecco']],
  ['La Marca Prosecco 750', ['la marca', '750'], ['187', '6 pack']],
  ['Wycliff Brut', ['wycliff', 'brut'], ['rose']],
  ['Wycliff Brut Rose', ['wycliff', 'rose']],
  // Tequila
  ['Espolon Blanco 750', ['espolon', '750']],
  ['Lunazul Blanco 750', ['lunazul', '750']],
  ['Lunazul Blanco 1.75', ['lunazul', '1.75']],
  // Vodka
  ["Tito's 750", ['tito', '750']],
  ["Tito's 1.75L", ['tito', '1.75']],
  // Rum
  ['Bacardi Superior 750', ['bacardi', '750']],
  // Gin
  ['Dripping Springs Gin 750', ['dripping springs', 'gin', '750']],
  // Whiskey
  ['Austin 85 Light Whiskey', ['austin 85']],
  ["Maker's Mark 1.75L", ["maker's mark", '1.75']],
  ["Jack Daniel's 750", ['jack daniel', '750']],
  // Seltzers / RTDs
  ['Surfside Starter Variety', ['surfside', 'starter', 'variety']],
  ['Surfside Lemonade Variety', ['surfside', 'lemonade', 'variety']],
  ['High Noon Variety 12pk', ['high noon', 'variety', '12 pack']],
  ['High Noon Variety 8pk', ['high noon variety', '8 pack']],
  ['High Noon Tequila Variety', ['high noon', 'tequila', 'variety']],
  ['White Claw Variety 24', ['white claw', 'variety', '24']],
  // Non-alc soda / juice
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
  // Sundries
  ['Bag of Ice', ['bag of ice']],
  ['Solo Cups', ['solo cup']],
];

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

async function main() {
  console.log('Seeding last-minute collection...\n');

  // Resolve every wishlist entry to products
  const resolved = [];
  const misses = [];
  const productIds = new Set();

  for (const [label, includes, excludes = []] of WISHLIST) {
    const matches = await findMatches(includes, excludes);
    if (matches.length === 0) {
      misses.push(label);
      continue;
    }
    resolved.push({ label, matches });
    for (const m of matches) productIds.add(m.id);
  }

  // Add all cocktail kits
  const kitsCategory = await prisma.category.findUnique({ where: { handle: 'cocktail-kits' } });
  let kitCount = 0;
  if (kitsCategory) {
    const kits = await prisma.productCategory.findMany({
      where: { categoryId: kitsCategory.id, product: { status: 'ACTIVE' } },
      select: { productId: true },
    });
    for (const k of kits) productIds.add(k.productId);
    kitCount = kits.length;
  }

  console.log(`Matched wishlist items (${resolved.length}/${WISHLIST.length}):`);
  for (const r of resolved) {
    console.log(`  ${r.label} -> ${r.matches.map((m) => m.title).join(' | ')}`);
  }
  if (misses.length) {
    console.log(`\nMisses (no product found):`);
    for (const m of misses) console.log(`  - ${m}`);
  }
  console.log(`\nCocktail kits included: ${kitCount}`);
  console.log(`Total unique products: ${productIds.size}`);

  // Upsert the collection
  const category = await prisma.category.upsert({
    where: { handle: 'last-minute' },
    create: {
      handle: 'last-minute',
      title: 'Last Minute',
      description: 'Curated set of always-in-stock items for 48-72 hour delivery.',
    },
    update: {},
  });
  console.log(`\nCollection id: ${category.id}`);

  // Clear existing links, then relink (idempotent)
  await prisma.productCategory.deleteMany({ where: { categoryId: category.id } });
  const links = Array.from(productIds).map((pid, i) => ({
    productId: pid,
    categoryId: category.id,
    position: i,
  }));
  if (links.length) {
    await prisma.productCategory.createMany({ data: links, skipDuplicates: true });
  }
  console.log(`Linked ${links.length} products to last-minute collection.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
