/**
 * Reorganize product catalog based on sales data from tmp-sales-data.xlsx
 *
 * Steps:
 * 1. Create 3 new categories (chill-supplies, food, rentals)
 * 2. Read xlsx, match products to DB by normalized title
 * 3. Update productType for new-category products
 * 4. Rebuild all category assignments with position = sales rank
 * 5. Set Category.position for display order
 *
 * Usage: set -a && source .env.local && set +a && node scripts/reorganize-catalog.mjs
 * Add --dry-run to preview without making changes.
 */

import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

// Map spreadsheet category names to DB category handles
const CATEGORY_MAP = {
  'Seltzers & RTDs': 'seltzers-rtds',
  'Light Beer': 'light-beer',
  'Craft Beer': 'craft-beer',
  'Tequila': 'spirits-tequila',
  'Vodka': 'spirits-vodka',
  'Whiskey & Bourbon': 'spirits-whiskey',
  'Rum': 'spirits-rum',
  'Gin': 'spirits-gin',
  'Liqueurs': 'spirits-liqueurs',
  'Sparkling & Rosé': 'sparkling-wine',
  'White Wine': 'white-wine',
  'Red Wine': 'red-wine',
  'Mixers': 'mixers',
  'Cocktail Kits': 'cocktail-kits',
  'Kegs & Equipment': 'kegs',
  'Weekend Party Supplies': 'weekend-party-supplies',
  'Chill Supplies': 'chill-supplies',
  'Food': 'food',
  'Rentals': 'rentals',
};

// Spirit sub-categories also get assigned to parent 'spirits'
const SPIRIT_HANDLES = new Set([
  'spirits-tequila', 'spirits-vodka', 'spirits-whiskey',
  'spirits-rum', 'spirits-gin', 'spirits-liqueurs',
]);

// productType values for each category
const CATEGORY_PRODUCT_TYPE = {
  'seltzers-rtds': null, // keep existing (Seltzer / RTD Cocktail)
  'light-beer': null,
  'craft-beer': null,
  'spirits-tequila': null,
  'spirits-vodka': null,
  'spirits-whiskey': null,
  'spirits-rum': null,
  'spirits-gin': null,
  'spirits-liqueurs': null,
  'sparkling-wine': null,
  'white-wine': null,
  'red-wine': null,
  'mixers': null,
  'cocktail-kits': null,
  'kegs': null,
  'weekend-party-supplies': null,
  'chill-supplies': 'Chill Supply',
  'food': 'Food',
  'rentals': 'Rental',
};

// Category display order (position)
const CATEGORY_ORDER = {
  'spirits': 0,
  'seltzers-rtds': 1,
  'light-beer': 2,
  'craft-beer': 3,
  'spirits-tequila': 4,
  'spirits-vodka': 5,
  'spirits-whiskey': 6,
  'spirits-rum': 7,
  'spirits-gin': 8,
  'spirits-liqueurs': 9,
  'sparkling-wine': 10,
  'white-wine': 11,
  'red-wine': 12,
  'mixers': 13,
  'cocktail-kits': 14,
  'kegs': 15,
  'weekend-party-supplies': 16,
  'chill-supplies': 17,
  'food': 18,
  'rentals': 19,
};

// Normalize title for matching
function normalize(title) {
  return title
    .replace(/[•·\u2022\u00b7]/g, '') // bullet chars
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// --- Step 1: Read xlsx ---
function readSalesData() {
  const wb = XLSX.readFile('tmp-sales-data.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

  let currentCat = null;
  let rank = 0;
  const products = [];

  for (const row of rows) {
    const num = row['#'];
    const product = row['Product'];
    if (typeof num === 'string' && num.includes('(')) {
      currentCat = num.split('(')[0].trim();
      rank = 0;
    } else if (product && currentCat) {
      rank++;
      products.push({
        rank,
        category: currentCat,
        handle: CATEGORY_MAP[currentCat],
        title: product,
        normalized: normalize(product),
        unitsSold: row['Units Sold'] || 0,
      });
    }
  }

  console.log(`Read ${products.length} products from xlsx across ${Object.keys(CATEGORY_MAP).length} categories`);
  return products;
}

// --- Step 2: Match to DB products ---
async function matchProducts(salesProducts) {
  const dbProducts = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, title: true, productType: true },
  });
  console.log(`Found ${dbProducts.length} active products in DB`);

  // Build normalized title -> product map
  const dbMap = new Map();
  for (const p of dbProducts) {
    const key = normalize(p.title);
    if (dbMap.has(key)) {
      // Duplicate normalized title; keep first
      console.log(`  WARN: duplicate normalized title: "${p.title}"`);
    } else {
      dbMap.set(key, p);
    }
  }

  let matched = 0;
  let unmatched = 0;
  const unmatchedList = [];

  for (const sp of salesProducts) {
    const dbProduct = dbMap.get(sp.normalized);
    if (dbProduct) {
      sp.productId = dbProduct.id;
      sp.currentProductType = dbProduct.productType;
      matched++;
    } else {
      unmatched++;
      unmatchedList.push(`  [${sp.category}] "${sp.title}"`);
    }
  }

  console.log(`Matched: ${matched}, Unmatched: ${unmatched}`);
  if (unmatchedList.length > 0) {
    console.log('Unmatched products:');
    unmatchedList.forEach(l => console.log(l));
  }

  return salesProducts.filter(sp => sp.productId);
}

// --- Step 3: Create new categories ---
async function createNewCategories() {
  const newCats = [
    { handle: 'chill-supplies', title: 'Chill Supplies' },
    { handle: 'food', title: 'Food' },
    { handle: 'rentals', title: 'Rentals' },
  ];

  for (const cat of newCats) {
    const existing = await prisma.category.findUnique({ where: { handle: cat.handle } });
    if (existing) {
      console.log(`Category "${cat.handle}" already exists (id: ${existing.id})`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would create category: ${cat.handle}`);
      continue;
    }
    const created = await prisma.category.create({
      data: {
        handle: cat.handle,
        title: cat.title,
        position: CATEGORY_ORDER[cat.handle],
      },
    });
    console.log(`Created category "${cat.handle}" (id: ${created.id})`);
  }
}

// --- Step 4: Update productType for new-category products ---
async function updateProductTypes(matchedProducts) {
  let updated = 0;
  for (const sp of matchedProducts) {
    const newType = CATEGORY_PRODUCT_TYPE[sp.handle];
    if (!newType) continue; // Only update for chill-supplies, food, rentals
    if (sp.currentProductType === newType) continue;

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would update productType: "${sp.title}" -> ${newType} (was: ${sp.currentProductType})`);
    } else {
      await prisma.product.update({
        where: { id: sp.productId },
        data: { productType: newType },
      });
    }
    updated++;
  }
  console.log(`Updated ${updated} product types`);
}

// --- Step 5: Rebuild category assignments ---
async function rebuildCategoryAssignments(matchedProducts) {
  // Get all category handles we care about (the 19 + spirits parent)
  const allHandles = [...Object.values(CATEGORY_MAP), 'spirits'];
  const categories = await prisma.category.findMany({
    where: { handle: { in: allHandles } },
  });
  const catByHandle = new Map(categories.map(c => [c.handle, c]));

  // Verify all categories exist
  for (const handle of Object.values(CATEGORY_MAP)) {
    if (!catByHandle.has(handle)) {
      if (DRY_RUN) {
        console.log(`  [DRY RUN] Category "${handle}" not in DB yet (would be created in step 2)`);
      } else {
        throw new Error(`Category "${handle}" not found in DB! Run createNewCategories first.`);
      }
    }
  }

  const spiritsCategory = catByHandle.get('spirits');
  if (!spiritsCategory) {
    throw new Error('spirits parent category not found in DB!');
  }

  // Group products by category handle
  const byHandle = new Map();
  for (const sp of matchedProducts) {
    if (!byHandle.has(sp.handle)) byHandle.set(sp.handle, []);
    byHandle.get(sp.handle).push(sp);
  }

  // Curated collections to leave untouched
  const CURATED = new Set([
    'bachelor-favorites', 'bachelorette-booze', 'boat-essentials',
    'welcome-to-austin-packages', 'favorites-home-page',
  ]);

  let totalDeleted = 0;
  let totalInserted = 0;

  for (const [handle, products] of byHandle) {
    if (CURATED.has(handle)) continue;
    const category = catByHandle.get(handle);
    if (!category) continue;

    if (DRY_RUN) {
      console.log(`[DRY RUN] ${handle}: would delete existing, insert ${products.length} products`);
      continue;
    }

    // Delete existing assignments for this category
    const deleted = await prisma.productCategory.deleteMany({
      where: { categoryId: category.id },
    });
    totalDeleted += deleted.count;

    // Insert new assignments with position = rank
    const insertData = products.map(sp => ({
      productId: sp.productId,
      categoryId: category.id,
      position: sp.rank,
    }));

    await prisma.productCategory.createMany({
      data: insertData,
      skipDuplicates: true,
    });
    totalInserted += insertData.length;

    console.log(`  ${handle}: deleted ${deleted.count}, inserted ${insertData.length} (${products.length > 48 ? `${products.length} total, 48 displayed` : `${products.length} total`})`);
  }

  // Now handle spirits parent: add all spirit sub-category products
  if (!DRY_RUN) {
    const spiritProducts = matchedProducts.filter(sp => SPIRIT_HANDLES.has(sp.handle));

    // Delete existing spirits parent assignments
    const deleted = await prisma.productCategory.deleteMany({
      where: { categoryId: spiritsCategory.id },
    });
    totalDeleted += deleted.count;

    // Build spirits parent assignments - position based on overall spirit sales rank
    // Sort all spirit products by units sold descending to get global spirit rank
    spiritProducts.sort((a, b) => b.unitsSold - a.unitsSold);
    const spiritInsertData = spiritProducts.map((sp, idx) => ({
      productId: sp.productId,
      categoryId: spiritsCategory.id,
      position: idx + 1,
    }));

    await prisma.productCategory.createMany({
      data: spiritInsertData,
      skipDuplicates: true,
    });
    totalInserted += spiritInsertData.length;
    console.log(`  spirits (parent): deleted ${deleted.count}, inserted ${spiritInsertData.length}`);
  }

  console.log(`Total: deleted ${totalDeleted}, inserted ${totalInserted} category assignments`);
}

// --- Step 6: Set Category.position for display order ---
async function setCategoryPositions() {
  let updated = 0;
  for (const [handle, position] of Object.entries(CATEGORY_ORDER)) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would set ${handle} position = ${position}`);
      continue;
    }
    try {
      await prisma.category.update({
        where: { handle },
        data: { position },
      });
      updated++;
    } catch (e) {
      console.log(`  WARN: Could not update position for "${handle}": ${e.message}`);
    }
  }
  console.log(`Updated ${updated} category positions`);
}

// --- Main ---
async function main() {
  console.log(DRY_RUN ? '=== DRY RUN MODE ===' : '=== LIVE MODE ===');
  console.log();

  console.log('--- Step 1: Read sales data ---');
  const salesProducts = readSalesData();

  console.log('\n--- Step 2: Create new categories ---');
  await createNewCategories();

  console.log('\n--- Step 3: Match products to DB ---');
  const matchedProducts = await matchProducts(salesProducts);

  console.log('\n--- Step 4: Update product types ---');
  await updateProductTypes(matchedProducts);

  console.log('\n--- Step 5: Rebuild category assignments ---');
  await rebuildCategoryAssignments(matchedProducts);

  console.log('\n--- Step 6: Set category positions ---');
  await setCategoryPositions();

  console.log('\n--- Done! ---');

  // Summary
  const byHandle = new Map();
  for (const sp of matchedProducts) {
    if (!byHandle.has(sp.handle)) byHandle.set(sp.handle, 0);
    byHandle.set(sp.handle, byHandle.get(sp.handle) + 1);
  }
  console.log('\nCategory product counts:');
  for (const [handle, count] of [...byHandle.entries()].sort((a, b) => (CATEGORY_ORDER[a[0]] || 99) - (CATEGORY_ORDER[b[0]] || 99))) {
    console.log(`  ${handle}: ${count}${count > 48 ? ` (48 displayed, ${count - 48} hidden)` : ''}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
