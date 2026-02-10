/**
 * Batch collection product counts API
 *
 * GET /api/products/counts?handles=boat-best-sellers,boat-seltzers-rtds,...
 * Returns { counts: { "boat-best-sellers": 26, ... } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export const revalidate = 300;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  'CDN-Cache-Control': 'public, s-maxage=300',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
};

export async function GET(request: NextRequest) {
  const handlesParam = request.nextUrl.searchParams.get('handles');
  if (!handlesParam) {
    return NextResponse.json(
      { error: 'Missing required "handles" query parameter' },
      { status: 400 }
    );
  }

  const handles = handlesParam.split(',').filter(Boolean);
  if (handles.length === 0 || handles.length > 20) {
    return NextResponse.json(
      { error: 'Provide between 1 and 20 collection handles' },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.all(
      handles.map(async (handle) => {
        const count = await prisma.productCategory.count({
          where: {
            category: { handle },
            product: { status: 'ACTIVE' },
          },
        });
        return [handle, count] as const;
      })
    );

    const counts: Record<string, number> = {};
    for (const [handle, count] of results) {
      counts[handle] = count;
    }

    return NextResponse.json({ counts }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('[Counts API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch counts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
