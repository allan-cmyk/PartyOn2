/**
 * Shopify Sync Service
 *
 * One-way sync from Shopify to local database for parallel operation.
 * This allows the custom inventory management system to run alongside Shopify
 * during the migration period.
 *
 * Usage:
 * ```typescript
 * import { runFullSync, syncProducts, syncCustomers } from '@/lib/shopify/sync';
 *
 * // Full sync (products + customers)
 * const result = await runFullSync(prisma);
 *
 * // Individual syncs
 * const productResult = await syncProducts(prisma);
 * const customerResult = await syncCustomers(prisma);
 * ```
 */

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
 * Run full sync of all Shopify data
 */
export async function runFullSync(prisma: PrismaClient): Promise<FullSyncResult> {
  const startTime = Date.now();

  console.log('[Shopify Sync] Starting full sync...');

  // Sync products first
  console.log('[Shopify Sync] Syncing products...');
  const productResult = await syncAllProducts(prisma);
  console.log(`[Shopify Sync] Products: ${productResult.created} created, ${productResult.updated} updated`);

  // Then sync customers
  console.log('[Shopify Sync] Syncing customers...');
  const customerResult = await syncAllCustomers(prisma);
  console.log(`[Shopify Sync] Customers: ${customerResult.created} created, ${customerResult.updated} updated, ${customerResult.skipped} skipped`);

  const duration = Date.now() - startTime;
  console.log(`[Shopify Sync] Full sync completed in ${duration}ms`);

  // Log errors if any
  if (productResult.errors.length > 0) {
    console.error('[Shopify Sync] Product sync errors:', productResult.errors);
  }
  if (customerResult.errors.length > 0) {
    console.error('[Shopify Sync] Customer sync errors:', customerResult.errors);
  }

  return {
    products: productResult,
    customers: customerResult,
    duration,
    completedAt: new Date(),
  };
}

/**
 * Create a sync log entry in the database
 */
export async function logSyncResult(
  prisma: PrismaClient,
  entityType: 'product' | 'customer',
  entityId: string,
  shopifyId: string,
  status: 'COMPLETED' | 'FAILED',
  errorMessage?: string
): Promise<void> {
  await prisma.shopifySync.create({
    data: {
      entityType,
      entityId,
      shopifyId,
      direction: 'SHOPIFY_TO_LOCAL',
      status,
      errorMessage,
      syncedAt: status === 'COMPLETED' ? new Date() : undefined,
    },
  });
}
