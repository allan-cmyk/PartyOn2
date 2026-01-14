/**
 * Admin Sync API Route
 *
 * Triggers Shopify → Local database sync
 * Protected by admin API key
 *
 * POST /api/admin/sync - Full sync
 * POST /api/admin/sync?type=products - Products only
 * POST /api/admin/sync?type=customers - Customers only
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { runFullSync, syncProducts, syncCustomers } from '@/lib/shopify/sync';

const prisma = new PrismaClient();

/**
 * Verify admin API key
 */
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.warn('[Sync API] ADMIN_API_KEY not configured');
    return false;
  }

  return authHeader === `Bearer ${expectedKey}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const syncType = request.nextUrl.searchParams.get('type');

  try {
    let result;

    switch (syncType) {
      case 'products':
        console.log('[Sync API] Running products sync...');
        result = await syncProducts(prisma);
        break;

      case 'customers':
        console.log('[Sync API] Running customers sync...');
        result = await syncCustomers(prisma);
        break;

      default:
        console.log('[Sync API] Running full sync...');
        result = await runFullSync(prisma);
        break;
    }

    return NextResponse.json({
      success: true,
      type: syncType || 'full',
      result,
    });
  } catch (error) {
    console.error('[Sync API] Sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for checking sync status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get counts from database
    const [productCount, customerCount, lastSyncs] = await Promise.all([
      prisma.product.count(),
      prisma.customer.count(),
      prisma.shopifySync.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      status: 'ready',
      counts: {
        products: productCount,
        customers: customerCount,
      },
      recentSyncs: lastSyncs,
    });
  } catch (error) {
    console.error('[Sync API] Status check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Status check failed',
      },
      { status: 500 }
    );
  }
}
