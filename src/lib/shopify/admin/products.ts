/**
 * Shopify Admin API Product Management
 *
 * Functions to edit and manage products via Admin API
 */

interface ProductUpdate {
  id: string;
  title?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  status?: 'active' | 'archived' | 'draft';
  published_scope?: 'web' | 'global';
}

interface Product {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  status: string;
  published_scope: string;
  handle: string;
  images: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    inventory_quantity: number;
  }>;
}

/**
 * Get all products from Shopify Admin API
 */
export async function getAllProducts(): Promise<Product[]> {
  const shop = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!shop || !accessToken) {
    throw new Error('Missing required environment variables');
  }

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/products.json?limit=250`,
    {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const { products } = await response.json();
  return products;
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<Product> {
  const shop = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!shop || !accessToken) {
    throw new Error('Missing required environment variables');
  }

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/products/${productId}.json`,
    {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  const { product } = await response.json();
  return product;
}

/**
 * Update a product
 */
export async function updateProduct(productId: string, updates: Partial<ProductUpdate>): Promise<Product> {
  const shop = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!shop || !accessToken) {
    throw new Error('Missing required environment variables');
  }

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/products/${productId}.json`,
    {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: {
          id: productId,
          ...updates
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update product: ${error}`);
  }

  const { product } = await response.json();
  return product;
}

/**
 * Add tags to a product (preserves existing tags)
 */
export async function addTagsToProduct(productId: string, newTags: string[]): Promise<Product> {
  // First get the current product to get existing tags
  const product = await getProduct(productId);

  // Parse existing tags (comma-separated string)
  const existingTags = product.tags ? product.tags.split(',').map(tag => tag.trim()) : [];

  // Combine existing and new tags, removing duplicates
  const allTags = [...new Set([...existingTags, ...newTags])];

  // Update product with combined tags
  return updateProduct(productId, {
    tags: allTags.join(', ')
  });
}

/**
 * Remove tags from a product
 */
export async function removeTagsFromProduct(productId: string, tagsToRemove: string[]): Promise<Product> {
  // First get the current product to get existing tags
  const product = await getProduct(productId);

  // Parse existing tags
  const existingTags = product.tags ? product.tags.split(',').map(tag => tag.trim()) : [];

  // Filter out tags to remove
  const filteredTags = existingTags.filter(tag => !tagsToRemove.includes(tag));

  // Update product with filtered tags
  return updateProduct(productId, {
    tags: filteredTags.join(', ')
  });
}

/**
 * Set tags for a product (replaces all existing tags)
 */
export async function setProductTags(productId: string, tags: string[]): Promise<Product> {
  return updateProduct(productId, {
    tags: tags.join(', ')
  });
}

/**
 * Bulk update multiple products with the same tags
 */
export async function bulkAddTags(productIds: string[], tags: string[]): Promise<void> {
  console.log(`Adding tags [${tags.join(', ')}] to ${productIds.length} products...`);

  for (const productId of productIds) {
    try {
      await addTagsToProduct(productId, tags);
      console.log(`✓ Updated product ${productId}`);
    } catch (error) {
      console.error(`✗ Failed to update product ${productId}:`, error);
    }
  }

  console.log('Bulk tag update complete');
}

/**
 * Get all products with a specific tag
 */
export async function getProductsByTag(tag: string): Promise<Product[]> {
  const allProducts = await getAllProducts();
  return allProducts.filter(product =>
    product.tags && product.tags.split(',').map(t => t.trim()).includes(tag)
  );
}

/**
 * Update product type for multiple products
 */
export async function bulkUpdateProductType(productIds: string[], productType: string): Promise<void> {
  console.log(`Setting product type to "${productType}" for ${productIds.length} products...`);

  for (const productId of productIds) {
    try {
      await updateProduct(productId, { product_type: productType });
      console.log(`✓ Updated product ${productId}`);
    } catch (error) {
      console.error(`✗ Failed to update product ${productId}:`, error);
    }
  }

  console.log('Bulk product type update complete');
}