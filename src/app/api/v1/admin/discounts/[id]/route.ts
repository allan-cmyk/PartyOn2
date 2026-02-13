/**
 * Admin Individual Discount API
 * GET /api/v1/admin/discounts/[id] - Get discount details
 * PUT /api/v1/admin/discounts/[id] - Update discount
 * DELETE /api/v1/admin/discounts/[id] - Delete discount
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { DiscountType } from '@prisma/client';

interface UpdateDiscountBody {
  code?: string;
  name?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  appliesToAll?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  minOrderAmount?: number | null;
  minQuantity?: number | null;
  maxUsageCount?: number | null;
  usagePerCustomer?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  startsAt?: string;
  expiresAt?: string | null;
  isActive?: boolean;
  combinable?: boolean;
  freeShipping?: boolean;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        usageHistory: {
          orderBy: { usedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!discount) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        description: discount.description,
        type: discount.type,
        value: Number(discount.value),
        appliesToAll: discount.appliesToAll,
        applicableProducts: discount.applicableProducts,
        applicableCategories: discount.applicableCategories,
        minOrderAmount: discount.minOrderAmount ? Number(discount.minOrderAmount) : null,
        minQuantity: discount.minQuantity,
        maxUsageCount: discount.maxUsageCount,
        usagePerCustomer: discount.usagePerCustomer,
        buyQuantity: discount.buyQuantity,
        getQuantity: discount.getQuantity,
        startsAt: discount.startsAt.toISOString(),
        expiresAt: discount.expiresAt?.toISOString() || null,
        isActive: discount.isActive,
        combinable: discount.combinable,
        freeShipping: discount.freeShipping,
        usageCount: discount.usageCount,
        totalDiscountGiven: Number(discount.totalDiscountGiven),
        createdAt: discount.createdAt.toISOString(),
        updatedAt: discount.updatedAt.toISOString(),
        usageHistory: discount.usageHistory.map((u) => ({
          id: u.id,
          customerId: u.customerId,
          orderId: u.orderId,
          amountSaved: Number(u.amountSaved),
          usedAt: u.usedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('[Admin Discount API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discount' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateDiscountBody;

    // Check if discount exists
    const existing = await prisma.discount.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    // If changing code, check it doesn't already exist
    if (body.code) {
      const normalizedCode = body.code.toUpperCase().trim();
      const codeExists = await prisma.discount.findFirst({
        where: {
          code: normalizedCode,
          NOT: { id },
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Discount code already exists' },
          { status: 400 }
        );
      }
    }

    // Validate Buy X Get Y fields if type is being changed
    if (body.type === 'BUY_X_GET_Y') {
      const buyQty = body.buyQuantity ?? existing.buyQuantity;
      const getQty = body.getQuantity ?? existing.getQuantity;
      if (!buyQty || !getQty) {
        return NextResponse.json(
          { success: false, error: 'BUY_X_GET_Y discounts require buyQuantity and getQuantity' },
          { status: 400 }
        );
      }
    }

    const discount = await prisma.discount.update({
      where: { id },
      data: {
        ...(body.code && { code: body.code.toUpperCase().trim() }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.value !== undefined && { value: body.value }),
        ...(body.appliesToAll !== undefined && { appliesToAll: body.appliesToAll }),
        ...(body.applicableProducts !== undefined && { applicableProducts: body.applicableProducts }),
        ...(body.applicableCategories !== undefined && { applicableCategories: body.applicableCategories }),
        ...(body.minOrderAmount !== undefined && { minOrderAmount: body.minOrderAmount }),
        ...(body.minQuantity !== undefined && { minQuantity: body.minQuantity }),
        ...(body.maxUsageCount !== undefined && { maxUsageCount: body.maxUsageCount }),
        ...(body.usagePerCustomer !== undefined && { usagePerCustomer: body.usagePerCustomer }),
        ...(body.buyQuantity !== undefined && { buyQuantity: body.buyQuantity }),
        ...(body.getQuantity !== undefined && { getQuantity: body.getQuantity }),
        ...(body.startsAt !== undefined && { startsAt: new Date(body.startsAt) }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.combinable !== undefined && { combinable: body.combinable }),
        ...(body.freeShipping !== undefined && { freeShipping: body.freeShipping }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: Number(discount.value),
        isActive: discount.isActive,
        combinable: discount.combinable,
        freeShipping: discount.freeShipping,
        updatedAt: discount.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Discount API] Error updating discount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update discount' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    // Check if discount exists
    const existing = await prisma.discount.findUnique({
      where: { id },
      include: {
        _count: { select: { usageHistory: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Discount not found' },
        { status: 404 }
      );
    }

    // If discount has been used, soft delete instead
    if (existing._count.usageHistory > 0) {
      await prisma.discount.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Discount deactivated (has usage history)',
      });
    }

    // Hard delete if never used
    await prisma.discount.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Discount deleted',
    });
  } catch (error) {
    console.error('[Admin Discount API] Error deleting discount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete discount' },
      { status: 500 }
    );
  }
}
