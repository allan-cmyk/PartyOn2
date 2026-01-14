/**
 * Product Variant Service
 * Note: ProductVariant model not in Prisma schema - variants managed via Shopify
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { VariantCreateInput, VariantUpdateInput } from '../types';

const NOT_IMPLEMENTED = 'Product variants managed via Shopify - local variant service not implemented';

// Local type for ProductVariant since Prisma model doesn't exist
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string | null;
  title: string;
  price: number;
  compareAtPrice: number | null;
  option1Name: string | null;
  option1Value: string | null;
  option2Name: string | null;
  option2Value: string | null;
  option3Name: string | null;
  option3Value: string | null;
  inventoryQuantity: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  weight: number | null;
  weightUnit: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all variants for a product (stub)
 */
export async function getVariantsByProduct(
  _productId: string
): Promise<ProductVariant[]> {
  return [];
}

/**
 * Get single variant by ID (stub)
 */
export async function getVariant(_id: string): Promise<ProductVariant | null> {
  return null;
}

/**
 * Get variant by SKU (stub)
 */
export async function getVariantBySku(_sku: string): Promise<ProductVariant | null> {
  return null;
}

/**
 * Create a new variant (stub)
 */
export async function createVariant(
  _input: VariantCreateInput
): Promise<ProductVariant> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Update a variant (stub)
 */
export async function updateVariant(
  _input: VariantUpdateInput
): Promise<ProductVariant> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Delete a variant (stub)
 */
export async function deleteVariant(_id: string): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Bulk update variant prices (stub)
 */
export async function bulkUpdatePrices(
  _updates: Array<{ id: string; price: number; compareAtPrice?: number | null }>
): Promise<number> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Get variants with low inventory (stub)
 */
export async function getLowInventoryVariants(
  _threshold = 10
): Promise<Array<ProductVariant & { product: { title: string } }>> {
  return [];
}
