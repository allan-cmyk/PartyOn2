/**
 * Public Invoice API
 * GET: Get invoice by token (customer-facing)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDraftOrderByToken, markDraftOrderViewed } from '@/lib/draft-orders';

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/v1/invoice/[token]
 * Get invoice by token for customer viewing
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    // Get draft order by token
    const draftOrder = await getDraftOrderByToken(token);

    if (!draftOrder) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Mark as viewed if status is SENT
    if (draftOrder.status === 'SENT') {
      await markDraftOrderViewed(token);
    }

    // Check if expired
    if (draftOrder.expiresAt && new Date(draftOrder.expiresAt) < new Date()) {
      return NextResponse.json({
        success: true,
        data: {
          ...draftOrder,
          status: 'EXPIRED',
        },
      });
    }

    // Generate invoice URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
    const invoiceUrl = `${baseUrl}/invoice/${draftOrder.token}`;

    return NextResponse.json({
      success: true,
      data: {
        ...draftOrder,
        invoiceUrl,
        // Don't expose internal fields to customers
        createdBy: undefined,
        adminNotes: undefined,
      },
    });
  } catch (error) {
    console.error('[Invoice API] Get error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get invoice' },
      { status: 500 }
    );
  }
}
