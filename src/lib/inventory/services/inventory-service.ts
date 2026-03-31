/**
 * Inventory Service
 * Single source of truth: ProductVariant.inventoryQuantity
 * InventoryMovement is used as an audit log, linked directly to variantId.
 */

import { prisma } from '@/lib/database/client';
import { Prisma, InventoryMovementType } from '@prisma/client';
import type {
  InventoryAdjustment,
  InventoryCount,
  LowStockItem,
} from '../types';

const LOW_STOCK_THRESHOLD = 10;

// ==========================================
// Inventory Locations (kept for backward compat)
// ==========================================

export async function getLocations() {
  return prisma.inventoryLocation.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function getDefaultLocation() {
  return prisma.inventoryLocation.findFirst({
    where: { isActive: true, isDefault: true },
  });
}

export async function createLocation(name: string, address?: Prisma.InputJsonValue) {
  return prisma.inventoryLocation.create({
    data: { name, address: address ?? Prisma.JsonNull },
  });
}

// ==========================================
// Inventory Queries
// ==========================================

/**
 * Get inventory for a product (all variants)
 */
export async function getProductInventory(productId: string) {
  return prisma.productVariant.findMany({
    where: { productId },
    select: {
      id: true,
      title: true,
      sku: true,
      inventoryQuantity: true,
      costPerUnit: true,
    },
  });
}

/**
 * Get all inventory (replaces getLocationInventory)
 */
export async function getLocationInventory(_locationId?: string) {
  return prisma.productVariant.findMany({
    include: {
      product: { select: { id: true, title: true, handle: true } },
    },
    orderBy: { product: { title: 'asc' } },
  });
}

// ==========================================
// Inventory Adjustments
// ==========================================

/**
 * Adjust inventory (add/remove stock)
 * Writes directly to ProductVariant.inventoryQuantity
 */
export async function adjustInventory(adjustment: InventoryAdjustment) {
  const { productId, variantId, quantity, reason, type } = adjustment;

  // Find the variant to adjust
  let variant;
  if (variantId) {
    variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, inventoryQuantity: true },
    });
  } else {
    // Fall back to first variant for the product
    variant = await prisma.productVariant.findFirst({
      where: { productId },
      select: { id: true, inventoryQuantity: true },
    });
  }

  if (!variant) {
    throw new Error(`No variant found for product ${productId}`);
  }

  const previousQuantity = variant.inventoryQuantity;
  const newQuantity = previousQuantity + quantity;

  // Update ProductVariant -- the single source of truth
  await prisma.productVariant.update({
    where: { id: variant.id },
    data: { inventoryQuantity: newQuantity },
  });

  // Create audit trail
  const movement = await prisma.inventoryMovement.create({
    data: {
      variantId: variant.id,
      type: type as InventoryMovementType,
      quantity,
      previousQuantity,
      newQuantity,
      reason,
    },
  });

  // Check for low stock alert
  if (newQuantity <= LOW_STOCK_THRESHOLD && previousQuantity > LOW_STOCK_THRESHOLD) {
    await createLowStockAlert(productId, variant.id, newQuantity, LOW_STOCK_THRESHOLD);
  }

  return { item: variant, movement, previousQuantity, newQuantity };
}

/**
 * Set absolute inventory count (for inventory counting)
 */
export async function setInventoryCount(count: InventoryCount) {
  const { items, countedBy } = count;

  const results = [];

  for (const item of items) {
    let variant;
    if (item.variantId) {
      variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        select: { id: true, inventoryQuantity: true },
      });
    } else {
      variant = await prisma.productVariant.findFirst({
        where: { productId: item.productId },
        select: { id: true, inventoryQuantity: true },
      });
    }

    if (!variant) continue;

    const previousQuantity = variant.inventoryQuantity;
    const newQuantity = item.countedQuantity;
    const difference = newQuantity - previousQuantity;

    if (difference !== 0) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { inventoryQuantity: newQuantity },
      });

      await prisma.inventoryMovement.create({
        data: {
          variantId: variant.id,
          type: 'ADJUSTMENT',
          quantity: difference,
          previousQuantity,
          newQuantity,
          reason: 'Physical inventory count',
          createdBy: countedBy,
        },
      });
    }

    results.push({
      productId: item.productId,
      variantId: variant.id,
      previousQuantity,
      newQuantity,
      adjusted: difference !== 0,
    });
  }

  return results;
}

// ==========================================
// Low Stock Alerts
// ==========================================

async function createLowStockAlert(
  productId: string,
  variantId: string,
  currentQuantity: number,
  threshold: number
) {
  const existing = await prisma.lowStockAlert.findFirst({
    where: {
      productId,
      variantId,
      status: 'ACTIVE',
    },
  });

  if (!existing) {
    await prisma.lowStockAlert.create({
      data: {
        productId,
        variantId,
        currentQuantity,
        threshold,
        status: 'ACTIVE',
      },
    });
  }
}

export async function getLowStockAlerts(): Promise<LowStockItem[]> {
  // Query variants directly instead of relying on LowStockAlert table
  const variants = await prisma.productVariant.findMany({
    where: {
      inventoryQuantity: { lte: LOW_STOCK_THRESHOLD },
      trackInventory: true,
    },
    include: {
      product: { select: { id: true, title: true } },
    },
    orderBy: { inventoryQuantity: 'asc' },
  });

  return variants.map(v => ({
    productId: v.productId,
    productTitle: v.product.title,
    variantId: v.id,
    variantTitle: v.title,
    sku: v.sku || undefined,
    currentQuantity: v.inventoryQuantity,
    threshold: LOW_STOCK_THRESHOLD,
    reorderPoint: LOW_STOCK_THRESHOLD,
    recommendedReorderQuantity: 50,
  }));
}

export async function acknowledgeAlert(alertId: string, acknowledgedBy: string) {
  return prisma.lowStockAlert.update({
    where: { id: alertId },
    data: {
      status: 'ACKNOWLEDGED',
      acknowledgedAt: new Date(),
      acknowledgedBy,
    },
  });
}

export async function resolveAlert(alertId: string) {
  return prisma.lowStockAlert.update({
    where: { id: alertId },
    data: { status: 'RESOLVED' },
  });
}

// ==========================================
// Inventory History
// ==========================================

export async function getMovementHistory(
  productId: string,
  options: { variantId?: string; limit?: number } = {}
) {
  const { variantId, limit = 50 } = options;

  const where: Prisma.InventoryMovementWhereInput = variantId
    ? { variantId }
    : {
        variant: { productId },
      };

  return prisma.inventoryMovement.findMany({
    where,
    include: {
      variant: { select: { id: true, title: true, sku: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
