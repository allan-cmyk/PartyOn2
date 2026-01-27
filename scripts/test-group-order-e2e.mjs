/**
 * Group Order E2E Test Script
 * Tests the complete group ordering flow with local inventory and Stripe payments
 *
 * Prerequisites:
 * 1. Server running: npm run dev
 * 2. Stripe CLI listening: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * 3. Products synced to local database
 *
 * Usage: node scripts/test-group-order-e2e.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test configuration
const TEST_HOST = {
  name: 'E2E Test Host',
  email: 'test-host@partyondelivery.com',
  phone: '512-555-0100'
};

const TEST_PARTICIPANT = {
  name: 'E2E Test Participant',
  email: 'test-participant@partyondelivery.com'
};

// Helper to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  return { status: response.status, data, ok: response.ok };
}

// Phase 1: Verify prerequisites
async function verifyPrerequisites() {
  console.log('\n=== Phase 0: Verify Prerequisites ===\n');

  // Check database connection
  try {
    const productCount = await prisma.product.count({
      where: { status: 'ACTIVE', variants: { some: { availableForSale: true } } }
    });
    console.log(`✓ Database connected - ${productCount} products available`);

    if (productCount === 0) {
      console.error('✗ No products in database. Run product sync first.');
      return false;
    }
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }

  // Check server is running
  try {
    const health = await fetch(`${BASE_URL}/api/health`).catch(() => null);
    if (!health) {
      // Try a simple page
      const home = await fetch(BASE_URL).catch(() => null);
      if (!home) {
        console.error(`✗ Server not running at ${BASE_URL}`);
        console.log('  Run: npm run dev');
        return false;
      }
    }
    console.log(`✓ Server running at ${BASE_URL}`);
  } catch (error) {
    console.error('✗ Server check failed:', error.message);
    return false;
  }

  // Check environment variables
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    console.warn('⚠ STRIPE_SECRET_KEY should be a test key');
  }

  console.log('✓ Environment configured\n');
  return true;
}

// Phase 1: Create Group Order
async function createGroupOrder() {
  console.log('\n=== Phase 1: Create Group Order ===\n');

  // Set delivery date 4 days from now (after 72-hour requirement)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  deliveryDate.setHours(14, 0, 0, 0); // 2 PM

  const orderData = {
    name: `E2E Test Order ${Date.now()}`,
    customerId: `test-customer-${Date.now()}`, // Required by API
    customerName: TEST_HOST.name,
    deliveryDate: deliveryDate.toISOString(),
    deliveryTime: '2:00 PM - 4:00 PM',
    deliveryAddress: {
      address1: '123 Test Street',
      city: 'Austin',
      province: 'TX',
      zip: '78701'
    },
    minimumOrderAmount: 100
  };

  console.log('Creating group order...');
  console.log('  Name:', orderData.name);
  console.log('  Host:', orderData.customerName);
  console.log('  Delivery:', orderData.deliveryDate);

  const result = await apiRequest('/api/group-orders/create', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });

  if (!result.ok) {
    console.error('✗ Failed to create group order:', result.data);
    return null;
  }

  console.log('✓ Group order created');
  console.log('  ID:', result.data.id);
  console.log('  Share Code:', result.data.shareCode);
  console.log('  Share URL:', result.data.shareUrl || `${BASE_URL}/group/${result.data.shareCode}`);

  return result.data;
}

// Phase 2: Create a cart and add items
async function createCartWithItems() {
  console.log('\n=== Phase 2: Create Cart with Items ===\n');

  // Get a sample product with variant (looking for a higher-priced item)
  const product = await prisma.product.findFirst({
    where: {
      status: 'ACTIVE',
      variants: { some: { availableForSale: true, price: { gte: 20 } } }
    },
    include: {
      variants: {
        where: { availableForSale: true, price: { gte: 20 } },
        take: 1
      }
    },
    orderBy: { basePrice: 'desc' }
  });

  if (!product || product.variants.length === 0) {
    console.error('✗ No product with valid variant found');
    return null;
  }

  const variant = product.variants[0];
  console.log('Selected product:', product.title);
  console.log('  Variant:', variant.title || 'Default');
  console.log('  Price: $' + Number(variant.price).toFixed(2));

  // Create cart by calling GET (creates if not exists)
  console.log('\nCreating cart...');
  const createCartResult = await apiRequest('/api/v1/cart', {
    method: 'GET'
  });

  if (!createCartResult.ok) {
    console.error('✗ Failed to create cart:', createCartResult.data);
    return null;
  }

  const cart = createCartResult.data.data?.cart;
  if (!cart) {
    console.error('✗ Cart not returned in response');
    return null;
  }
  console.log('✓ Cart created:', cart.id);

  // Add items to meet minimum ($100)
  const itemsNeeded = Math.ceil(100 / Number(variant.price)) + 1;
  console.log(`\nAdding ${itemsNeeded} items to cart...`);

  // Use the operation-based POST API
  const addResult = await apiRequest('/api/v1/cart', {
    method: 'POST',
    body: JSON.stringify({
      operation: 'add',
      productId: product.id,
      variantId: variant.id,
      quantity: itemsNeeded,
      price: Number(variant.price)
    })
  });

  if (!addResult.ok) {
    console.error('✗ Failed to add items:', addResult.data);
    return null;
  }

  const updatedCart = addResult.data.data?.cart;
  if (!updatedCart) {
    console.error('✗ Updated cart not returned');
    return null;
  }

  console.log('✓ Items added to cart');
  console.log('  Subtotal: $' + Number(updatedCart.subtotal).toFixed(2));

  return { cartId: updatedCart.id, cartTotal: Number(updatedCart.subtotal), itemCount: itemsNeeded };
}

// Phase 3: Join group order as participant
async function joinGroupOrder(groupOrder, cartInfo) {
  console.log('\n=== Phase 3: Join Group Order ===\n');

  const joinData = {
    guestName: TEST_PARTICIPANT.name,
    guestEmail: TEST_PARTICIPANT.email,
    cartId: cartInfo.cartId,
    ageVerified: true
  };

  console.log('Joining as participant...');
  console.log('  Name:', joinData.guestName);
  console.log('  Cart ID:', joinData.cartId);

  const result = await apiRequest(`/api/group-orders/id/${groupOrder.id}/join`, {
    method: 'POST',
    body: JSON.stringify(joinData)
  });

  if (!result.ok) {
    console.error('✗ Failed to join group order:', result.data);
    return null;
  }

  console.log('✓ Joined group order');
  console.log('  Participant ID:', result.data.participantId || 'N/A');

  // Update cart totals in group order
  console.log('\nUpdating cart totals...');
  const updateResult = await apiRequest(`/api/group-orders/${groupOrder.shareCode}/update-cart`, {
    method: 'POST',
    body: JSON.stringify({
      cartId: cartInfo.cartId,
      cartTotal: cartInfo.cartTotal,
      itemCount: cartInfo.itemCount
    })
  });

  if (!updateResult.ok) {
    console.warn('⚠ Failed to update cart totals:', updateResult.data);
    // Continue anyway - cart totals will be fetched during checkout
  } else {
    console.log('✓ Cart totals updated');
    console.log('  Cart Total: $' + cartInfo.cartTotal.toFixed(2));
  }

  return result.data;
}

// Phase 4: Lock the group order
async function lockGroupOrder(groupOrder) {
  console.log('\n=== Phase 4: Lock Group Order ===\n');

  console.log('Locking order...');

  const result = await apiRequest(`/api/group-orders/${groupOrder.shareCode}/lock-order`, {
    method: 'POST',
    body: JSON.stringify({
      // hostCustomerId is optional when the group order was created without auth
    })
  });

  if (!result.ok) {
    console.error('✗ Failed to lock order:', result.data);
    return false;
  }

  console.log('✓ Order locked');
  console.log('  Status:', result.data.groupOrder?.status || result.data.status);

  return true;
}

// Phase 5: Create checkout (Draft Order + Invoice)
async function createCheckout(groupOrder) {
  console.log('\n=== Phase 5: Create Checkout (Draft Order) ===\n');

  const checkoutData = {
    hostEmail: TEST_HOST.email,
    hostPhone: TEST_HOST.phone
  };

  console.log('Creating checkout...');

  const result = await apiRequest(`/api/group-orders/${groupOrder.shareCode}/create-checkout`, {
    method: 'POST',
    body: JSON.stringify(checkoutData)
  });

  if (!result.ok) {
    console.error('✗ Failed to create checkout:', result.data);
    return null;
  }

  console.log('✓ Checkout created');
  console.log('  Draft Order ID:', result.data.draftOrder?.id || 'N/A');
  console.log('  Invoice Token:', result.data.draftOrder?.token || 'N/A');
  console.log('  Invoice URL:', result.data.checkoutUrl);
  console.log('  Total: $' + (result.data.draftOrder?.totalPrice || 'N/A'));

  return result.data;
}

// Phase 6: Create Stripe Checkout Session
async function createStripeCheckout(draftOrderToken) {
  console.log('\n=== Phase 6: Create Stripe Checkout Session ===\n');

  console.log('Creating Stripe session...');

  const result = await apiRequest(`/api/v1/invoice/${draftOrderToken}/checkout`, {
    method: 'POST',
    body: JSON.stringify({})
  });

  if (!result.ok) {
    console.error('✗ Failed to create Stripe session:', result.data);
    return null;
  }

  console.log('✓ Stripe session created');
  console.log('  Session ID:', result.data.sessionId);
  console.log('  Checkout URL:', result.data.checkoutUrl);
  console.log('\n----------------------------------------');
  console.log('🔗 OPEN THIS URL TO COMPLETE PAYMENT:');
  console.log(result.data.checkoutUrl);
  console.log('----------------------------------------');
  console.log('\nUse test card: 4242 4242 4242 4242');
  console.log('Expiry: Any future date');
  console.log('CVC: Any 3 digits');

  return result.data;
}

// Verification: Check order was created
async function verifyOrderCreated(sessionId) {
  console.log('\n=== Phase 7: Verify Order Created ===\n');

  console.log('Checking for order... (may take a moment after payment)');

  // Wait a bit for webhook processing
  await new Promise(resolve => setTimeout(resolve, 5000));

  const order = await prisma.order.findFirst({
    where: {
      stripeCheckoutSessionId: sessionId
    },
    include: {
      items: true,
      deliveryTask: true
    }
  });

  if (!order) {
    console.log('⚠ Order not found yet. Check server logs for webhook processing.');
    console.log('  Ensure Stripe CLI is running: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
    return null;
  }

  console.log('✓ Order created!');
  console.log('  Order Number:', order.orderNumber);
  console.log('  Status:', order.status);
  console.log('  Financial Status:', order.financialStatus);
  console.log('  Total: $' + Number(order.total).toFixed(2));
  console.log('  Items:', order.items.length);
  console.log('  Delivery Task:', order.deliveryTask ? 'Created' : 'Not created');

  return order;
}

// Main test flow
async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Group Order E2E Test - Local Inventory + Stripe Payments  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    // Phase 0: Verify prerequisites
    const ready = await verifyPrerequisites();
    if (!ready) {
      console.log('\n❌ Prerequisites not met. Please fix the issues above and try again.');
      return;
    }

    // Phase 1: Create group order
    const groupOrder = await createGroupOrder();
    if (!groupOrder) {
      console.log('\n❌ Test failed at Phase 1');
      return;
    }

    // Phase 2: Create cart with items
    const cartInfo = await createCartWithItems();
    if (!cartInfo) {
      console.log('\n❌ Test failed at Phase 2');
      return;
    }

    // Phase 3: Join group order
    const joinResult = await joinGroupOrder(groupOrder, cartInfo);
    if (!joinResult) {
      console.log('\n❌ Test failed at Phase 3');
      return;
    }

    // Phase 4: Lock group order
    const locked = await lockGroupOrder(groupOrder);
    if (!locked) {
      console.log('\n❌ Test failed at Phase 4');
      return;
    }

    // Phase 5: Create checkout
    const checkout = await createCheckout(groupOrder);
    if (!checkout) {
      console.log('\n❌ Test failed at Phase 5');
      return;
    }

    // Phase 6: Create Stripe session
    const stripeSession = await createStripeCheckout(checkout.draftOrder?.token);
    if (!stripeSession) {
      console.log('\n❌ Test failed at Phase 6');
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Manual Step Required: Complete Payment in Browser          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nAfter completing payment, run this to verify:');
    console.log(`node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.order.findFirst({
  where: { stripeCheckoutSessionId: '${stripeSession.sessionId}' },
  include: { items: true }
}).then(o => {
  if (o) {
    console.log('✓ Order found:', o.orderNumber);
    console.log('  Total:', o.total);
    console.log('  Items:', o.items.length);
  } else {
    console.log('Order not found yet');
  }
  prisma.\\$disconnect();
});
"`);

    console.log('\n✅ Test flow completed up to payment step');
    console.log('Complete payment in browser to finish the test.');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
runTest();
