/**
 * GET /api/v2/group-orders/[code]/tabs/[tabId]/free-shipping-check
 * Check if any participant on this tab used a discount code that includes free shipping
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { getGroupOrderByCode } from '@/lib/group-orders-v2/service';

interface RouteParams {
  params: Promise<{ code: string; tabId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { code, tabId } = await params;

    const group = await getGroupOrderByCode(code);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const tab = group.tabs.find((t) => t.id === tabId);
    if (!tab) {
      return NextResponse.json({ success: false, error: 'Tab not found' }, { status: 404 });
    }

    // Find paid payments on this tab that used a discount code
    const paidPayments = await prisma.participantPayment.findMany({
      where: {
        subOrderId: tabId,
        status: 'PAID',
        discountCode: { not: null },
      },
      select: { discountCode: true },
    });

    const usedCodes = paidPayments
      .map((p) => p.discountCode)
      .filter((c): c is string => c !== null);

    if (usedCodes.length === 0) {
      return NextResponse.json({ success: true, data: { freeShippingCode: null } });
    }

    // Check if any of those codes have freeShipping enabled
    const freeShippingDiscount = await prisma.discount.findFirst({
      where: {
        code: { in: usedCodes },
        freeShipping: true,
        isActive: true,
      },
      select: { code: true },
    });

    return NextResponse.json({
      success: true,
      data: { freeShippingCode: freeShippingDiscount?.code ?? null },
    });
  } catch (error) {
    console.error('[Group V2] Free shipping check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check free shipping eligibility' },
      { status: 500 }
    );
  }
}
