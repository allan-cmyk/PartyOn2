#!/usr/bin/env node
/**
 * Test script: Affiliate free-delivery fix
 *
 * Verifies server-side delivery fee waiver for ALL affiliates on the group v2
 * checkout path. Rules:
 *   - Premier marina address (contains "13993")  = free delivery, no minimum
 *   - Premier house address                      = free delivery on $300+ only
 *   - All other affiliates                       = free delivery when tab subtotal
 *                                                   meets the affiliate's FREE_SHIPPING
 *                                                   discount minOrderAmount (standard: $100)
 *   - No affiliate                               = always charged delivery
 *
 * Test strategy:
 *   1. Create test GroupOrderV2 records via Prisma directly
 *   2. POST to /api/v2/group-orders/{code}/tabs/{tabId}/checkout-all on localhost
 *   3. Retrieve the resulting Stripe checkout session with line items expanded
 *   4. Assert on line items + metadata
 *   5. Expire Stripe sessions and delete test groups (cascade cleans up children)
 *
 * Safety: sessions are always expired, even on failure. No real payments are created.
 * Requires: dev server running on localhost:3000, .env.local with STRIPE_SECRET_KEY.
 *
 * Usage:
 *   npm run dev          # in one terminal
 *   set -a && source .env.local && set +a && node scripts/test-premier-delivery-fix.mjs
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Real product/variant from the catalog (Bacardi Light Rum $18.99)
const TEST_PRODUCT_ID = 'a468ec25-ca52-4922-9665-5b4e4cd2640c';
const TEST_VARIANT_ID = '7934ffa4-58ec-4814-a6d5-4fc38bbea96b';
const TEST_PRODUCT_TITLE = 'Bacardi Light Rum Superior 80';
const TEST_VARIANT_TITLE = '750ml Bottle';
const TEST_UNIT_PRICE = 18.99;

const DELIVERY_FEE = 40;

const MARINA_ADDRESS = {
  address1: '13993 Farm to Market Rd 2769',
  address2: '',
  city: 'Leander',
  province: 'TX',
  zip: '78641',
  country: 'US',
};

const HOUSE_ADDRESS = {
  address1: '500 W 5th St',
  address2: '',
  city: 'Austin',
  province: 'TX',
  zip: '78701',
  country: 'US',
};

// ----- Scenarios -----
// targetSubtotal: quantity is derived from unit price to reach this amount.
const SCENARIOS = [
  // --- Premier custom rules ---
  {
    key: 'A',
    label: 'PREMIER + marina address + $20 (below $300, but marina = always free)',
    affiliateCode: 'PREMIER',
    address: MARINA_ADDRESS,
    targetSubtotal: 20,
    expect: { deliveryFeeInLineItems: false, metadataWaived: true },
  },
  {
    key: 'B',
    label: 'PREMIER + house address + $100 (under $300 = charged)',
    affiliateCode: 'PREMIER',
    address: HOUSE_ADDRESS,
    targetSubtotal: 100,
    expect: { deliveryFeeInLineItems: true, metadataWaived: false },
  },
  {
    key: 'C',
    label: 'PREMIER + house address + $350 (over $300 = free)',
    affiliateCode: 'PREMIER',
    address: HOUSE_ADDRESS,
    targetSubtotal: 350,
    expect: { deliveryFeeInLineItems: false, metadataWaived: true },
  },
  // --- Generic affiliate (BACHBABES, minOrderAmount=$100) ---
  {
    key: 'D',
    label: 'BACHBABES + house + $50 (under $100 min = charged)',
    affiliateCode: 'BACHBABES',
    address: HOUSE_ADDRESS,
    targetSubtotal: 50,
    expect: { deliveryFeeInLineItems: true, metadataWaived: false },
  },
  {
    key: 'E',
    label: 'BACHBABES + house + $120 (over $100 min = free)',
    affiliateCode: 'BACHBABES',
    address: HOUSE_ADDRESS,
    targetSubtotal: 120,
    expect: { deliveryFeeInLineItems: false, metadataWaived: true },
  },
  // --- No affiliate = always charged ---
  {
    key: 'F',
    label: 'No affiliate + house + $200 = charged',
    affiliateCode: null,
    address: HOUSE_ADDRESS,
    targetSubtotal: 200,
    expect: { deliveryFeeInLineItems: true, metadataWaived: false },
  },
];

const created = []; // { groupId, sessionId } for cleanup

async function resolveAffiliateId(code) {
  if (!code) return null;
  const aff = await prisma.affiliate.findUnique({ where: { code } });
  if (!aff) throw new Error(`Affiliate not found: ${code}`);
  return aff.id;
}

async function createTestGroup(scenario) {
  const affiliateId = await resolveAffiliateId(scenario.affiliateCode);

  // quantity such that subtotal >= targetSubtotal
  const quantity = Math.max(1, Math.ceil(scenario.targetSubtotal / TEST_UNIT_PRICE));

  const shareCode = `TST${scenario.key}${Date.now().toString(36).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const orderDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const group = await prisma.groupOrderV2.create({
    data: {
      name: `TEST Affiliate Fix ${scenario.key}`,
      hostName: `Test Host ${scenario.key}`,
      hostEmail: `test-aff-${scenario.key}-${Date.now()}@partyondelivery.com`,
      shareCode,
      affiliateId,
      expiresAt,
      tabs: {
        create: [
          {
            name: 'Test Tab',
            deliveryDate,
            deliveryTime: '5:00 PM',
            deliveryAddress: scenario.address,
            orderDeadline,
            deliveryFee: DELIVERY_FEE,
            deliveryContextType: 'HOUSE',
          },
        ],
      },
      participants: {
        create: [
          {
            guestName: `Test Host ${scenario.key}`,
            guestEmail: `test-aff-${scenario.key}-${Date.now()}@partyondelivery.com`,
            isHost: true,
            ageVerified: true,
          },
        ],
      },
    },
    include: { tabs: true, participants: true },
  });

  const tab = group.tabs[0];
  const participant = group.participants[0];

  await prisma.draftCartItem.create({
    data: {
      subOrderId: tab.id,
      addedByParticipantId: participant.id,
      productId: TEST_PRODUCT_ID,
      variantId: TEST_VARIANT_ID,
      title: TEST_PRODUCT_TITLE,
      variantTitle: TEST_VARIANT_TITLE,
      price: TEST_UNIT_PRICE,
      quantity,
    },
  });

  const actualSubtotal = TEST_UNIT_PRICE * quantity;

  return { group, tab, participant, actualSubtotal };
}

async function hitCheckoutAll(group, tab, participant) {
  const url = `${BASE_URL}/api/v2/group-orders/${group.shareCode}/tabs/${tab.id}/checkout-all`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId: participant.id }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(`Checkout endpoint failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json.data.sessionId;
}

async function inspectStripeSession(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });
  const lineItems = session.line_items?.data || [];
  const deliveryLine = lineItems.find((li) => (li.description || '').toLowerCase().includes('delivery fee'));
  return {
    metadata: session.metadata || {},
    lineItems: lineItems.map((li) => ({
      description: li.description,
      amountUsd: (li.amount_total || 0) / 100,
    })),
    hasDeliveryFee: Boolean(deliveryLine),
    deliveryFeeAmountUsd: deliveryLine ? (deliveryLine.amount_total || 0) / 100 : 0,
  };
}

function checkExpectation(scenario, inspection) {
  const errors = [];

  if (scenario.expect.deliveryFeeInLineItems && !inspection.hasDeliveryFee) {
    errors.push('expected "Delivery Fee" line item but none found');
  }
  if (!scenario.expect.deliveryFeeInLineItems && inspection.hasDeliveryFee) {
    errors.push(`expected NO delivery fee line item but found one for $${inspection.deliveryFeeAmountUsd}`);
  }

  const waivedFlag = inspection.metadata.deliveryFeeWaivedByAffiliate === 'true';
  if (scenario.expect.metadataWaived && !waivedFlag) {
    errors.push('expected metadata.deliveryFeeWaivedByAffiliate=="true" but not set');
  }
  if (!scenario.expect.metadataWaived && waivedFlag) {
    errors.push('expected metadata.deliveryFeeWaivedByAffiliate NOT set but got "true"');
  }

  if (scenario.expect.metadataWaived) {
    if (inspection.metadata.deliveryFee !== '0') {
      errors.push(`expected metadata.deliveryFee=="0" but got ${JSON.stringify(inspection.metadata.deliveryFee)}`);
    }
  } else if (scenario.expect.deliveryFeeInLineItems) {
    if (inspection.metadata.deliveryFee !== String(DELIVERY_FEE)) {
      errors.push(`expected metadata.deliveryFee=="${DELIVERY_FEE}" but got ${JSON.stringify(inspection.metadata.deliveryFee)}`);
    }
  }

  return errors;
}

async function cleanup() {
  for (const entry of created) {
    if (entry.sessionId) {
      try {
        await stripe.checkout.sessions.expire(entry.sessionId);
      } catch (err) {
        // Session may already be expired or closed; ignore
      }
    }
    if (entry.groupId) {
      try {
        await prisma.groupOrderV2.delete({ where: { id: entry.groupId } });
      } catch (err) {
        console.error(`  cleanup: failed to delete group ${entry.groupId}:`, err.message);
      }
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('Affiliate Free Delivery -- Test Runner');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  // Sanity check: dev server up?
  try {
    const ping = await fetch(`${BASE_URL}/api/v2/group-orders/__nonexistent__`);
    if (ping.status !== 404 && ping.status !== 400 && ping.status !== 500) {
      console.log(`[warn] dev server returned unexpected status ${ping.status} on sanity check`);
    }
  } catch (err) {
    console.error(`[fatal] Cannot reach dev server at ${BASE_URL}. Run \`npm run dev\` first.`);
    process.exit(1);
  }

  const results = [];

  for (const scenario of SCENARIOS) {
    const entry = { groupId: null, sessionId: null };
    created.push(entry);

    console.log(`--- Scenario ${scenario.key}: ${scenario.label} ---`);

    try {
      const { group, tab, participant, actualSubtotal } = await createTestGroup(scenario);
      entry.groupId = group.id;
      console.log(`  created group ${group.shareCode} with subtotal $${actualSubtotal.toFixed(2)}`);

      const sessionId = await hitCheckoutAll(group, tab, participant);
      entry.sessionId = sessionId;
      console.log(`  stripe session: ${sessionId}`);

      const inspection = await inspectStripeSession(sessionId);
      console.log(`  metadata.deliveryFee: ${JSON.stringify(inspection.metadata.deliveryFee)}`);
      console.log(`  metadata.deliveryFeeWaivedByAffiliate: ${JSON.stringify(inspection.metadata.deliveryFeeWaivedByAffiliate)}`);
      console.log(`  line items:`);
      for (const li of inspection.lineItems) {
        console.log(`    - ${li.description}  $${li.amountUsd.toFixed(2)}`);
      }

      const errors = checkExpectation(scenario, inspection);
      if (errors.length === 0) {
        console.log(`  PASS`);
        results.push({ key: scenario.key, pass: true });
      } else {
        console.log(`  FAIL:`);
        for (const e of errors) console.log(`    * ${e}`);
        results.push({ key: scenario.key, pass: false, errors });
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      results.push({ key: scenario.key, pass: false, errors: [err.message] });
    }

    console.log('');
  }

  console.log('========================================');
  console.log('Cleanup');
  console.log('========================================');
  await cleanup();
  console.log('  done');
  console.log('');

  console.log('========================================');
  console.log('Summary');
  console.log('========================================');
  for (const r of results) {
    console.log(`  ${r.key}: ${r.pass ? 'PASS' : 'FAIL'}`);
  }
  const allPassed = results.every((r) => r.pass);
  console.log('');
  console.log(allPassed ? 'ALL SCENARIOS PASSED' : 'SOME SCENARIOS FAILED');
  process.exit(allPassed ? 0 : 1);
}

main()
  .catch(async (err) => {
    console.error('[fatal]', err);
    await cleanup();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
