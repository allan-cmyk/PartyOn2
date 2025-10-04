/**
 * Test script to diagnose Shopify blog access
 */

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'premier-concierge.myshopify.com';
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function testBlogAccess() {
  console.log('Testing Shopify blog access...\n');
  console.log(`Domain: ${SHOPIFY_DOMAIN}`);
  console.log(`Token exists: ${!!STOREFRONT_TOKEN}`);
  console.log(`Token length: ${STOREFRONT_TOKEN?.length}\n`);

  // Test 1: Simple query to check API access
  const simpleQuery = `
    {
      shop {
        name
      }
    }
  `;

  try {
    console.log('Test 1: Basic shop query...');
    const response1 = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: simpleQuery }),
    });

    const data1 = await response1.json();
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log('✅ Basic API access works\n');
  } catch (error) {
    console.log('❌ Basic API access failed:', error);
  }

  // Test 2: Try to query blogs
  const blogQuery = `
    {
      blogs(first: 10) {
        edges {
          node {
            handle
            title
          }
        }
      }
    }
  `;

  try {
    console.log('Test 2: Query blogs...');
    const response2 = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: blogQuery }),
    });

    const data2 = await response2.json();
    console.log('Response:', JSON.stringify(data2, null, 2));
    if (!data2.errors) {
      console.log('✅ Blog query works\n');
    }
  } catch (error) {
    console.log('❌ Blog query failed:', error);
  }

  // Test 3: Try specific blog by handle
  const specificBlogQuery = `
    {
      blog(handle: "news") {
        handle
        title
      }
    }
  `;

  try {
    console.log('Test 3: Query specific blog "news"...');
    const response3 = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: specificBlogQuery }),
    });

    const data3 = await response3.json();
    console.log('Response:', JSON.stringify(data3, null, 2));
    if (!data3.errors) {
      console.log('✅ Specific blog query works\n');
    }
  } catch (error) {
    console.log('❌ Specific blog query failed:', error);
  }
}

testBlogAccess();
