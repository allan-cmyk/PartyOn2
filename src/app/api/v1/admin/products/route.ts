/**
 * Admin Products API
 * GET /api/v1/admin/products - List all products with search, filter, pagination
 * POST /api/v1/admin/products - Create a new product
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { ProductStatus, Prisma } from '@prisma/client';

interface ProductListParams {
  search?: string;
  status?: ProductStatus;
  category?: string;
  vendor?: string;
  sortBy?: 'title' | 'price' | 'createdAt' | 'inventory';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params: ProductListParams = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as ProductStatus) || undefined,
      category: searchParams.get('category') || undefined,
      vendor: searchParams.get('vendor') || undefined,
      sortBy: (searchParams.get('sortBy') as ProductListParams['sortBy']) || 'title',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    };

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { vendor: { contains: params.search, mode: 'insensitive' } },
        { tags: { has: params.search } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.vendor) {
      where.vendor = params.vendor;
    }

    if (params.category) {
      where.categories = {
        some: { category: { handle: params.category } },
      };
    }

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      params.sortBy === 'inventory'
        ? { variants: { _count: params.sortOrder } }
        : params.sortBy === 'price'
          ? { basePrice: params.sortOrder }
          : { [params.sortBy || 'title']: params.sortOrder };

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products with related data
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: ((params.page || 1) - 1) * (params.limit || 20),
      take: params.limit || 20,
      include: {
        variants: {
          select: {
            id: true,
            sku: true,
            title: true,
            price: true,
            inventoryQuantity: true,
            availableForSale: true,
          },
        },
        images: {
          orderBy: { position: 'asc' },
          take: 1,
          select: { url: true, altText: true },
        },
        categories: {
          include: { category: { select: { title: true, handle: true } } },
        },
        inventoryItems: {
          select: { quantity: true },
        },
      },
    });

    // Get unique vendors for filter
    const vendors = await prisma.product.findMany({
      where: { vendor: { not: null } },
      distinct: ['vendor'],
      select: { vendor: true },
    });

    // Get categories for filter
    const categories = await prisma.category.findMany({
      select: { handle: true, title: true },
      orderBy: { title: 'asc' },
    });

    // Transform products
    const transformedProducts = products.map((product) => ({
      id: product.id,
      handle: product.handle,
      title: product.title,
      vendor: product.vendor,
      productType: product.productType,
      status: product.status,
      price: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      image: product.images[0] || null,
      categories: product.categories.map((c) => ({
        handle: c.category.handle,
        title: c.category.title,
      })),
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        price: Number(v.price),
        inventory: v.inventoryQuantity,
        available: v.availableForSale,
      })),
      totalInventory: product.inventoryItems.reduce((sum, i) => sum + i.quantity, 0),
      variantCount: product.variants.length,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total,
          pages: Math.ceil(total / (params.limit || 20)),
        },
        filters: {
          vendors: vendors.map((v) => v.vendor).filter(Boolean),
          categories: categories,
          statuses: Object.values(ProductStatus),
        },
      },
    });
  } catch (error) {
    console.error('[Admin Products API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

interface ImageInput {
  url: string;
  altText?: string;
  position?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      title,
      handle,
      description,
      vendor,
      productType,
      basePrice,
      compareAtPrice,
      tags,
      status,
      abv,
      metaTitle,
      metaDescription,
      images,
    } = body;

    if (!title || !handle || basePrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Title, handle, and base price are required' },
        { status: 400 }
      );
    }

    // Check for duplicate handle
    const existing = await prisma.product.findUnique({
      where: { handle },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A product with this handle already exists' },
        { status: 400 }
      );
    }

    // Create product with images in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          title,
          handle,
          description: description || null,
          vendor: vendor || null,
          productType: productType || null,
          basePrice,
          compareAtPrice: compareAtPrice || null,
          tags: tags || [],
          status: status || 'DRAFT',
          abv: abv || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        },
      });

      // Create images if provided
      if (images && Array.isArray(images) && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: ImageInput, idx: number) => ({
            productId: newProduct.id,
            url: img.url,
            altText: img.altText || null,
            position: img.position ?? idx,
            width: null,
            height: null,
          })),
        });
      }

      return newProduct;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        status: product.status,
      },
    });
  } catch (error) {
    console.error('[Admin Products API] Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
