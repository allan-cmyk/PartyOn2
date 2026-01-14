/**
 * Product Service
 * Note: Product models not in Prisma schema - products managed via Shopify
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  ProductCreateInput,
  ProductUpdateInput,
  ProductFilters,
  ProductWithRelations,
  PaginationParams,
} from '../types';

const NOT_IMPLEMENTED = 'Products managed via Shopify Storefront API - local product service not implemented';

/**
 * Get paginated list of products with filters (stub)
 */
export async function getProducts(
  _filters: ProductFilters = {},
  _pagination: PaginationParams = {}
): Promise<{ products: ProductWithRelations[]; total: number }> {
  return { products: [], total: 0 };
}

/**
 * Get single product by ID or handle (stub)
 */
export async function getProduct(
  _idOrHandle: string
): Promise<ProductWithRelations | null> {
  return null;
}

/**
 * Create a new product (stub)
 */
export async function createProduct(
  _input: ProductCreateInput
): Promise<ProductWithRelations> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Update an existing product (stub)
 */
export async function updateProduct(
  _input: ProductUpdateInput
): Promise<ProductWithRelations> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Delete a product (stub)
 */
export async function deleteProduct(_id: string): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Hard delete a product (stub)
 */
export async function hardDeleteProduct(_id: string): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Get unique product types for filtering (stub)
 */
export async function getProductTypes(): Promise<string[]> {
  return [];
}

/**
 * Get unique vendors for filtering (stub)
 */
export async function getVendors(): Promise<string[]> {
  return [];
}

/**
 * Search products by text (stub)
 */
export async function searchProducts(
  _query: string,
  _limit = 10
): Promise<ProductWithRelations[]> {
  return [];
}
