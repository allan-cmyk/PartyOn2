/**
 * Add Product from URL - Shopify Product Creator
 *
 * This script creates a Shopify product from extracted URL data.
 * Called by Claude with product data as JSON argument.
 *
 * Usage: node scripts/add-product-from-url.mjs '<JSON_DATA>'
 *
 * JSON_DATA format:
 * {
 *   "name": "Product Name",
 *   "size": "750ml",
 *   "originalPrice": 359.99,
 *   "description": "Original description to rephrase",
 *   "descriptionHtml": "<p>HTML formatted description</p>",
 *   "category": "Scotch",
 *   "vendor": "Macallan",
 *   "imageUrl": "https://...",
 *   "details": {
 *     "abv": "43%",
 *     "country": "Scotland",
 *     "region": "Highland",
 *     "taste": "Rich, Citrus, Spice"
 *   }
 * }
 */

import 'dotenv/config';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;

if (!domain || !adminToken) {
  console.error('Missing Shopify credentials. Check your .env file.');
  process.exit(1);
}

// Category to ProductType mapping
const CATEGORY_MAP = {
  'scotch': 'Whiskey',
  'whisky': 'Whiskey',
  'whiskey': 'Whiskey',
  'single malt': 'Whiskey',
  'blended': 'Whiskey',
  'bourbon': 'Bourbon',
  'rye': 'Whiskey',
  'vodka': 'Vodka',
  'tequila': 'Tequila',
  'mezcal': 'Tequila',
  'rum': 'Rum',
  'gin': 'Gin',
  'wine': 'Wine',
  'red wine': 'Wine',
  'white wine': 'Wine',
  'rose': 'Wine',
  'rosé': 'Wine',
  'beer': 'Beer',
  'ale': 'Beer',
  'lager': 'Beer',
  'ipa': 'Beer',
  'champagne': 'Champagne & Sparkling',
  'sparkling': 'Champagne & Sparkling',
  'prosecco': 'Champagne & Sparkling',
  'cognac': 'Brandy & Cognac',
  'brandy': 'Brandy & Cognac',
  'liqueur': 'Liqueurs',
  'cordial': 'Liqueurs',
  'aperitif': 'Liqueurs',
  'vermouth': 'Liqueurs',
  'amaro': 'Liqueurs',
};

// Collection handles for auto-assignment
const COLLECTION_MAP = {
  'Whiskey': 'whiskey',
  'Bourbon': 'bourbon',
  'Vodka': 'vodka',
  'Tequila': 'tequila',
  'Rum': 'rum',
  'Gin': 'gin',
  'Wine': 'wine',
  'Beer': 'beer',
  'Champagne & Sparkling': 'champagne-sparkling',
  'Brandy & Cognac': 'brandy-cognac',
  'Liqueurs': 'liqueurs',
};

/**
 * Calculate price with 27% markup, rounded up to nearest .99
 */
function calculatePrice(originalPrice) {
  const withMarkup = originalPrice * 1.27;
  const roundedUp = Math.ceil(withMarkup);
  return (roundedUp - 0.01).toFixed(2);
}

/**
 * Map category string to Shopify product type
 */
function mapCategory(category) {
  if (!category) return 'Spirits';
  const lower = category.toLowerCase();

  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  return 'Spirits';
}

/**
 * Generate SKU from product details
 */
function generateSku(vendor, name, size) {
  const vendorPart = (vendor || 'UNKNOWN').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  const namePart = (name || 'PRODUCT').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
  const sizePart = (size || '750ML').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${vendorPart}-${namePart}-${sizePart}`;
}

/**
 * Generate tags from product data
 */
function generateTags(data, productType) {
  const tags = new Set();

  // Add product type
  if (productType) tags.add(productType);

  // Add category
  if (data.category) tags.add(data.category);

  // Add vendor/brand
  if (data.vendor) tags.add(data.vendor);

  // Add details
  if (data.details?.country) tags.add(data.details.country);
  if (data.details?.region) tags.add(data.details.region);

  // Add size
  if (data.size) tags.add(data.size);

  return Array.from(tags);
}

async function shopifyFetch(query, variables = {}) {
  const response = await fetch(
    `https://${domain}/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  return response.json();
}

async function shopifyRest(endpoint, method, body = null) {
  const options = {
    method,
    headers: {
      'X-Shopify-Access-Token': adminToken,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`https://${domain}/admin/api/2024-01/${endpoint}`, options);
  return response.json();
}

const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
    productCreate(input: $input, media: $media) {
      product {
        id
        title
        handle
        status
        variants(first: 1) {
          edges {
            node {
              id
              price
              sku
              inventoryItem {
                id
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_VARIANT_MUTATION = `
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
        price
      }
      userErrors {
        field
        message
      }
    }
  }
`;

async function createProduct(data) {
  // Calculate values
  const size = data.size || '750ml';
  const title = `${data.name} • ${size}`;
  const newPrice = calculatePrice(data.originalPrice);
  const productType = mapCategory(data.category);
  const sku = generateSku(data.vendor, data.name, size);
  const tags = generateTags(data, productType);

  console.log('\n📦 Creating Product in Shopify...');
  console.log(`   Title: ${title}`);
  console.log(`   Original Price: $${data.originalPrice}`);
  console.log(`   New Price: $${newPrice} (+27%)`);
  console.log(`   Category: ${productType}`);
  console.log(`   Vendor: ${data.vendor}`);
  console.log(`   SKU: ${sku}`);
  console.log(`   Tags: ${tags.join(', ')}`);

  // Step 1: Create the product
  const input = {
    title,
    descriptionHtml: data.descriptionHtml || `<p>${data.description}</p>`,
    vendor: data.vendor || 'Unknown',
    productType,
    tags,
    status: 'ACTIVE',
  };

  const media = data.imageUrl ? [
    {
      originalSource: data.imageUrl,
      mediaContentType: 'IMAGE',
      alt: title
    }
  ] : [];

  console.log('\n   Step 1: Creating product...');
  const createResult = await shopifyFetch(CREATE_PRODUCT_MUTATION, { input, media });

  if (createResult.errors) {
    console.error('   ❌ GraphQL Errors:', JSON.stringify(createResult.errors, null, 2));
    return null;
  }

  if (createResult.data?.productCreate?.userErrors?.length > 0) {
    console.error('   ❌ User Errors:', JSON.stringify(createResult.data.productCreate.userErrors, null, 2));
    return null;
  }

  const product = createResult.data?.productCreate?.product;
  if (!product) {
    console.error('   ❌ No product returned');
    return null;
  }

  console.log(`   ✓ Product created: ${product.id}`);

  // Step 2: Update variant price
  const variantId = product.variants?.edges?.[0]?.node?.id;
  if (variantId) {
    console.log('   Step 2: Setting price...');
    const updateResult = await shopifyFetch(UPDATE_VARIANT_MUTATION, {
      productId: product.id,
      variants: [{ id: variantId, price: newPrice }]
    });

    if (updateResult.errors || updateResult.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
      console.log('   ⚠ Price update via GraphQL failed, trying REST...');
    } else {
      console.log(`   ✓ Price set to $${newPrice}`);
    }
  }

  // Step 3: Update SKU and inventory policy via REST API
  const variantNumericId = variantId?.replace('gid://shopify/ProductVariant/', '');
  if (variantNumericId) {
    console.log('   Step 3: Setting SKU and inventory policy...');
    const restResult = await shopifyRest(`variants/${variantNumericId}.json`, 'PUT', {
      variant: {
        id: variantNumericId,
        sku: sku,
        price: newPrice,
        inventory_policy: 'continue', // Sell when out of stock
        inventory_management: 'shopify', // Track inventory
      }
    });

    if (restResult.variant) {
      console.log(`   ✓ SKU set to ${restResult.variant.sku}`);
      console.log(`   ✓ Inventory policy: continue selling when out of stock`);
    } else if (restResult.errors) {
      console.log('   ⚠ REST update error:', restResult.errors);
    }
  }

  // Final output
  const productNumericId = product.id.replace('gid://shopify/Product/', '');

  console.log('\n' + '═'.repeat(60));
  console.log('✅ PRODUCT CREATED SUCCESSFULLY!');
  console.log('═'.repeat(60));
  console.log(`   Title: ${title}`);
  console.log(`   Price: $${newPrice} (was $${data.originalPrice} + 27%)`);
  console.log(`   SKU: ${sku}`);
  console.log(`   Category: ${productType}`);
  console.log(`   Vendor: ${data.vendor}`);
  console.log(`   Handle: ${product.handle}`);
  console.log('');
  console.log(`   🔗 Store URL: https://${domain}/products/${product.handle}`);
  console.log(`   🔗 Admin URL: https://${domain}/admin/products/${productNumericId}`);
  console.log('═'.repeat(60));

  return {
    id: product.id,
    numericId: productNumericId,
    title,
    handle: product.handle,
    price: newPrice,
    originalPrice: data.originalPrice,
    sku,
    productType,
    vendor: data.vendor,
    storeUrl: `https://${domain}/products/${product.handle}`,
    adminUrl: `https://${domain}/admin/products/${productNumericId}`,
  };
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/add-product-from-url.mjs \'<JSON_DATA>\'');
  console.log('\nJSON_DATA should contain: name, size, originalPrice, description, category, vendor, imageUrl');
  process.exit(1);
}

try {
  const data = JSON.parse(args[0]);

  if (!data.name) {
    console.error('Error: Product name is required');
    process.exit(1);
  }
  if (!data.originalPrice) {
    console.error('Error: Original price is required');
    process.exit(1);
  }

  createProduct(data).then(result => {
    if (result) {
      // Output JSON for programmatic use
      console.log('\n📋 JSON Output:');
      console.log(JSON.stringify(result, null, 2));
    }
  });
} catch (error) {
  console.error('Error parsing JSON data:', error.message);
  process.exit(1);
}
