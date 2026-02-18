/**
 * Admin Single Product API
 * GET /api/v1/admin/products/[id] - Get product details
 * PUT /api/v1/admin/products/[id] - Update product
 * DELETE /api/v1/admin/products/[id] - Delete or archive product
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { ProductStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            image: true,
            inventoryItems: {
              include: { location: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        categories: {
          include: { category: true },
        },
        inventoryItems: {
          include: { location: true },
        },
        bundleComponents: {
          include: {
            componentProduct: {
              select: {
                id: true,
                title: true,
                handle: true,
                images: { take: 1, orderBy: { position: 'asc' }, select: { url: true } },
              },
            },
            componentVariant: {
              select: { id: true, title: true, sku: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get order stats for this product
    const orderStats = await prisma.orderItem.aggregate({
      where: { productId: id },
      _sum: { quantity: true },
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        description: product.description,
        descriptionHtml: product.descriptionHtml,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags,
        status: product.status,
        basePrice: Number(product.basePrice),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        currencyCode: product.currencyCode,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        abv: product.abv ? Number(product.abv) : null,
        isBundle: product.isBundle,
        bundleComponents: product.bundleComponents.map((bc) => ({
          id: bc.id,
          componentProductId: bc.componentProduct.id,
          componentProductTitle: bc.componentProduct.title,
          componentProductHandle: bc.componentProduct.handle,
          componentProductImage: bc.componentProduct.images[0]?.url || null,
          componentVariantId: bc.componentVariant?.id || null,
          componentVariantTitle: bc.componentVariant?.title || null,
          componentVariantSku: bc.componentVariant?.sku || null,
          quantity: bc.quantity,
        })),
        shopifyId: product.shopifyId,
        shopifySyncedAt: product.shopifySyncedAt?.toISOString() || null,
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          width: img.width,
          height: img.height,
          position: img.position,
        })),
        variants: product.variants.map((v) => {
          // Get cost from the first inventory item for this variant (or null)
          const variantCost = v.inventoryItems[0]?.costPerUnit;
          return {
            id: v.id,
            sku: v.sku,
            title: v.title,
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
            costPerUnit: variantCost ? Number(variantCost) : null,
            options: {
              option1: v.option1Name ? { name: v.option1Name, value: v.option1Value } : null,
              option2: v.option2Name ? { name: v.option2Name, value: v.option2Value } : null,
              option3: v.option3Name ? { name: v.option3Name, value: v.option3Value } : null,
            },
            inventory: v.inventoryQuantity,
            trackInventory: v.trackInventory,
            allowBackorder: v.allowBackorder,
            availableForSale: v.availableForSale,
            weight: v.weight,
            weightUnit: v.weightUnit,
            image: v.image ? { url: v.image.url, altText: v.image.altText } : null,
            inventoryByLocation: v.inventoryItems.map((inv) => ({
              id: inv.id,
              locationId: inv.locationId,
              location: inv.location.name,
              quantity: inv.quantity,
              costPerUnit: inv.costPerUnit ? Number(inv.costPerUnit) : null,
            })),
          };
        }),
        categories: product.categories.map((c) => ({
          id: c.category.id,
          handle: c.category.handle,
          title: c.category.title,
        })),
        totalInventory: product.inventoryItems.reduce((sum, i) => sum + i.quantity, 0),
        // Get the primary cost (first inventory item's cost or null)
        costPerUnit: product.inventoryItems[0]?.costPerUnit
          ? Number(product.inventoryItems[0].costPerUnit)
          : null,
        stats: {
          totalSold: orderStats._sum.quantity || 0,
          orderCount: orderStats._count.id,
        },
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Product API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title',
      'handle',
      'description',
      'descriptionHtml',
      'vendor',
      'productType',
      'tags',
      'status',
      'basePrice',
      'compareAtPrice',
      'metaTitle',
      'metaDescription',
      'abv',
      'isBundle',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle status change
    if (body.status && !Object.values(ProductStatus).includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check handle uniqueness if changing
    if (body.handle && body.handle !== existing.handle) {
      const handleExists = await prisma.product.findFirst({
        where: { handle: body.handle, id: { not: id } },
      });
      if (handleExists) {
        return NextResponse.json(
          { success: false, error: 'Handle already in use' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Handle costPerUnit update (stored in InventoryItem, not Product)
    if (body.costPerUnit !== undefined) {
      const costValue = body.costPerUnit === null ? null : parseFloat(body.costPerUnit);

      // Update all inventory items for this product with the new cost
      await prisma.inventoryItem.updateMany({
        where: { productId: id },
        data: { costPerUnit: costValue },
      });
    }

    // Handle bundleComponents update (delete-all + re-create)
    if (body.bundleComponents !== undefined) {
      await prisma.bundleComponent.deleteMany({
        where: { bundleProductId: id },
      });

      if (Array.isArray(body.bundleComponents) && body.bundleComponents.length > 0) {
        for (const comp of body.bundleComponents) {
          await prisma.bundleComponent.create({
            data: {
              bundleProductId: id,
              componentProductId: comp.componentProductId,
              componentVariantId: comp.componentVariantId || null,
              quantity: comp.quantity || 1,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        status: product.status,
        costPerUnit: body.costPerUnit !== undefined ? body.costPerUnit : null,
        updatedAt: product.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Product API] Error updating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const permanent = searchParams.get('permanent') === 'true';

    const product = await prisma.product.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // If product has order history, archive instead of delete
    if (product.orderItems.length > 0 && permanent) {
      return NextResponse.json(
        { success: false, error: 'Cannot permanently delete product with order history. Use archive instead.' },
        { status: 400 }
      );
    }

    if (permanent) {
      // Permanent delete (only if no order history)
      await prisma.product.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Product permanently deleted',
      });
    } else {
      // Archive the product
      await prisma.product.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({
        success: true,
        message: 'Product archived',
      });
    }
  } catch (error) {
    console.error('[Admin Product API] Error deleting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
