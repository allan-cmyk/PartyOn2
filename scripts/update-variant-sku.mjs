import 'dotenv/config';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;

// Use REST API to update variant SKU
const variantNumericId = '46974089330866'; // Numeric ID from gid://shopify/ProductVariant/46974089330866

async function updateSku() {
  console.log('Updating variant SKU via REST API...');

  const response = await fetch(
    `https://${domain}/admin/api/2024-01/variants/${variantNumericId}.json`,
    {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variant: {
          id: variantNumericId,
          sku: 'MACALLAN-18-DC-750'
        }
      }),
    }
  );

  const data = await response.json();

  if (data.errors) {
    console.error('Error:', data.errors);
  } else if (data.variant) {
    console.log('✅ SKU updated successfully!');
    console.log('Variant ID:', data.variant.id);
    console.log('SKU:', data.variant.sku);
    console.log('Price:', data.variant.price);
  } else {
    console.log('Response:', JSON.stringify(data, null, 2));
  }
}

updateSku();
