/**
 * Email Events API for Draft Orders
 * GET: Retrieve email lifecycle events for a draft order
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/draft-orders/[id]/email-events
 * Returns all EmailLog entries for a given draft order
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const emailLogs = await prisma.emailLog.findMany({
      where: { draftOrderId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        to: true,
        subject: true,
        status: true,
        resendId: true,
        sentAt: true,
        deliveredAt: true,
        openedAt: true,
        bouncedAt: true,
        complainedAt: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: emailLogs });
  } catch (error) {
    console.error('[Email Events] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email events' },
      { status: 500 }
    );
  }
}
