/**
 * Script to fix Shopify collections by:
 * 1. Listing existing collections
 * 2. Creating missing collections
 * 3. Assigning products to collections based on productType
 */

import 'dotenv/config';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;

if (!SHOPIFY_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
  console.error('Missing NEXT_PUBLIC_SHOPIFY_DOMAIN or SHOPIFY_ADMIN_API_TOKEN');
  process.exit(1);
}

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

  const data = await response.json();
  if (data.errors) {
    console.error('GraphQL errors:', JSON.stringify(data.errors, null, 2));
  }
  return data;
}

// Get all collections
async function getCollections() {
  const query = `
    query {
      collections(first: 100) {
        edges {
          node {
            id
            handle
            title
            productsCount {
              count
            }
          }
        }
      }
    }
  `;
  const result = await shopifyAdminFetch(query);
  return result.data?.collections?.edges?.map(e => ({
    ...e.node,
    productsCount: e.node.productsCount?.count || 0
  })) || [];
}

// Get collection by handle
async function getCollectionByHandle(handle) {
  const query = `
    query($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        handle
        title
        productsCount {
          count
        }
      }
    }
  `;
  const result = await shopifyAdminFetch(query, { handle });
  const collection = result.data?.collectionByHandle;
  if (collection) {
    return {
      ...collection,
      productsCount: collection.productsCount?.count || 0
    };
  }
  return null;
}

// Get all products with their types
async function getProducts() {
  let allProducts = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `
      query($cursor: String) {
        products(first: 50, after: $cursor) {
          edges {
            node {
              id
              title
              handle
              productType
              tags
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
    const products = result.data?.products?.edges?.map(e => e.node) || [];
    allProducts = allProducts.concat(products);
    hasNextPage = result.data?.products?.pageInfo?.hasNextPage || false;
    cursor = result.data?.products?.pageInfo?.endCursor;
    console.log(`Fetched ${allProducts.length} products...`);
  }

  return allProducts;
}

// Create a smart collection based on rules
async function createSmartCollection(title, handle, rules) {
  const query = `
    mutation createCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          handle
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    title,
    handle,
    ruleSet: {
      appliedDisjunctively: true, // OR between rules
      rules: rules.map(rule => ({
        column: rule.column,
        relation: rule.relation,
        condition: rule.condition,
      })),
    },
  };

  const result = await shopifyAdminFetch(query, { input });
  return result.data?.collectionCreate?.collection;
}

// Create a manual collection
async function createManualCollection(title, handle) {
  const query = `
    mutation createCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          handle
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    title,
    handle,
  };

  const result = await shopifyAdminFetch(query, { input });
  if (result.data?.collectionCreate?.userErrors?.length > 0) {
    console.error('Collection create errors:', result.data.collectionCreate.userErrors);
  }
  return result.data?.collectionCreate?.collection;
}

// Add products to a collection
async function addProductsToCollection(collectionId, productIds) {
  // Shopify requires using collectionAddProducts mutation
  const query = `
    mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) {
        collection {
          id
          title
          productsCount
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Add in batches of 250 (Shopify limit)
  const batchSize = 250;
  for (let i = 0; i < productIds.length; i += batchSize) {
    const batch = productIds.slice(i, i + batchSize);
    const result = await shopifyAdminFetch(query, {
      id: collectionId,
      productIds: batch,
    });
    if (result.data?.collectionAddProducts?.userErrors?.length > 0) {
      console.error('Add products errors:', result.data.collectionAddProducts.userErrors);
    } else {
      console.log(`Added batch of ${batch.length} products to collection`);
    }
  }
}

// Map product types to collection handles
const COLLECTION_MAPPING = {
  'favorites-home-page': {
    title: "Austin's Favorites",
    productTypes: ['Vodka', 'Tequila', 'Whiskey', 'Beer', 'Wine', 'Cocktail Kits'],
    limit: 20, // Only add top 20 products
  },
  'spirits': {
    title: 'Spirits',
    productTypes: ['Vodka', 'Tequila', 'Whiskey', 'Bourbon', 'Gin', 'Rum', 'Liquor & Spirits', 'Cognac', 'Brandy', 'Scotch', 'Rye'],
  },
  'cocktail-kits': {
    title: 'Cocktail Kits',
    productTypes: ['Cocktail', 'Cocktail Kits', 'Ready to Drink', 'RTD', 'Canned Cocktails'],
  },
  'tailgate-beer': {
    title: 'Beers',
    productTypes: ['beer and seltzers', 'Beer', 'Lager', 'IPA', 'Ale', 'Stout'],
  },
  'seltzer-collection': {
    title: 'Seltzers',
    productTypes: ['Seltzer', 'Hard Seltzer'],
  },
  'champagne': {
    title: 'Wine and Champagne',
    productTypes: ['champagne', 'Prosecco', 'Sparkling Wine', 'Wine', 'wine'],
  },
  'mixers-non-alcoholic': {
    title: 'Mixers & Non-Alcoholic',
    productTypes: ['Cocktail Mixes', 'non alcoholic', 'sparkling water', 'water', 'Juice', 'ice', 'Mixer', 'Tonic', 'Soda', 'Grocery'],
  },
  'bachelor-favorites': {
    title: 'Bachelor Favorites',
    productTypes: ['Beer', 'Whiskey', 'Bourbon'],
  },
  'bachelorette-booze': {
    title: 'Bachelorette Favorites',
    productTypes: ['Party Supplies', 'Sashes', 'Sunglasses', 'Shot Glass Necklace', 'Mesh Baseball Cap'],
  },
};

async function main() {
  console.log('=== Shopify Collections Fix Script ===\n');

  // Step 1: Get existing collections
  console.log('Step 1: Fetching existing collections...');
  const existingCollections = await getCollections();
  console.log(`Found ${existingCollections.length} existing collections:`);
  existingCollections.forEach(c => {
    console.log(`  - ${c.handle}: "${c.title}" (${c.productsCount} products)`);
  });

  // Step 2: Get all products
  console.log('\nStep 2: Fetching all products...');
  const products = await getProducts();
  console.log(`Found ${products.length} products total`);

  // Count product types
  const productTypeCounts = {};
  products.forEach(p => {
    const type = p.productType || 'Unknown';
    productTypeCounts[type] = (productTypeCounts[type] || 0) + 1;
  });
  console.log('\nProduct types found:');
  Object.entries(productTypeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

  // Step 3: Create or find collections and add products
  console.log('\nStep 3: Processing collections...');

  for (const [handle, config] of Object.entries(COLLECTION_MAPPING)) {
    console.log(`\nProcessing collection: ${handle}`);

    // Check if collection exists
    let collection = existingCollections.find(c => c.handle === handle);

    if (!collection) {
      console.log(`  Creating collection "${config.title}"...`);
      collection = await createManualCollection(config.title, handle);
      if (collection) {
        console.log(`  Created: ${collection.id}`);
      } else {
        // Try to fetch by handle directly
        console.log(`  Trying to fetch collection by handle...`);
        collection = await getCollectionByHandle(handle);
        if (!collection) {
          console.log(`  Failed to create or find collection`);
          continue;
        }
        console.log(`  Found existing collection: ${collection.id}`);
      }
    } else {
      console.log(`  Collection exists: ${collection.id} (${collection.productsCount} products)`);
    }

    // Find matching products
    const matchingProducts = products.filter(p => {
      const type = (p.productType || '').toLowerCase();
      return config.productTypes.some(t => t.toLowerCase() === type);
    });

    console.log(`  Found ${matchingProducts.length} matching products`);

    if (matchingProducts.length > 0) {
      // Apply limit if specified
      const productsToAdd = config.limit
        ? matchingProducts.slice(0, config.limit)
        : matchingProducts;

      const productIds = productsToAdd.map(p => p.id);
      console.log(`  Adding ${productIds.length} products to collection...`);
      await addProductsToCollection(collection.id, productIds);
    }
  }

  // Step 4: Verify
  console.log('\n\nStep 4: Verifying collections...');
  const updatedCollections = await getCollections();
  console.log('Updated collection counts:');
  updatedCollections.forEach(c => {
    console.log(`  - ${c.handle}: ${c.productsCount} products`);
  });

  console.log('\n=== Done! ===');
}

main().catch(console.error);
