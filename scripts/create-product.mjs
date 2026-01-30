/**
 * Create a new product in Shopify from extracted data
 * Usage: node scripts/create-product.mjs
 */

import 'dotenv/config';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;

if (!domain || !adminToken) {
  console.error('Missing Shopify credentials. Check your .env file.');
  process.exit(1);
}

// Product data extracted from Total Wine
const productData = {
  title: "Macallan 18 Year Double Cask Single Malt Scotch",
  descriptionHtml: `<p>This exceptional 18-year single malt from Macallan masterfully combines sherry-seasoned American and European oak casks, creating a perfectly balanced whisky. Experience rich dried fruits, warm ginger spice, and sweet toffee notes—all with naturally derived color from the finest oak.</p>
<p><strong>Details:</strong></p>
<ul>
<li>Country: Scotland (Highland)</li>
<li>ABV: 43%</li>
<li>Size: 750ml</li>
<li>Taste Profile: Rich, Citrus, Spice, Raisin</li>
<li>Finish: Long and Complex</li>
</ul>`,
  vendor: "Macallan",
  productType: "Scotch",
  tags: ["Scotch", "Single Malt", "Whisky", "Premium", "Highland", "18 Year", "Macallan"],
  imageUrl: "https://www.totalwine.com/dynamic/x1000,sq/images/231621750/231621750-1-fr.png",
  price: "449.99",
  sku: "MACALLAN-18-DC-750",
};

// Step 1: Create the product (without variants in input)
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

// Step 2: Update the variant with price and SKU
const UPDATE_VARIANT_MUTATION = `
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      productVariant {
        id
        price
        sku
      }
      userErrors {
        field
        message
      }
    }
  }
`;

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

async function createProduct() {
  console.log('Creating product in Shopify...');
  console.log(`Title: ${productData.title}`);
  console.log(`Price: $${productData.price}`);
  console.log(`Domain: ${domain}\n`);

  // Step 1: Create the product
  const input = {
    title: productData.title,
    descriptionHtml: productData.descriptionHtml,
    vendor: productData.vendor,
    productType: productData.productType,
    tags: productData.tags,
    status: "ACTIVE",
  };

  const media = [
    {
      originalSource: productData.imageUrl,
      mediaContentType: "IMAGE",
      alt: productData.title
    }
  ];

  console.log('Step 1: Creating product...');
  const createResult = await shopifyFetch(CREATE_PRODUCT_MUTATION, { input, media });

  if (createResult.errors) {
    console.error('GraphQL Errors:', JSON.stringify(createResult.errors, null, 2));
    return;
  }

  if (createResult.data?.productCreate?.userErrors?.length > 0) {
    console.error('User Errors:', JSON.stringify(createResult.data.productCreate.userErrors, null, 2));
    return;
  }

  const product = createResult.data?.productCreate?.product;
  if (!product) {
    console.error('No product returned');
    return;
  }

  console.log(`   Product created: ${product.id}`);

  // Step 2: Update the variant with price and SKU
  const variantId = product.variants?.edges?.[0]?.node?.id;
  if (variantId) {
    console.log('\nStep 2: Updating variant with price and SKU...');

    const variantInput = {
      id: variantId,
      price: productData.price,
      sku: productData.sku,
    };

    const updateResult = await shopifyFetch(UPDATE_VARIANT_MUTATION, { input: variantInput });

    if (updateResult.errors) {
      console.error('Variant Update Errors:', JSON.stringify(updateResult.errors, null, 2));
    } else if (updateResult.data?.productVariantUpdate?.userErrors?.length > 0) {
      console.error('Variant User Errors:', JSON.stringify(updateResult.data.productVariantUpdate.userErrors, null, 2));
    } else {
      console.log('   Variant updated successfully');
    }
  }

  // Final output
  console.log('\n✅ Product created successfully!');
  console.log(`   ID: ${product.id}`);
  console.log(`   Title: ${product.title}`);
  console.log(`   Handle: ${product.handle}`);
  console.log(`   Status: ${product.status}`);
  console.log(`   Price: $${productData.price}`);
  console.log(`   SKU: ${productData.sku}`);
  console.log(`\n   Store URL: https://${domain}/products/${product.handle}`);
  console.log(`   Admin URL: https://${domain}/admin/products/${product.id.replace('gid://shopify/Product/', '')}`);
}

createProduct();
