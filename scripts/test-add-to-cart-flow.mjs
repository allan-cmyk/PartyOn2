#!/usr/bin/env node
/**
 * Test the complete add-to-cart flow
 * This simulates what happens when a user clicks "Add to Cart"
 */

const BASE_URL = 'http://localhost:3000';

async function testAddToCart() {
  console.log('=== Testing Add to Cart Flow ===\n');

  // Step 1: Get a product
  console.log('1. Fetching products...');
  const productsRes = await fetch(`${BASE_URL}/api/products?limit=1`);
  const productsData = await productsRes.json();
  const product = productsData.products?.edges?.[0]?.node;

  if (!product) {
    console.log('❌ No products found!');
    return;
  }

  const variantId = product.variants?.edges?.[0]?.node?.id;
  const price = product.variants?.edges?.[0]?.node?.price?.amount;
  console.log('   Product:', product.title);
  console.log('   Variant ID:', variantId);
  console.log('   Price:', price);

  // Step 2: Test variant lookup (this is what useCustomCart.addToCart does)
  console.log('\n2. Testing variant lookup...');
  const variantRes = await fetch(`${BASE_URL}/api/v1/products/variant/${variantId}`);
  console.log('   Status:', variantRes.status);

  if (variantRes.status !== 200) {
    console.log('❌ Variant lookup failed!');
    console.log('   Response:', await variantRes.text());
    return;
  }

  const variantData = await variantRes.json();
  console.log('   Product ID:', variantData.productId);
  console.log('   Price from DB:', variantData.price);

  // Step 3: Add to cart
  console.log('\n3. Adding to cart...');
  const cartRes = await fetch(`${BASE_URL}/api/v1/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'add',
      productId: variantData.productId,
      variantId: variantId,
      quantity: 1,
      price: parseFloat(variantData.price),
    }),
  });

  const cartData = await cartRes.json();
  console.log('   Status:', cartRes.status);
  console.log('   Success:', cartData.success);

  if (cartData.success) {
    console.log('   Cart ID:', cartData.data?.cart?.id);
    console.log('   Items:', cartData.data?.cart?.items?.length);
    console.log('   Subtotal:', cartData.data?.cart?.subtotal);
    console.log('   Total:', cartData.data?.cart?.total);
    console.log('\n✓ Add to cart flow completed successfully!');
  } else {
    console.log('   ❌ Error:', cartData.error);
  }
}

testAddToCart().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
