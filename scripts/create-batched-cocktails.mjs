/**
 * Create 17 Batched Cocktail & Mocktail bundle products
 * - Creates 2 missing ingredient products (Tanteo Jalapeno, H-E-B Club Soda 1L)
 * - Creates "Batched Cocktails" category
 * - Creates 13 cocktails + 4 mocktails as bundle products
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ── Existing ingredient product IDs ──────────────────────────────────
const EXISTING = {
  lunazulBlanco:      '8dc47091-d637-4307-828a-2ef2a0a4d11f',
  treatyOakBourbon:   '4f99f314-07c7-4e2a-9448-33d5b652052c',
  drippingSpringsGin: '36a54508-7691-4ae7-9573-6a12e768f658',
  islandGetawayRum:   'b87a993b-fedd-4894-a331-77581613e268',
  deepEddyVodka:      'b3e33b51-4a76-4313-a7c5-cfee038a4b02',
  fvLimeAgave:        '4d79c10c-787f-4864-a179-ecc64f89c492',
  fvCucumberLime:     'ea89ff16-2dfd-4eb4-9f3e-2cd78e1933cb',
  fvCitrusMint:       'a678b018-0dd7-4090-930f-33e6e6758082',
  fvStrawberryLemon:  '95216678-2ade-42d5-9c97-9c0ac1463419',
  tonicWater:         '3f5711ab-d452-4cdd-94e1-2746a4668c1b',
  drinkDispenser:     'b59b640d-987a-4d84-9733-8b712cabcc43',
};

async function main() {
  // ── Step 1: Create missing ingredient products ───────────────────
  console.log('Creating missing ingredient products...');

  const tanteo = await prisma.product.upsert({
    where: { handle: 'tanteo-jalapeno-tequila-750ml' },
    update: {},
    create: {
      title: 'Tanteo Jalapeño Tequila 750ml',
      handle: 'tanteo-jalapeno-tequila-750ml',
      description: 'Tanteo Jalapeño Tequila 750ml bottle. Infused with real jalapeño peppers for a smooth, spicy kick.',
      vendor: 'Tanteo',
      productType: 'Tequila',
      basePrice: 34.99,
      status: 'ACTIVE',
      tags: ['tequila', 'jalapeno', 'spicy', '750ml'],
      variants: {
        create: {
          title: 'Default',
          price: 34.99,
          sku: 'TANTEO-JAL-750',
          inventoryQuantity: 100,
        },
      },
    },
  });
  console.log(`  Created: ${tanteo.title} (${tanteo.id})`);

  const clubSoda = await prisma.product.upsert({
    where: { handle: 'heb-club-soda-2l' },
    update: {},
    create: {
      title: 'H-E-B Club Soda 2L',
      handle: 'heb-club-soda-2l',
      description: 'H-E-B Club Soda 2 liter bottle. Made with sea salt.',
      vendor: 'H-E-B',
      productType: 'Mixer',
      basePrice: 1.99,
      status: 'ACTIVE',
      tags: ['club-soda', 'mixer', 'non-alcoholic', '2L'],
      variants: {
        create: {
          title: 'Default',
          price: 1.99,
          sku: 'HEB-CLUB-SODA-2L',
          inventoryQuantity: 200,
        },
      },
    },
  });
  console.log(`  Created: ${clubSoda.title} (${clubSoda.id})`);

  // ── Step 2: Create "Batched Cocktails" category ──────────────────
  console.log('\nCreating Batched Cocktails category...');

  const category = await prisma.category.upsert({
    where: { handle: 'batched-cocktails' },
    update: {},
    create: {
      handle: 'batched-cocktails',
      title: 'Batched Cocktails',
      description: 'Pre-batched cocktails and mocktails made with Fresh Victor premium mixers. Each batch serves 16 drinks and includes a drink dispenser.',
      position: 0,
    },
  });
  console.log(`  Category: ${category.title} (${category.id})`);

  // ── Step 3: Define all 17 products ───────────────────────────────
  const products = [
    // ── Mexican Lime & Agave Group ──
    {
      title: 'Lady Bird Margarita',
      handle: 'lady-bird-margarita-serves-16',
      price: 85.00,
      description: 'Our signature Austin margarita. Lunazul Blanco Tequila with Fresh Victor Mexican Lime & Agave and club soda. Refreshing, balanced, and ready to pour. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'margarita', 'tequila', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 1,
      components: [
        { productId: EXISTING.lunazulBlanco, qty: 1 },
        { productId: EXISTING.fvLimeAgave, qty: 3 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Keep Austin Spicy Marg',
      handle: 'keep-austin-spicy-marg-serves-16',
      price: 95.00,
      description: 'For the spice lovers. Tanteo Jalapeño Tequila meets Fresh Victor Mexican Lime & Agave with a club soda fizz. Medium heat, maximum flavor. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'margarita', 'tequila', 'spicy', 'jalapeno', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 2,
      components: [
        { productId: tanteo.id, qty: 1 },
        { productId: EXISTING.fvLimeAgave, qty: 3 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: '6th Street Gold Rush',
      handle: '6th-street-gold-rush-serves-16',
      price: 77.00,
      description: 'A bourbon twist on the classic Gold Rush. Treaty Oak Day Drinker Bourbon with Fresh Victor Mexican Lime & Agave and club soda. Smooth and spirit-forward. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'bourbon', 'gold-rush', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 3,
      components: [
        { productId: EXISTING.treatyOakBourbon, qty: 1 },
        { productId: EXISTING.fvLimeAgave, qty: 2 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Lake Travis Ranch Water',
      handle: 'lake-travis-ranch-water-serves-16',
      price: 68.00,
      description: 'The official drink of Texas lake culture. Lunazul Blanco Tequila, a splash of Fresh Victor Mexican Lime & Agave, and plenty of club soda. Light, crushable, all-day easy. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'ranch-water', 'tequila', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 4,
      components: [
        { productId: EXISTING.lunazulBlanco, qty: 1 },
        { productId: EXISTING.fvLimeAgave, qty: 1 },
        { productId: clubSoda.id, qty: 2 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    // ── Cucumber & Lime Group ──
    {
      title: 'Cucumber Crush Margarita',
      handle: 'cucumber-crush-margarita-serves-16',
      price: 85.00,
      description: 'Cool and refreshing cucumber-lime margarita with Lunazul Blanco Tequila and club soda. A bachelorette party go-to. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'margarita', 'tequila', 'cucumber', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 5,
      components: [
        { productId: EXISTING.lunazulBlanco, qty: 1 },
        { productId: EXISTING.fvCucumberLime, qty: 3 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Eastside Gin & Tonic',
      handle: 'eastside-gin-and-tonic-serves-16',
      price: 75.00,
      description: 'A sophisticated cucumber-lime gin and tonic. Dripping Springs Artisan Gin with Fresh Victor Cucumber & Lime and tonic water. Wedding-ready. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'gin-and-tonic', 'gin', 'cucumber', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 6,
      components: [
        { productId: EXISTING.drippingSpringsGin, qty: 1 },
        { productId: EXISTING.fvCucumberLime, qty: 2 },
        { productId: EXISTING.tonicWater, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Cool Cucumber Splash',
      handle: 'cool-cucumber-splash-serves-16',
      price: 71.00,
      description: 'A clean, light vodka soda with cucumber-lime flavor. Deep Eddy Vodka, Fresh Victor Cucumber & Lime, and club soda. Low-cal crowd-pleaser. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'vodka-soda', 'vodka', 'cucumber', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 7,
      components: [
        { productId: EXISTING.deepEddyVodka, qty: 1 },
        { productId: EXISTING.fvCucumberLime, qty: 2 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    // ── Three Citrus & Mint Leaf Group ──
    {
      title: 'Barton Springs Mojito',
      handle: 'barton-springs-mojito-serves-16',
      price: 68.00,
      description: 'A perfect batch mojito without the muddling. Island Getaway White Rum with Fresh Victor Three Citrus & Mint Leaf and club soda. Bright, minty, effortless. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'mojito', 'rum', 'mint', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 8,
      components: [
        { productId: EXISTING.islandGetawayRum, qty: 1 },
        { productId: EXISTING.fvCitrusMint, qty: 2 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Mint Julep Smash',
      handle: 'mint-julep-smash-serves-16',
      price: 77.00,
      description: 'A smash-style bourbon cocktail with citrus and mint. Treaty Oak Day Drinker Bourbon meets Fresh Victor Three Citrus & Mint Leaf. Spirit-forward and bold. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'bourbon', 'mint-julep', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 9,
      components: [
        { productId: EXISTING.treatyOakBourbon, qty: 1 },
        { productId: EXISTING.fvCitrusMint, qty: 2 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Citrus Gin Cooler',
      handle: 'citrus-gin-cooler-serves-16',
      price: 75.00,
      description: 'A botanical gin and tonic elevated with Fresh Victor Three Citrus & Mint Leaf. Dripping Springs Artisan Gin with tonic water. Elegant and light. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'gin-and-tonic', 'gin', 'citrus', 'mint', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 10,
      components: [
        { productId: EXISTING.drippingSpringsGin, qty: 1 },
        { productId: EXISTING.fvCitrusMint, qty: 2 },
        { productId: EXISTING.tonicWater, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    // ── Strawberry & Lemon Group ──
    {
      title: 'Lake Day Daiquiri',
      handle: 'lake-day-daiquiri-serves-16',
      price: 68.00,
      description: 'Strawberry-lemon daiquiri with Island Getaway White Rum and club soda. Sweet, tart, and perfect for a day on the lake. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'daiquiri', 'rum', 'strawberry', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 11,
      components: [
        { productId: EXISTING.islandGetawayRum, qty: 1 },
        { productId: EXISTING.fvStrawberryLemon, qty: 2 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Pink Party Lemonade',
      handle: 'pink-party-lemonade-serves-16',
      price: 82.00,
      description: 'Vodka strawberry lemonade with club soda fizz. Deep Eddy Vodka and Fresh Victor Strawberry & Lemon. The all-day boat drink. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'vodka', 'strawberry', 'lemonade', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 12,
      components: [
        { productId: EXISTING.deepEddyVodka, qty: 1 },
        { productId: EXISTING.fvStrawberryLemon, qty: 3 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Strawberry Gin Smash',
      handle: 'strawberry-gin-smash-serves-16',
      price: 74.00,
      description: 'Botanical gin meets strawberry-lemon. Dripping Springs Artisan Gin with Fresh Victor Strawberry & Lemon and club soda. Fruity, bright, and trending. Serves 16 drinks. Drink dispenser included.',
      tags: ['cocktail', 'gin', 'strawberry', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: false,
      position: 13,
      components: [
        { productId: EXISTING.drippingSpringsGin, qty: 1 },
        { productId: EXISTING.fvStrawberryLemon, qty: 2 },
        { productId: clubSoda.id, qty: 1 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    // ── Mocktails ──
    {
      title: 'Zilker Lime Fizz Mocktail',
      handle: 'zilker-lime-fizz-mocktail-serves-16',
      price: 45.00,
      description: 'All the lime-agave flavor, none of the booze. Fresh Victor Mexican Lime & Agave with club soda. A virgin margarita vibe for the non-drinkers in the group. Serves 16 drinks. Drink dispenser included.',
      tags: ['mocktail', 'alcohol-free', 'non-alcoholic', 'lime', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: true,
      position: 14,
      components: [
        { productId: EXISTING.fvLimeAgave, qty: 2 },
        { productId: clubSoda.id, qty: 2 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Cucumber Lime Spritz Mocktail',
      handle: 'cucumber-lime-spritz-mocktail-serves-16',
      price: 45.00,
      description: 'Cucumber-lime refresher with serious flavor. Fresh Victor Cucumber & Lime with club soda. Light, clean, and refreshing. Serves 16 drinks. Drink dispenser included.',
      tags: ['mocktail', 'alcohol-free', 'non-alcoholic', 'cucumber', 'lime', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: true,
      position: 15,
      components: [
        { productId: EXISTING.fvCucumberLime, qty: 2 },
        { productId: clubSoda.id, qty: 2 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Mint to Be Mocktail',
      handle: 'mint-to-be-mocktail-serves-16',
      price: 43.00,
      description: 'A virgin mojito that doesn\'t feel like a compromise. Fresh Victor Three Citrus & Mint Leaf with club soda. Bright, minty, and crushable. Serves 16 drinks. Drink dispenser included.',
      tags: ['mocktail', 'alcohol-free', 'non-alcoholic', 'mint', 'citrus', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: true,
      position: 16,
      components: [
        { productId: EXISTING.fvCitrusMint, qty: 2 },
        { productId: clubSoda.id, qty: 2 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
    {
      title: 'Strawberry Sunset Mocktail',
      handle: 'strawberry-sunset-mocktail-serves-16',
      price: 45.00,
      description: 'Fancy strawberry lemonade with club soda fizz. Fresh Victor Strawberry & Lemon makes this look as good as it tastes. Serves 16 drinks. Drink dispenser included.',
      tags: ['mocktail', 'alcohol-free', 'non-alcoholic', 'strawberry', 'lemon', 'fresh-victor', 'batched', 'serves-16'],
      isMocktail: true,
      position: 17,
      components: [
        { productId: EXISTING.fvStrawberryLemon, qty: 2 },
        { productId: clubSoda.id, qty: 2 },
        { productId: EXISTING.drinkDispenser, qty: 1 },
      ],
    },
  ];

  // ── Step 4: Create all 17 bundle products ────────────────────────
  console.log(`\nCreating ${products.length} batched cocktail products...`);

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { handle: p.handle } });
    if (existing) {
      console.log(`  SKIP (exists): ${p.title}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        title: p.title,
        handle: p.handle,
        description: p.description,
        vendor: 'Party On',
        productType: 'Batched Cocktail',
        basePrice: p.price,
        status: 'ACTIVE',
        isBundle: true,
        tags: p.tags,
        variants: {
          create: {
            title: 'Default',
            price: p.price,
            sku: p.handle,
            inventoryQuantity: 0, // virtual - uses component inventory
          },
        },
        bundleComponents: {
          create: p.components.map(c => ({
            componentProductId: c.productId,
            quantity: c.qty,
          })),
        },
      },
    });

    // Add to "Batched Cocktails" category
    await prisma.productCategory.create({
      data: {
        productId: product.id,
        categoryId: category.id,
        position: p.position,
      },
    });

    console.log(`  CREATED: ${product.title} ($${p.price}) - ${p.components.length} components - pos ${p.position}`);
  }

  // ── Summary ──────────────────────────────────────────────────────
  const count = await prisma.product.count({
    where: { productType: 'Batched Cocktail' },
  });
  console.log(`\nDone! ${count} batched cocktail products in database.`);
  console.log(`Category: "${category.title}" (handle: ${category.handle})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
