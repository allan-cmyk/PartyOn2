#!/usr/bin/env node

/**
 * Search products for McKinley Harrison Draft Order
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

async function graphqlQuery(query, variables = {}) {
  const response = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  return response.json();
}

async function searchProduct(searchTerm) {
  const query = `
    query searchProducts($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            handle
            productType
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price
                  inventoryQuantity
                }
              }
            }
          }
        }
      }
    }
  `;

  const result = await graphqlQuery(query, { query: searchTerm });
  return result.data?.products?.edges || [];
}

async function main() {
  console.log('Searching for products for McKinley Harrison order...\n');

  if (!ADMIN_TOKEN || !SHOPIFY_DOMAIN) {
    console.error('Missing SHOPIFY_ADMIN_API_TOKEN or NEXT_PUBLIC_SHOPIFY_DOMAIN');
    process.exit(1);
  }

  const searches = [
    'whiskey 750ml',
    'bourbon 750ml',
    'tequila 750ml',
    'vodka 750ml',
    'Ancho Reyes Verde',
    'red wine',
    'cabernet',
    'white wine',
    'chardonnay',
    'sauvignon blanc',
    'craft beer',
    'IPA',
    'Modelo',
    'Michelob Ultra',
  ];

  for (const term of searches) {
    console.log(`\n=== Searching: "${term}" ===`);
    const results = await searchProduct(term);

    if (results.length === 0) {
      console.log('  No products found');
    } else {
      for (const edge of results) {
        const product = edge.node;
        const variant = product.variants.edges[0]?.node;
        console.log(`  - ${product.title}`);
        console.log(`    Type: ${product.productType || 'N/A'}`);
        console.log(`    Price: $${variant?.price || 'N/A'}`);
        console.log(`    Variant ID: ${variant?.id || 'N/A'}`);
      }
    }
  }
}

main().catch(console.error);
