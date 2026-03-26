/**
 * Admin Unpaid Carts API
 * GET /api/v1/admin/unpaid-carts - List GroupOrderV2 records with unpaid draft items
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { GroupOrderV2Status, Prisma } from '@prisma/client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as GroupOrderV2Status) || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const where: Prisma.GroupOrderV2WhereInput = {
      tabs: {
        some: {
          draftItems: { some: {} },
        },
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shareCode: { contains: search, mode: 'insensitive' } },
        { hostName: { contains: search, mode: 'insensitive' } },
        { hostEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;

    const total = await prisma.groupOrderV2.count({ where });

    const carts = await prisma.groupOrderV2.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tabs: {
          include: {
            draftItems: {
              select: { id: true, title: true, price: true, quantity: true },
            },
            _count: {
              select: { draftItems: true, purchasedItems: true },
            },
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    const transformedCarts = carts.map((cart) => {
      let unpaidItemCount = 0;
      let unpaidTotal = 0;
      let paidItemCount = 0;
      const allDraftItems: { title: string; quantity: number; price: number }[] = [];

      for (const tab of cart.tabs) {
        unpaidItemCount += tab._count.draftItems;
        paidItemCount += tab._count.purchasedItems;
        for (const item of tab.draftItems) {
          unpaidTotal += Number(item.price) * item.quantity;
          allDraftItems.push({
            title: item.title,
            quantity: item.quantity,
            price: Number(item.price),
          });
        }
      }

      // Use first tab's delivery date if available
      const firstTab = cart.tabs[0];

      return {
        id: cart.id,
        name: cart.name,
        shareCode: cart.shareCode,
        status: cart.status,
        hostName: cart.hostName,
        hostEmail: cart.hostEmail,
        deliveryDate: firstTab?.deliveryDate?.toISOString() || null,
        deliveryTime: firstTab?.deliveryTime || null,
        participantCount: cart._count.participants,
        unpaidItemCount,
        unpaidTotal: Math.round(unpaidTotal * 100) / 100,
        paidItemCount,
        items: allDraftItems,
        createdAt: cart.createdAt.toISOString(),
        expiresAt: cart.expiresAt?.toISOString() || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        carts: transformedCarts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          statuses: Object.values(GroupOrderV2Status),
        },
      },
    });
  } catch (error) {
    console.error('[Admin Unpaid Carts API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unpaid carts' },
      { status: 500 }
    );
  }
}
