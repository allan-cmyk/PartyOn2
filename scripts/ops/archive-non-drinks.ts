/**
 * Drinks-only storefront (2026-09-10): archive the non-drink catalog items.
 *
 * Archiving = Product.status -> ARCHIVED plus the variant cascade
 * (availableForSale -> false), via the SAME helper the admin product route,
 * product-service and shopify product-sync use (cascadeVariantAvailabilityForStatus),
 * so this is not a reimplementation of the archive rules.
 *
 * Effects: gone from browse/search/upsells; new adds and checkout of these
 * variants are refused by assertVariantsPurchasable (clean HTTP 409 naming the
 * item). Existing PAID orders are untouched — OrderItem rows are snapshots.
 *
 * Reversible, but re-activating needs BOTH status=ACTIVE and variant
 * availableForSale=true — the cascade is deliberately one-way.
 *
 * The list is an explicit ID set (resolved and reviewed 2026-09-10), not a
 * live query, so apply-time catalog changes can't widen it.
 *
 * Usage: npx tsx scripts/ops/archive-non-drinks.ts [--apply]
 */

import { ProductStatus } from '@prisma/client';
import { prisma } from '../../src/lib/database/client';
import { cascadeVariantAvailabilityForStatus } from '../../src/lib/products/availability';

const APPLY = process.argv.includes('--apply');

const TO_ARCHIVE: { id: string; title: string }[] = [
  // Hemp / THC beverages
  { id: '8d766edf-e637-489c-a5db-2dbed712ab91', title: 'Cantrip Lemon Basil Seltzer • 5mg Can' },
  { id: 'c8bbb69e-4423-4f9c-a52d-03ee0bd28ac0', title: 'DANKK THC Shots • 25mg' },
  { id: 'cc0af322-3cf2-48f8-b722-bc6f5154015a', title: 'Pamos Mai Tai Spritz 5mg • 4 Pack' },
  // Food
  { id: '366e581a-ca04-4ab2-aa00-6729678fa85a', title: 'Chips and Salsa' },
  // Bundle of non-drinks (chips, salsa, limes, cups, ping pong). Its free-perk code paths
  // (SurvivalPackageBanner, HouseTabUpsell, cocktail-cowboys tile) were removed first —
  // archiving it while those still promised it would have been a broken promise.
  { id: '26fe5ebe-4940-42c5-933e-7748b4050b79', title: 'Welcome to Austin Survival Package' },
  // Syrups, bitters, garnish, seasoning, produce, sour ingredient
  { id: 'f0a808b3-6c99-47b1-8cb6-b0235cfd65c3', title: 'Liber & Co Old-Fashioned Syrup • 375ml Bottle' },
  { id: '92ed9194-240e-4ad4-a6ff-a015ddde84f9', title: 'Angostura Aromatic Bitters • 200ml Bottle' },
  { id: '30632aca-c4b6-4f32-96e9-25b2ed9d03ac', title: 'Angostura Orange Bitters • 100ml Bottle' },
  { id: '46cd9ed1-fb21-4cb4-a229-00842de9c73f', title: 'Cocktail Cherries • 8.8oz Bottle' },
  { id: '8fb08516-b3b0-4e5d-82bd-581f24060a36', title: 'Fresh Lemons • 2lb Bag' },
  { id: 'b5d42209-e0a5-4e6d-a7e0-913dc1d97585', title: 'Fresh Limes • 2lb Bag' },
  { id: '1b1ccc2c-09c4-4c9d-8f3c-95141a6c5b94', title: 'Fresh Oranges • 4lb Bag' },
  { id: 'bdaa74da-549f-4164-abec-a8461b960ad7', title: 'Herradura Agave Syrup • 23oz Bottle' },
  { id: 'c9837643-424e-4fea-b458-e4ea73f57782', title: 'Jose Cuervo Margarita Salt • 6.25oz' },
  { id: 'a1cb1b8a-7c89-4d1d-a805-23354fac8903', title: 'Liber & Co Raspberry Syrup • 375ml Bottle' },
  { id: 'efc6f474-819c-401e-b568-fcb9715826df', title: 'Mini Tajin Clasico with Lime Seasoning • 0.35oz' },
  { id: '6b857505-99fe-4206-9e8d-433c174381ff', title: 'Organic Lime Juice • 12.5oz Bottle' },
  { id: 'ca51724c-ce14-459a-b8a1-c18255d649d6', title: 'Shake & Share Grenadine Syrup • 12oz' },
  { id: 'd29389ea-a6f9-48e2-9db7-ce772c5c8dce', title: 'Simple Syrup • 355ml Bottle' },
  { id: '4b5cbd27-a1c7-4219-a1c8-4276aa094a87', title: 'Torani Pumpkin Pie Syrup • 16.5oz Bottle' },
  // Cups, barware, games, novelty
  { id: '3d258d86-9324-4ec2-a20e-01e3efbbb3be', title: '50-Can Soft Side Cooler Tote' },
  { id: 'c2dc058e-7a20-4733-beb2-0d3f64589b05', title: 'Acopa 1 oz. & 2 oz. Stainless Steel Japanese Jigger' },
  { id: '2ec98798-f912-4d86-a3ff-a60526445758', title: 'Acopa 28 oz & 18 oz Stainless Steel 2-Piece Boston Shaker Set' },
  { id: '46716e0d-3867-4f3d-b601-47ade998cf76', title: 'Acopa 4 Prong Silver Hawthorne Strainer' },
  { id: '2097d516-60fb-4bb1-8e5c-45b7b5157b68', title: 'Cocktail Mixing Glass' },
  { id: '945f6993-abfe-4320-8327-8a297e5b68ba', title: 'Cocktail Mixing Spoon • 12inches' },
  { id: '425b165d-d4be-443f-bea6-4dfac70cacca', title: 'Deck of Cards' },
  { id: '7fd897b0-0e7c-4554-b2c6-a9a64f1131fe', title: 'Disco Ball Cup with Straw' },
  { id: '884fca39-fd92-4072-ad1f-f15e53f63183', title: 'Drink Pouches w/ Straws' },
  { id: 'd646c05f-5f5a-47e3-8b5e-3cd5155acc07', title: 'Pineapple Cup with Straw' },
  { id: '5fea8073-8a66-44c2-b37e-a5627c57ff5b', title: 'Ping Pong Balls • 6pcs' },
  { id: 'e424435f-a818-400c-888f-d2acf5e65152', title: 'Plastic Champagne Flutes  · 10pk' },
  { id: 'fe41ccb9-d0f6-4e2b-b938-a7e38343a2e2', title: 'Plastic Cocktail Shaker w/ Recipe • 32oz' },
  { id: '8b13c04b-b01f-4b1b-9dbd-3ef4074866fb', title: 'Unicorn Float • 5-ft' },
];

// Must never be archived by this script, whatever the list above says.
const NEVER_ARCHIVE = new Map<string, string>([
  ['752f887e-d7e1-41ef-bd27-eb7e0e04d526', 'Bag of Ice (kept for operations)'],
  ['61d17890-f549-47b9-8ecb-632ac83dd19e', 'Solo Cups (kept — reinstated same day, 2026-09-10)'],
  ['custom', 'custom fee product (used for invoice fee line items)'],
]);

async function main(): Promise<void> {
  console.log(APPLY ? '*** APPLY MODE ***' : '*** DRY RUN (pass --apply to execute) ***');

  const blocked = TO_ARCHIVE.filter((p) => NEVER_ARCHIVE.has(p.id));
  if (blocked.length) {
    throw new Error(`Refusing: protected products in list: ${blocked.map((b) => b.title).join(', ')}`);
  }
  if (new Set(TO_ARCHIVE.map((p) => p.id)).size !== TO_ARCHIVE.length) {
    throw new Error('Refusing: duplicate IDs in list');
  }

  const rows = await prisma.product.findMany({
    where: { id: { in: TO_ARCHIVE.map((p) => p.id) } },
    select: {
      id: true,
      title: true,
      status: true,
      variants: { select: { id: true, availableForSale: true } },
    },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));

  let toDo = 0;
  let already = 0;
  let variantsToFlip = 0;
  for (const p of TO_ARCHIVE) {
    const row = byId.get(p.id);
    if (!row) throw new Error(`Refusing: product ${p.id} (${p.title}) not found`);
    if (row.title !== p.title) {
      throw new Error(`Refusing: title drift on ${p.id} — expected "${p.title}", found "${row.title}"`);
    }
    if (row.status === ProductStatus.ARCHIVED) {
      already++;
      continue;
    }
    toDo++;
    variantsToFlip += row.variants.filter((v) => v.availableForSale).length;
  }
  console.log(`list: ${TO_ARCHIVE.length} | to archive: ${toDo} | already archived: ${already} | variants to flip: ${variantsToFlip}`);

  if (!APPLY) return;

  let archived = 0;
  let flipped = 0;
  for (const p of TO_ARCHIVE) {
    const row = byId.get(p.id)!;
    if (row.status === ProductStatus.ARCHIVED) continue;
    const n = await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: p.id }, data: { status: ProductStatus.ARCHIVED } });
      return cascadeVariantAvailabilityForStatus(tx, p.id, ProductStatus.ARCHIVED);
    });
    archived++;
    flipped += n;
    console.log(`  ✓ ${p.title} (${n} variant${n === 1 ? '' : 's'} off-sale)`);
  }
  console.log(`\nDone: ${archived} archived, ${flipped} variants flipped off-sale.`);
}

main()
  .catch((e) => {
    console.error('FAILED:', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
