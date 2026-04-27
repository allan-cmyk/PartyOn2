/**
 * One-shot: apply costs from the 9 distributor invoices uploaded to chat on 2026-04-27.
 *
 * Source data: line items extracted manually from each invoice image.
 * Approach: per-selling-unit cost = PRICE / PPC. Match each line to a ProductVariant by
 * fuzzy description, propose cost. Sanity check: if existing variant cost is set and
 * delta > 50%, also try PRICE alone (some distributors print PPC as cans-per-case where
 * 1 case = 1 selling unit). Apply whichever interpretation is within tolerance.
 *
 * Usage:
 *   POSTGRES_URL=<prod> npx tsx scripts/apply-invoice-batch-2026-04-27.ts [--dry-run] [--apply]
 *   (omit both flags for dry-run; pass --apply to write)
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

interface InvoiceLine {
  invoice: string;
  distributor: string;
  productNum: string;
  description: string;
  ppc: number;
  price: number;
}

// All non-credit, non-keg, non-deposit lines from 9 invoices.
// SG #6109591586 contains negative-quantity credits and is excluded entirely.
// Austin Beerworks kegs are excluded (no variants in catalog).
const LINES: InvoiceLine[] = [
  // SG #9130935575 (3/31)
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '464549', description: 'ESPOLON TEQ BLANCO 80 1.750 LT', ppc: 6, price: 243.04 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '46599', description: 'TITOS HANDMADE VODKA 80 1.000 LT', ppc: 12, price: 255.96 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '512979', description: 'CHT STE MICH SAUVIGNON BLANC 750ML', ppc: 12, price: 108.00 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '557367', description: 'APEROL APERITIVO 22 1.000 LT', ppc: 6, price: 150.00 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '558212', description: 'HOUSE WINE RED BLEND CAN 12PK 355ML', ppc: 12, price: 54.00 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '584457', description: 'HIGH NOON VARIETY TEQ PACK CAN 8P 355ML', ppc: 3, price: 54.00 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '632672', description: 'CHT STE MICH CABERNET SAUVIGNON 750ML', ppc: 12, price: 135.00 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '651556', description: 'HIGH NOON VAR VOD DAY PACK CAN 8P 355ML', ppc: 3, price: 49.50 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '84587', description: 'TITOS HANDMADE VODKA 80 1.750 LT', ppc: 6, price: 177.84 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '906082', description: 'DARK HORSE PINOT GRIGIO CAN 375ML', ppc: 12, price: 50.40 },
  { invoice: 'SG-9130935575', distributor: "Southern Glazer's", productNum: '956638', description: 'HIGH NOON VARIETY VOD PK CAN12P 355ML', ppc: 2, price: 46.50 },

  // Capital Reyes #100913948 (3/24)
  { invoice: 'CR-100913948', distributor: 'Capital Reyes', productNum: '10230', description: 'COORS LIGHT C24 12OZ 12P', ppc: 2, price: 25.30 },
  { invoice: 'CR-100913948', distributor: 'Capital Reyes', productNum: '10235', description: 'COORS LIGHT C24 12OZ LSE', ppc: 1, price: 24.95 },
  { invoice: 'CR-100913948', distributor: 'Capital Reyes', productNum: '11288', description: 'LITE C24 12OZ LSE', ppc: 1, price: 24.95 },
  { invoice: 'CR-100913948', distributor: 'Capital Reyes', productNum: '13568', description: 'MODELO ESP C24 12OZ LSE', ppc: 1, price: 26.10 },
  { invoice: 'CR-100913948', distributor: 'Capital Reyes', productNum: '35350', description: 'PACIFICO C24 12OZ 12P', ppc: 2, price: 31.65 },
  { invoice: 'CR-100913948', distributor: 'Capital Reyes', productNum: '55231', description: 'DOS EQUIS LAGER C24 12OZ LSE', ppc: 1, price: 26.10 },
  { invoice: 'CR-100913948', distributor: 'Capital Reyes', productNum: '56521', description: 'TOPO CHICO VARIETY PACK C24 12OZ LSE', ppc: 1, price: 27.97 },
  { invoice: 'CR-100913948', distributor: 'Capital Reyes', productNum: '67329', description: 'LIVE OAK BREWING HEFEWEIZEN C24 12OZ', ppc: 2, price: 30.40 },

  // Brown #5446611 (4/2)
  { invoice: 'BR-5446611', distributor: 'Brown', productNum: '17386', description: 'WHITE CLAW VARIETY 24 CN 12OZ', ppc: 1, price: 27.97 },
  { invoice: 'BR-5446611', distributor: 'Brown', productNum: '2780', description: 'MIC ULTRA 24 CN SUITCASE 12OZ', ppc: 1, price: 25.30 },
  { invoice: 'BR-5446611', distributor: 'Brown', productNum: '54800', description: 'RAMBLER SPARKLING WATER LEMON LIME 2/12 CN 12OZ', ppc: 2, price: 14.50 },
  { invoice: 'BR-5446611', distributor: 'Brown', productNum: '54801', description: 'RAMBLER SPARKLING WATER GRAPEFRUIT 2/12 CN 12OZ', ppc: 2, price: 14.50 },
  { invoice: 'BR-5446611', distributor: 'Brown', productNum: '63700', description: 'CUTWATER TEQUILA MARGARITA 24/12OZ 6/4CN', ppc: 6, price: 60.94 },
  { invoice: 'BR-5446611', distributor: 'Brown', productNum: '63701', description: 'CUTWATER TEQUILA PALOMA 24/12OZ 6/4CN', ppc: 6, price: 60.94 },
  { invoice: 'BR-5446611', distributor: 'Brown', productNum: '63709', description: 'CUTWATER TROPICAL TIKI RUM MAI TAI 24/12OZ 6/4CN', ppc: 6, price: 60.94 },

  // (Austin Beerworks #265156 — kegs and deposits, excluded)

  // Republic National #7417538 (4/7)
  { invoice: 'RN-7417538', distributor: 'Republic National', productNum: '22281398', description: 'FOUR ROSES BBN YELLOW LBL 750M', ppc: 12, price: 269.88 },
  { invoice: 'RN-7417538', distributor: 'Republic National', productNum: '22467396', description: 'ISLAND GETAWAY RUM COCO 6PK 75', ppc: 6, price: 95.94 },
  { invoice: 'RN-7417538', distributor: 'Republic National', productNum: '32344397', description: 'DRIPPING SPRING GIN ARTSN NUPC', ppc: 6, price: 145.44 },
  { invoice: 'RN-7417538', distributor: 'Republic National', productNum: '72349397', description: 'DEEP EDDY VODKA 80 NL 750ML', ppc: 12, price: 211.32 },

  // SG #9131151365 (4/14)
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '107204', description: 'WYCLIFF BRUT CHAMPAGNE 750ML', ppc: 12, price: 57.00 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '186579', description: 'LUNAZUL TEQ BLANCO 80 750ML', ppc: 12, price: 207.00 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '239670', description: 'LUNAZUL TEQ BLANCO 80 1.750 LT', ppc: 6, price: 189.00 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '28729', description: 'BACARDI RUM SUPERIOR WHITE 80 750ML', ppc: 12, price: 171.00 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '446131', description: 'CASAMIGOS TEQUILA BLANCO 80 750ML', ppc: 6, price: 216.00 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '464549', description: 'ESPOLON TEQ BLANCO 80 1.750 LT', ppc: 6, price: 234.04 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '584457', description: 'HIGH NOON VARIETY TEQ PACK CAN 8P 355ML', ppc: 3, price: 54.00 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '651556', description: 'HIGH NOON VAR VOD DAY PACK CAN 8P 355ML', ppc: 3, price: 49.50 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '693555', description: 'LALO TEQUILA BLANCO 80 750ML', ppc: 6, price: 221.94 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '84587', description: 'TITOS HANDMADE VODKA 80 1.750 LT', ppc: 6, price: 172.02 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '956638', description: 'HIGH NOON VARIETY VOD PK CAN12P 355ML', ppc: 2, price: 46.50 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '968966', description: 'ESPOLON TEQ BLANCO 80 750ML', ppc: 12, price: 288.04 },
  { invoice: 'SG-9131151365', distributor: "Southern Glazer's", productNum: '977306', description: 'STILL AUSTIN STR BBN MUSICIAN 98.4 750ML', ppc: 6, price: 214.74 },

  // (SG #6109591586 — credit/return invoice excluded)

  // Brown #5463789 (4/16)
  { invoice: 'BR-5463789', distributor: 'Brown', productNum: '17386', description: 'WHITE CLAW VARIETY 24 CN 12OZ', ppc: 1, price: 27.97 },
  { invoice: 'BR-5463789', distributor: 'Brown', productNum: '19033', description: 'TXBC MCCONAUHAZE HAZY IPA 2/12 CN 12OZ', ppc: 2, price: 36.74 },
  { invoice: 'BR-5463789', distributor: 'Brown', productNum: '2780', description: 'MIC ULTRA 24 CN SUITCASE 12OZ', ppc: 1, price: 25.30 },
  { invoice: 'BR-5463789', distributor: 'Brown', productNum: '32058', description: 'IND NATIVE TEXAN 2/12 CN 12OZ', ppc: 2, price: 29.60 },
  { invoice: 'BR-5463789', distributor: 'Brown', productNum: '41108', description: 'HB MEXICAN VANILLA 12 CN 8OZ', ppc: 12, price: 24.20 },
  { invoice: 'BR-5463789', distributor: 'Brown', productNum: '54800', description: 'RAMBLER SPARKLING WATER LEMON LIME 2/12 CN 12OZ', ppc: 2, price: 14.50 },
  { invoice: 'BR-5463789', distributor: 'Brown', productNum: '54801', description: 'RAMBLER SPARKLING WATER GRAPEFRUIT 2/12 CN 12OZ', ppc: 2, price: 14.50 },

  // Capital Reyes #100937716 (4/21)
  { invoice: 'CR-100937716', distributor: 'Capital Reyes', productNum: '10235', description: 'COORS LIGHT C24 12OZ LSE', ppc: 1, price: 24.95 },
  { invoice: 'CR-100937716', distributor: 'Capital Reyes', productNum: '55266', description: 'LONESTAR C24 12OZ LSE', ppc: 1, price: 18.80 },
  { invoice: 'CR-100937716', distributor: 'Capital Reyes', productNum: '55357', description: 'ST ARNOLD SUMMER PILS C24 12OZ 6P', ppc: 4, price: 34.40 },
];

interface MatchResult {
  line: InvoiceLine;
  perUnit: number;
  altPerCase: number;        // PRICE / 1, fallback for ambiguous PPC
  variant: { id: string; productTitle: string; variantTitle: string | null; existing: number | null } | null;
  decision: 'apply' | 'apply-alt' | 'skip-no-match' | 'skip-sanity' | 'skip-ambiguous';
  applied?: number;
  note?: string;
}

function tokenize(s: string): string[] {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

async function findVariant(description: string) {
  const tokens = tokenize(description);
  if (tokens.length === 0) return null;

  // Pull candidate variants by description-word overlap.
  const candidates = await prisma.productVariant.findMany({
    where: {
      OR: tokens.flatMap((t) => [
        { product: { title: { contains: t, mode: 'insensitive' as const } } },
        { title: { contains: t, mode: 'insensitive' as const } },
      ]),
    },
    include: { product: { select: { title: true } } },
    take: 50,
  });

  const scored = candidates.map((v) => {
    const haystack = `${v.product.title} ${v.title ?? ''}`.toUpperCase();
    const score = tokens.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
    return {
      id: v.id,
      productTitle: v.product.title,
      variantTitle: v.title,
      existing: v.costPerUnit ? Number(v.costPerUnit) : null,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 0) return null;
  // Require top score to beat 2nd by at least 1 token AND match at least half the tokens.
  const top = scored[0];
  const minScore = Math.max(2, Math.ceil(tokens.length / 2));
  if (top.score < minScore) return null;
  if (scored.length > 1 && scored[1].score === top.score) {
    // Ambiguous — multiple equally-good matches. Skip.
    return { ...top, ambiguous: true };
  }
  return { ...top, ambiguous: false };
}

function within50(a: number, b: number): boolean {
  if (b === 0) return false;
  return Math.abs(a - b) / b <= 0.5;
}

async function main() {
  console.log(`[invoice-batch] processing ${LINES.length} lines${APPLY ? ' (APPLYING)' : ' (DRY RUN)'}`);
  console.log();

  const results: MatchResult[] = [];

  for (const line of LINES) {
    const perUnit = Number((line.price / line.ppc).toFixed(4));
    const altPerCase = line.price;
    const matchRaw = await findVariant(line.description);

    if (!matchRaw) {
      results.push({ line, perUnit, altPerCase, variant: null, decision: 'skip-no-match' });
      continue;
    }
    if ('ambiguous' in matchRaw && matchRaw.ambiguous) {
      results.push({
        line, perUnit, altPerCase,
        variant: matchRaw,
        decision: 'skip-ambiguous',
        note: 'multiple equally-good matches',
      });
      continue;
    }

    const variant = matchRaw;
    let chosen: number;
    let chosenLabel: 'apply' | 'apply-alt';

    if (variant.existing == null) {
      chosen = perUnit;
      chosenLabel = 'apply';
    } else if (within50(perUnit, variant.existing)) {
      chosen = perUnit;
      chosenLabel = 'apply';
    } else if (within50(altPerCase, variant.existing)) {
      chosen = altPerCase;
      chosenLabel = 'apply-alt';
    } else {
      results.push({
        line, perUnit, altPerCase,
        variant,
        decision: 'skip-sanity',
        note: `existing=$${variant.existing.toFixed(2)} but perUnit=$${perUnit.toFixed(2)} and altCase=$${altPerCase.toFixed(2)} both >50% off`,
      });
      continue;
    }

    if (APPLY) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { costPerUnit: new Prisma.Decimal(chosen) },
      });
    }
    results.push({ line, perUnit, altPerCase, variant, decision: chosenLabel, applied: chosen });
  }

  // Print grouped summary.
  const byInvoice = new Map<string, MatchResult[]>();
  for (const r of results) {
    const arr = byInvoice.get(r.line.invoice) ?? [];
    arr.push(r);
    byInvoice.set(r.line.invoice, arr);
  }
  for (const [invoice, rows] of byInvoice) {
    console.log(`=== ${invoice} (${rows.length} lines) ===`);
    for (const r of rows) {
      const desc = r.line.description.slice(0, 50).padEnd(50);
      const ppc = r.line.ppc.toString().padStart(2);
      const price = `$${r.line.price.toFixed(2)}`.padStart(8);
      const pu = `$${r.perUnit.toFixed(2)}`.padStart(8);
      const variant = r.variant ? `${r.variant.productTitle}${r.variant.variantTitle && r.variant.variantTitle !== 'Default Title' ? ` / ${r.variant.variantTitle}` : ''}` : '—';
      const existing = r.variant?.existing != null ? `$${r.variant.existing.toFixed(2)}` : 'null';
      const action = r.applied != null ? `→ $${r.applied.toFixed(2)}` : `[${r.decision}]`;
      console.log(`  ${desc} ppc=${ppc} price=${price} perUnit=${pu}  ${action.padEnd(15)} existing=${existing.padEnd(8)} variant=${variant}`);
      if (r.note) console.log(`    note: ${r.note}`);
    }
    console.log();
  }

  const counts = {
    apply: results.filter((r) => r.decision === 'apply').length,
    applyAlt: results.filter((r) => r.decision === 'apply-alt').length,
    skipNoMatch: results.filter((r) => r.decision === 'skip-no-match').length,
    skipSanity: results.filter((r) => r.decision === 'skip-sanity').length,
    skipAmbiguous: results.filter((r) => r.decision === 'skip-ambiguous').length,
  };
  console.log('=== SUMMARY ===');
  console.log(`  apply (perUnit=PRICE/PPC):  ${counts.apply}`);
  console.log(`  apply-alt (case=PRICE):     ${counts.applyAlt}`);
  console.log(`  skip-no-match:              ${counts.skipNoMatch}`);
  console.log(`  skip-sanity:                ${counts.skipSanity}`);
  console.log(`  skip-ambiguous:             ${counts.skipAmbiguous}`);
  if (!APPLY) console.log('\n[dry run] re-run with --apply to write costs.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
