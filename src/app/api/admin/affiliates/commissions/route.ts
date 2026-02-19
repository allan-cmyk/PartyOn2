/**
 * GET /api/admin/affiliates/commissions -- list commissions with status filter
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { prisma } from '@/lib/database/client';
import { CommissionStatus } from '@prisma/client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const statusParam = request.nextUrl.searchParams.get('status') as CommissionStatus | null;

    const commissions = await prisma.affiliateCommission.findMany({
      where: statusParam ? { status: statusParam as CommissionStatus } : undefined,
      include: {
        affiliate: {
          select: { id: true, code: true, businessName: true, email: true },
        },
        order: {
          select: { id: true, orderNumber: true, customerName: true, customerEmail: true, subtotal: true, total: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: commissions });
  } catch (error) {
    console.error('[Ops Commissions API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list commissions' }, { status: 500 });
  }
}
