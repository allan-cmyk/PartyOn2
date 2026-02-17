/**
 * One-off script: Update Welcome to Austin package prices from $39.99 → $49.99 in Shopify
 *
 * Usage: node scripts/update-welcome-package-prices.mjs
 *
 * After running, trigger a product sync to update local DB:
 *   curl -X POST http://localhost:3002/api/admin/sync -H "Content-Type: application/json" -d '{"type":"products"}'
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;

if (!domain || !adminToken) {
  console.error('Missing NEXT_PUBLIC_SHOPIFY_DOMAIN or SHOPIFY_ADMIN_API_TOKEN');
  process.exit(1);
}

const ADMIN_API = `https://${domain}/admin/api/2024-01/graphql.json`;

async function adminGraphQL(query, variables = {}) {
  const res = await fetch(ADMIN_API, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': adminToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

// Step 1: Find all "Welcome to Austin" products
const FIND_PRODUCTS_QUERY = `
  query findWelcomePackages($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          variants(first: 20) {
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

const UPDATE_VARIANTS_MUTATION = `
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
        title
        price
      }
      userErrors {
        field
        message
      }
    }
  }
`;

async function main() {
  console.log('Searching for Welcome to Austin products...');

  const data = await adminGraphQL(FIND_PRODUCTS_QUERY, {
    query: 'title:Welcome to Austin',
    first: 20,
  });

  const products = data.products.edges.map(e => e.node);
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    console.log(`\nProduct: ${product.title} (${product.id})`);

    const variantsToUpdate = [];
    for (const edge of product.variants.edges) {
      const variant = edge.node;
      const currentPrice = parseFloat(variant.price);
      console.log(`  Variant: ${variant.title} — current price: $${currentPrice}`);

      if (currentPrice === 39.99) {
        variantsToUpdate.push({
          id: variant.id,
          price: '49.99',
        });
        console.log(`    → Will update to $49.99`);
      } else if (currentPrice === 49.99) {
        console.log(`    → Already $49.99, skipping`);
      } else {
        console.log(`    → Unexpected price, skipping`);
      }
    }

    if (variantsToUpdate.length > 0) {
      console.log(`  Updating ${variantsToUpdate.length} variant(s)...`);
      const result = await adminGraphQL(UPDATE_VARIANTS_MUTATION, {
        productId: product.id,
        variants: variantsToUpdate,
      });

      const errors = result.productVariantsBulkUpdate.userErrors;
      if (errors.length > 0) {
        console.error('  Errors:', errors);
      } else {
        const updated = result.productVariantsBulkUpdate.productVariants;
        for (const v of updated) {
          console.log(`  ✓ Updated ${v.title} to $${v.price}`);
        }
      }
    } else {
      console.log('  No variants need updating');
    }
  }

  console.log('\nDone! Now trigger a product sync to update local DB:');
  console.log('  curl -X POST http://localhost:3002/api/admin/sync -H "Content-Type: application/json" -d \'{"type":"products"}\'');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
