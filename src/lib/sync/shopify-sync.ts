/**
 * Shopify Sync Service
 * Synchronize data between Shopify and custom database
 */

import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';

// Use Prisma enums
import { SyncDirection, SyncStatus } from '@prisma/client';

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
 * Record a sync event
 */
async function recordSync(
  entityType: string,
  entityId: string,
  shopifyId: string,
  direction: SyncDirection,
  status: SyncStatus,
  errorMessage?: string
): Promise<void> {
  await prisma.shopifySync.create({
    data: {
      entityType,
      entityId,
      shopifyId,
      direction,
      status,
      errorMessage,
      syncedAt: status === SyncStatus.COMPLETED ? new Date() : null,
    },
  });
}

/**
 * Sync a single product from Shopify to local database
 */
export async function syncProductFromShopify(
  shopifyProduct: ShopifyProduct
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    // Parse Shopify GID to get just the ID
    const shopifyId = shopifyProduct.id.replace('gid://shopify/Product/', '');

    // Upsert product
    const product = await prisma.product.upsert({
      where: { shopifyId },
      update: {
        handle: shopifyProduct.handle,
        title: shopifyProduct.title,
        description: shopifyProduct.description,
        descriptionHtml: shopifyProduct.descriptionHtml,
        vendor: shopifyProduct.vendor,
        productType: shopifyProduct.productType,
        tags: shopifyProduct.tags || [],
        basePrice: new Prisma.Decimal(shopifyProduct.priceRange.minVariantPrice.amount),
        compareAtPrice: shopifyProduct.compareAtPriceRange?.minVariantPrice
          ? new Prisma.Decimal(shopifyProduct.compareAtPriceRange.minVariantPrice.amount)
          : null,
        shopifySyncedAt: new Date(),
      },
      create: {
        handle: shopifyProduct.handle,
        title: shopifyProduct.title,
        description: shopifyProduct.description,
        descriptionHtml: shopifyProduct.descriptionHtml,
        vendor: shopifyProduct.vendor,
        productType: shopifyProduct.productType,
        tags: shopifyProduct.tags || [],
        basePrice: new Prisma.Decimal(shopifyProduct.priceRange.minVariantPrice.amount),
        compareAtPrice: shopifyProduct.compareAtPriceRange?.minVariantPrice
          ? new Prisma.Decimal(shopifyProduct.compareAtPriceRange.minVariantPrice.amount)
          : null,
        shopifyId,
        shopifySyncedAt: new Date(),
        status: 'ACTIVE',
      },
    });

    // Sync variants
    for (const edge of shopifyProduct.variants.edges) {
      const variant = edge.node;
      const variantShopifyId = variant.id.replace('gid://shopify/ProductVariant/', '');

      // Build option fields
      const options = variant.selectedOptions || [];
      const option1 = options[0];
      const option2 = options[1];
      const option3 = options[2];

      await prisma.productVariant.upsert({
        where: { shopifyId: variantShopifyId },
        update: {
          title: variant.title,
          sku: variant.sku,
          price: new Prisma.Decimal(variant.price.amount),
          compareAtPrice: variant.compareAtPrice
            ? new Prisma.Decimal(variant.compareAtPrice.amount)
            : null,
          availableForSale: variant.availableForSale,
          inventoryQuantity: variant.quantityAvailable ?? 0,
          option1Name: option1?.name,
          option1Value: option1?.value,
          option2Name: option2?.name,
          option2Value: option2?.value,
          option3Name: option3?.name,
          option3Value: option3?.value,
          weight: variant.weight,
          weightUnit: variant.weightUnit,
        },
        create: {
          productId: product.id,
          shopifyId: variantShopifyId,
          title: variant.title,
          sku: variant.sku,
          price: new Prisma.Decimal(variant.price.amount),
          compareAtPrice: variant.compareAtPrice
            ? new Prisma.Decimal(variant.compareAtPrice.amount)
            : null,
          availableForSale: variant.availableForSale,
          inventoryQuantity: variant.quantityAvailable ?? 0,
          option1Name: option1?.name,
          option1Value: option1?.value,
          option2Name: option2?.name,
          option2Value: option2?.value,
          option3Name: option3?.name,
          option3Value: option3?.value,
          weight: variant.weight,
          weightUnit: variant.weightUnit,
        },
      });
    }

    // Sync images
    for (let i = 0; i < shopifyProduct.images.edges.length; i++) {
      const image = shopifyProduct.images.edges[i].node;
      const imageShopifyId = image.id.replace('gid://shopify/ProductImage/', '');

      await prisma.productImage.upsert({
        where: {
          shopifyId: imageShopifyId,
        },
        update: {
          url: image.url,
          altText: image.altText,
          width: image.width,
          height: image.height,
          position: i,
        },
        create: {
          productId: product.id,
          shopifyId: imageShopifyId,
          url: image.url,
          altText: image.altText,
          width: image.width,
          height: image.height,
          position: i,
        },
      });
    }

    // Record sync
    await recordSync('product', product.id, shopifyId, SyncDirection.SHOPIFY_TO_LOCAL, SyncStatus.COMPLETED);

    return { success: true, productId: product.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ShopifySync] Product sync error:', errorMsg);

    // Record failed sync
    const shopifyId = shopifyProduct.id.replace('gid://shopify/Product/', '');
    await recordSync('product', '', shopifyId, SyncDirection.SHOPIFY_TO_LOCAL, SyncStatus.FAILED, errorMsg);

    return { success: false, error: errorMsg };
  }
}

/**
 * Sync multiple products from Shopify
 */
export async function syncProductsFromShopify(
  products: ShopifyProduct[]
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  for (const product of products) {
    const syncResult = await syncProductFromShopify(product);
    if (syncResult.success) {
      result.synced++;
    } else {
      result.failed++;
      result.errors.push(`${product.handle}: ${syncResult.error}`);
    }
  }

  result.success = result.failed === 0;
  return result;
}

/**
 * Get last sync time for an entity type
 */
export async function getLastSyncTime(
  entityType: string
): Promise<Date | null> {
  const lastSync = await prisma.shopifySync.findFirst({
    where: {
      entityType,
      status: SyncStatus.COMPLETED,
    },
    orderBy: {
      syncedAt: 'desc',
    },
    select: {
      syncedAt: true,
    },
  });

  return lastSync?.syncedAt ?? null;
}

/**
 * Get sync history
 */
export async function getSyncHistory(
  entityType?: string,
  limit = 50
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
  return prisma.shopifySync.findMany({
    where: entityType ? { entityType } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      entityType: true,
      entityId: true,
      direction: true,
      status: true,
      errorMessage: true,
      syncedAt: true,
      createdAt: true,
    },
  });
}
