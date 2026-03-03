/**
 * POST /api/v1/affiliate/create-dashboard
 * Creates a multi-tab GroupOrderV2 on behalf of a client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';
import { createMultiTabDashboardOrder } from '@/lib/group-orders-v2/service';
import { prisma } from '@/lib/database/client';

const TabSchema = z.object({
  name: z.string().min(1).max(200),
  deliveryAddress: z.string().max(500).optional(),
  deliveryContextType: z.enum(['HOUSE', 'BOAT', 'VENUE', 'HOTEL', 'OTHER']).optional(),
  deliveryTime: z.string().max(50).optional(),
});

const CreateDashboardSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(200),
  partyType: z.enum(['BACH', 'BOAT']).optional(),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliveryTime: z.string().max(50).default('12:00 PM - 2:00 PM'),
  tabs: z.array(TabSchema).min(1, 'At least one tab is required'),
  saveAsTemplate: z
    .object({
      name: z.string().min(1).max(200),
    })
    .optional(),
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
    const parsed = CreateDashboardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { clientName, partyType, deliveryDate, deliveryTime, tabs, saveAsTemplate } = parsed.data;

    // Build dashboard title from party type
    let dashboardTitle: string;
    if (partyType === 'BACH') {
      dashboardTitle = `${clientName} Bach Drink Delivery!`;
    } else if (partyType === 'BOAT') {
      dashboardTitle = `${clientName} Drink Delivery!`;
    } else {
      dashboardTitle = `${clientName}'s Order`;
    }

    const groupOrder = await createMultiTabDashboardOrder({
      hostName: clientName,
      dashboardTitle,
      deliveryDate,
      deliveryTime,
      partyType: partyType || undefined,
      affiliateId: session.affiliateId,
      source: 'PARTNER_PAGE',
      tabs: tabs.map((tab) => ({
        name: tab.name,
        deliveryAddress: tab.deliveryAddress,
        deliveryContextType: tab.deliveryContextType,
        deliveryTime: tab.deliveryTime,
      })),
    });

    // Optionally save as template
    if (saveAsTemplate) {
      await prisma.dashboardTemplate.create({
        data: {
          affiliateId: session.affiliateId,
          name: saveAsTemplate.name,
          config: {
            partyType,
            deliveryTime,
            tabs: tabs.map((tab) => ({
              name: tab.name,
              deliveryAddress: tab.deliveryAddress,
              deliveryContextType: tab.deliveryContextType,
              deliveryTime: tab.deliveryTime,
            })),
          },
        },
      });
    }

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
    console.error('[Affiliate Create Dashboard] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}
