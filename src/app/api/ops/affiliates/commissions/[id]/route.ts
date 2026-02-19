/**
 * PUT /api/ops/affiliates/commissions/[id] -- approve or void a commission
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/ops-session';
import { prisma } from '@/lib/database/client';
import { CommissionStatus } from '@prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireAdminRole();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body; // action: 'approve' | 'void'

    const commission = await prisma.affiliateCommission.findUnique({ where: { id } });
    if (!commission) {
      return NextResponse.json({ success: false, error: 'Commission not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const updated = await prisma.affiliateCommission.update({
        where: { id },
        data: { status: CommissionStatus.APPROVED },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'void') {
      const updated = await prisma.affiliateCommission.update({
        where: { id },
        data: {
          status: CommissionStatus.VOID,
          voidedAt: new Date(),
          voidedReason: reason || 'admin_void',
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Use "approve" or "void".' }, { status: 400 });
  } catch (error) {
    console.error('[Ops Commission Update API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update commission' }, { status: 500 });
  }
}
