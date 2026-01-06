#!/usr/bin/env node
/**
 * Update Keg Products Inventory
 * Sets all keg products to quantity 3 (in stock)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'premier-concierge.myshopify.com';
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

if (!SHOPIFY_DOMAIN || !ADMIN_TOKEN) {
  console.error('Missing SHOPIFY_DOMAIN or ADMIN_TOKEN in environment');
  process.exit(1);
}

const GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`;

async function shopifyAdmin(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': ADMIN_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2));
  }

  return data;
}

// Search for keg products with multiple queries
async function findKegProducts() {
  const searchTerms = ['keg', 'barrel', 'tap rental', 'tub rental', 'party package'];
  const allProducts = new Map();

  for (const term of searchTerms) {
    const query = `
      query($searchTerm: String!) {
        products(first: 50, query: $searchTerm) {
          edges {
            node {
              id
              title
              handle
              status
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price
                    inventoryQuantity
                    inventoryItem {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await shopifyAdmin(query, { searchTerm: term });
    const products = result.data?.products?.edges?.map(e => e.node) || [];

    for (const product of products) {
      if (!allProducts.has(product.id)) {
        allProducts.set(product.id, product);
      }
    }
  }

  return Array.from(allProducts.values());
}

// Get inventory location
async function getLocationId() {
  const query = `
    query {
      locations(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  const result = await shopifyAdmin(query);
  return result.data?.locations?.edges?.[0]?.node?.id;
}

// Update inventory quantity
async function setInventoryQuantity(inventoryItemId, locationId, quantity) {
  const query = `
    mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) {
        inventoryAdjustmentGroup {
          createdAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      name: "available",
      reason: "correction",
      ignoreCompareQuantity: true,
      quantities: [
        {
          inventoryItemId: inventoryItemId,
          locationId: locationId,
          quantity: quantity
        }
      ]
    }
  };

  return shopifyAdmin(query, variables);
}

async function main() {
  console.log('='.repeat(50));
  console.log('Keg Products Inventory Update');
  console.log('='.repeat(50));
  console.log(`Store: ${SHOPIFY_DOMAIN}\n`);

  // Get location
  const locationId = await getLocationId();
  console.log(`Location ID: ${locationId}\n`);

  if (!locationId) {
    console.error('Could not find inventory location');
    process.exit(1);
  }

  // Find keg products
  const products = await findKegProducts();
  console.log(`Found ${products.length} keg-related products:\n`);

  for (const product of products) {
    // Skip archived products
    if (product.status === 'ARCHIVED') {
      continue;
    }

    console.log(`─`.repeat(40));
    console.log(`${product.title}`);
    console.log(`  Handle: ${product.handle}`);
    console.log(`  Status: ${product.status}`);

    for (const variantEdge of product.variants.edges) {
      const variant = variantEdge.node;
      console.log(`  Variant: ${variant.title}`);
      console.log(`    Price: $${variant.price}`);
      console.log(`    Current Qty: ${variant.inventoryQuantity}`);

      if (variant.inventoryItem?.id) {
        console.log(`    Updating to qty: 3...`);

        const result = await setInventoryQuantity(
          variant.inventoryItem.id,
          locationId,
          3
        );

        if (result.data?.inventorySetQuantities?.userErrors?.length > 0) {
          console.log(`    ⚠ Error: ${result.data.inventorySetQuantities.userErrors[0].message}`);
        } else {
          console.log(`    ✓ Updated to 3`);
        }
      } else {
        console.log(`    ⚠ No inventory item ID - may be untracked`);
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('Done!');
}

main().catch(console.error);
