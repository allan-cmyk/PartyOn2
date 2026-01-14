/**
 * Shopify Sync Service
 * Note: Products managed via Shopify Storefront API - local sync not implemented
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

const NOT_IMPLEMENTED = 'Products managed via Shopify Storefront API - local sync not implemented';

// Local type definitions (models don't exist in Prisma)
type SyncDirection = 'SHOPIFY_TO_LOCAL' | 'LOCAL_TO_SHOPIFY';
type SyncStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

/**
 * Sync result type
 */
interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Product sync data from Shopify
 */
interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  priceRange: {
    minVariantPrice: { amount: string };
    maxVariantPrice: { amount: string };
  };
  compareAtPriceRange?: {
    minVariantPrice: { amount: string };
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku?: string;
        price: { amount: string };
        compareAtPrice?: { amount: string };
        availableForSale: boolean;
        quantityAvailable?: number;
        selectedOptions: Array<{ name: string; value: string }>;
        weight?: number;
        weightUnit?: string;
      };
    }>;
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    }>;
  };
}

/**
 * Sync a single product from Shopify to local database (stub)
 */
export async function syncProductFromShopify(
  _shopifyProduct: ShopifyProduct
): Promise<{ success: boolean; productId?: string; error?: string }> {
  console.log('[ShopifySync] Sync disabled - products managed via Shopify');
  return { success: false, error: NOT_IMPLEMENTED };
}

/**
 * Sync multiple products from Shopify (stub)
 */
export async function syncProductsFromShopify(
  _products: ShopifyProduct[]
): Promise<SyncResult> {
  console.log('[ShopifySync] Sync disabled - products managed via Shopify');
  return {
    success: false,
    synced: 0,
    failed: 0,
    errors: [NOT_IMPLEMENTED],
  };
}

/**
 * Get last sync time for an entity type (stub)
 */
export async function getLastSyncTime(
  _entityType: string
): Promise<Date | null> {
  return null;
}

/**
 * Get sync history (stub)
 */
export async function getSyncHistory(
  _entityType?: string,
  _limit = 50
): Promise<
  Array<{
    id: string;
    entityType: string;
    entityId: string;
    direction: string;
    status: string;
    errorMessage: string | null;
    syncedAt: Date | null;
    createdAt: Date;
  }>
> {
  return [];
}
