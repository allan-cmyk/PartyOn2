/**
 * Product Resolver
 * Resolves Shopify product handles to variant IDs for cart operations
 */

import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCTS_BY_HANDLES_QUERY } from '@/lib/shopify/queries/products';
import type { CalculatedItem, CartLineItem } from './types';

// ============================================================================
// TYPES
// ============================================================================

interface ShopifyVariant {
  id: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  productType: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyVariant;
    }>;
  };
}

interface ProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

// ============================================================================
// CACHE
// ============================================================================

// Simple in-memory cache for resolved products
// Cleared on page reload
const productCache = new Map<string, ShopifyProduct>();

// ============================================================================
// RESOLVER FUNCTIONS
// ============================================================================

/**
 * Build Shopify query string from handles
 * Format: "handle:product-1 OR handle:product-2 OR handle:product-3"
 */
function buildHandleQuery(handles: string[]): string {
  return handles.map((h) => `handle:${h}`).join(' OR ');
}

/**
 * Resolve multiple product handles to their Shopify data
 * Uses caching to avoid repeated API calls
 */
export async function resolveProducts(
  handles: string[]
): Promise<Map<string, ShopifyProduct>> {
  const result = new Map<string, ShopifyProduct>();
  const uncachedHandles: string[] = [];

  // Check cache first
  for (const handle of handles) {
    const cached = productCache.get(handle);
    if (cached) {
      result.set(handle, cached);
    } else {
      uncachedHandles.push(handle);
    }
  }

  // Fetch uncached products from Shopify
  if (uncachedHandles.length > 0) {
    try {
      const queryString = buildHandleQuery(uncachedHandles);

      const response = await shopifyFetch<ProductsResponse>({
        query: PRODUCTS_BY_HANDLES_QUERY,
        variables: {
          query: queryString,
          first: uncachedHandles.length,
        },
      });

      // Process response and update cache
      for (const edge of response.products.edges) {
        const product = edge.node;
        productCache.set(product.handle, product);
        result.set(product.handle, product);
      }
    } catch (error) {
      console.error('Error resolving products:', error);
      // Return what we have from cache even if API fails
    }
  }

  return result;
}

/**
 * Get variant ID for a product handle
 * Returns null if product not found or not available
 */
export async function getVariantId(handle: string): Promise<string | null> {
  const products = await resolveProducts([handle]);
  const product = products.get(handle);

  if (!product) {
    console.warn(`Product not found: ${handle}`);
    return null;
  }

  const variant = product.variants.edges[0]?.node;

  if (!variant) {
    console.warn(`No variant found for: ${handle}`);
    return null;
  }

  if (!variant.availableForSale) {
    console.warn(`Product not available: ${handle}`);
    return null;
  }

  return variant.id;
}

/**
 * Resolve calculated items to cart line items
 * Fetches variant IDs for all products and returns cart-ready items
 */
export async function resolveCartItems(
  items: CalculatedItem[]
): Promise<CartLineItem[]> {
  // Get all unique handles
  const handles = [...new Set(items.map((item) => item.product.handle))];

  // Resolve all products
  const products = await resolveProducts(handles);

  // Build cart items
  const cartItems: CartLineItem[] = [];

  for (const item of items) {
    const product = products.get(item.product.handle);

    if (!product) {
      console.warn(`Skipping unavailable product: ${item.product.name}`);
      continue;
    }

    const variant = product.variants.edges[0]?.node;

    if (!variant?.availableForSale) {
      console.warn(`Skipping out-of-stock product: ${item.product.name}`);
      continue;
    }

    cartItems.push({
      merchandiseId: variant.id,
      quantity: item.quantity,
    });
  }

  return cartItems;
}

/**
 * Update calculated items with resolved data
 * Adds variant IDs and actual prices from Shopify
 */
export async function enrichCalculatedItems(
  items: CalculatedItem[]
): Promise<CalculatedItem[]> {
  const handles = [...new Set(items.map((item) => item.product.handle))];
  const products = await resolveProducts(handles);

  return items.map((item) => {
    const product = products.get(item.product.handle);
    const variant = product?.variants.edges[0]?.node;

    if (!product || !variant) {
      return {
        ...item,
        available: false,
      };
    }

    const actualPrice = parseFloat(variant.price.amount);

    return {
      ...item,
      variantId: variant.id,
      unitPrice: actualPrice,
      subtotal: actualPrice * item.quantity,
      available: variant.availableForSale,
    };
  });
}

/**
 * Clear the product cache
 * Useful for testing or forcing fresh data
 */
export function clearProductCache(): void {
  productCache.clear();
}
