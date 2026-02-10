/**
 * Admin Customers API
 * GET /api/v1/admin/customers - List all customers with search, filter, pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';

interface CustomerListParams {
  search?: string;
  hasOrders?: boolean;
  isActive?: boolean;
  loyaltyTier?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'totalOrders' | 'lifetimeSpend';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params: CustomerListParams = {
      search: searchParams.get('search') || undefined,
      hasOrders: searchParams.get('hasOrders') === 'true' ? true :
                 searchParams.get('hasOrders') === 'false' ? false : undefined,
      isActive: searchParams.get('isActive') === 'true' ? true :
                searchParams.get('isActive') === 'false' ? false : undefined,
      loyaltyTier: searchParams.get('loyaltyTier') || undefined,
      sortBy: (searchParams.get('sortBy') as CustomerListParams['sortBy']) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    };

    // Build where clause
    const where: Prisma.CustomerWhereInput = {};

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.hasOrders !== undefined) {
      where.orders = params.hasOrders ? { some: {} } : { none: {} };
    }

    if (params.loyaltyTier) {
      where.loyalty = { tierId: params.loyaltyTier };
    }

    // Build orderBy
    let orderBy: Prisma.CustomerOrderByWithRelationInput;
    switch (params.sortBy) {
      case 'name':
        orderBy = { firstName: params.sortOrder };
        break;
      case 'email':
        orderBy = { email: params.sortOrder };
        break;
      case 'totalOrders':
        orderBy = { orders: { _count: params.sortOrder } };
        break;
      case 'lifetimeSpend':
        orderBy = { loyalty: { lifetimeSpend: params.sortOrder } };
        break;
      default:
        orderBy = { createdAt: params.sortOrder };
    }

    // Get total count
    const total = await prisma.customer.count({ where });

    // Get customers with related data
    const customers = await prisma.customer.findMany({
      where,
      orderBy,
      skip: ((params.page || 1) - 1) * (params.limit || 20),
      take: params.limit || 20,
      include: {
        loyalty: {
          include: { tier: true },
        },
        orders: {
          select: { id: true, total: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    // Get loyalty tiers for filter
    const loyaltyTiers = await prisma.loyaltyTier.findMany({
      select: { id: true, name: true, color: true },
      orderBy: { position: 'asc' },
    });

    // Transform customers
    const transformedCustomers = customers.map((customer) => ({
      id: customer.id,
      email: customer.email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email,
      acceptsMarketing: customer.acceptsMarketing,
      isActive: customer.isActive,
      ageVerified: customer.ageVerified,
      emailVerified: customer.emailVerified,
      totalOrders: customer._count.orders,
      lastOrderAt: customer.orders[0]?.createdAt.toISOString() || null,
      lastOrderTotal: customer.orders[0] ? Number(customer.orders[0].total) : null,
      loyalty: customer.loyalty ? {
        points: customer.loyalty.points,
        lifetimeSpend: Number(customer.loyalty.lifetimeSpend),
        lifetimePoints: customer.loyalty.lifetimePoints,
        tier: {
          id: customer.loyalty.tier.id,
          name: customer.loyalty.tier.name,
          color: customer.loyalty.tier.color,
        },
      } : null,
      createdAt: customer.createdAt.toISOString(),
      lastLoginAt: customer.lastLoginAt?.toISOString() || null,
    }));

    // Summary stats
    const stats = await prisma.customer.aggregate({
      _count: { id: true },
    });

    const activeCount = await prisma.customer.count({ where: { isActive: true } });
    const withOrdersCount = await prisma.customer.count({
      where: { orders: { some: {} } },
    });

    return NextResponse.json({
      success: true,
      data: {
        customers: transformedCustomers,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total,
          pages: Math.ceil(total / (params.limit || 20)),
        },
        filters: {
          loyaltyTiers,
        },
        summary: {
          total: stats._count.id,
          active: activeCount,
          withOrders: withOrdersCount,
        },
      },
    });
  } catch (error) {
    console.error('[Admin Customers API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
