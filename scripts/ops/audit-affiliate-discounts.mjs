// Audit script: cross-reference all active affiliates with Discount records.
// Reports MISSING, WRONG_TYPE, LEGACY (orphaned discounts with no matching affiliate).
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const affs = await p.affiliate.findMany({
  where: { status: 'ACTIVE' },
  select: { id: true, code: true, businessName: true, customerPerk: true },
  orderBy: { code: 'asc' },
});

console.log(`\n=== ${affs.length} ACTIVE AFFILIATES ===\n`);

const missing = [];
const wrongType = [];
const ok = [];

for (const a of affs) {
  const d = await p.discount.findUnique({ where: { code: a.code } });
  const perk = (a.customerPerk || '').toLowerCase();
  const wantsFreeShip = perk.includes('free') && perk.includes('deliver');

  if (!d) {
    missing.push(a);
    console.log(`  MISSING    ${a.code.padEnd(22)} (${a.businessName}) perk="${a.customerPerk}"`);
  } else if (wantsFreeShip && d.type !== 'FREE_SHIPPING') {
    wrongType.push({ aff: a, discount: d });
    console.log(`  WRONG TYPE ${a.code.padEnd(22)} has ${d.type}/${d.value}, needs FREE_SHIPPING`);
  } else {
    ok.push(a);
    console.log(`  OK         ${a.code.padEnd(22)} type=${d.type} value=${d.value}`);
  }
}

console.log(`\n=== LEGACY DISCOUNT CODES (no matching affiliate) ===\n`);

const allDiscounts = await p.discount.findMany({
  select: { id: true, code: true, type: true, value: true, usageCount: true },
});
const affCodes = new Set(affs.map(a => a.code));

// Only flag as legacy if code looks related to an existing affiliate (e.g. prefix match)
// so we don't nuke unrelated system discounts like FREEDELIVERY, PARTYONPREMIER, etc.
const legacy = [];
for (const d of allDiscounts) {
  if (affCodes.has(d.code)) continue;
  // Check if it looks like a malformed version of any affiliate code
  for (const a of affs) {
    const prefix = a.code.slice(0, Math.min(a.code.length, 7));
    if (d.code.startsWith(prefix) && d.code !== a.code) {
      legacy.push({ discount: d, matchesAffiliate: a.code });
      break;
    }
  }
}

for (const l of legacy) {
  console.log(`  LEGACY ${l.discount.code.padEnd(22)} (related to ${l.matchesAffiliate}) type=${l.discount.type} value=${l.discount.value} used=${l.discount.usageCount}`);
}

console.log(`\n=== SUMMARY ===`);
console.log(`  OK:         ${ok.length}`);
console.log(`  MISSING:    ${missing.length}`);
console.log(`  WRONG TYPE: ${wrongType.length}`);
console.log(`  LEGACY:     ${legacy.length}`);

await p.$disconnect();
