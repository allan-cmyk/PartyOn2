const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Shopify Admin API configuration
const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-01';

async function fetchAllProducts() {
  const products = [];
  let hasNextPage = true;
  let pageInfo = null;
  
  while (hasNextPage) {
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/products.json?limit=250${pageInfo ? `&page_info=${pageInfo}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    
    const linkHeader = response.headers.get('link');
    hasNextPage = linkHeader && linkHeader.includes('rel="next"');
    
    if (hasNextPage) {
      const match = linkHeader.match(/page_info=([^>]+)>; rel="next"/);
      pageInfo = match ? match[1] : null;
    }
    
    const data = await response.json();
    products.push(...data.products);
    
    console.log(`Fetched ${products.length} products...`);
  }
  
  return products;
}

async function fetchInventoryLevels() {
  const inventoryItems = [];
  let hasNextPage = true;
  let pageInfo = null;
  
  // First get location IDs
  const locationsResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/locations.json`, {
    headers: {
      'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  
  const locationsData = await locationsResponse.json();
  const locations = locationsData.locations || [];
  console.log(`Found ${locations.length} locations`);
  
  // Get inventory levels for each location
  for (const location of locations) {
    hasNextPage = true;
    pageInfo = null;
    
    while (hasNextPage) {
      const url = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/inventory_levels.json?location_ids=${location.id}&limit=250${pageInfo ? `&page_info=${pageInfo}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      
      const linkHeader = response.headers.get('link');
      hasNextPage = linkHeader && linkHeader.includes('rel="next"');
      
      if (hasNextPage) {
        const match = linkHeader.match(/page_info=([^>]+)>; rel="next"/);
        pageInfo = match ? match[1] : null;
      }
      
      const data = await response.json();
      inventoryItems.push(...data.inventory_levels.map(item => ({
        ...item,
        location_name: location.name,
        location_id: location.id
      })));
    }
  }
  
  console.log(`Fetched ${inventoryItems.length} inventory levels`);
  return inventoryItems;
}

async function exportInventoryToCSV() {
  try {
    console.log('Starting Shopify inventory export...');
    
    // Fetch all products and inventory levels
    const [products, inventoryLevels] = await Promise.all([
      fetchAllProducts(),
      fetchInventoryLevels()
    ]);
    
    // Create inventory map for quick lookup
    const inventoryMap = {};
    inventoryLevels.forEach(item => {
      inventoryMap[item.inventory_item_id] = item;
    });
    
    // Prepare CSV data
    const csvRows = [];
    csvRows.push([
      'SKU',
      'Product_Title',
      'Variant_Title',
      'Barcode',
      'Price',
      'Compare_At_Price',
      'Cost',
      'Available_Quantity',
      'On_Hand_Quantity',
      'Reserved_Quantity',
      'Location',
      'Product_Type',
      'Vendor',
      'Tags',
      'Status',
      'Product_ID',
      'Variant_ID',
      'Inventory_Item_ID',
      'Last_Updated',
      'Notes'
    ].join(','));
    
    // Process each product and its variants
    products.forEach(product => {
      product.variants.forEach(variant => {
        const inventory = inventoryMap[variant.inventory_item_id] || {};
        
        const row = [
          variant.sku || '',
          `"${product.title.replace(/"/g, '""')}"`,
          `"${variant.title.replace(/"/g, '""')}"`,
          variant.barcode || '',
          variant.price || '0.00',
          variant.compare_at_price || '',
          variant.inventory_item?.cost || '',
          inventory.available || '0',
          inventory.available || '0', // On hand (same as available for now)
          '0', // Reserved (not available in this API)
          inventory.location_name || 'Default',
          product.product_type || '',
          product.vendor || '',
          `"${(product.tags || '').replace(/"/g, '""')}"`,
          product.status || 'active',
          product.id,
          variant.id,
          variant.inventory_item_id || '',
          inventory.updated_at || new Date().toISOString(),
          variant.inventory_policy === 'continue' ? 'Allow overselling' : ''
        ].join(',');
        
        csvRows.push(row);
      });
    });
    
    // Write to CSV file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `shopify_inventory_${timestamp}.csv`;
    const filepath = path.join(__dirname, '..', filename);
    
    fs.writeFileSync(filepath, csvRows.join('\n'), 'utf8');
    
    console.log(`\nInventory export completed!`);
    console.log(`File saved: ${filename}`);
    console.log(`Total products: ${products.length}`);
    console.log(`Total variants: ${csvRows.length - 1}`);
    console.log(`\nYou can now open this CSV file to conduct your physical inventory count.`);
    
    return filepath;
  } catch (error) {
    console.error('Error exporting inventory:', error);
    process.exit(1);
  }
}

// Run the export
exportInventoryToCSV();