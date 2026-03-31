/**
 * Inventory Management System Types
 * Shared types for APIs and services
 */

import { Prisma } from '@prisma/client';

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==========================================
// Product Types
// ==========================================

export interface ProductCreateInput {
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  basePrice: number;
  compareAtPrice?: number;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  metaTitle?: string;
  metaDescription?: string;
  abv?: number;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: string;
}

export interface ProductFilters {
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  productType?: string;
  vendor?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  inStock?: boolean;
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    variants: true;
    images: true;
    categories: { include: { category: true } };
  };
}>;

// ==========================================
// Variant Types
// ==========================================

export interface VariantCreateInput {
  productId: string;
  sku?: string;
  title?: string;
  price: number;
  compareAtPrice?: number;
  option1Name?: string;
  option1Value?: string;
  option2Name?: string;
  option2Value?: string;
  option3Name?: string;
  option3Value?: string;
  inventoryQuantity?: number;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  weight?: number;
  weightUnit?: string;
}

export interface VariantUpdateInput extends Partial<VariantCreateInput> {
  id: string;
}

// ==========================================
// Inventory Types
// ==========================================

export interface InventoryAdjustment {
  productId: string;
  variantId?: string;
  locationId?: string; // Deprecated -- ignored, kept for backward compatibility
  quantity: number;
  reason?: string;
  type: 'RECEIVED' | 'SOLD' | 'ADJUSTMENT' | 'TRANSFER' | 'RETURN' | 'DAMAGED';
}

export interface InventoryTransfer {
  productId: string;
  variantId?: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reason?: string;
}

export interface InventoryCount {
  locationId?: string; // Deprecated -- ignored, kept for backward compatibility
  items: Array<{
    productId: string;
    variantId?: string;
    countedQuantity: number;
  }>;
  countedBy?: string;
}

export interface LowStockItem {
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  sku?: string;
  currentQuantity: number;
  threshold: number;
  reorderPoint: number;
  recommendedReorderQuantity: number;
}

// ==========================================
// Order Types (for future use)
// ==========================================

export interface OrderFilters {
  status?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  customerId?: string;
  deliveryDateFrom?: Date;
  deliveryDateTo?: Date;
  search?: string;
}

// ==========================================
// Customer Types (for future use)
// ==========================================

export interface CustomerFilters {
  search?: string;
  ageVerified?: boolean;
  hasOrders?: boolean;
}
