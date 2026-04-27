/**
 * Apply ONLY high-confidence cost matches from the 2026-04-27 invoice batch.
 *
 * Selection rule: existing variant cost must validate the new cost within 50%
 * tolerance, OR the brand match is so clear that it's effectively certain.
 * Everything else needs manual review (ambiguous matches, brand mismatches,
 * pack-size mismatches between invoice and variant).
 *
 * Usage: POSTGRES_URL=<prod> npx tsx scripts/apply-safe-invoice-costs-2026-04-27.ts [--apply]
 */

import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

// (variantSearch, newCost, source) — variantSearch is a unique title fragment.
const SAFE: Array<{ search: string; cost: number; source: string }> = [
  // Validates within 50% of existing — these all matched in dry run.
  { search: 'Aperol Aperitivo', cost: 25.00, source: 'SG-9130935575 line 557367 (existing=$25, new=$25)' },
  { search: 'Four Roses Bourbon • 750ml', cost: 22.49, source: 'RN-7417538 line 22281398 (existing=$21.74, new=$22.49)' },
  { search: 'Island Getaway Coconut Rum', cost: 15.99, source: 'RN-7417538 line 22467396 (existing=$14.99, new=$15.99)' },
  { search: 'Lunazul Blanco Tequila • 750ml', cost: 17.25, source: 'SG-9131151365 line 186579 (existing=$17.25, new=$17.25)' },
  { search: 'Lalo Blanco Tequila', cost: 36.99, source: 'SG-9131151365 line 693555 (existing=$36.99, new=$36.99)' },
  { search: 'Cutwater Lime Margarita', cost: 10.16, source: 'BR-5446611 line 63700 (existing=$10.16, new=$10.16)' },
  // Brand-clear, no existing cost: Chateau Ste. Michelle is its own brand, no other variants would collide.
  { search: 'Chateau St. Michelle Sauvignon Blanc', cost: 9.00, source: 'SG-9130935575 line 512979 (no existing; brand-clear match)' },
];

async function main() {
  console.log(`[safe-costs] ${APPLY ? 'APPLYING' : 'DRY RUN'}: ${SAFE.length} variants`);
  console.log();

  for (const item of SAFE) {
    const matches = await prisma.productVariant.findMany({
      where: {
        OR: [
          { product: { title: { contains: item.search, mode: 'insensitive' } } },
          { title: { contains: item.search, mode: 'insensitive' } },
        ],
      },
      include: { product: { select: { title: true } } },
    });

    if (matches.length === 0) {
      console.log(`  ✗ NO MATCH    "${item.search}"  (source: ${item.source})`);
      continue;
    }
    if (matches.length > 1) {
      console.log(`  ✗ MULTIPLE    "${item.search}"  found ${matches.length}: ${matches.map((m) => m.product.title).slice(0, 3).join(', ')}`);
      continue;
    }

    const v = matches[0];
    const label = `${v.product.title}${v.title && v.title !== 'Default Title' ? ` / ${v.title}` : ''}`;
    const existing = v.costPerUnit ? Number(v.costPerUnit) : null;

    if (APPLY) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { costPerUnit: new Prisma.Decimal(item.cost) },
      });
    }

    console.log(`  ✓ ${APPLY ? 'APPLIED' : 'WOULD APPLY'}: ${label.padEnd(60)}  $${(existing ?? 0).toFixed(2)} → $${item.cost.toFixed(2)}`);
    console.log(`      source: ${item.source}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
