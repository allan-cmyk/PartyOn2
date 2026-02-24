/**
 * Draft Order by ID API
 * GET: Get single draft order
 * PUT: Update draft order
 * DELETE: Delete draft order
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getDraftOrderById,
  updateDraftOrder,
  updateDraftOrderStatus,
  deleteDraftOrder,
  calculateDraftOrderAmounts,
} from '@/lib/draft-orders';
import type { UpdateDraftOrderInput } from '@/lib/draft-orders/types';
import { DraftOrderStatus } from '@prisma/client';

const DraftOrderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  title: z.string(),
  variantTitle: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
});

const UpdateDraftOrderSchema = z.object({
  status: z.enum(['CANCELLED']).optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().optional().nullable(),
  deliveryAddress: z.string().min(1).optional(),
  deliveryCity: z.string().min(1).optional(),
  deliveryState: z.string().optional(),
  deliveryZip: z.string().min(5).optional(),
  deliveryDate: z.string().transform((str) => new Date(str)).optional(),
  deliveryTime: z.string().min(1).optional(),
  deliveryNotes: z.string().optional().nullable(),
  items: z.array(DraftOrderItemSchema).min(1).optional(),
  deliveryFee: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  discountCode: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  affiliateId: z.string().optional().nullable(),
  affiliateCode: z.string().optional().nullable(),
  expiresAt: z.string().transform((str) => new Date(str)).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/draft-orders/[id]
 * Get a single draft order by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const draftOrder = await getDraftOrderById(id);

    if (!draftOrder) {
      return NextResponse.json(
        { success: false, error: 'Draft order not found' },
        { status: 404 }
      );
    }

    // Generate invoice URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
    const invoiceUrl = `${baseUrl}/invoice/${draftOrder.token}`;

    return NextResponse.json({
      success: true,
      data: {
        ...draftOrder,
        invoiceUrl,
      },
    });
  } catch (error) {
    console.error('[Draft Order API] Get error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get draft order' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/admin/draft-orders/[id]
 * Update a draft order
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateDraftOrderSchema.parse(body);

    // Get existing draft order
    const existing = await getDraftOrderById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Draft order not found' },
        { status: 404 }
      );
    }

    // Check if can be modified
    if (['PAID', 'CONVERTED', 'CANCELLED'].includes(existing.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot modify a ${existing.status.toLowerCase()} draft order` },
        { status: 400 }
      );
    }

    // Handle status change (currently only CANCELLED is allowed)
    if (validated.status) {
      const draftOrder = await updateDraftOrderStatus(id, validated.status as DraftOrderStatus);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
      const invoiceUrl = `${baseUrl}/invoice/${draftOrder.token}`;
      return NextResponse.json({
        success: true,
        data: { ...draftOrder, invoiceUrl },
      });
    }

    // If items or amounts changed, recalculate
    let updateData: UpdateDraftOrderInput = { ...validated };

    if (validated.items || validated.deliveryFee !== undefined || validated.discountAmount !== undefined) {
      const items = validated.items || existing.items;
      const deliveryZip = validated.deliveryZip || existing.deliveryZip;
      const deliveryFee = validated.deliveryFee ?? Number(existing.deliveryFee);
      const discountAmount = validated.discountAmount ?? Number(existing.discountAmount);

      const amounts = calculateDraftOrderAmounts(items, deliveryZip, deliveryFee, discountAmount);

      updateData = {
        ...updateData,
        subtotal: amounts.subtotal,
        taxAmount: amounts.taxAmount,
        deliveryFee: amounts.deliveryFee,
        discountAmount: amounts.discountAmount,
      };
    }

    const draftOrder = await updateDraftOrder(id, updateData);

    // Generate invoice URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
    const invoiceUrl = `${baseUrl}/invoice/${draftOrder.token}`;

    return NextResponse.json({
      success: true,
      data: {
        ...draftOrder,
        invoiceUrl,
      },
    });
  } catch (error) {
    console.error('[Draft Order API] Update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update draft order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/draft-orders/[id]
 * Delete a draft order
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if exists
    const existing = await getDraftOrderById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Draft order not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting paid/converted orders
    if (['PAID', 'CONVERTED'].includes(existing.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot delete a ${existing.status.toLowerCase()} draft order` },
        { status: 400 }
      );
    }

    await deleteDraftOrder(id);

    return NextResponse.json({
      success: true,
      message: 'Draft order deleted',
    });
  } catch (error) {
    console.error('[Draft Order API] Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete draft order' },
      { status: 500 }
    );
  }
}
