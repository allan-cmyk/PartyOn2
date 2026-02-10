/**
 * Product Resolver
 * Resolves product handles to variant IDs for cart operations
 * Uses custom PostgreSQL API instead of Shopify
 */

import type { CalculatedItem, CartLineItem } from './types';

// ============================================================================
// TYPES
// ============================================================================

interface ResolvedVariant {
  id: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
}

interface ResolvedProduct {
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
      node: ResolvedVariant;
    }>;
  };
}

// ============================================================================
// CACHE
// ============================================================================

// Simple in-memory cache for resolved products
// Cleared on page reload
const productCache = new Map<string, ResolvedProduct>();

// ============================================================================
// RESOLVER FUNCTIONS
// ============================================================================

/**
 * Resolve multiple product handles to their data
 * Fetches from custom PostgreSQL API
 * Uses caching to avoid repeated API calls
 */
export async function resolveProducts(
  handles: string[]
): Promise<Map<string, ResolvedProduct>> {
  const result = new Map<string, ResolvedProduct>();
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

  // Fetch uncached products from custom API
  if (uncachedHandles.length > 0) {
    try {
      const fetchPromises = uncachedHandles.map(async (handle) => {
        try {
          const response = await fetch(`/api/products/${handle}`);
          if (!response.ok) return null;
          const product: ResolvedProduct = await response.json();
          return product;
        } catch {
          return null;
        }
      });

      const products = await Promise.all(fetchPromises);

      for (const product of products) {
        if (product) {
          productCache.set(product.handle, product);
          result.set(product.handle, product);
        }
      }
    } catch (error) {
      console.error('Error resolving products:', error);
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
  const handles = [...new Set(items.map((item) => item.product.handle))];
  const products = await resolveProducts(handles);

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
 * Adds variant IDs and actual prices
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
 */
export function clearProductCache(): void {
  productCache.clear();
}
