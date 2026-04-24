#!/usr/bin/env node
/**
 * One-off: match distributor invoice line items to catalog variants.
 * Reads a JSON array of { desc, size, unitCost, notes? } from stdin OR uses
 * the hardcoded INVOICE_LINES below. Searches products and prints a review
 * table. Does NOT write anything — this is match-only.
 *
 * Usage:
 *   node scripts/ops/match-invoice-costs.mjs              # uses hardcoded list
 *   node scripts/ops/match-invoice-costs.mjs --json       # output as JSON for bulk-apply
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const jsonMode = process.argv.includes('--json');

// Unique products extracted from all distributor invoices (Apr 2026 set).
// unitCost = distributor cost for the variant size we sell.
// When a distributor line maps to multiple possible catalog variants, we list
// candidates here and let the matcher pick the best.
const INVOICE_LINES = [
  // SGWS spirits
  { key: 'espolon-blanco-175', searchTerms: 'espolon tequila blanco', variantHints: ['1.75', '1750'], unitCost: 39.01, source: 'SGWS 4/14' },
  { key: 'espolon-blanco-750', searchTerms: 'espolon tequila blanco', variantHints: ['750'], unitCost: 24.00, source: 'SGWS 4/14' },
  { key: 'titos-175', searchTerms: 'titos handmade vodka', variantHints: ['1.75', '1750'], unitCost: 28.67, source: 'SGWS 4/14' },
  { key: 'titos-1l', searchTerms: 'titos handmade vodka', variantHints: ['1l', '1.0', '1000'], unitCost: 21.33, source: 'SGWS 3/31' },
  { key: 'aperol-1l', searchTerms: 'aperol', variantHints: ['1l', '1.0', '1000'], unitCost: 25.00, source: 'SGWS 3/31' },
  { key: 'chateau-ste-michelle-sauv-blanc', searchTerms: 'chateau ste michelle sauvignon blanc', variantHints: ['750'], unitCost: 9.00, source: 'SGWS 3/31' },
  { key: 'chateau-ste-michelle-cab', searchTerms: 'chateau ste michelle cabernet', variantHints: ['750'], unitCost: 11.25, source: 'SGWS 3/31' },
  { key: 'wycliff-brut', searchTerms: 'wycliff brut champagne', variantHints: ['750'], unitCost: 4.75, source: 'SGWS 4/14' },
  { key: 'lunazul-blanco-750', searchTerms: 'lunazul tequila blanco', variantHints: ['750'], unitCost: 17.25, source: 'SGWS 4/14' },
  { key: 'lunazul-blanco-175', searchTerms: 'lunazul tequila blanco', variantHints: ['1.75', '1750'], unitCost: 31.50, source: 'SGWS 4/14' },
  { key: 'bacardi-superior', searchTerms: 'bacardi superior', variantHints: ['750'], unitCost: 14.25, source: 'SGWS 4/14' },
  { key: 'casamigos-blanco', searchTerms: 'casamigos blanco', variantHints: ['750'], unitCost: 36.00, source: 'SGWS 4/14' },
  { key: 'lalo-blanco', searchTerms: 'lalo blanco tequila', variantHints: ['750'], unitCost: 36.99, source: 'SGWS 4/14' },
  { key: 'still-austin-musician', searchTerms: 'still austin musician', variantHints: ['750'], unitCost: 35.79, source: 'SGWS 4/14' },
  { key: 'four-roses-yellow', searchTerms: 'four roses yellow label', variantHints: ['750'], unitCost: 21.74, source: 'Republic Nat' },
  { key: 'island-getaway-coco', searchTerms: 'island getaway rum', variantHints: ['750'], unitCost: 14.99, source: 'Republic Nat' },
  { key: 'dripping-springs-gin', searchTerms: 'dripping springs gin', variantHints: ['750'], unitCost: 23.99, source: 'Republic Nat' },
  { key: 'deep-eddy-vodka', searchTerms: 'deep eddy vodka', variantHints: ['750'], unitCost: 16.49, source: 'Republic Nat' },
  { key: 'dark-horse-pinot-grigio', searchTerms: 'dark horse pinot grigio', variantHints: ['375'], unitCost: 4.20, source: 'SGWS 3/31', notes: 'PPC=12; $4.20/can OR $50.40/12pk if variant is 12-pack' },

  // High Noon RTDs
  { key: 'high-noon-variety-teq-8pk', searchTerms: 'high noon variety tequila', variantHints: ['8'], unitCost: 18.00, source: 'SGWS 3/31' },
  { key: 'high-noon-variety-vod-day-8pk', searchTerms: 'high noon vodka day', variantHints: ['8'], unitCost: 16.50, source: 'SGWS 3/31' },
  { key: 'high-noon-variety-vod-12pk', searchTerms: 'high noon variety vodka', variantHints: ['12'], unitCost: 23.25, source: 'SGWS 3/31' },

  // Beer — 24-packs (primary variant assumption)
  { key: 'white-claw-variety-24pk', searchTerms: 'white claw variety', variantHints: ['24'], unitCost: 27.97, source: 'Brown' },
  { key: 'michelob-ultra-24pk', searchTerms: 'michelob ultra', variantHints: ['24'], unitCost: 25.30, source: 'Brown' },
  { key: 'coors-light-24pk', searchTerms: 'coors light', variantHints: ['24'], unitCost: 24.95, source: 'Capital Reyes' },
  { key: 'miller-lite-24pk', searchTerms: 'miller lite', variantHints: ['24'], unitCost: 24.95, source: 'Capital Reyes' },
  { key: 'modelo-especial-24pk', searchTerms: 'modelo especial', variantHints: ['24'], unitCost: 26.10, source: 'Capital Reyes' },
  { key: 'pacifico-24pk', searchTerms: 'pacifico', variantHints: ['24'], unitCost: 31.65, source: 'Capital Reyes' },
  { key: 'dos-equis-24pk', searchTerms: 'dos equis', variantHints: ['24'], unitCost: 26.10, source: 'Capital Reyes' },
  { key: 'topo-chico-variety-24pk', searchTerms: 'topo chico variety', variantHints: ['24'], unitCost: 27.97, source: 'Capital Reyes' },
  { key: 'live-oak-hefe-24pk', searchTerms: 'live oak hefeweizen', variantHints: ['24'], unitCost: 30.40, source: 'Capital Reyes' },
  { key: 'lonestar-24pk', searchTerms: 'lonestar', variantHints: ['24'], unitCost: 18.80, source: 'Capital Reyes 4/21' },
  { key: 'st-arnold-pils-24pk', searchTerms: 'st arnold summer pils', variantHints: ['24'], unitCost: 34.40, source: 'Capital Reyes 4/21' },
  { key: 'rambler-lemon-lime', searchTerms: 'rambler lemon lime', variantHints: ['24', '12'], unitCost: 14.50, source: 'Brown 4/2', notes: '2×12pk; $14.50 per 24pk OR $7.25/12pk' },
  { key: 'rambler-grapefruit', searchTerms: 'rambler grapefruit', variantHints: ['24', '12'], unitCost: 14.50, source: 'Brown 4/2' },
  { key: 'cutwater-margarita', searchTerms: 'cutwater margarita', variantHints: ['24', '4'], unitCost: 60.94, source: 'Brown 4/2', notes: '6×4pk; $60.94/24pk or $10.16/4pk' },
  { key: 'cutwater-paloma', searchTerms: 'cutwater paloma', variantHints: ['24', '4'], unitCost: 60.94, source: 'Brown 4/2' },
  { key: 'cutwater-tiki', searchTerms: 'cutwater tiki mai tai', variantHints: ['24', '4'], unitCost: 60.94, source: 'Brown 4/2' },
  { key: 'txbc-mcconaughaze', searchTerms: 'mcconaughaze', variantHints: ['24', '12'], unitCost: 36.74, source: 'Brown 4/16', notes: '2×12pk' },
  { key: 'native-texan', searchTerms: 'independence native texan', variantHints: ['24', '12'], unitCost: 29.60, source: 'Brown 4/16' },
  { key: 'hb-mexican-vanilla', searchTerms: 'hb mexican vanilla', variantHints: ['12'], unitCost: 24.20, source: 'Brown 4/16', notes: '8oz — flagged for review' },

  // Austin Beerworks kegs
  { key: 'abw-peacemaker-keg', searchTerms: 'peacemaker keg', variantHints: ['1/6', 'sixtel'], unitCost: 60.00, source: 'Austin Beerworks' },
  { key: 'abw-pearl-snap-keg', searchTerms: 'pearl snap keg', variantHints: ['1/6', 'sixtel'], unitCost: 65.00, source: 'Austin Beerworks' },
  { key: 'abw-variety-12pk', searchTerms: 'austin beerworks variety', variantHints: ['12'], unitCost: 28.50, source: 'Austin Beerworks', notes: '12 × 12-packs at $28.50 ea' },

  // Seltzers/flagged
  { key: 'house-wine-red-12pk', searchTerms: 'house wine red blend', variantHints: ['12'], unitCost: 54.00, source: 'SGWS 3/31', notes: 'Our variant likely = 12pk, case price = $54' },
  { key: 'high-noon-pineapple', searchTerms: 'high noon pineapple', variantHints: ['12'], unitCost: 45.00, source: 'SGWS 4/16', notes: 'needs review' },
];

function scoreVariant(line, product, variant) {
  const title = (product.title || '').toLowerCase();
  const vTitle = (variant.title || '').toLowerCase();
  let score = 0;
  for (const hint of line.variantHints || []) {
    const h = hint.toLowerCase();
    if (vTitle.includes(h) || title.includes(h)) score += 10;
  }
  // prefer variants where the price is at least 1.2x the unit cost (sanity)
  const price = Number(variant.price);
  if (price > 0 && line.unitCost > 0) {
    const ratio = price / line.unitCost;
    if (ratio >= 1.1 && ratio <= 5) score += 3;
  }
  return score;
}

async function findBestMatch(line) {
  const words = line.searchTerms.split(/\s+/).filter((w) => w.length > 0);
  const andClauses = words.map((w) => ({ title: { contains: w, mode: 'insensitive' } }));

  const products = await prisma.product.findMany({
    where: { AND: andClauses },
    include: {
      variants: { select: { id: true, title: true, sku: true, price: true, costPerUnit: true } },
    },
    take: 10,
  });

  const candidates = [];
  for (const p of products) {
    for (const v of p.variants) {
      candidates.push({ product: p, variant: v, score: scoreVariant(line, p, v) });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 3);
}

async function main() {
  const results = [];
  for (const line of INVOICE_LINES) {
    const matches = await findBestMatch(line);
    results.push({ line, matches });
  }

  if (jsonMode) {
    console.log(
      JSON.stringify(
        results.map((r) => ({
          key: r.line.key,
          searchTerms: r.line.searchTerms,
          unitCost: r.line.unitCost,
          source: r.line.source,
          notes: r.line.notes,
          topMatch: r.matches[0]
            ? {
                productId: r.matches[0].product.id,
                productTitle: r.matches[0].product.title,
                variantId: r.matches[0].variant.id,
                variantTitle: r.matches[0].variant.title,
                sku: r.matches[0].variant.sku,
                price: Number(r.matches[0].variant.price),
                currentCost: r.matches[0].variant.costPerUnit
                  ? Number(r.matches[0].variant.costPerUnit)
                  : null,
                score: r.matches[0].score,
              }
            : null,
          allMatches: r.matches.map((m) => ({
            productId: m.product.id,
            productTitle: m.product.title,
            variantId: m.variant.id,
            variantTitle: m.variant.title,
            price: Number(m.variant.price),
            score: m.score,
          })),
        })),
        null,
        2
      )
    );
    return;
  }

  console.log('\nInvoice → Catalog Match Review');
  console.log('═'.repeat(120));
  for (const { line, matches } of results) {
    console.log(`\n● ${line.key}  (${line.source})`);
    console.log(`  cost: $${line.unitCost.toFixed(2)}   search: "${line.searchTerms}"   hints: [${(line.variantHints||[]).join(', ')}]`);
    if (line.notes) console.log(`  note: ${line.notes}`);
    if (matches.length === 0) {
      console.log('  ❌ NO MATCH — product not in catalog');
      continue;
    }
    matches.forEach((m, i) => {
      const price = Number(m.variant.price).toFixed(2);
      const currentCost = m.variant.costPerUnit ? `$${Number(m.variant.costPerUnit).toFixed(2)}` : '—';
      const marker = i === 0 ? '  ✓' : '   ';
      const marginPct = line.unitCost > 0 && Number(m.variant.price) > 0
        ? ((Number(m.variant.price) - line.unitCost) / Number(m.variant.price) * 100).toFixed(0) + '%'
        : '?';
      console.log(`${marker} [score ${m.score}] ${m.product.title} — ${m.variant.title}`);
      console.log(`       price $${price}  current cost ${currentCost}  proposed margin ${marginPct}`);
    });
  }
  console.log('\n═'.repeat(120));
  console.log(`${results.length} invoice lines, ${results.filter(r => r.matches.length === 0).length} with no match`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
