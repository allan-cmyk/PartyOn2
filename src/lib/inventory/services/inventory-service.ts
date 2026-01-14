/**
 * Inventory Service
 * Business logic for inventory management
 */

import { prisma } from '@/lib/database/client';
import { Prisma, InventoryMovementType } from '@prisma/client';
import type {
  InventoryAdjustment,
  InventoryTransfer,
  InventoryCount,
  LowStockItem,
} from '../types';

// ==========================================
// Inventory Locations
// ==========================================

/**
 * Get all inventory locations
 */
export async function getLocations() {
  return prisma.inventoryLocation.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Get default location
 */
export async function getDefaultLocation() {
  return prisma.inventoryLocation.findFirst({
    where: { isActive: true, isDefault: true },
  });
}

/**
 * Create inventory location
 */
export async function createLocation(name: string, address?: Prisma.InputJsonValue) {
  return prisma.inventoryLocation.create({
    data: { name, address: address ?? Prisma.JsonNull },
  });
}

// ==========================================
// Inventory Items
// ==========================================

/**
 * Get inventory for a product across all locations
 */
export async function getProductInventory(productId: string) {
  return prisma.inventoryItem.findMany({
    where: { productId },
    include: {
      location: true,
      variant: { select: { id: true, title: true, sku: true } },
    },
  });
}

/**
 * Get inventory at a specific location
 */
export async function getLocationInventory(locationId: string) {
  return prisma.inventoryItem.findMany({
    where: { locationId },
    include: {
      product: { select: { id: true, title: true, handle: true } },
      variant: { select: { id: true, title: true, sku: true } },
    },
    orderBy: { product: { title: 'asc' } },
  });
}

/**
 * Get or create inventory item
 */
async function getOrCreateInventoryItem(
  productId: string,
  locationId: string,
  variantId?: string
) {
  let item = await prisma.inventoryItem.findFirst({
    where: { productId, locationId, variantId: variantId || null },
  });

  if (!item) {
    item = await prisma.inventoryItem.create({
      data: {
        productId,
        locationId,
        variantId: variantId || null,
        quantity: 0,
      },
    });
  }

  return item;
}

// ==========================================
// Inventory Adjustments
// ==========================================

/**
 * Adjust inventory (add/remove stock)
 */
export async function adjustInventory(adjustment: InventoryAdjustment) {
  const { productId, variantId, locationId, quantity, reason, type } = adjustment;

  const item = await getOrCreateInventoryItem(productId, locationId, variantId);
  const previousQuantity = item.quantity;
  const newQuantity = previousQuantity + quantity;

  // Update inventory item
  await prisma.inventoryItem.update({
    where: { id: item.id },
    data: { quantity: newQuantity },
  });

  // Create movement record
  const movement = await prisma.inventoryMovement.create({
    data: {
      inventoryItemId: item.id,
      type: type as InventoryMovementType,
      quantity,
      previousQuantity,
      newQuantity,
      reason,
    },
  });

  // Check for low stock alert
  if (newQuantity <= item.lowStockThreshold && previousQuantity > item.lowStockThreshold) {
    await createLowStockAlert(productId, variantId, locationId, newQuantity, item.lowStockThreshold);
  }

  // Also update variant inventory count if tracking at variant level
  if (variantId) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { inventoryQuantity: newQuantity },
    });
  }

  return { item, movement, previousQuantity, newQuantity };
}

/**
 * Transfer inventory between locations
 */
export async function transferInventory(transfer: InventoryTransfer) {
  const { productId, variantId, fromLocationId, toLocationId, quantity, reason } = transfer;

  if (quantity <= 0) {
    throw new Error('Transfer quantity must be positive');
  }

  // Get source inventory
  const sourceItem = await getOrCreateInventoryItem(productId, fromLocationId, variantId);

  if (sourceItem.quantity < quantity) {
    throw new Error(`Insufficient inventory at source location. Available: ${sourceItem.quantity}`);
  }

  // Perform transfer in a transaction
  return prisma.$transaction(async tx => {
    // Decrease from source
    const fromPrevious = sourceItem.quantity;
    const fromNew = fromPrevious - quantity;

    await tx.inventoryItem.update({
      where: { id: sourceItem.id },
      data: { quantity: fromNew },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryItemId: sourceItem.id,
        type: 'TRANSFER',
        quantity: -quantity,
        previousQuantity: fromPrevious,
        newQuantity: fromNew,
        reason: reason || `Transfer to location ${toLocationId}`,
      },
    });

    // Increase at destination
    let destItem = await tx.inventoryItem.findFirst({
      where: { productId, locationId: toLocationId, variantId: variantId || null },
    });

    if (!destItem) {
      destItem = await tx.inventoryItem.create({
        data: {
          productId,
          locationId: toLocationId,
          variantId: variantId || null,
          quantity: 0,
        },
      });
    }

    const toPrevious = destItem.quantity;
    const toNew = toPrevious + quantity;

    await tx.inventoryItem.update({
      where: { id: destItem.id },
      data: { quantity: toNew },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryItemId: destItem.id,
        type: 'TRANSFER',
        quantity,
        previousQuantity: toPrevious,
        newQuantity: toNew,
        reason: reason || `Transfer from location ${fromLocationId}`,
      },
    });

    return {
      from: { locationId: fromLocationId, previousQuantity: fromPrevious, newQuantity: fromNew },
      to: { locationId: toLocationId, previousQuantity: toPrevious, newQuantity: toNew },
    };
  });
}

/**
 * Set absolute inventory count (for inventory counting)
 */
export async function setInventoryCount(count: InventoryCount) {
  const { locationId, items, countedBy } = count;

  const results = [];

  for (const item of items) {
    const inventoryItem = await getOrCreateInventoryItem(
      item.productId,
      locationId,
      item.variantId
    );

    const previousQuantity = inventoryItem.quantity;
    const newQuantity = item.countedQuantity;
    const difference = newQuantity - previousQuantity;

    if (difference !== 0) {
      await prisma.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          quantity: newQuantity,
          lastCountedAt: new Date(),
          lastCountedBy: countedBy,
        },
      });

      await prisma.inventoryMovement.create({
        data: {
          inventoryItemId: inventoryItem.id,
          type: 'ADJUSTMENT',
          quantity: difference,
          previousQuantity,
          newQuantity,
          reason: 'Physical inventory count',
          createdBy: countedBy,
        },
      });

      // Update variant if applicable
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { inventoryQuantity: newQuantity },
        });
      }
    }

    results.push({
      productId: item.productId,
      variantId: item.variantId,
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

/**
 * Create low stock alert
 */
async function createLowStockAlert(
  productId: string,
  variantId: string | undefined,
  locationId: string | undefined,
  currentQuantity: number,
  threshold: number
) {
  // Check if alert already exists
  const existing = await prisma.lowStockAlert.findFirst({
    where: {
      productId,
      variantId: variantId || null,
      locationId: locationId || null,
      status: 'ACTIVE',
    },
  });

  if (!existing) {
    await prisma.lowStockAlert.create({
      data: {
        productId,
        variantId,
        locationId,
        currentQuantity,
        threshold,
        status: 'ACTIVE',
      },
    });
  }
}

/**
 * Get active low stock alerts
 */
export async function getLowStockAlerts(): Promise<LowStockItem[]> {
  const alerts = await prisma.lowStockAlert.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  const items: LowStockItem[] = [];

  for (const alert of alerts) {
    const product = await prisma.product.findUnique({
      where: { id: alert.productId },
      select: { title: true },
    });

    const variant = alert.variantId
      ? await prisma.productVariant.findUnique({
          where: { id: alert.variantId },
          select: { title: true, sku: true },
        })
      : null;

    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        productId: alert.productId,
        variantId: alert.variantId || null,
      },
    });

    items.push({
      productId: alert.productId,
      productTitle: product?.title || 'Unknown',
      variantId: alert.variantId || undefined,
      variantTitle: variant?.title,
      sku: variant?.sku || undefined,
      currentQuantity: alert.currentQuantity,
      threshold: alert.threshold,
      reorderPoint: inventoryItem?.reorderPoint || alert.threshold,
      recommendedReorderQuantity: inventoryItem?.reorderQuantity || 50,
    });
  }

  return items;
}

/**
 * Acknowledge alert
 */
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

/**
 * Resolve alert
 */
export async function resolveAlert(alertId: string) {
  return prisma.lowStockAlert.update({
    where: { id: alertId },
    data: { status: 'RESOLVED' },
  });
}

// ==========================================
// Inventory History
// ==========================================

/**
 * Get movement history for an inventory item
 */
export async function getMovementHistory(
  productId: string,
  options: { variantId?: string; locationId?: string; limit?: number } = {}
) {
  const { variantId, locationId, limit = 50 } = options;

  const where: Prisma.InventoryMovementWhereInput = {
    inventoryItem: {
      productId,
      ...(variantId && { variantId }),
      ...(locationId && { locationId }),
    },
  };

  return prisma.inventoryMovement.findMany({
    where,
    include: {
      inventoryItem: {
        include: {
          location: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
