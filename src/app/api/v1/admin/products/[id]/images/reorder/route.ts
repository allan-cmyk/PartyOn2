/**
 * Admin Product Images Reorder API
 * PATCH /api/v1/admin/products/[id]/images/reorder - Batch update image positions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ImagePosition {
  id: string;
  position: number;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: productId } = await params;
    const body = await request.json();

    // Validate request body
    if (!body.images || !Array.isArray(body.images)) {
      return NextResponse.json(
        { success: false, error: 'Images array is required' },
        { status: 400 }
      );
    }

    const imagePositions: ImagePosition[] = body.images;

    // Validate each item has id and position
    for (const item of imagePositions) {
      if (!item.id || typeof item.position !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Each image must have id and position' },
          { status: 400 }
        );
      }
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update all positions in a transaction
    await prisma.$transaction(
      imagePositions.map((img) =>
        prisma.productImage.updateMany({
          where: {
            id: img.id,
            productId: productId, // Ensure image belongs to this product
          },
          data: {
            position: img.position,
          },
        })
      )
    );

    // Fetch updated images to return
    const updatedImages = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        url: true,
        altText: true,
        position: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedImages,
    });
  } catch (error) {
    console.error('[Images Reorder API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder images' },
      { status: 500 }
    );
  }
}
