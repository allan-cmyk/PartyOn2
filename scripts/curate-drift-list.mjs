// Curate the list of "egregious" handle drift cases for user review
// Usage: node scripts/curate-drift-list.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handles with hardcoded SEO metadata in src/app/products/[handle]/page.tsx
// These MUST NOT be changed even if the title drifted.
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

// Patterns that indicate "protected by name substring"
function isProtectedBySubstring(handle) {
  const h = handle.toLowerCase();
  return h.includes('schneeberg') || h.includes('poschl') || h.includes('weiss');
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\u2022/g, ' ')
    .replace(/&/g, ' and ')
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
    productType: true,
    _count: { select: { orderItems: true } },
  },
  orderBy: { title: 'asc' },
});

const allHandles = new Set(
  (await prisma.product.findMany({ select: { handle: true } })).map((p) => p.handle)
);

function handleAvailable(h, excludeId) {
  if (!allHandles.has(h)) return true;
  // Is the product holding this handle the same one we're updating?
  return false; // we'll pass excludeId logic separately
}

const egregious = [];
const minor = [];
const protectedList = [];

for (const p of products) {
  const expected = slugify(p.title);
  const handle = p.handle;

  // Skip protected handles entirely
  if (PROTECTED_HANDLES.has(handle) || isProtectedBySubstring(handle)) {
    // Still track them if they drift so user can see
    if (expected !== handle && !handle.startsWith(firstNTokens(expected, 3))) {
      protectedList.push({ product: p, expected });
    }
    continue;
  }

  // Normalize both sides to strip trailing -N / -copy suffix
  const handleBase = handle
    .replace(/-copy$/, '')
    .replace(/-copy-\d+$/, '')
    .replace(/-\d+$/, '');

  // Does handle share the first 2+ tokens of expected?
  const expectedSig = firstNTokens(expected, 2);
  const handleSig = firstNTokens(handleBase, 2);

  // Skip if first 2 tokens match (minor drift only)
  if (expectedSig === handleSig) continue;

  // Skip Tito's apostrophe false-positive: "tito-s-..." vs "titos-..."
  if (
    (expected.startsWith('tito-s-') && handle.startsWith('titos-')) ||
    (expected.startsWith('cook-s-') && handle.startsWith('cooks-'))
  ) {
    continue;
  }

  // Skip light-beer cosmetic "lite" vs "light"
  if (handle.replace(/-lite-/g, '-light-') === expected) continue;
  if (expected.replace(/-lite-/g, '-light-') === handle) continue;

  // Skip "aix-ros" vs "aix-rose" (ó apostrophe drift)
  if (expected.includes('ros-') && handle.includes('rose-')) continue;

  // Skip "big-hat-jalape-o" vs "jalapeno" (ñ)
  if (expected.includes('jalape-o') && handle.includes('jalapeno')) continue;

  // Skip "barefoot-bright-and-breezy" vs "barefoot-bright-breezy"
  if (
    expected.replace(/-and-/g, '-') === handle ||
    handle.replace(/-and-/g, '-') === expected
  ) {
    continue;
  }

  // Skip "chateau-desclans" vs "chateau-d-esclans"
  if (expected.replace(/-d-/g, '-d') === handle.replace(/-d-/g, '-d')) continue;

  // Check if expected handle is already taken
  const expectedTaken = allHandles.has(expected) && expected !== handle;

  // Propose a fallback handle if the expected one is taken
  let proposed = expected;
  let blockedBy = null;
  if (expectedTaken) {
    const blocker = await prisma.product.findUnique({
      where: { handle: expected },
      select: { id: true, title: true, status: true },
    });
    blockedBy = blocker;
    proposed = `${expected}-v2`;
  }

  egregious.push({
    id: p.id,
    title: p.title,
    handle: p.handle,
    expected,
    proposed,
    blockedBy,
    orders: p._count.orderItems,
  });
}

// Sort: highest-order products first (most urgent)
egregious.sort((a, b) => b.orders - a.orders);

console.log(`\n============================================================`);
console.log(`CURATED EGREGIOUS DRIFT LIST (${egregious.length} products)`);
console.log(`============================================================`);
console.log(`Filtered from 109 total drift cases by removing:`);
console.log(`  - 8 protected handles (hardcoded SEO / FAQ)`);
console.log(`  - Tito's/Cook's apostrophe false-positives`);
console.log(`  - coors-lite/coors-light cosmetic variants`);
console.log(`  - "and" vs "&" differences`);
console.log(`  - "rosé"/"jalapeño" diacritic differences`);
console.log(`  - Any product where first 2 tokens of handle match title`);
console.log();

for (const e of egregious) {
  console.log(`ID: ${e.id}  (${e.orders} orders)`);
  console.log(`  Title:    "${e.title}"`);
  console.log(`  Current:  ${e.handle}`);
  console.log(`  Proposed: ${e.proposed}${e.blockedBy ? `  [BLOCKED by ${e.blockedBy.status} product "${e.blockedBy.title}"]` : ''}`);
  console.log();
}

console.log(`\n============================================================`);
console.log(`BLOCKED CASES (expected handle is held by another product)`);
console.log(`============================================================`);
const blocked = egregious.filter((e) => e.blockedBy);
console.log(`Count: ${blocked.length}\n`);
for (const e of blocked) {
  console.log(`  "${e.title}"`);
  console.log(`    wants: ${e.expected}`);
  console.log(`    held by ${e.blockedBy.status} "${e.blockedBy.title}" (id ${e.blockedBy.id})`);
  console.log();
}

console.log(`\nTotal actionable: ${egregious.length}`);
console.log(`Of which ${blocked.length} need the blocking product resolved first.`);

await prisma.$disconnect();
