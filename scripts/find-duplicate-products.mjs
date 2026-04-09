// Find duplicate products & handle drift
// Usage: node scripts/find-duplicate-products.mjs [--json]
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';

const prisma = new PrismaClient();
const jsonMode = process.argv.includes('--json');

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/\u2022/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const products = await prisma.product.findMany({
  select: {
    id: true,
    title: true,
    handle: true,
    status: true,
    productType: true,
    vendor: true,
    basePrice: true,
    createdAt: true,
    updatedAt: true,
    variants: {
      select: {
        id: true,
        sku: true,
        price: true,
        inventoryItems: { select: { quantity: true } },
      },
    },
    _count: { select: { orderItems: true } },
  },
  orderBy: { title: 'asc' },
});

function describe(p) {
  const totalStock = p.variants.reduce(
    (s, v) => s + v.inventoryItems.reduce((ss, i) => ss + i.quantity, 0),
    0
  );
  const prices = p.variants.map((v) => Number(v.price)).filter((x) => x > 0);
  const priceRange = prices.length
    ? prices[0] === prices[prices.length - 1]
      ? `$${prices[0]}`
      : `$${Math.min(...prices)}-$${Math.max(...prices)}`
    : `$${Number(p.basePrice)}`;
  return `    ${p.status.padEnd(9)} ord:${p._count.orderItems.toString().padStart(3)} stk:${totalStock.toString().padStart(4)} ${priceRange.padEnd(14)} "${p.title}" [${p.handle}]`;
}

// -------------------------------------------------------
// PROBLEM A: Stale copies (handle ends in -copy / -N)
// -------------------------------------------------------
const copySuffixed = products.filter((p) =>
  /-copy$|-copy-\d+$|-\d+$/.test(p.handle)
);

console.log(`\n======================================`);
console.log(`PROBLEM A: Products with -copy / -N handle suffix`);
console.log(`======================================`);
console.log(`Total found: ${copySuffixed.length}`);
const copyByStatus = copySuffixed.reduce((m, p) => {
  m[p.status] = (m[p.status] || 0) + 1;
  return m;
}, {});
console.log(`  By status:`, copyByStatus);
console.log();

// For each copy-suffixed product, look for its "parent" (handle without suffix)
const byHandle = new Map(products.map((p) => [p.handle, p]));
const staleCopies = [];
const orphanCopies = [];

for (const p of copySuffixed) {
  const base = p.handle
    .replace(/-copy$/, '')
    .replace(/-copy-\d+$/, '')
    .replace(/-\d+$/, '');
  const parent = byHandle.get(base);
  if (parent && parent.id !== p.id) {
    staleCopies.push({ copy: p, parent });
  } else {
    orphanCopies.push(p);
  }
}

console.log(`\n--- A.1: Copy-suffixed products WITH matching parent handle (${staleCopies.length}) ---`);
console.log(`These are the classic stale copies -- can likely archive the worse one of each pair.\n`);
for (const { copy, parent } of staleCopies) {
  console.log(`>>> Pair`);
  console.log(`  PARENT:`);
  console.log(describe(parent));
  console.log(`  COPY:`);
  console.log(describe(copy));
  console.log();
}

console.log(`\n--- A.2: Copy-suffixed products with NO matching parent handle (${orphanCopies.length}) ---`);
console.log(`These have -copy/-N handles but no longer have a parent -- the original was renamed or deleted.`);
console.log(`Most of these are actually real products that just have a stale handle suffix.\n`);
// Just summarize -- don't dump all
const orphanActive = orphanCopies.filter((p) => p.status === 'ACTIVE');
console.log(`  ACTIVE: ${orphanActive.length}`);
console.log(`  ARCHIVED: ${orphanCopies.filter((p) => p.status === 'ARCHIVED').length}`);
console.log(`  DRAFT: ${orphanCopies.filter((p) => p.status === 'DRAFT').length}`);
console.log(`\n  First 10 ACTIVE orphan copies:`);
for (const p of orphanActive.slice(0, 10)) console.log(describe(p));

// -------------------------------------------------------
// PROBLEM B: Handle drift (handle doesn't match title)
// -------------------------------------------------------
console.log(`\n\n======================================`);
console.log(`PROBLEM B: Handle drift (handle does not match title at all)`);
console.log(`======================================`);
console.log(`Comparing expected slug of current title vs actual handle.\n`);

const drift = [];
for (const p of products) {
  const expected = slugify(p.title);
  // Strip trailing number/copy on the actual handle for comparison
  const actualBase = p.handle
    .replace(/-copy$/, '')
    .replace(/-copy-\d+$/, '')
    .replace(/-\d+$/, '');
  // "Drift" means the first few words of the expected slug don't appear at the start of the actual handle
  // Use the first 3 tokens of the expected slug as a signature
  const sig = expected.split('-').slice(0, 3).join('-');
  if (!actualBase.startsWith(sig) && !expected.startsWith(actualBase.split('-').slice(0, 3).join('-'))) {
    drift.push({ product: p, expected, actualBase });
  }
}

console.log(`Total drift cases: ${drift.length}`);
const driftActive = drift.filter((d) => d.product.status === 'ACTIVE');
console.log(`  ACTIVE: ${driftActive.length}`);
console.log(`  ARCHIVED: ${drift.filter((d) => d.product.status === 'ARCHIVED').length}\n`);

console.log(`--- ALL ACTIVE drift cases (${driftActive.length}) ---`);
for (const { product: p, expected } of driftActive) {
  console.log(`\n  Title:    "${p.title}"`);
  console.log(`  Handle:   ${p.handle}`);
  console.log(`  Expected: ${expected}`);
  console.log(`  Status:   ${p.status} | Orders: ${p._count.orderItems} | ID: ${p.id}`);
}

// -------------------------------------------------------
// PROBLEM C: Duplicate SKUs
// -------------------------------------------------------
console.log(`\n\n======================================`);
console.log(`PROBLEM C: Duplicate SKUs across variants`);
console.log(`======================================`);
const bySku = new Map();
for (const p of products) {
  for (const v of p.variants) {
    if (!v.sku || v.sku.trim() === '') continue;
    if (!bySku.has(v.sku)) bySku.set(v.sku, []);
    bySku.get(v.sku).push({ product: p, variant: v });
  }
}
const skuDupes = [...bySku.entries()].filter(([, arr]) => arr.length > 1);
console.log(`Total: ${skuDupes.length}\n`);
for (const [sku, arr] of skuDupes) {
  console.log(`\nSKU: ${sku}`);
  for (const { product: p } of arr) console.log(describe(p));
}

if (jsonMode) {
  writeFileSync(
    'duplicate-products-report.json',
    JSON.stringify(
      {
        staleCopies,
        orphanCopies,
        drift,
        skuDupes: skuDupes.map(([sku, arr]) => ({ sku, products: arr.map((a) => a.product) })),
      },
      null,
      2
    )
  );
  console.log('\nWrote duplicate-products-report.json');
}

await prisma.$disconnect();
