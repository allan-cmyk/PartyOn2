/**
 * Size an event / party drink order with the website's drink planner engine and
 * price it from the live catalog.
 *
 * Same math as the public drink planner, Wayne's chat and dashboard
 * recommendations (src/lib/drinkPlannerLogic.ts): guests × (hours + 1) for
 * corporate / wedding / house parties, a flat 2 drinks/person/hour for boat and
 * bach. Prints the lines with live prices, then an `items` array in the exact
 * shape scripts/ops/create-draft-order.mjs takes. Read-only — creates nothing.
 *
 * Usage:
 *   npx tsx scripts/ops/drink-plan.ts --guests 130 --hours 3 --event corporate --categories beer,wine
 *     [--keep-seltzers]  keep the 5% seltzers the engine auto-adds on the event track
 *     [--no-ice]         drop the ice line (bar partner brings ice)
 *     [--json]           print only machine-readable JSON
 *
 *   --hours: 2-6 or multi-day. --event: corporate, wedding, house-party, other,
 *   boat-day, bachelor, bachelorette, weekend-trip.
 *   --categories: beer, seltzers, wine, spirits, cocktail-kits.
 */

import { prisma } from '../../src/lib/database/client';
import { DEFAULT_TAX_RATE } from '../../src/lib/tax/rates';
import {
  buildOpsDrinkPlan,
  parseDrinkPlanArgs,
  pickCatalogProduct,
  type CatalogCandidate,
  type OpsDrinkPlanLine,
} from '../../src/lib/drinkPlannerOps';

interface DraftItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  quantity: number;
  price: number;
  imageUrl: string | null;
}

async function loadCandidates(search: string): Promise<CatalogCandidate[]> {
  const rows = await prisma.product.findMany({
    where: { status: 'ACTIVE', title: { contains: search, mode: 'insensitive' } },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1, select: { url: true } },
      variants: { select: { id: true, title: true, price: true, availableForSale: true } },
    },
    take: 25,
  });
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    imageUrl: p.images[0]?.url ?? null,
    variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
  }));
}

async function resolveLine(line: OpsDrinkPlanLine, warnings: string[]): Promise<DraftItem | null> {
  const pick = pickCatalogProduct(await loadCandidates(line.search), line.variantHint);
  if (pick.status === 'missing') {
    warnings.push(`${line.name}: NOT IN CATALOG (${pick.reason}) — search "${line.search}". Pick a substitute by hand.`);
    return null;
  }
  if (pick.hintMissed) {
    warnings.push(`${line.name}: no title contains "${line.variantHint}" — picked "${pick.product.title}"; check the pack size.`);
  }
  if (pick.alternates.length) {
    warnings.push(`${line.name}: AMBIGUOUS — picked "${pick.product.title}", also matched: ${pick.alternates.join(' | ')}`);
  }
  return {
    productId: pick.product.id,
    variantId: pick.variant.id,
    title: pick.product.title,
    variantTitle: pick.variant.title,
    quantity: line.quantity,
    price: pick.variant.price,
    imageUrl: pick.product.imageUrl,
  };
}

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

async function main(): Promise<void> {
  const args = parseDrinkPlanArgs(process.argv.slice(2));
  if (!args.ok) {
    console.error(`drink-plan: ${args.error}`);
    process.exit(1);
  }

  const plan = buildOpsDrinkPlan(args.input);
  const warnings: string[] = [];
  const resolved: { line: OpsDrinkPlanLine; item: DraftItem | null }[] = [];
  for (const line of plan.lines) {
    resolved.push({ line, item: await resolveLine(line, warnings) });
  }
  const items = resolved.flatMap((r) => (r.item ? [r.item] : []));

  const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
  const tax = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100;

  if (args.json) {
    console.log(JSON.stringify({ input: args.input, plan, items, subtotal, tax, warnings }, null, 2));
    return;
  }

  const { input } = args;
  console.log(`\nDrink plan: ${input.guests} guests, ${input.duration}, ${input.eventType}, ${input.categories.join(' + ')}`);
  console.log(`Formula: ${plan.formula} = ${plan.totalDrinks} drinks; lines cover ${plan.plannedServings} servings`);
  if (plan.droppedAutoSeltzers) console.log('(Dropped the engine\'s auto-added seltzers — pass --keep-seltzers to keep them.)');
  console.log('');
  for (const { line, item } of resolved) {
    const servings = line.servings === null ? '' : `  (${line.servings} servings)`;
    const priced = item ? `${item.title} @ ${money(item.price)} = ${money(item.price * item.quantity)}` : 'NOT PRICED';
    console.log(`  ${String(line.quantity).padStart(3)} × ${line.name.padEnd(30)} ${priced}${servings}`);
  }
  console.log(`\n  Subtotal ${money(subtotal)}   Tax ${(DEFAULT_TAX_RATE * 100).toFixed(2)}% ${money(tax)}   ` +
    `Total before delivery ${money(subtotal + tax)}`);
  console.log('  (create-draft-order.mjs computes the zone delivery fee; partner perks may waive it.)');
  if (warnings.length) console.log(`\nWARNINGS:\n${warnings.map((w) => `  - ${w}`).join('\n')}`);
  console.log('\nitems for create-draft-order.mjs:');
  console.log(JSON.stringify(items));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
