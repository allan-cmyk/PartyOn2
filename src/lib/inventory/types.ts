/**
 * Inventory Management System Types
 * Note: Many Prisma models don't exist - using local type definitions
 */

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

// Local type since Prisma Product model doesn't exist
export interface ProductWithRelations {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  descriptionHtml: string | null;
  vendor: string | null;
  productType: string | null;
  tags: string[];
  basePrice: number;
  compareAtPrice: number | null;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  metaTitle: string | null;
  metaDescription: string | null;
  abv: number | null;
  createdAt: Date;
  updatedAt: Date;
  variants: ProductVariant[];
  images: ProductImage[];
  categories: { category: Category }[];
}

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

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
  locationId: string;
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
  locationId: string;
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
