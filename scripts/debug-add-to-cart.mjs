#!/usr/bin/env node
/**
 * Debug script to identify add-to-cart issues
 * Tests the variant lookup and cart APIs
 *
 * Run: node scripts/debug-add-to-cart.mjs
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testVariantLookup() {
  console.log('\n=== Testing Variant Lookup API ===\n');

  // First, get products from the API
  console.log('1. Fetching products from /api/products...');

  try {
    const productsRes = await fetch(`${BASE_URL}/api/products?limit=5`);
    const productsData = await productsRes.json();

    if (!productsData.products || productsData.products.length === 0) {
      console.error('   ❌ No products returned from /api/products');
      return;
    }

    console.log(`   ✓ Got ${productsData.products.length} products`);

    // Test variant lookup for each product
    for (const product of productsData.products.slice(0, 3)) {
      const variantId = product.variants?.edges?.[0]?.node?.id;
      const title = product.title;

      if (!variantId) {
        console.log(`   ⚠ Product "${title}" has no variants`);
        continue;
      }

      console.log(`\n2. Testing variant lookup for "${title}"`);
      console.log(`   Variant ID: ${variantId}`);

      const variantRes = await fetch(
        `${BASE_URL}/api/v1/products/variant/${encodeURIComponent(variantId)}`
      );

      console.log(`   Response Status: ${variantRes.status}`);

      if (variantRes.status === 200) {
        const variantData = await variantRes.json();
        console.log('   ✓ Variant found in local database');
        console.log(`   Product ID: ${variantData.productId}`);
        console.log(`   Price: $${variantData.price}`);
      } else if (variantRes.status === 404) {
        console.log('   ❌ VARIANT NOT FOUND IN LOCAL DATABASE');
        console.log('   This is likely the cause of add-to-cart failures!');
        console.log('   Run product sync to fix: npm run sync-products');
      } else {
        const errorText = await variantRes.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
    }
  } catch (error) {
    console.error('   ❌ Error fetching products:', error.message);
  }
}

async function testCartAPI() {
  console.log('\n=== Testing Cart API ===\n');

  try {
    // Test GET cart
    console.log('1. Testing GET /api/v1/cart...');
    const cartRes = await fetch(`${BASE_URL}/api/v1/cart`);
    console.log(`   Response Status: ${cartRes.status}`);

    const cartData = await cartRes.json();
    if (cartData.success) {
      console.log('   ✓ Cart API is working');
      console.log(`   Cart ID: ${cartData.data?.cart?.id || 'N/A'}`);
      console.log(`   Items: ${cartData.data?.cart?.items?.length || 0}`);
    } else {
      console.log(`   ❌ Cart API error: ${cartData.error}`);
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

async function testDatabaseConnection() {
  console.log('\n=== Checking Database Connection ===\n');

  try {
    // Test if we can reach the variant API at all
    const healthRes = await fetch(`${BASE_URL}/api/v1/products/variant/test-connection-check`);
    const status = healthRes.status;

    if (status === 404) {
      console.log('   ✓ API route is reachable (404 for invalid ID is expected)');
    } else if (status === 500) {
      const errorText = await healthRes.text();
      console.log('   ❌ Server error - possible database connection issue');
      console.log(`   Error: ${errorText}`);
    } else {
      console.log(`   Status: ${status}`);
    }
  } catch (error) {
    console.error('   ❌ Cannot reach API:', error.message);
  }
}

async function checkEnvironmentVariables() {
  console.log('\n=== Environment Check ===\n');
  console.log(`   BASE_URL: ${BASE_URL}`);
  console.log(`   NEXT_PUBLIC_USE_CUSTOM_CART should be "true" for local cart`);
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  PartyOn Add-to-Cart Debug Script          ║');
  console.log('╚════════════════════════════════════════════╝');

  await checkEnvironmentVariables();
  await testDatabaseConnection();
  await testVariantLookup();
  await testCartAPI();

  console.log('\n=== Summary ===\n');
  console.log('If variant lookup returns 404:');
  console.log('  → Products are not synced to local database');
  console.log('  → Run: npx prisma db push && npm run sync-products');
  console.log('');
  console.log('If cart API fails:');
  console.log('  → Check database connection in .env.local');
  console.log('  → Check DATABASE_URL is set correctly');
  console.log('');
  console.log('If all tests pass but add-to-cart still fails:');
  console.log('  → Check browser console for JavaScript errors');
  console.log('  → Check age verification is set in localStorage');
  console.log('  → Clear cookies and try again');
  console.log('');
}

main().catch(console.error);
