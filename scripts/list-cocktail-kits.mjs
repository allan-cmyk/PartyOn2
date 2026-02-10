#!/usr/bin/env node

/**
 * List all cocktail kits in the store
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

async function searchProducts(searchTerm) {
  const query = `
    query searchProducts($query: String!) {
      products(first: 50, query: $query) {
        edges {
          node {
            id
            title
            handle
            productType
            description
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 3) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 5) {
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

  const result = await graphqlQuery(query, { query: searchTerm });
  return result.data?.products?.edges || [];
}

async function main() {
  console.log('🍸 Listing all cocktail kits...\n');

  if (!ADMIN_TOKEN || !SHOPIFY_DOMAIN) {
    console.error('Missing credentials');
    process.exit(1);
  }

  const searches = ['cocktail kit', 'batched cocktail', 'margarita kit', 'paloma kit', 'mule kit', 'party kit'];
  const allKits = new Map();

  for (const term of searches) {
    const results = await searchProducts(term);
    for (const edge of results) {
      const product = edge.node;
      // Filter to only actual kits
      if (product.title.toLowerCase().includes('kit') ||
          product.title.toLowerCase().includes('batched') ||
          product.productType?.toLowerCase().includes('kit')) {
        allKits.set(product.id, product);
      }
    }
  }

  console.log(`Found ${allKits.size} cocktail kits:\n`);
  console.log('='.repeat(80));

  for (const [id, product] of allKits) {
    const price = product.priceRange?.minVariantPrice?.amount || 'N/A';
    const imageCount = product.images?.edges?.length || 0;
    const firstImage = product.images?.edges?.[0]?.node?.url || 'No image';

    console.log(`\n📦 ${product.title}`);
    console.log(`   Price: $${price}`);
    console.log(`   Type: ${product.productType || 'N/A'}`);
    console.log(`   Handle: ${product.handle}`);
    console.log(`   Images: ${imageCount}`);
    console.log(`   First Image: ${firstImage.substring(0, 80)}...`);

    // Show description snippet
    if (product.description) {
      const desc = product.description.replace(/<[^>]*>/g, '').substring(0, 150);
      console.log(`   Description: ${desc}...`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal: ${allKits.size} cocktail kits`);
}

main().catch(console.error);
