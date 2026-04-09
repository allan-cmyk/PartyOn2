#!/usr/bin/env node
/**
 * Create a new affiliate (DRAFT status) via Prisma.
 *
 * Mirrors the createAffiliate() service in src/lib/affiliates/affiliate-service.ts
 * but does NOT send the welcome email -- admin sends manually from /ops/affiliates.
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   node scripts/ops/create-affiliate.mjs \
 *     --business "Luxury Boat Rentals" \
 *     --contact "John Smith" \
 *     --email "john@luxuryboatrentals.com" \
 *     --category BOAT \
 *     [--phone "+15125551234"] \
 *     [--slug "luxury-boat-rentals"] \
 *     [--code "LUXURY1234"] \
 *     [--status DRAFT|ACTIVE]
 */
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const VALID_CATEGORIES = ['BARTENDER', 'BOAT', 'VENUE', 'LODGING', 'PLANNER', 'OTHER'];
const VALID_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'INACTIVE'];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const flag = argv[i];
    if (!flag.startsWith('--')) continue;
    const key = flag.slice(2);
    const val = argv[i + 1];
    if (val === undefined || val.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = val;
      i++;
    }
  }
  return args;
}

function generateReferralCode(businessName) {
  const base = businessName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${base || 'PARTNER'}${suffix}`;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const args = parseArgs(process.argv);

const businessName = args.business;
const contactName = args.contact;
const email = args.email;
const category = args.category;

if (!businessName || !contactName || !email || !category) {
  console.error('Missing required flags.');
  console.error('Required: --business, --contact, --email, --category');
  console.error(`--category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  process.exit(1);
}

if (!VALID_CATEGORIES.includes(category)) {
  console.error(`Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  process.exit(1);
}

const status = args.status || 'DRAFT';
if (!VALID_STATUSES.includes(status)) {
  console.error(`Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
  process.exit(1);
}

const normalizedEmail = email.toLowerCase();
const partnerSlug = args.slug || slugify(businessName);

// Check email uniqueness
const existingByEmail = await prisma.affiliate.findUnique({
  where: { email: normalizedEmail },
});
if (existingByEmail) {
  console.error(`Affiliate already exists with email ${normalizedEmail}: ${existingByEmail.code} (${existingByEmail.businessName})`);
  process.exit(1);
}

// Check slug uniqueness
const existingBySlug = await prisma.affiliate.findFirst({
  where: { partnerSlug },
});
if (existingBySlug) {
  console.error(`Affiliate already exists with partnerSlug "${partnerSlug}": ${existingBySlug.code} (${existingBySlug.businessName})`);
  process.exit(1);
}

// Generate or validate code
let code = args.code || generateReferralCode(businessName);
let codeCollision = await prisma.affiliate.findUnique({ where: { code } });
let attempts = 0;
while (codeCollision && attempts < 5) {
  code = generateReferralCode(businessName);
  codeCollision = await prisma.affiliate.findUnique({ where: { code } });
  attempts++;
}
if (codeCollision) {
  console.error('Failed to generate unique code after 5 attempts. Pass --code explicitly.');
  process.exit(1);
}

const affiliate = await prisma.affiliate.create({
  data: {
    code,
    partnerSlug,
    contactName,
    businessName,
    email: normalizedEmail,
    phone: args.phone || null,
    category,
    status,
  },
});

// Create the matching Discount row that delivers the affiliate's customerPerk.
// The validate-discount route (src/app/api/v2/group-orders/validate-discount/route.ts)
// uppercases the user-entered code before lookup, so we ALWAYS store the Discount
// code as uppercase -- even if the affiliate code itself is mixed case.
//
// customerPerk defaults to "Free Delivery" (prisma/schema.prisma line 2013), so
// we create a FREE_SHIPPING discount. If the perk ever becomes configurable,
// this branch will need to map other perk types.
const discountCode = affiliate.code.toUpperCase();
let discount = null;
const existingDiscount = await prisma.discount.findUnique({ where: { code: discountCode } });
if (existingDiscount) {
  console.log(`\nWARNING: Discount code "${discountCode}" already exists (type=${existingDiscount.type}). Leaving it alone.`);
} else {
  discount = await prisma.discount.create({
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
}

console.log('');
console.log('Affiliate created');
console.log('  id:           ', affiliate.id);
console.log('  code:         ', affiliate.code);
console.log('  businessName: ', affiliate.businessName);
console.log('  contactName:  ', affiliate.contactName);
console.log('  email:        ', affiliate.email);
console.log('  category:     ', affiliate.category);
console.log('  status:       ', affiliate.status);
console.log('  partnerSlug:  ', affiliate.partnerSlug);
console.log('  customerPerk: ', affiliate.customerPerk);
console.log('  partnerPage:  ', `https://partyondelivery.com/partners/${affiliate.partnerSlug}`);
console.log('  referralLink: ', `https://partyondelivery.com/?ref=${affiliate.code}`);
if (discount) {
  console.log(`  discountCode: ${discount.code} (${discount.type}) -- customers enter this at checkout for free delivery`);
}
console.log('');
if (status === 'DRAFT') {
  console.log('NOTE: Affiliate is DRAFT. Admin must send welcome email from /ops/affiliates to activate.');
}
console.log(`Logo location: public/images/partners/${affiliate.partnerSlug}-logo.png`);

await prisma.$disconnect();
