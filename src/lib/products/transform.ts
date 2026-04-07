/**
 * Product data transformation utilities
 * Converts Prisma product models to Shopify-compatible format
 * for backwards compatibility with existing frontend components.
 */

import { Prisma } from '@prisma/client';
import type { Product } from '@/lib/types';

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: { include: { image: true } };
    categories: { include: { category: true } };
  };
}> & {
  bundleComponents?: Array<{
    quantity: number;
    componentProduct: {
      variants: Array<{
        inventoryQuantity: number;
      }>;
    };
    componentVariant: {
      inventoryQuantity: number;
    } | null;
  }>;
};

/**
 * Transform a Prisma product with relations to Product format.
 * Maintains backwards compatibility with all frontend components
 * that expect the Shopify data shape.
 */
export function transformToProduct(product: ProductWithRelations): Product {
  const minPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => Number(v.price)))
    : Number(product.basePrice);

  // Always use local database UUID for product ID
  // This must match the cart system which stores local UUIDs
  const productId = product.id;

  // Compute bundle availability.
  // Bundles whose own variant has trackInventory:false are treated as always
  // available (we still decrement component stock when they sell -- that's
  // handled by order-service.ts -- but we don't block customers from ordering).
  // This is how the operator marks "evergreen" SKUs like batched cocktail kits
  // that should never go OOS regardless of component stock.
  let bundleAvailable = true;
  let bundleMaxQuantity: number | null = null;
  const bundleAlwaysAvailable =
    product.isBundle &&
    product.variants.length > 0 &&
    product.variants.every((v) => v.trackInventory === false);

  if (product.isBundle && product.bundleComponents && product.bundleComponents.length > 0) {
    if (bundleAlwaysAvailable) {
      bundleAvailable = true;
      bundleMaxQuantity = 999;
    } else {
      for (const comp of product.bundleComponents) {
        const stock = comp.componentVariant
          ? comp.componentVariant.inventoryQuantity
          : comp.componentProduct.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
        const possibleQty = Math.floor(stock / comp.quantity);
        if (bundleMaxQuantity === null || possibleQty < bundleMaxQuantity) {
          bundleMaxQuantity = possibleQty;
        }
        if (possibleQty <= 0) {
          bundleAvailable = false;
        }
      }
    }
  }

  const isAvailable = product.isBundle
    ? product.status === 'ACTIVE' && bundleAvailable
    : product.status === 'ACTIVE' && product.variants.some(v => v.availableForSale);

  return {
    id: productId,
    handle: product.handle,
    title: product.title,
    description: product.description || '',
    descriptionHtml: product.descriptionHtml || '',
    vendor: product.vendor || '',
    productType: product.productType || '',
    tags: product.tags,
    availableForSale: isAvailable,
    priceRange: {
      minVariantPrice: {
        amount: minPrice.toFixed(2),
        currencyCode: product.currencyCode,
      },
    },
    images: {
      edges: product.images.map(img => ({
        node: {
          url: img.url,
          altText: img.altText,
          width: img.width || 800,
          height: img.height || 800,
        },
      })),
    },
    variants: {
      edges: product.variants.map(v => {
        // Always use local database UUID for variant ID
        // This must match the cart system which stores local UUIDs
        const variantId = v.id;
        return {
          node: {
            id: variantId,
            title: v.title,
            availableForSale: product.isBundle ? isAvailable : v.availableForSale,
            quantityAvailable: product.isBundle ? (bundleMaxQuantity ?? 0) : v.inventoryQuantity,
            price: {
              amount: Number(v.price).toFixed(2),
              currencyCode: product.currencyCode,
            },
            compareAtPrice: v.compareAtPrice ? {
              amount: Number(v.compareAtPrice).toFixed(2),
              currencyCode: product.currencyCode,
            } : undefined,
            selectedOptions: [
              v.option1Name && v.option1Value ? { name: v.option1Name, value: v.option1Value } : null,
              v.option2Name && v.option2Value ? { name: v.option2Name, value: v.option2Value } : null,
              v.option3Name && v.option3Value ? { name: v.option3Name, value: v.option3Value } : null,
            ].filter(Boolean) as Array<{ name: string; value: string }>,
            image: v.image ? {
              url: v.image.url,
              altText: v.image.altText,
            } : undefined,
          },
        };
      }),
    },
    collections: {
      edges: product.categories.map(pc => ({
        node: {
          handle: pc.category.handle,
          title: pc.category.title,
        },
      })),
    },
    metafield: product.abv ? {
      value: product.abv.toString(),
      type: 'single_line_text_field',
    } : null,
  };
}
