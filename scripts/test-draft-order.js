#!/usr/bin/env node

/**
 * Test script to verify Draft Order API is working
 */

require('dotenv').config({ path: '.env.local' });

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function testDraftOrderAPI() {
  console.log('🔍 Testing Shopify Draft Order API...\n');

  if (!ADMIN_TOKEN || !SHOPIFY_DOMAIN) {
    console.error('❌ Missing required environment variables');
    console.error('  - SHOPIFY_ADMIN_ACCESS_TOKEN:', !!ADMIN_TOKEN ? '✓' : '✗');
    console.error('  - NEXT_PUBLIC_SHOPIFY_DOMAIN:', !!SHOPIFY_DOMAIN ? '✓' : '✗');
    process.exit(1);
  }

  // Test creating a simple draft order
  const draftOrderMutation = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          invoiceUrl
          status
          totalPrice
          subtotalPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // First, let's get a product variant ID to test with
  const productsQuery = `
    {
      products(first: 1) {
        edges {
          node {
            id
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  price
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    // Get a product variant
    console.log('📦 Fetching a product variant for testing...');
    const productResponse = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: productsQuery }),
      }
    );

    const productData = await productResponse.json();
    
    if (!productData.data?.products?.edges?.[0]) {
      console.error('❌ No products found in the store');
      return;
    }

    const product = productData.data.products.edges[0].node;
    const variant = product.variants.edges[0]?.node;
    
    if (!variant) {
      console.error('❌ No product variants found');
      return;
    }

    console.log(`✅ Found product: ${product.title}`);
    console.log(`   Variant: ${variant.title} - $${variant.price}`);
    console.log(`   Variant ID: ${variant.id}\n`);

    // Create a test draft order
    console.log('📝 Creating test draft order...');
    
    const draftOrderInput = {
      lineItems: [
        {
          variantId: variant.id,
          quantity: 2,
        },
      ],
      email: 'test@example.com',
      shippingAddress: {
        address1: '123 Test St',
        city: 'Austin',
        province: 'TX',
        zip: '78701',
        country: 'US',
        firstName: 'Test',
        lastName: 'Customer',
      },
      note: 'Test draft order from API script',
      tags: ['test', 'group-order'],
      customAttributes: [
        { key: 'test_order', value: 'true' },
        { key: 'created_by', value: 'test_script' },
      ],
    };

    const draftOrderResponse = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: draftOrderMutation,
          variables: { input: draftOrderInput },
        }),
      }
    );

    const draftOrderData = await draftOrderResponse.json();
    
    if (draftOrderData.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(draftOrderData.errors, null, 2));
      return;
    }

    if (draftOrderData.data?.draftOrderCreate?.userErrors?.length > 0) {
      console.error('❌ User Errors:', draftOrderData.data.draftOrderCreate.userErrors);
      return;
    }

    const draftOrder = draftOrderData.data?.draftOrderCreate?.draftOrder;
    
    if (!draftOrder) {
      console.error('❌ Failed to create draft order');
      console.log('Response:', JSON.stringify(draftOrderData, null, 2));
      return;
    }

    console.log('✅ Draft order created successfully!\n');
    console.log('📋 Draft Order Details:');
    console.log(`   ID: ${draftOrder.id}`);
    console.log(`   Name: ${draftOrder.name}`);
    console.log(`   Status: ${draftOrder.status}`);
    console.log(`   Subtotal: ${draftOrder.subtotalPrice}`);
    console.log(`   Total: ${draftOrder.totalPrice}`);
    console.log(`   Invoice URL: ${draftOrder.invoiceUrl}`);
    
    console.log('\n🎉 Draft Order API is working correctly!');
    console.log('\nNext steps:');
    console.log('1. The invoice URL can be sent to customers for payment');
    console.log('2. Group orders will merge multiple carts into one draft order');
    console.log('3. The host will receive the invoice to complete payment');
    
  } catch (error) {
    console.error('❌ Error testing Draft Order API:', error);
    console.error('\nPossible issues:');
    console.error('1. Check that SHOPIFY_ADMIN_ACCESS_TOKEN has write_draft_orders permission');
    console.error('2. Verify the API version (2024-01) is correct');
    console.error('3. Ensure the Admin API token is valid');
  }
}

// Run the test
testDraftOrderAPI().catch(console.error);