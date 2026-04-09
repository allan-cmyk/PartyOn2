// Fix script: creates/updates FREE_SHIPPING discount codes for affiliates
// whose customerPerk is "Free Delivery" but who have no matching Discount row.
// Also deletes confirmed-legacy orphaned discount codes.
//
// Safe to re-run: creates are idempotent (skips if already exists), deletes
// check for existence first.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const DELETE_CODES = ['BACHPLAN5', 'BACHBABES24', 'MIMISPARTYPALACE'];

// Affiliate codes that should get a new FREE_SHIPPING Discount row.
// Uses affiliate.code directly, except DTRbartending -> DTRBARTENDING because
// the validate-discount route uppercases the lookup.
const CREATE_FOR = [
  { affiliateCode: 'BACHBABES', discountCode: 'BACHBABES' },
  { affiliateCode: 'BACHPLAN', discountCode: 'BACHPLAN' },
  { affiliateCode: 'CENTEXBOATRENTALS', discountCode: 'CENTEXBOATRENTALS' },
  { affiliateCode: 'CONNECTED', discountCode: 'CONNECTED' },
  { affiliateCode: 'COWBOYS', discountCode: 'COWBOYS' },
  { affiliateCode: 'DTRbartending', discountCode: 'DTRBARTENDING' },
  { affiliateCode: 'FIVESTAR', discountCode: 'FIVESTAR' },
  { affiliateCode: 'MIMISPARTY', discountCode: 'MIMISPARTY' },
  { affiliateCode: 'MISCHIEF', discountCode: 'MISCHIEF' },
  { affiliateCode: 'SIPNSOCIAL', discountCode: 'SIPNSOCIAL' },
  { affiliateCode: 'TAPTRUCK', discountCode: 'TAPTRUCK' },
  { affiliateCode: 'THEPREMIUMPOUR', discountCode: 'THEPREMIUMPOUR' },
];

// Existing Discount rows whose type is wrong (perk = Free Delivery, type != FREE_SHIPPING).
const UPDATE_TO_FREE_SHIPPING = ['BIGTEXBOATRENTALS'];

// Skipped entirely (test/junk affiliates + PREMIER which has an intentional
// legacy tier structure that should not be touched).
const SKIPPED = ['BRIAN!!!!', 'PREMIERTES4C02', 'TESTBARBEC2', 'PREMIER'];

console.log('\n=== STEP 1: DELETE LEGACY DISCOUNTS ===\n');
for (const code of DELETE_CODES) {
  const existing = await p.discount.findUnique({ where: { code } });
  if (!existing) {
    console.log(`  SKIP   ${code} (already gone)`);
    continue;
  }
  if (existing.usageCount > 0) {
    console.log(`  ABORT  ${code} has usageCount=${existing.usageCount}, refusing to delete`);
    continue;
  }
  await p.discount.delete({ where: { code } });
  console.log(`  DELETE ${code} (type=${existing.type}, value=${existing.value})`);
}

console.log('\n=== STEP 2: UPDATE WRONG-TYPE DISCOUNTS ===\n');
for (const code of UPDATE_TO_FREE_SHIPPING) {
  const existing = await p.discount.findUnique({ where: { code } });
  if (!existing) {
    console.log(`  SKIP   ${code} (not found)`);
    continue;
  }
  if (existing.type === 'FREE_SHIPPING') {
    console.log(`  OK     ${code} already FREE_SHIPPING`);
    continue;
  }
  await p.discount.update({
    where: { code },
    data: { type: 'FREE_SHIPPING', value: '0' },
  });
  console.log(`  UPDATE ${code}: ${existing.type}/${existing.value} -> FREE_SHIPPING/0`);
}

console.log('\n=== STEP 3: CREATE MISSING DISCOUNTS ===\n');
for (const { affiliateCode, discountCode } of CREATE_FOR) {
  const aff = await p.affiliate.findUnique({ where: { code: affiliateCode } });
  if (!aff) {
    console.log(`  SKIP   ${discountCode} (affiliate ${affiliateCode} not found)`);
    continue;
  }
  const existing = await p.discount.findUnique({ where: { code: discountCode } });
  if (existing) {
    console.log(`  SKIP   ${discountCode} (already exists, type=${existing.type})`);
    continue;
  }
  await p.discount.create({
    data: {
      code: discountCode,
      name: discountCode,
      type: 'FREE_SHIPPING',
      value: '0',
      appliesToAll: true,
      applicableProducts: [],
      applicableCategories: [],
      minOrderAmount: '0.01',
      isActive: true,
      combinable: false,
      freeShipping: false,
    },
  });
  console.log(`  CREATE ${discountCode} (affiliate: ${aff.businessName})`);
}

console.log('\n=== SKIPPED ===\n');
for (const code of SKIPPED) {
  console.log(`  ${code}`);
}

console.log('\n=== DONE ===\n');
await p.$disconnect();
