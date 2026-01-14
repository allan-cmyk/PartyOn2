/**
 * Admin Automatic Discounts API
 * GET /api/v1/admin/discounts/automatic - List automatic discounts
 * POST /api/v1/admin/discounts/automatic - Create automatic discount
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { DiscountType, AutoDiscountTrigger } from '@prisma/client';

interface CreateAutoDiscountBody {
  name: string;
  type: DiscountType;
  value: number;
  triggerType: AutoDiscountTrigger;
  triggerValue?: number;
  appliesToAll?: boolean;
  applicableProducts?: string[];
  priority?: number;
  stackable?: boolean;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const discounts = await prisma.automaticDiscount.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: discounts.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        value: Number(d.value),
        triggerType: d.triggerType,
        triggerValue: d.triggerValue ? Number(d.triggerValue) : null,
        appliesToAll: d.appliesToAll,
        applicableProducts: d.applicableProducts,
        priority: d.priority,
        stackable: d.stackable,
        startsAt: d.startsAt.toISOString(),
        expiresAt: d.expiresAt?.toISOString() || null,
        isActive: d.isActive,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Admin Auto Discounts API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automatic discounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateAutoDiscountBody;

    if (!body.name || !body.type || body.value === undefined || !body.triggerType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, type, value, triggerType' },
        { status: 400 }
      );
    }

    // Validate trigger value for certain types
    if (['CART_TOTAL', 'PRODUCT_COUNT'].includes(body.triggerType) && !body.triggerValue) {
      return NextResponse.json(
        { success: false, error: `${body.triggerType} requires a triggerValue` },
        { status: 400 }
      );
    }

    const discount = await prisma.automaticDiscount.create({
      data: {
        name: body.name,
        type: body.type,
        value: body.value,
        triggerType: body.triggerType,
        triggerValue: body.triggerValue,
        appliesToAll: body.appliesToAll ?? true,
        applicableProducts: body.applicableProducts || [],
        priority: body.priority ?? 0,
        stackable: body.stackable ?? false,
        startsAt: body.startsAt ? new Date(body.startsAt) : new Date(),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: discount.id,
        name: discount.name,
        type: discount.type,
        triggerType: discount.triggerType,
        isActive: discount.isActive,
        createdAt: discount.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Auto Discounts API] Error creating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create automatic discount' },
      { status: 500 }
    );
  }
}
