/**
 * Product Search API
 *
 * GET /api/v1/products/search?q=query - Search products by text
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/inventory/services/product-service';

/**
 * GET /api/v1/products/search
 * Search products by title, description, tags, or SKU
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const query = request.nextUrl.searchParams.get('q');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const products = await searchProducts(query.trim(), Math.min(limit, 50));

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        query,
        count: products.length,
      },
    });
  } catch (error) {
    console.error('[Products Search API] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}
