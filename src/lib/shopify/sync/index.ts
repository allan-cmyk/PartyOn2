/**
 * Shopify Sync Service
 * Note: Sync models not in Prisma schema - data managed directly via Shopify APIs
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { PrismaClient } from '@prisma/client';
import { syncAllProducts, SyncResult } from './product-sync';
import { syncAllCustomers, CustomerSyncResult } from './customer-sync';

export { syncAllProducts as syncProducts } from './product-sync';
export type { SyncResult } from './product-sync';
export { syncAllCustomers as syncCustomers } from './customer-sync';
export type { CustomerSyncResult } from './customer-sync';
export { adminGraphQL, paginatedAdminQuery } from './admin-client';
export { syncCustomerByShopifyId } from './customer-sync';

export interface FullSyncResult {
  products: SyncResult;
  customers: CustomerSyncResult;
  duration: number;
  completedAt: Date;
}

/**
 * Run full sync of all Shopify data (stub)
 */
export async function runFullSync(prisma: PrismaClient): Promise<FullSyncResult> {
  const startTime = Date.now();

  console.log('[Shopify Sync] Sync disabled - data managed directly via Shopify APIs');

  const productResult = await syncAllProducts(prisma);
  const customerResult = await syncAllCustomers(prisma);

  const duration = Date.now() - startTime;

  return {
    products: productResult,
    customers: customerResult,
    duration,
    completedAt: new Date(),
  };
}

/**
 * Create a sync log entry in the database (stub - no-op)
 */
export async function logSyncResult(
  _prisma: PrismaClient,
  _entityType: 'product' | 'customer',
  _entityId: string,
  _shopifyId: string,
  _status: 'COMPLETED' | 'FAILED',
  _errorMessage?: string
): Promise<void> {
  // No-op - sync logging not implemented
}
