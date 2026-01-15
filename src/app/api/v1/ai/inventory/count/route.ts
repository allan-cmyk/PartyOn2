/**
 * AI Inventory Count API
 * POST /api/v1/ai/inventory/count - Analyze image and count inventory
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { countInventoryFromImage, countInventoryFromMultipleImages } from '@/lib/ai/inventory-index';
import type { KnownProduct } from '@/lib/ai/inventory-index';

/**
 * POST /api/v1/ai/inventory/count
 * Count inventory from image(s) using AI vision
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { images, locationId, userId } = body as {
      images: string | string[]; // Base64 or URL(s)
      locationId?: string;
      userId?: string;
    };

    if (!images || (Array.isArray(images) && images.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Validate location if provided
    if (locationId) {
      const location = await prisma.inventoryLocation.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        return NextResponse.json(
          { success: false, error: 'Invalid location ID' },
          { status: 400 }
        );
      }
    }

    // Get known products for better detection
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        variants: {
          select: {
            id: true,
            title: true,
            sku: true,
            option1Value: true,
          },
        },
      },
    });

    const knownProducts: KnownProduct[] = products.map((p) => ({
      id: p.id,
      name: p.title,
      variants: p.variants.map((v) => v.title),
      packagingDescription: p.variants[0]?.option1Value || undefined,
    }));

    // Count inventory
    const imageArray = Array.isArray(images) ? images : [images];
    const result =
      imageArray.length === 1
        ? await countInventoryFromImage(imageArray[0], knownProducts)
        : await countInventoryFromMultipleImages(imageArray, knownProducts);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to count inventory' },
        { status: 500 }
      );
    }

    // Save AI count record to database
    let aiCountId: string | null = null;
    if (locationId) {
      const aiCount = await prisma.aIInventoryCount.create({
        data: {
          locationId,
          imageUrl: imageArray[0], // Store first image or could store all
          status: 'COMPLETED',
          rawResponse: JSON.parse(JSON.stringify(result.data)),
          detectedItems: JSON.parse(JSON.stringify(result.data.products)),
          overallConfidence: result.confidence,
          createdBy: userId,
        },
      });
      aiCountId = aiCount.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        aiCountId,
      },
      confidence: result.confidence,
    });
  } catch (error) {
    console.error('[AI Inventory] Count error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to count inventory',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/ai/inventory/count
 * Get history of AI counts
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Valid status values from AICountStatus enum
    type AICountStatusType = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING_REVIEW' | 'APPLIED';
    const validStatuses: AICountStatusType[] = ['PROCESSING', 'COMPLETED', 'FAILED', 'PENDING_REVIEW', 'APPLIED'];
    const statusFilter = status && validStatuses.includes(status as AICountStatusType)
      ? (status as AICountStatusType)
      : undefined;

    const aiCounts = await prisma.aIInventoryCount.findMany({
      where: {
        ...(locationId && { locationId }),
        ...(statusFilter && { status: statusFilter }),
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: aiCounts,
    });
  } catch (error) {
    console.error('[AI Inventory] Get counts error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get AI counts',
      },
      { status: 500 }
    );
  }
}
