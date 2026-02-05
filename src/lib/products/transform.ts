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
}>;

/**
 * Transform a Prisma product with relations to Product format.
 * Maintains backwards compatibility with all frontend components
 * that expect the Shopify data shape.
 */
export function transformToProduct(product: ProductWithRelations): Product {
  const minPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => Number(v.price)))
    : Number(product.basePrice);

  const productId = product.shopifyId
    ? (product.shopifyId.startsWith('gid://') ? product.shopifyId : `gid://shopify/Product/${product.shopifyId}`)
    : product.id;

  return {
    id: productId,
    handle: product.handle,
    title: product.title,
    description: product.description || '',
    descriptionHtml: product.descriptionHtml || '',
    vendor: product.vendor || '',
    productType: product.productType || '',
    tags: product.tags,
    availableForSale: product.status === 'ACTIVE' && product.variants.some(v => v.availableForSale),
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
        const variantId = v.shopifyId
          ? (v.shopifyId.startsWith('gid://') ? v.shopifyId : `gid://shopify/ProductVariant/${v.shopifyId}`)
          : v.id;
        return {
          node: {
            id: variantId,
            title: v.title,
            availableForSale: v.availableForSale,
            quantityAvailable: v.inventoryQuantity,
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
