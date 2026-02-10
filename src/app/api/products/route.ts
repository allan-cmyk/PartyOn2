/**
 * Products API - List products with filters, search, and pagination
 * Data source: PostgreSQL via Prisma
 *
 * GET /api/products
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';
import { transformToProduct, type ProductWithRelations } from '@/lib/products/transform';

// Cache products for 5 minutes
export const revalidate = 300;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  'CDN-Cache-Control': 'public, s-maxage=300',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
};

const productInclude = {
  images: { orderBy: { position: 'asc' as const } },
  variants: {
    include: { image: true },
    orderBy: { createdAt: 'asc' as const },
  },
  categories: { include: { category: true } },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const collection = searchParams.get('collection');
  const first = parseInt(searchParams.get('first') || '20');
  const after = searchParams.get('after');
  const searchTerm = searchParams.get('search');
  const category = searchParams.get('category');
  const tags = searchParams.get('tags')?.split(',').filter(Boolean);
  const priceMin = searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined;
  const priceMax = searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined;

  // Local collection shortcut
  const localCollection = searchParams.get('localCollection');
  if (localCollection) {
    try {
      const collectionData = await prisma.category.findUnique({
        where: { handle: localCollection },
      });

      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          categories: { some: { category: { handle: localCollection } } },
        },
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
      });

      const edges = products.map((product) => ({
        node: transformToProduct(product),
      }));

      return NextResponse.json(
        {
          products: { edges },
          collection: collectionData
            ? { id: collectionData.id, handle: collectionData.handle, title: collectionData.title, description: collectionData.description || '' }
            : null,
        },
        { headers: CACHE_HEADERS }
      );
    } catch (error) {
      console.error('[Products API] Local collection query failed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch local collection', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  try {
    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
    };

    // Collection/Category filter
    if (collection) {
      where.categories = {
        some: { category: { handle: collection } },
      };
    } else if (category && category !== 'all') {
      where.categories = {
        some: { category: { handle: category } },
      };
    }

    // Tags filter
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Price filter
    if (priceMin !== undefined || priceMax !== undefined) {
      where.basePrice = {};
      if (priceMin !== undefined) {
        where.basePrice.gte = priceMin;
      }
      if (priceMax !== undefined) {
        where.basePrice.lte = priceMax;
      }
    }

    // Handle pagination cursor
    let skip = 0;
    if (after) {
      const cursorProduct = await prisma.product.findUnique({
        where: { id: after },
        select: { createdAt: true },
      });
      if (cursorProduct) {
        const count = await prisma.product.count({
          where: { ...where, createdAt: { lt: cursorProduct.createdAt } },
        });
        skip = count + 1;
      }
    }

    const totalCount = await prisma.product.count({ where });

    let products: ProductWithRelations[];

    // Relevance-based search ordering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const baseWhere = { ...where, status: 'ACTIVE' as const };

      // Query 1: productType matches (highest relevance)
      const productTypeMatches = await prisma.product.findMany({
        where: { ...baseWhere, productType: { contains: searchTerm, mode: 'insensitive' } },
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
      });

      const productTypeIds = new Set(productTypeMatches.map(p => p.id));

      // Query 2: title matches
      const titleMatches = await prisma.product.findMany({
        where: {
          ...baseWhere,
          id: { notIn: Array.from(productTypeIds) },
          title: { contains: searchTerm, mode: 'insensitive' },
        },
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
      });

      const usedIds = new Set([...productTypeIds, ...titleMatches.map(p => p.id)]);

      // Query 3: other matches (description, vendor, tags)
      const otherMatches = await prisma.product.findMany({
        where: {
          ...baseWhere,
          id: { notIn: Array.from(usedIds) },
          OR: [
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { vendor: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { hasSome: [searchTerm, searchLower, searchTerm.toUpperCase()] } },
          ],
        },
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
      });

      products = [...productTypeMatches, ...titleMatches, ...otherMatches].slice(skip, skip + first);
    } else {
      products = await prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { title: 'asc' },
        take: first,
        skip,
      });
    }

    const edges = products.map(product => ({
      node: transformToProduct(product),
    }));

    const hasNextPage = skip + products.length < totalCount;
    const endCursor = products.length > 0 ? products[products.length - 1].id : null;

    // If collection was requested, include collection info
    if (collection) {
      const collectionData = await prisma.category.findUnique({
        where: { handle: collection },
      });

      return NextResponse.json(
        {
          products: { edges },
          collection: collectionData ? {
            id: collectionData.id,
            handle: collectionData.handle,
            title: collectionData.title,
            description: collectionData.description || '',
          } : null,
        },
        { headers: CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        products: {
          edges,
          pageInfo: { hasNextPage, endCursor },
        },
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[Products API] Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
