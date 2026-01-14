/**
 * Shopify Customer Sync Service
 * Note: Customer models not in Prisma schema - customers managed via Shopify Customer Accounts API
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { PrismaClient } from '@prisma/client';

const NOT_IMPLEMENTED = 'Customers managed via Shopify Customer Accounts API - local sync not implemented';

export interface CustomerSyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ email: string | null; error: string }>;
}

/**
 * Sync all customers from Shopify to database (stub)
 */
export async function syncAllCustomers(_prisma: PrismaClient): Promise<CustomerSyncResult> {
  console.log('[Customer Sync] Sync disabled - customers managed via Shopify');
  return { created: 0, updated: 0, skipped: 0, errors: [{ email: null, error: NOT_IMPLEMENTED }] };
}

/**
 * Sync a single customer by Shopify ID (stub)
 */
export async function syncCustomerByShopifyId(
  _prisma: PrismaClient,
  _shopifyGid: string
): Promise<void> {
  console.log('[Customer Sync] Sync disabled - customers managed via Shopify');
}
