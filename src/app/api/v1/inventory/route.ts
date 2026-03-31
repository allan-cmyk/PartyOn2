/**
 * Inventory API - Overview and Management
 *
 * GET /api/v1/inventory - Get inventory items (from ProductVariant)
 * GET /api/v1/inventory?view=locations - Get single hardcoded location summary
 * POST /api/v1/inventory - Adjust or count inventory
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  adjustInventory,
  setInventoryCount,
} from '@/lib/inventory/services/inventory-service';

/**
 * GET /api/v1/inventory
 * Get inventory items from ProductVariant (single source of truth)
 * Query params:
 *   - search: Search by product name, variant title, or SKU
 *   - filter: 'all' | 'low_stock' | 'out_of_stock'
 *   - view: 'locations' returns a single hardcoded location summary
 *   - page: Page number (default 1)
 *   - limit: Items per page (default 100)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const view = searchParams.get('view');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100')));

    // Hardcoded single location summary
    if (view === 'locations') {
      const totalVariants = await prisma.productVariant.count();
      const totalStock = await prisma.productVariant.aggregate({
        _sum: { inventoryQuantity: true },
      });
      const uniqueProducts = await prisma.product.count({
        where: { variants: { some: {} } },
      });

      return NextResponse.json({
        success: true,
        data: [
          {
            id: 'main-warehouse',
            name: 'Main Warehouse',
            summary: {
              totalItems: totalStock._sum.inventoryQuantity ?? 0,
              uniqueProducts,
              itemCount: totalVariants,
            },
          },
        ],
      });
    }

    // Build where clause for ProductVariant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Filter by stock status
    if (filter === 'out_of_stock') {
      where.inventoryQuantity = 0;
    } else if (filter === 'low_stock') {
      where.inventoryQuantity = { gt: 0, lte: 10 };
    }

    // Search by product name, variant title, or SKU
    if (search) {
      where.OR = [
        { product: { title: { contains: search, mode: 'insensitive' } } },
        { sku: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.productVariant.count({ where });

    // Fetch variants with product info
    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: { select: { id: true, title: true, handle: true } },
      },
      orderBy: [{ product: { title: 'asc' } }, { title: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform to expected format
    const formattedItems = variants.map(variant => ({
      id: variant.id,
      productId: variant.productId,
      productName: variant.product.title,
      variantId: variant.id,
      variantName: variant.title || null,
      sku: variant.sku || null,
      quantity: variant.inventoryQuantity,
      reservedQuantity: 0,
      lowStockThreshold: 10,
      reorderPoint: 5,
      locationId: 'main-warehouse',
      locationName: 'Main Warehouse',
      lastCountedAt: null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedItems,
      meta: {
        count: formattedItems.length,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('[Inventory API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inventory',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/inventory
 * Handle inventory operations: adjust, count
 * Transfer is no longer supported (single location).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const operation = body.operation;

    switch (operation) {
      case 'adjust': {
        // Validate required fields (locationId no longer required)
        if (!body.productId || body.quantity === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: productId, quantity' },
            { status: 400 }
          );
        }

        const result = await adjustInventory({
          productId: body.productId,
          variantId: body.variantId,
          quantity: body.quantity,
          reason: body.reason,
          type: body.type || 'ADJUSTMENT',
        });

        return NextResponse.json({ success: true, data: result });
      }

      case 'transfer': {
        return NextResponse.json(
          { success: false, error: 'Transfer not supported' },
          { status: 400 }
        );
      }

      case 'count': {
        // Validate required fields (locationId no longer required)
        if (!Array.isArray(body.items)) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: items (array)' },
            { status: 400 }
          );
        }

        const result = await setInventoryCount({
          items: body.items,
          countedBy: body.countedBy,
        });

        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation. Use: adjust, transfer, or count' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Inventory API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Inventory operation failed',
      },
      { status: 500 }
    );
  }
}
