/**
 * Apply AI Inventory Count API
 * POST /api/v1/ai/inventory/count/[id]/apply - Apply AI count results to inventory
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

interface DetectedItem {
  productName: string;
  estimatedQuantity: number;
  confidence: number;
  productId?: string;
  variantId?: string;
}

interface ApplyRequest {
  adjustments?: Record<string, number>; // productId -> adjusted quantity
  userId?: string;
}

/**
 * POST /api/v1/ai/inventory/count/[id]/apply
 * Apply AI count results to actual inventory
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = (await request.json()) as ApplyRequest;
    const { adjustments, userId } = body;

    // Get the AI count record
    const aiCount = await prisma.aIInventoryCount.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });

    if (!aiCount) {
      return NextResponse.json(
        { success: false, error: 'AI count not found' },
        { status: 404 }
      );
    }

    if (aiCount.status === 'APPLIED') {
      return NextResponse.json(
        { success: false, error: 'AI count has already been applied' },
        { status: 400 }
      );
    }

    // Get detected items
    const detectedItems = (aiCount.detectedItems as unknown as DetectedItem[]) || [];

    if (detectedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items detected in this AI count' },
        { status: 400 }
      );
    }

    // Process each detected item
    const appliedChanges: Array<{
      productId: string;
      productName: string;
      previousQuantity: number;
      newQuantity: number;
      aiQuantity: number;
    }> = [];

    await prisma.$transaction(async (tx) => {
      for (const item of detectedItems) {
        // Skip items without product ID mapping
        if (!item.productId) continue;

        // Use adjustment if provided, otherwise use AI detected quantity
        const targetQuantity = adjustments?.[item.productId] ?? item.estimatedQuantity;

        // Find inventory item for this product at this location
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            locationId: aiCount.locationId,
          },
        });

        if (inventoryItem) {
          const previousQuantity = inventoryItem.quantity;

          // Update inventory
          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: targetQuantity,
              lastCountedAt: new Date(),
              lastCountedBy: userId || 'AI',
            },
          });

          // Create movement record
          await tx.inventoryMovement.create({
            data: {
              inventoryItemId: inventoryItem.id,
              type: 'AI_COUNT',
              quantity: targetQuantity - previousQuantity,
              previousQuantity,
              newQuantity: targetQuantity,
              reason: 'AI inventory count applied',
              referenceType: 'ai_count',
              referenceId: aiCount.id,
              aiConfidence: item.confidence,
              aiImageUrl: aiCount.imageUrl,
              createdBy: userId,
            },
          });

          appliedChanges.push({
            productId: item.productId,
            productName: item.productName,
            previousQuantity,
            newQuantity: targetQuantity,
            aiQuantity: item.estimatedQuantity,
          });
        }
      }

      // Update AI count status
      await tx.aIInventoryCount.update({
        where: { id },
        data: {
          status: 'APPLIED',
          appliedAt: new Date(),
          reviewedAt: new Date(),
          reviewedBy: userId,
          adjustments: adjustments ? JSON.parse(JSON.stringify(adjustments)) : undefined,
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        appliedChanges,
        totalItemsUpdated: appliedChanges.length,
      },
    });
  } catch (error) {
    console.error('[AI Inventory] Apply count error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply AI count',
      },
      { status: 500 }
    );
  }
}
