/**
 * Admin Single Customer API
 * GET /api/v1/admin/customers/[id] - Get customer details with orders and loyalty
 * PUT /api/v1/admin/customers/[id] - Update customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        loyalty: {
          include: {
            tier: true,
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: {
              include: {
                product: { select: { title: true } },
              },
            },
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate total spent
    const orderTotals = await prisma.order.aggregate({
      where: { customerId: id },
      _sum: { total: true },
      _avg: { total: true },
    });

    // Get next tier info if loyalty exists
    let nextTier = null;
    if (customer.loyalty) {
      const next = await prisma.loyaltyTier.findFirst({
        where: {
          minLifetimeSpend: { gt: customer.loyalty.tier.minLifetimeSpend },
        },
        orderBy: { minLifetimeSpend: 'asc' },
      });
      if (next) {
        nextTier = {
          id: next.id,
          name: next.name,
          minSpend: Number(next.minLifetimeSpend),
          spendNeeded: Number(next.minLifetimeSpend) - Number(customer.loyalty.lifetimeSpend),
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        phone: customer.phone,
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email,
        acceptsMarketing: customer.acceptsMarketing,
        isActive: customer.isActive,
        ageVerified: customer.ageVerified,
        ageVerifiedAt: customer.ageVerifiedAt?.toISOString() || null,
        dateOfBirth: customer.dateOfBirth?.toISOString() || null,
        emailVerified: customer.emailVerified,
        emailVerifiedAt: customer.emailVerifiedAt?.toISOString() || null,
        shopifyId: customer.shopifyId,
        stripeCustomerId: customer.stripeCustomerId,
        addresses: customer.addresses.map((addr) => ({
          id: addr.id,
          firstName: addr.firstName,
          lastName: addr.lastName,
          address1: addr.address1,
          address2: addr.address2,
          city: addr.city,
          province: addr.province,
          zip: addr.zip,
          country: addr.country,
          phone: addr.phone,
          isDefault: addr.isDefault,
        })),
        loyalty: customer.loyalty ? {
          points: customer.loyalty.points,
          lifetimeSpend: Number(customer.loyalty.lifetimeSpend),
          lifetimePoints: customer.loyalty.lifetimePoints,
          tier: {
            id: customer.loyalty.tier.id,
            name: customer.loyalty.tier.name,
            color: customer.loyalty.tier.color,
            discountPercent: customer.loyalty.tier.discountPercent,
            pointsMultiplier: customer.loyalty.tier.pointsMultiplier,
            benefits: customer.loyalty.tier.benefits,
          },
          nextTier,
          recentTransactions: customer.loyalty.transactions.map((t) => ({
            id: t.id,
            type: t.type,
            points: t.points,
            description: t.description,
            createdAt: t.createdAt.toISOString(),
          })),
        } : null,
        orders: customer.orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          financialStatus: order.financialStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          total: Number(order.total),
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          deliveryDate: order.deliveryDate.toISOString(),
          createdAt: order.createdAt.toISOString(),
        })),
        stats: {
          totalOrders: customer._count.orders,
          totalSpent: Number(orderTotals._sum.total || 0),
          averageOrderValue: Number(orderTotals._avg.total || 0),
        },
        createdAt: customer.createdAt.toISOString(),
        lastLoginAt: customer.lastLoginAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('[Admin Customer API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'acceptsMarketing',
      'isActive',
      'ageVerified',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle age verification timestamp
    if (body.ageVerified === true && !existing.ageVerified) {
      updateData.ageVerifiedAt = new Date();
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        isActive: customer.isActive,
        updatedAt: customer.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Admin Customer API] Error updating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}
