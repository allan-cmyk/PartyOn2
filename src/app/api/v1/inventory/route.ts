/**
 * Inventory API - Overview and Management
 *
 * GET /api/v1/inventory - Get inventory overview
 * POST /api/v1/inventory/adjust - Adjust inventory
 * POST /api/v1/inventory/transfer - Transfer between locations
 * POST /api/v1/inventory/count - Set inventory count
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLocations,
  getLocationInventory,
  adjustInventory,
  transferInventory,
  setInventoryCount,
} from '@/lib/inventory/services/inventory-service';

/**
 * GET /api/v1/inventory
 * Get inventory overview - locations and their stock
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const locationId = request.nextUrl.searchParams.get('locationId');

    if (locationId) {
      // Get inventory for specific location
      const inventory = await getLocationInventory(locationId);
      return NextResponse.json({
        success: true,
        data: inventory,
        meta: { count: inventory.length },
      });
    }

    // Get all locations with summary
    const locations = await getLocations();

    const locationsWithInventory = await Promise.all(
      locations.map(async location => {
        const inventory = await getLocationInventory(location.id);
        const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const uniqueProducts = new Set(inventory.map(i => i.productId)).size;

        return {
          ...location,
          summary: {
            totalItems,
            uniqueProducts,
            itemCount: inventory.length,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: locationsWithInventory,
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
