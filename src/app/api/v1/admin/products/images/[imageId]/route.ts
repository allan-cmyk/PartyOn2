/**
 * Admin Product Image API
 * PUT /api/v1/admin/products/images/[imageId] - Update image (alt text, position)
 * DELETE /api/v1/admin/products/images/[imageId] - Delete image
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

interface RouteParams {
  params: Promise<{ imageId: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { imageId } = await params;
    const body = await request.json();

    // Check if image exists
    const existing = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: { altText?: string | null; position?: number } = {};

    if (body.altText !== undefined) {
      updateData.altText = body.altText || null;
    }

    if (body.position !== undefined) {
      updateData.position = parseInt(body.position);
    }

    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        url: updated.url,
        altText: updated.altText,
        position: updated.position,
      },
    });
  } catch (error) {
    console.error('[Image API] Error updating image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { imageId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const deleteFromStorage = searchParams.get('deleteFromStorage') === 'true';

    // Check if image exists
    const existing = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    // Optionally delete from storage (Supabase)
    if (deleteFromStorage && existing.url.includes('supabase')) {
      try {
        // Extract path from Supabase URL
        const urlParts = existing.url.split('/product-images/');
        if (urlParts.length > 1) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          await supabase.storage.from('product-images').remove([urlParts[1]]);
        }
      } catch (storageError) {
        console.error('[Image API] Failed to delete from storage:', storageError);
        // Don't fail the request if storage deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('[Image API] Error deleting image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
