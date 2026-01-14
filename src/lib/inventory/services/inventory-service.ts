/**
 * Inventory Service
 * Note: Inventory models not in Prisma schema - inventory managed via Shopify
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  InventoryAdjustment,
  InventoryTransfer,
  InventoryCount,
  LowStockItem,
} from '../types';

const NOT_IMPLEMENTED = 'Inventory managed via Shopify - local inventory service not implemented';

// ==========================================
// Inventory Locations (stubs)
// ==========================================

export async function getLocations() {
  return [];
}

export async function getDefaultLocation() {
  return null;
}

export async function createLocation(_name: string, _address?: unknown) {
  throw new Error(NOT_IMPLEMENTED);
}

// ==========================================
// Inventory Items (stubs)
// ==========================================

export async function getProductInventory(_productId: string) {
  return [];
}

export async function getLocationInventory(_locationId: string) {
  return [];
}

// ==========================================
// Inventory Adjustments (stubs)
// ==========================================

export async function adjustInventory(_adjustment: InventoryAdjustment) {
  throw new Error(NOT_IMPLEMENTED);
}

export async function transferInventory(_transfer: InventoryTransfer) {
  throw new Error(NOT_IMPLEMENTED);
}

export async function setInventoryCount(_count: InventoryCount) {
  throw new Error(NOT_IMPLEMENTED);
}

// ==========================================
// Low Stock Alerts (stubs)
// ==========================================

export async function getLowStockAlerts(): Promise<LowStockItem[]> {
  return [];
}

export async function acknowledgeAlert(_alertId: string, _acknowledgedBy: string) {
  throw new Error(NOT_IMPLEMENTED);
}

export async function resolveAlert(_alertId: string) {
  throw new Error(NOT_IMPLEMENTED);
}

// ==========================================
// Inventory History (stubs)
// ==========================================

export async function getMovementHistory(
  _productId: string,
  _options: { variantId?: string; locationId?: string; limit?: number } = {}
) {
  return [];
}
