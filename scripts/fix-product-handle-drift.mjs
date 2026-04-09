// Fix product handle drift -- rename handles to match current titles.
// Usage:
//   node scripts/fix-product-handle-drift.mjs          (dry-run)
//   node scripts/fix-product-handle-drift.mjs --apply  (write to DB)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

// Handles with hardcoded SEO metadata/FAQ in src/app/products/[handle]/page.tsx
// MUST NOT be changed.
const PROTECTED_HANDLES = new Set([
  'miller-lite-keg',
  'pinthouse-electric-jellyfish-16oz-4-pack-can',
  'fat-es-spicy-mator-mix',
  'modelo-ranch-water-6-pack',
  'bud-light-24-can-suitcase-12oz',
  'aperol-spritz-party-pitcher-kit-16-drinks',
  'borrasca-brut-cava',
  'corona-extra-1-2-barrel',
]);

function isProtectedBySubstring(handle) {
  const h = handle.toLowerCase();
  return h.includes('schneeberg') || h.includes('poschl') || h.includes('weiss');
}

// Slugify that normalizes accents (é→e, ë→e, ñ→n, etc.) using Unicode NFKD
function slugify(s) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritic marks
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/\u2022/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/\//g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function firstNTokens(slug, n) {
  return slug.split('-').slice(0, n).join('-');
}

const products = await prisma.product.findMany({
  where: { status: 'ACTIVE' },
  select: {
    id: true,
    title: true,
    handle: true,
    _count: { select: { orderItems: true } },
  },
  orderBy: { title: 'asc' },
});

const allHandles = new Set(
  (await prisma.product.findMany({ select: { handle: true } })).map((p) => p.handle)
);

const renames = [];
const skippedHeb = [];

for (const p of products) {
  if (PROTECTED_HANDLES.has(p.handle) || isProtectedBySubstring(p.handle)) continue;

  const expected = slugify(p.title);
  const handle = p.handle;
  if (expected === handle) continue;

  // Strip trailing numeric/copy suffix before comparing
  const handleBase = handle
    .replace(/-copy$/, '')
    .replace(/-copy-\d+$/, '')
    .replace(/-\d+$/, '');

  const expectedSig = firstNTokens(expected, 2);
  const handleSig = firstNTokens(handleBase, 2);
  if (expectedSig === handleSig) continue;

  // Apostrophe false positives
  if (
    (expected.startsWith('titos-') && handle.startsWith('titos-')) ||
    (expected.startsWith('cooks-') && handle.startsWith('cooks-'))
  ) {
    continue;
  }

  if (handle.replace(/-lite-/g, '-light-') === expected) continue;
  if (expected.replace(/-lite-/g, '-light-') === handle) continue;

  if (
    expected.replace(/-and-/g, '-') === handle ||
    handle.replace(/-and-/g, '-') === expected
  ) {
    continue;
  }

  // Skip H-E-B hyphenation (heb-* is fine, leave it alone)
  if (expected.startsWith('h-e-b-') && handle.startsWith('heb-')) {
    skippedHeb.push(p);
    continue;
  }

  // Check if expected is held by another product
  const expectedTaken = allHandles.has(expected) && expected !== handle;
  if (expectedTaken) {
    console.warn(`BLOCKED: "${p.title}" wants ${expected} but it's taken`);
    continue;
  }

  renames.push({
    id: p.id,
    title: p.title,
    from: handle,
    to: expected,
    orders: p._count.orderItems,
  });
}

// Sort: most orders first
renames.sort((a, b) => b.orders - a.orders);

console.log(`\nFound ${renames.length} handle renames to apply`);
console.log(`Skipped ${skippedHeb.length} H-E-B cases (heb- prefix is fine)\n`);

console.log('from -> to (orders)');
console.log('---');
for (const r of renames) {
  console.log(`  ${r.orders.toString().padStart(3)} orders | ${r.from}`);
  console.log(`                 -> ${r.to}`);
}

if (!apply) {
  console.log(`\nDRY RUN ONLY. Re-run with --apply to write changes.`);
  await prisma.$disconnect();
  process.exit(0);
}

console.log(`\nAPPLYING ${renames.length} renames...`);
let success = 0;
let failed = 0;
for (const r of renames) {
  try {
    await prisma.product.update({
      where: { id: r.id },
      data: { handle: r.to },
    });
    success++;
  } catch (e) {
    failed++;
    console.error(`  FAILED: ${r.from} -> ${r.to}`, e.message);
  }
}

console.log(`\nDone. Success: ${success}  Failed: ${failed}`);
await prisma.$disconnect();
