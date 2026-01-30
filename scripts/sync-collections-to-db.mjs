/**
 * Script to sync Shopify collections to local Prisma database
 * 1. Creates/updates Category records from Shopify collections
 * 2. Creates ProductCategory links based on Shopify collection membership
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

const ADMIN_API_URL = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`;

async function shopifyAdminFetch(query, variables = {}) {
  const response = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

// Get all collections from Shopify
async function getShopifyCollections() {
  let allCollections = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `
      query($cursor: String) {
        collections(first: 50, after: $cursor) {
          edges {
            node {
              id
              handle
              title
              description
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    const result = await shopifyAdminFetch(query, { cursor });
    const collections = result.data?.collections?.edges?.map(e => e.node) || [];
    allCollections = allCollections.concat(collections);
    hasNextPage = result.data?.collections?.pageInfo?.hasNextPage || false;
    cursor = result.data?.collections?.pageInfo?.endCursor;
  }

  return allCollections;
}

// Get products in a collection
async function getCollectionProducts(collectionId) {
  let allProducts = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `
      query($id: ID!, $cursor: String) {
        collection(id: $id) {
          products(first: 100, after: $cursor) {
            edges {
              node {
                id
                handle
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;
    const result = await shopifyAdminFetch(query, { id: collectionId, cursor });
    const products = result.data?.collection?.products?.edges?.map(e => e.node) || [];
    allProducts = allProducts.concat(products);
    hasNextPage = result.data?.collection?.products?.pageInfo?.hasNextPage || false;
    cursor = result.data?.collection?.products?.pageInfo?.endCursor;
  }

  return allProducts;
}

// Collections we care about (matching the UI filter buttons)
const TARGET_COLLECTIONS = [
  'favorites-home-page',
  'cocktail-kits',
  'bachelor-favorites',
  'bachelorette-booze',
  'tailgate-beer',
  'seltzer-collection',
  'champagne',
  'spirits',
  'mixers-non-alcoholic',
];

async function main() {
  console.log('=== Sync Shopify Collections to Local DB ===\n');

  try {
    // Step 1: Get all Shopify collections
    console.log('Step 1: Fetching Shopify collections...');
    const shopifyCollections = await getShopifyCollections();
    console.log(`Found ${shopifyCollections.length} Shopify collections`);

    // Filter to target collections
    const targetCollections = shopifyCollections.filter(c =>
      TARGET_COLLECTIONS.includes(c.handle)
    );
    console.log(`Processing ${targetCollections.length} target collections`);

    // Step 2: Create/update categories in local DB
    console.log('\nStep 2: Syncing categories to local database...');
    for (const collection of targetCollections) {
      const category = await prisma.category.upsert({
        where: { handle: collection.handle },
        update: {
          title: collection.title,
          description: collection.description || null,
          shopifyCollectionId: collection.id,
        },
        create: {
          handle: collection.handle,
          title: collection.title,
          description: collection.description || null,
          shopifyCollectionId: collection.id,
        },
      });
      console.log(`  ✓ ${collection.handle}: ${category.id}`);
    }

    // Step 3: For each collection, get products and create links
    console.log('\nStep 3: Syncing product-category relationships...');

    for (const collection of targetCollections) {
      console.log(`\nProcessing: ${collection.handle}`);

      // Get products from Shopify collection
      const shopifyProducts = await getCollectionProducts(collection.id);
      console.log(`  Found ${shopifyProducts.length} products in Shopify`);

      if (shopifyProducts.length === 0) continue;

      // Get the category ID from local DB
      const category = await prisma.category.findUnique({
        where: { handle: collection.handle },
      });

      if (!category) {
        console.log(`  ⚠ Category not found in DB`);
        continue;
      }

      // Find matching local products by handle
      const productHandles = shopifyProducts.map(p => p.handle);
      const localProducts = await prisma.product.findMany({
        where: {
          handle: { in: productHandles },
        },
        select: { id: true, handle: true },
      });

      console.log(`  Found ${localProducts.length} matching local products`);

      // Create product-category links
      let created = 0;
      let skipped = 0;

      for (const product of localProducts) {
        try {
          await prisma.productCategory.upsert({
            where: {
              productId_categoryId: {
                productId: product.id,
                categoryId: category.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              categoryId: category.id,
              position: 0,
            },
          });
          created++;
        } catch (e) {
          skipped++;
        }
      }

      console.log(`  ✓ Created/updated ${created} links, skipped ${skipped}`);
    }

    // Step 4: Verify
    console.log('\n\nStep 4: Verification...');
    const categories = await prisma.category.findMany({
      where: { handle: { in: TARGET_COLLECTIONS } },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    console.log('Category product counts in local DB:');
    for (const cat of categories) {
      console.log(`  - ${cat.handle}: ${cat._count.products} products`);
    }

    console.log('\n=== Done! ===');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
