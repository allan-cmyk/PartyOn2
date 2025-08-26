#!/usr/bin/env node

/**
 * Test script to verify Customer Accounts API is working
 */

require('dotenv').config({ path: '.env.local' });

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function testCustomerAPI() {
  console.log('🔍 Testing Shopify Customer Accounts API...\n');

  // Test 1: Check if customer accounts are enabled
  const customerQuery = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const testEmail = `test-${Date.now()}@example.com`;
  
  try {
    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: customerQuery,
          variables: {
            input: {
              email: testEmail,
              password: 'TestPassword123!',
              acceptsMarketing: false
            }
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.errors) {
      console.log('❌ Customer API Error:');
      console.log(JSON.stringify(data.errors, null, 2));
      
      if (data.errors[0]?.message?.includes('Access denied')) {
        console.log('\n⚠️  Customer Accounts API is NOT enabled in Shopify!');
        console.log('\nTo enable:');
        console.log('1. Go to Shopify Admin → Settings → Customer accounts');
        console.log('2. Select "New customer accounts"');
        console.log('3. Save changes');
      }
    } else if (data.data?.customerCreate) {
      if (data.data.customerCreate.customer) {
        console.log('✅ Customer API is working!');
        console.log(`Created test customer: ${data.data.customerCreate.customer.email}`);
        
        // Try to get access token
        await testCustomerAccessToken(testEmail, 'TestPassword123!');
      } else if (data.data.customerCreate.customerUserErrors?.length > 0) {
        console.log('⚠️  Customer API responded with errors:');
        data.data.customerCreate.customerUserErrors.forEach(error => {
          console.log(`  - ${error.field}: ${error.message} (${error.code})`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Failed to test Customer API:', error.message);
  }
}

async function testCustomerAccessToken(email, password) {
  console.log('\n🔑 Testing Customer Access Token...');
  
  const tokenQuery = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: tokenQuery,
          variables: {
            input: { email, password }
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.data?.customerAccessTokenCreate?.customerAccessToken) {
      console.log('✅ Customer authentication is working!');
      console.log('Access token expires at:', data.data.customerAccessTokenCreate.customerAccessToken.expiresAt);
    } else {
      console.log('⚠️  Could not create access token');
      if (data.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0) {
        data.data.customerAccessTokenCreate.customerUserErrors.forEach(error => {
          console.log(`  - ${error.message}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Failed to create access token:', error.message);
  }
}

async function checkExistingCustomerFeatures() {
  console.log('\n📊 Checking available customer features...');
  
  const introspectionQuery = `
    {
      customer(customerAccessToken: "") {
        id
        email
        firstName
        lastName
        phone
        acceptsMarketing
        defaultAddress {
          address1
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: introspectionQuery })
      }
    );

    const data = await response.json();
    
    if (data.errors) {
      const accessDenied = data.errors.some(e => e.message.includes('Access denied'));
      if (accessDenied) {
        console.log('❌ Customer query access denied - Customer Accounts API not enabled');
      } else {
        console.log('✅ Customer queries are available (API is enabled)');
      }
    } else {
      console.log('✅ Customer queries are available (API is enabled)');
    }
  } catch (error) {
    console.error('Failed to check features:', error.message);
  }
}

// Run all tests
async function runTests() {
  await checkExistingCustomerFeatures();
  await testCustomerAPI();
  
  console.log('\n📝 Summary:');
  console.log('If you see "Access denied" errors above, you need to:');
  console.log('1. Go to your Shopify Admin');
  console.log('2. Navigate to Settings → Customer accounts');
  console.log('3. Switch from "Classic customer accounts" to "New customer accounts"');
  console.log('4. Save the changes');
  console.log('5. Run this test again');
}

runTests().catch(console.error);