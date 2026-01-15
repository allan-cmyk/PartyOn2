/**
 * Inventory API - Overview and Management
 *
 * GET /api/v1/inventory - Get inventory items (with optional location filter)
 * GET /api/v1/inventory?view=locations - Get locations summary
 * POST /api/v1/inventory/adjust - Adjust inventory
 * POST /api/v1/inventory/transfer - Transfer between locations
 * POST /api/v1/inventory/count - Set inventory count
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getLocations,
  getLocationInventory,
  adjustInventory,
  transferInventory,
  setInventoryCount,
} from '@/lib/inventory/services/inventory-service';

/**
 * GET /api/v1/inventory
 * Get inventory items with product info
 * Query params:
 *   - locationId: Filter by location
 *   - search: Search by product name or SKU
 *   - filter: 'all' | 'low_stock' | 'out_of_stock'
 *   - view: 'locations' returns location summaries instead
 *   - page: Page number (default 1)
 *   - limit: Items per page (default 100)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const view = searchParams.get('view');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100')));

    // Legacy behavior: return locations summary when view=locations
    if (view === 'locations') {
      const locations = await getLocations();
      const locationsWithInventory = await Promise.all(
        locations.map(async location => {
          const inventory = await getLocationInventory(location.id);
          const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
          const uniqueProducts = new Set(inventory.map(i => i.productId)).size;
          return {
            ...location,
            summary: { totalItems, uniqueProducts, itemCount: inventory.length },
          };
        })
      );
      return NextResponse.json({ success: true, data: locationsWithInventory });
    }

    // Build where clause for inventory items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (locationId) {
      where.locationId = locationId;
    }

    // Filter by stock status (out_of_stock only - low_stock is filtered client-side)
    if (filter === 'out_of_stock') {
      where.quantity = 0;
    }

    // Search by product name or SKU
    if (search) {
      where.OR = [
        { product: { title: { contains: search, mode: 'insensitive' } } },
        { variant: { sku: { contains: search, mode: 'insensitive' } } },
        { variant: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.inventoryItem.count({ where });

    // Fetch inventory items with relations
    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: { select: { id: true, title: true, handle: true } },
        variant: { select: { id: true, title: true, sku: true } },
        location: { select: { id: true, name: true } },
      },
      orderBy: [{ product: { title: 'asc' } }, { variant: { title: 'asc' } }],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform to expected format
    const formattedItems = items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.title,
      variantId: item.variantId,
      variantName: item.variant?.title || null,
      sku: item.variant?.sku || null,
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
      lowStockThreshold: item.lowStockThreshold,
      reorderPoint: item.reorderPoint,
      locationId: item.locationId,
      locationName: item.location.name,
      lastCountedAt: item.lastCountedAt?.toISOString() || null,
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
 * Handle inventory operations: adjust, transfer, count
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const operation = body.operation;

    switch (operation) {
      case 'adjust': {
        // Validate required fields
        if (!body.productId || !body.locationId || body.quantity === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: productId, locationId, quantity' },
            { status: 400 }
          );
        }

        const result = await adjustInventory({
          productId: body.productId,
          variantId: body.variantId,
          locationId: body.locationId,
          quantity: body.quantity,
          reason: body.reason,
          type: body.type || 'ADJUSTMENT',
        });

        return NextResponse.json({ success: true, data: result });
      }

      case 'transfer': {
        // Validate required fields
        if (!body.productId || !body.fromLocationId || !body.toLocationId || !body.quantity) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: productId, fromLocationId, toLocationId, quantity' },
            { status: 400 }
          );
        }

        const result = await transferInventory({
          productId: body.productId,
          variantId: body.variantId,
          fromLocationId: body.fromLocationId,
          toLocationId: body.toLocationId,
          quantity: body.quantity,
          reason: body.reason,
        });

        return NextResponse.json({ success: true, data: result });
      }

      case 'count': {
        // Validate required fields
        if (!body.locationId || !Array.isArray(body.items)) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: locationId, items (array)' },
            { status: 400 }
          );
        }

        const result = await setInventoryCount({
          locationId: body.locationId,
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
