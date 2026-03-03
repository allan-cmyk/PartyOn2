// Cocktail Kits Collection Cleanup Script
// Renames product titles, removes non-kits from collection, deletes duplicate, reorders

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// A. Title renames (old -> new)
const titleRenames = [
  ['Aperol Spritz Party Pitcher Kit (16 Drinks)', 'Aperol Spritz Cocktail Kit - Serves 16'],
  ['Arnold Palmer Non-Alcoholic (Party Pitcher Kit - 1 gallon)', 'Arnold Palmer Mocktail Kit - Makes 1 Gallon'],
  ['Austin Rita Party Pitcher Kit (24 drinks)', 'Austin Rita Cocktail Kit - Serves 24'],
  ['Blue Margarita Party Pitcher Kit (24 drinks)', 'Blue Margarita Cocktail Kit - Serves 24'],
  ['Cantarito Non-Alcoholic Party Pitcher Kit (1 gallon)', 'Cantarito Mocktail Kit - Makes 1 Gallon'],
  ['Cosmo Punch Party Pitcher Kit (30 drinks)', 'Cosmo Punch Cocktail Kit - Serves 30'],
  ['Floradora Party Pitcher Kit (16 drinks)', 'Floradora Cocktail Kit - Serves 16'],
  ['Perfect Paloma Party Pitcher Kit', 'Perfect Paloma Cocktail Kit'],
  ['Skinny Margarita Pitcher Kit (20 drinks per pitcher)', 'Skinny Margarita Cocktail Kit - Serves 20'],
  ['Strawberry Margarita Pitcher Kit', 'Strawberry Margarita Cocktail Kit'],
  ['Tequila Sunrise Party Pitcher Kit (16 drinks)', 'Tequila Sunrise Cocktail Kit - Serves 16'],
  ["Tito's Lemonade Party Pitcher Kit (16 drinks)", "Tito's Lemonade Cocktail Kit - Serves 16"],
  ['Bloody Mary (Stirred Cocktail Kit)', 'Bloody Mary Cocktail Kit'],
  ['The Bismo (Stirred Cocktail Kit)', 'The Bismo Cocktail Kit'],
  ['The Classic Austin Rita (Shaken Cocktail Kit)', 'Classic Austin Rita Cocktail Kit'],
  ['The Classic Texas Cosmopolitan (Shaken Cocktail Kit)', 'Classic Texas Cosmopolitan Cocktail Kit'],
  ['Apple Cider Aperol Spritz Bundle', 'Apple Cider Aperol Spritz Cocktail Kit'],
  ['Austin Rita Cocktail & Bar Setup', 'Austin Rita Cocktail Kit with Bar Setup'],
  ['Chocolate Covered Strawberry Martini Kit', 'Chocolate Strawberry Martini Cocktail Kit'],
  ['Coquito Cocktail Kit (Puerto-Rican Eggnog)', 'Coquito Cocktail Kit'],
  ['Electric Blue Lemonade Cocktail Kit (16 drinks)', 'Electric Blue Lemonade Cocktail Kit - Serves 16'],
  ['La Caza Rita Kit', 'La Caza Rita Cocktail Kit'],
  ['Pumpkin Pie Martini Kit', 'Pumpkin Pie Martini Cocktail Kit'],
  ['Pumpkin Spice Old-Fashioned', 'Pumpkin Spice Old-Fashioned Cocktail Kit'],
  ['Rum Punch Gallon Dispenser Kit (20 drinks)', 'Rum Punch Cocktail Kit - Serves 20'],
  ['The Hill Country Old-Fashioned (Cocktail Kit)', 'Hill Country Old-Fashioned Cocktail Kit'],
  ['Cuba Libre - Single Cocktail Kit', 'Cuba Libre Cocktail Kit - Single Serve'],
  ['Ranch Water Single Cocktail', 'Ranch Water Cocktail Kit - Single Serve'],
  ['Run it Back Chiefs Cocktail Kit (12-drink kit)', 'Run it Back Chiefs Cocktail Kit - Serves 12'],
  ['Run it Back Chiefs Cocktail Kit (2-drink kit)', 'Run it Back Chiefs Cocktail Kit - Serves 2'],
  ['Verde Punch Cocktail Kit (2-drink kit)', 'Verde Punch Cocktail Kit - Serves 2'],
];

// B. Products to remove from cocktail-kits collection (by title substring)
const removeFromCollection = [
  'Fresh Limes - 2lb Bag',
  'Austin Cocktails Sparkling Ruby Red',
  'Big Hat Prickly Pear Paloma',
  'Tropical Rum Punch (dbl)',
  'Austin Whiskey Gift Basket',
  'California Sober/Gardening Gift Basket',
  'Hair of the Dog Gift Basket - Bloody Marys',
  'Hair of the Dog Gift Basket - Mimosas',
  'Still Austin Old-Fashioned Gift Basket',
];

// D. Final ordering (0-indexed positions)
const finalOrder = [
  // Margaritas/Ritas (best sellers)
  'Austin Rita Cocktail Kit - Serves 24',
  'Classic Austin Rita Cocktail Kit',
  'Austin Rita Cocktail Kit with Bar Setup',
  'Skinny Margarita Cocktail Kit - Serves 20',
  'Blue Margarita Cocktail Kit - Serves 24',
  'Strawberry Margarita Cocktail Kit',
  'La Caza Rita Cocktail Kit',
  'Spicy Rita Cocktail Kit',
  // Other party-size kits
  'Perfect Paloma Cocktail Kit',
  'Aperol Spritz Cocktail Kit - Serves 16',
  'Apple Cider Aperol Spritz Cocktail Kit',
  'Hugo Spritz Cocktail Kit',
  "Tito's Lemonade Cocktail Kit - Serves 16",
  'Cosmo Punch Cocktail Kit - Serves 30',
  'Classic Texas Cosmopolitan Cocktail Kit',
  'Floradora Cocktail Kit - Serves 16',
  'Tequila Sunrise Cocktail Kit - Serves 16',
  'Rum Punch Cocktail Kit - Serves 20',
  'Electric Blue Lemonade Cocktail Kit - Serves 16',
  'Espresso Martini Cocktail Kit',
  'Chocolate Strawberry Martini Cocktail Kit',
  'Pink 75 Cocktail Kit',
  // Specialty cocktails
  'Hill Country Old-Fashioned Cocktail Kit',
  'Pumpkin Spice Old-Fashioned Cocktail Kit',
  'Bloody Mary Cocktail Kit',
  'The Bismo Cocktail Kit',
  'Coquito Cocktail Kit',
  'Pumpkin Pie Martini Cocktail Kit',
  'Peppermint Martini Cocktail Kit',
  'Apple Cider Mule Cocktail Kit',
  // Single-serve
  'Cuba Libre Cocktail Kit - Single Serve',
  'Ranch Water Cocktail Kit - Single Serve',
  'Verde Punch Cocktail Kit - Serves 2',
  'Run it Back Chiefs Cocktail Kit - Serves 2',
  'Run it Back Chiefs Cocktail Kit - Serves 12',
  // Mocktails
  'Arnold Palmer Mocktail Kit - Makes 1 Gallon',
  'Cantarito Mocktail Kit - Makes 1 Gallon',
  'Cranberry Ginger Fizz Mocktail Kit',
  'Verde Punch Cocktail Kit',
];

async function main() {
  // Get the cocktail-kits category
  const category = await prisma.category.findFirst({
    where: { handle: 'cocktail-kits' },
  });
  if (!category) {
    console.error('cocktail-kits category not found!');
    process.exit(1);
  }
  console.log(`Found category: ${category.name} (${category.id})`);

  // Get all products in the collection
  const productCategories = await prisma.productCategory.findMany({
    where: { categoryId: category.id },
    include: { product: true },
  });
  console.log(`Products in collection: ${productCategories.length}`);

  // --- A. Rename titles ---
  console.log('\n--- RENAMING TITLES ---');
  for (const [oldTitle, newTitle] of titleRenames) {
    const result = await prisma.product.updateMany({
      where: { title: oldTitle },
      data: { title: newTitle },
    });
    if (result.count > 0) {
      console.log(`  Renamed: "${oldTitle}" -> "${newTitle}"`);
    } else {
      console.log(`  NOT FOUND: "${oldTitle}"`);
    }
  }

  // --- B. Remove non-kits from collection ---
  console.log('\n--- REMOVING NON-KITS FROM COLLECTION ---');
  for (const titleSubstr of removeFromCollection) {
    const product = await prisma.product.findFirst({
      where: { title: { contains: titleSubstr, mode: 'insensitive' } },
    });
    if (product) {
      const deleted = await prisma.productCategory.deleteMany({
        where: { productId: product.id, categoryId: category.id },
      });
      if (deleted.count > 0) {
        console.log(`  Removed from collection: "${product.title}"`);
      } else {
        console.log(`  Not in collection: "${product.title}"`);
      }
    } else {
      console.log(`  Product not found: "${titleSubstr}"`);
    }
  }

  // --- C. Delete duplicate Cranberry Ginger Fizz Mocktail Kit ($64.99) ---
  console.log('\n--- DELETING DUPLICATE ---');
  const cranberryDupes = await prisma.product.findMany({
    where: { title: { contains: 'Cranberry Ginger Fizz Mocktail Kit', mode: 'insensitive' } },
    include: { variants: true },
  });
  console.log(`  Found ${cranberryDupes.length} Cranberry Ginger Fizz products`);

  // Find the $64.99 one to delete (keep the $59.99 one)
  const toDelete = cranberryDupes.find(p =>
    p.variants.some(v => Number(v.price) >= 64)
  );
  if (toDelete) {
    console.log(`  Deleting duplicate: "${toDelete.title}" (id: ${toDelete.id})`);
    // Cascade deletes variants, images, category links
    await prisma.product.delete({ where: { id: toDelete.id } });
    console.log(`  Deleted successfully`);
  } else {
    console.log(`  No $64.99 duplicate found`);
  }

  // --- D. Reorder the final collection ---
  console.log('\n--- REORDERING COLLECTION ---');
  // Re-fetch the collection after removals
  const remaining = await prisma.productCategory.findMany({
    where: { categoryId: category.id },
    include: { product: true },
  });
  console.log(`  Products remaining: ${remaining.length}`);

  let ordered = 0;
  for (let i = 0; i < finalOrder.length; i++) {
    const title = finalOrder[i];
    const pc = remaining.find(r => r.product.title === title);
    if (pc) {
      await prisma.productCategory.update({
        where: { productId_categoryId: { productId: pc.productId, categoryId: pc.categoryId } },
        data: { position: i },
      });
      ordered++;
    } else {
      console.log(`  Not found for ordering: "${title}"`);
    }
  }
  // Any products not in the order list get pushed to the end
  let endPos = finalOrder.length;
  for (const pc of remaining) {
    if (!finalOrder.includes(pc.product.title)) {
      console.log(`  Unordered product pushed to end: "${pc.product.title}" (pos ${endPos})`);
      await prisma.productCategory.update({
        where: { productId_categoryId: { productId: pc.productId, categoryId: pc.categoryId } },
        data: { position: endPos++ },
      });
    }
  }
  console.log(`  Ordered ${ordered} products`);

  // --- Verify ---
  console.log('\n--- FINAL COLLECTION ---');
  const final = await prisma.productCategory.findMany({
    where: { categoryId: category.id },
    include: { product: { include: { variants: true } } },
    orderBy: { position: 'asc' },
  });
  console.log(`Total products: ${final.length}`);
  for (const pc of final) {
    const price = pc.product.variants[0] ? Number(pc.product.variants[0].price).toFixed(2) : '?';
    console.log(`  ${String(pc.position).padStart(2)}: ${pc.product.title} ($${price})`);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
