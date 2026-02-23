/**
 * POST /api/v1/affiliate/create-order
 * Authenticated partner creates a GroupOrderV2 on behalf of a client.
 * Returns the shareCode and dashboard URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';
import { createDashboardOrder } from '@/lib/group-orders-v2/service';

const CreateOrderSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(200),
  partyType: z.enum(['BACHELOR', 'BACHELORETTE', 'WEDDING', 'CORPORATE', 'HOUSE_PARTY', 'OTHER', 'BOAT', 'BACH']).optional(),
  deliveryContextType: z.enum(['HOUSE', 'BOAT', 'VENUE', 'HOTEL', 'OTHER']).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getAffiliateSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { clientName, partyType, deliveryContextType } = parsed.data;

    const groupOrder = await createDashboardOrder({
      hostName: clientName,
      name: `${clientName}'s Order`,
      source: 'PARTNER_PAGE',
      affiliateId: session.affiliateId,
      partyType: partyType || undefined,
      deliveryContextType: deliveryContextType || undefined,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

    return NextResponse.json({
      success: true,
      data: {
        shareCode: groupOrder.shareCode,
        dashboardUrl: `${appUrl}/dashboard/${groupOrder.shareCode}`,
        groupOrderId: groupOrder.id,
      },
    });
  } catch (error) {
    console.error('[Partner Create Order] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
