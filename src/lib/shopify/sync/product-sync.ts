/**
 * Shopify Product Sync Service
 * Note: Product models not in Prisma schema - products managed via Shopify Storefront API
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { PrismaClient } from '@prisma/client';

const NOT_IMPLEMENTED = 'Products managed via Shopify Storefront API - local sync not implemented';

export interface SyncResult {
  created: number;
  updated: number;
  errors: Array<{ handle: string; error: string }>;
}

/**
 * Sync all products from Shopify to database (stub)
 */
export async function syncAllProducts(_prisma: PrismaClient): Promise<SyncResult> {
  console.log('[Product Sync] Sync disabled - products managed via Shopify');
  return { created: 0, updated: 0, errors: [{ handle: '', error: NOT_IMPLEMENTED }] };
}
