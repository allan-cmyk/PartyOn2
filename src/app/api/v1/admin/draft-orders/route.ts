/**
 * Draft Orders API
 * GET: List draft orders
 * POST: Create new draft order
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDraftOrder, listDraftOrders, calculateDraftOrderAmounts } from '@/lib/draft-orders';
import { DraftOrderStatus } from '@prisma/client';
import { prisma } from '@/lib/database/client';

const DraftOrderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  title: z.string(),
  variantTitle: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
});

const CreateDraftOrderSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().min(1),
  deliveryCity: z.string().min(1),
  deliveryState: z.string().default('TX'),
  deliveryZip: z.string().min(5),
  deliveryDate: z.string().transform((str) => new Date(str)),
  deliveryTime: z.string().min(1),
  deliveryNotes: z.string().optional(),
  items: z.array(DraftOrderItemSchema).min(1),
  deliveryFee: z.number().min(0).default(30),
  originalDeliveryFee: z.number().min(0).optional().nullable(),
  discountAmount: z.number().min(0).default(0),
  discountCode: z.string().optional(),
  createdBy: z.string().optional(),
  adminNotes: z.string().optional(),
  groupOrderId: z.string().optional(),
  affiliateId: z.string().optional(),
  affiliateCode: z.string().optional(),
  expiresInDays: z.number().int().positive().optional(),
});

/**
 * GET /api/v1/admin/draft-orders
 * List draft orders with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') as DraftOrderStatus | null;
    const customerEmail = searchParams.get('customerEmail') || undefined;
    const groupOrderId = searchParams.get('groupOrderId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const orderBy = (searchParams.get('orderBy') as 'createdAt' | 'updatedAt' | 'deliveryDate') || 'createdAt';
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

    const result = await listDraftOrders({
      status: status || undefined,
      customerEmail,
      groupOrderId,
      limit,
      offset,
      orderBy,
      order,
    });

    // Fetch latest email status for each draft order
    const draftOrderIds = result.draftOrders.map((d) => d.id);
    let emailStatusMap: Record<string, string> = {};

    if (draftOrderIds.length > 0) {
      const latestEmails = await prisma.$queryRaw<
        { draft_order_id: string; status: string }[]
      >`
        SELECT DISTINCT ON (draft_order_id) draft_order_id, status
        FROM email_logs
        WHERE draft_order_id = ANY(${draftOrderIds}::text[])
        ORDER BY draft_order_id, created_at DESC
      `;

      emailStatusMap = Object.fromEntries(
        latestEmails.map((e) => [e.draft_order_id, e.status])
      );
    }

    const dataWithEmailStatus = result.draftOrders.map((d) => ({
      ...d,
      emailStatus: emailStatusMap[d.id] || null,
    }));

    return NextResponse.json({
      success: true,
      data: dataWithEmailStatus,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + result.draftOrders.length < result.total,
      },
    });
  } catch (error) {
    console.error('[Draft Orders API] List error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list draft orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/draft-orders
 * Create a new draft order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateDraftOrderSchema.parse(body);

    // Calculate amounts from items
    const amounts = calculateDraftOrderAmounts(
      validated.items,
      validated.deliveryZip,
      validated.deliveryFee,
      validated.discountAmount
    );

    // Calculate expiration date if specified
    let expiresAt: Date | undefined;
    if (validated.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validated.expiresInDays);
    }

    const draftOrder = await createDraftOrder({
      ...validated,
      subtotal: amounts.subtotal,
      taxAmount: amounts.taxAmount,
      deliveryFee: amounts.deliveryFee,
      discountAmount: amounts.discountAmount,
      expiresAt,
    });

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
    console.error('[Draft Orders API] Create error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create draft order' },
      { status: 500 }
    );
  }
}
