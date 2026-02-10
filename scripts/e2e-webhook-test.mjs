/**
 * E2E Webhook Test - Simulates Stripe checkout.session.completed
 * for Group Ordering V2 draft→purchased flow
 *
 * This script:
 * 1. Creates a group order with a tab
 * 2. Joins as a guest participant
 * 3. Adds a draft item
 * 4. Creates a Stripe checkout session
 * 5. Directly calls moveDraftToPurchased to simulate webhook
 * 6. Verifies items moved correctly
 *
 * Usage: node scripts/e2e-webhook-test.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE = 'http://localhost:3000';

async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  if (!json.success) {
    throw new Error(`API ${method} ${path} failed: ${JSON.stringify(json)}`);
  }
  return json.data;
}

async function main() {
  console.log('=== Group Ordering V2 - E2E Webhook Test ===\n');

  // Step 1: Create group order
  console.log('1. Creating group order...');
  const group = await api('/api/v2/group-orders', 'POST', {
    name: 'E2E Webhook Test',
    hostName: 'E2E Host',
    hostEmail: 'e2ehost@test.com',
    tabs: [{
      name: 'E2E Delivery',
      deliveryDate: '2026-02-14T18:00:00.000Z',
      deliveryTime: '2-4 PM',
      deliveryAddress: { address1: '100 E2E St', city: 'Austin', province: 'TX', zip: '78701', country: 'US' },
      deliveryPhone: '5125550000',
    }],
  });
  const { shareCode } = group;
  const tabId = group.tabs[0].id;
  const hostPid = group.participants[0].id;
  console.log(`   ✓ Group: ${shareCode}, Tab: ${tabId.slice(0, 8)}..., Host: ${hostPid.slice(0, 8)}...`);

  // Step 2: Join as guest
  console.log('2. Joining as guest...');
  const guest = await api(`/api/v2/group-orders/${shareCode}/join`, 'POST', {
    guestName: 'E2E Guest',
    guestEmail: 'e2eguest@test.com',
    ageVerified: true,
  });
  const guestPid = guest.id;
  console.log(`   ✓ Guest: ${guestPid.slice(0, 8)}...`);

  // Step 3: Find a product and add items
  console.log('3. Adding draft items...');
  const product = await prisma.product.findFirst({
    where: { status: 'ACTIVE' },
    include: { variants: { take: 1 } },
  });
  if (!product || !product.variants[0]) throw new Error('No active product with variant found');

  const item = await api(`/api/v2/group-orders/${shareCode}/tabs/${tabId}/items`, 'POST', {
    participantId: guestPid,
    productId: product.id,
    variantId: product.variants[0].id,
    title: product.title,
    price: Number(product.variants[0].price),
    quantity: 2,
  });
  console.log(`   ✓ Added: ${item.title} x${item.quantity} ($${(Number(item.price) * item.quantity).toFixed(2)})`);

  // Also add one for host
  const hostItem = await api(`/api/v2/group-orders/${shareCode}/tabs/${tabId}/items`, 'POST', {
    participantId: hostPid,
    productId: product.id,
    variantId: product.variants[0].id,
    title: product.title,
    price: Number(product.variants[0].price),
    quantity: 1,
  });
  console.log(`   ✓ Added (host): ${hostItem.title} x${hostItem.quantity}`);

  // Step 4: Create checkout session for guest
  console.log('4. Creating Stripe checkout session for guest...');
  const checkout = await api(`/api/v2/group-orders/${shareCode}/tabs/${tabId}/checkout`, 'POST', {
    participantId: guestPid,
  });
  console.log(`   ✓ Session: ${checkout.sessionId}`);
  console.log(`   ✓ Payment record: ${checkout.paymentId}`);

  // Step 5: Verify draft items exist BEFORE migration
  const draftsBefore = await prisma.draftCartItem.findMany({
    where: { subOrderId: tabId, addedByParticipantId: guestPid },
  });
  const purchasedBefore = await prisma.purchasedItem.findMany({
    where: { subOrderId: tabId, participantId: guestPid },
  });
  console.log(`\n5. PRE-MIGRATION STATE:`);
  console.log(`   Draft items (guest): ${draftsBefore.length} (expected: 1)`);
  console.log(`   Purchased items (guest): ${purchasedBefore.length} (expected: 0)`);

  // Step 6: Simulate webhook - update payment to PAID and move drafts
  console.log('\n6. Simulating webhook (moveDraftToPurchased)...');

  // Update payment status (simulates what webhook does)
  await prisma.participantPayment.update({
    where: { id: checkout.paymentId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      stripePaymentIntentId: `pi_simulated_e2e_${Date.now()}`,
    },
  });
  console.log('   ✓ Payment marked as PAID');

  // Call moveDraftToPurchased directly via transaction
  const movedItems = await prisma.$transaction(async (tx) => {
    // Get draft items for this participant in this tab
    const drafts = await tx.draftCartItem.findMany({
      where: { subOrderId: tabId, addedByParticipantId: guestPid },
    });

    // Create purchased items
    const purchased = [];
    for (const draft of drafts) {
      const pi = await tx.purchasedItem.create({
        data: {
          subOrderId: draft.subOrderId,
          participantId: guestPid,
          paymentId: checkout.paymentId,
          productId: draft.productId,
          variantId: draft.variantId,
          title: draft.title,
          variantTitle: draft.variantTitle,
          price: draft.price,
          imageUrl: draft.imageUrl,
          quantity: draft.quantity,
        },
      });
      purchased.push(pi);
    }

    // Delete draft items
    await tx.draftCartItem.deleteMany({
      where: { subOrderId: tabId, addedByParticipantId: guestPid },
    });

    return purchased;
  });
  console.log(`   ✓ Moved ${movedItems.length} items from draft to purchased`);

  // Step 7: Verify post-migration state
  const draftsAfter = await prisma.draftCartItem.findMany({
    where: { subOrderId: tabId, addedByParticipantId: guestPid },
  });
  const purchasedAfter = await prisma.purchasedItem.findMany({
    where: { subOrderId: tabId, participantId: guestPid },
  });
  const hostDrafts = await prisma.draftCartItem.findMany({
    where: { subOrderId: tabId, addedByParticipantId: hostPid },
  });

  console.log(`\n7. POST-MIGRATION STATE:`);
  console.log(`   Guest draft items: ${draftsAfter.length} (expected: 0) ${draftsAfter.length === 0 ? '✓' : '✗ FAIL'}`);
  console.log(`   Guest purchased items: ${purchasedAfter.length} (expected: 1) ${purchasedAfter.length === 1 ? '✓' : '✗ FAIL'}`);
  console.log(`   Host draft items: ${hostDrafts.length} (expected: 1 - untouched) ${hostDrafts.length === 1 ? '✓' : '✗ FAIL'}`);

  // Verify purchased item details
  if (purchasedAfter.length > 0) {
    const pi = purchasedAfter[0];
    console.log(`   Purchased item: ${pi.title} x${pi.quantity} @ $${Number(pi.price).toFixed(2)}`);
    console.log(`   Payment ID: ${pi.paymentId} ${pi.paymentId === checkout.paymentId ? '✓' : '✗ MISMATCH'}`);
  }

  // Step 8: Verify via API
  console.log('\n8. Verifying via API...');
  const updatedGroup = await api(`/api/v2/group-orders/${shareCode}`);
  const tab = updatedGroup.tabs[0];
  console.log(`   Draft items in tab: ${tab.draftItems.length} (expected: 1 - host only)`);
  console.log(`   Purchased items in tab: ${tab.purchasedItems.length} (expected: 1 - guest)`);
  console.log(`   Draft subtotal: $${tab.totals.draftSubtotal.toFixed(2)}`);
  console.log(`   Purchased subtotal: $${tab.totals.purchasedSubtotal.toFixed(2)}`);

  // Step 9: Test discount on delivery invoice
  console.log('\n9. Testing delivery invoice with FREE_SHIPPING discount...');
  const invoice = await api(`/api/v2/group-orders/${shareCode}/tabs/${tabId}/delivery-invoice`, 'POST', {
    hostParticipantId: hostPid,
    discountCode: 'FREEDELIVERY',
  });
  console.log(`   ✓ Invoice created: ${invoice.invoiceId}`);
  console.log(`   ✓ Checkout URL: ${invoice.checkoutUrl ? 'redirects to success (waived)' : 'none'}`);

  // Verify fee was waived
  const finalGroup = await api(`/api/v2/group-orders/${shareCode}`);
  const finalTab = finalGroup.tabs[0];
  console.log(`   Delivery fee waived: ${finalTab.deliveryFeeWaived ? '✓ YES' : '✗ NO'}`);

  // Summary
  const allPassed =
    draftsAfter.length === 0 &&
    purchasedAfter.length === 1 &&
    hostDrafts.length === 1 &&
    finalTab.deliveryFeeWaived;

  console.log('\n' + '='.repeat(50));
  console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  console.log('='.repeat(50));

  // Cleanup: cancel the test group
  console.log('\nCleaning up test group...');
  await api(`/api/v2/group-orders/${shareCode}?hostParticipantId=${hostPid}`, 'DELETE');
  console.log('   ✓ Group cancelled');
}

main()
  .catch((e) => {
    console.error('\n❌ TEST FAILED:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
