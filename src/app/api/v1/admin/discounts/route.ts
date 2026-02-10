/**
 * Admin Discounts API
 * GET /api/v1/admin/discounts - List all discounts
 * POST /api/v1/admin/discounts - Create a new discount
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { DiscountType } from '@prisma/client';

interface CreateDiscountBody {
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  appliesToAll?: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  minOrderAmount?: number;
  minQuantity?: number;
  maxUsageCount?: number;
  usagePerCustomer?: number;
  buyQuantity?: number;
  getQuantity?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  combinable?: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // active, inactive, all
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [discounts, total] = await Promise.all([
      prisma.discount.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { usageHistory: true },
          },
        },
      }),
      prisma.discount.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        discounts: discounts.map((d) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          description: d.description,
          type: d.type,
          value: Number(d.value),
          appliesToAll: d.appliesToAll,
          applicableProducts: d.applicableProducts,
          applicableCategories: d.applicableCategories,
          minOrderAmount: d.minOrderAmount ? Number(d.minOrderAmount) : null,
          minQuantity: d.minQuantity,
          maxUsageCount: d.maxUsageCount,
          usagePerCustomer: d.usagePerCustomer,
          buyQuantity: d.buyQuantity,
          getQuantity: d.getQuantity,
          startsAt: d.startsAt.toISOString(),
          expiresAt: d.expiresAt?.toISOString() || null,
          isActive: d.isActive,
          combinable: d.combinable,
          usageCount: d.usageCount,
          totalDiscountGiven: Number(d.totalDiscountGiven),
          usageHistoryCount: d._count.usageHistory,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[Admin Discounts API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateDiscountBody;

    // Validate required fields
    if (!body.code || !body.name || !body.type || body.value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: code, name, type, value' },
        { status: 400 }
      );
    }

    // Normalize code to uppercase
    const code = body.code.toUpperCase().trim();

    // Check if code already exists
    const existing = await prisma.discount.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    // Validate Buy X Get Y fields
    if (body.type === 'BUY_X_GET_Y') {
      if (!body.buyQuantity || !body.getQuantity) {
        return NextResponse.json(
          { success: false, error: 'BUY_X_GET_Y discounts require buyQuantity and getQuantity' },
          { status: 400 }
        );
      }
    }

    const discount = await prisma.discount.create({
      data: {
        code,
        name: body.name,
        description: body.description,
        type: body.type,
        value: body.value,
        appliesToAll: body.appliesToAll ?? true,
        applicableProducts: body.applicableProducts || [],
        applicableCategories: body.applicableCategories || [],
        minOrderAmount: body.minOrderAmount,
        minQuantity: body.minQuantity,
        maxUsageCount: body.maxUsageCount,
        usagePerCustomer: body.usagePerCustomer,
        buyQuantity: body.buyQuantity,
        getQuantity: body.getQuantity,
        startsAt: body.startsAt ? new Date(body.startsAt) : new Date(),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive ?? true,
        combinable: body.combinable ?? false,
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
        createdAt: discount.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Discounts API] Error creating discount:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create discount' },
      { status: 500 }
    );
  }
}
