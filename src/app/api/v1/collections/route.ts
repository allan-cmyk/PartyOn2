/**
 * Collections API - List all collections/categories
 *
 * GET /api/v1/collections - List all collections with optional product counts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import type { ApiResponse } from '@/lib/inventory/types';

interface CollectionResponse {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  position: number;
  productCount?: number;
}

/**
 * GET /api/v1/collections
 * List all collections with optional product counts
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeCount = searchParams.get('includeCount') === 'true';
    const parentId = searchParams.get('parentId');

    const where: Record<string, unknown> = {};
    if (parentId === 'root') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        ...(includeCount ? { _count: { select: { products: true } } } : {}),
        children: includeCount
          ? { include: { _count: { select: { products: true } } } }
          : true,
      },
      orderBy: { position: 'asc' },
    });

    const collections: CollectionResponse[] = categories.map((cat) => ({
      id: cat.id,
      handle: cat.handle,
      title: cat.title,
      description: cat.description,
      imageUrl: cat.imageUrl,
      parentId: cat.parentId,
      position: cat.position,
      ...(includeCount && '_count' in cat
        ? { productCount: (cat._count as { products: number }).products }
        : {}),
    }));

    const response: ApiResponse<CollectionResponse[]> = {
      success: true,
      data: collections,
      meta: { total: collections.length },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[Collections API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch collections',
      },
      { status: 500 }
    );
  }
}
