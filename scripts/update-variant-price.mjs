import 'dotenv/config';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;

const productId = 'gid://shopify/Product/8715956224178';

const BULK_UPDATE_MUTATION = `
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
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

const GET_PRODUCT = `
  query getProduct($id: ID!) {
    product(id: $id) {
      variants(first: 1) {
        edges {
          node {
            id
            price
          }
        }
      }
    }
  }
`;

async function updateVariant() {
  // Get variant ID
  console.log('Getting variant ID...');
  const getRes = await fetch(
    `https://${domain}/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: GET_PRODUCT, variables: { id: productId } }),
    }
  );
  const getData = await getRes.json();

  if (getData.errors) {
    console.error('Error getting product:', getData.errors);
    return;
  }

  const variantId = getData.data?.product?.variants?.edges?.[0]?.node?.id;
  const currentPrice = getData.data?.product?.variants?.edges?.[0]?.node?.price;
  console.log('Variant ID:', variantId);
  console.log('Current Price:', currentPrice);

  // Update variant
  console.log('\nUpdating variant price to $449.99...');
  const updateRes = await fetch(
    `https://${domain}/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: BULK_UPDATE_MUTATION,
        variables: {
          productId: productId,
          variants: [{
            id: variantId,
            price: '449.99'
          }]
        }
      }),
    }
  );
  const updateData = await updateRes.json();

  if (updateData.errors) {
    console.error('Error:', updateData.errors);
  } else if (updateData.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
    console.error('User Errors:', updateData.data.productVariantsBulkUpdate.userErrors);
  } else {
    console.log('✅ Variant updated successfully!');
    console.log('Updated variant:', updateData.data?.productVariantsBulkUpdate?.productVariants);
  }
}

updateVariant();
