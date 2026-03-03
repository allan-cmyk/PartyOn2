/**
 * /api/v1/affiliate/templates
 * CRUD for affiliate dashboard templates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAffiliateSession } from '@/lib/affiliates/affiliate-session';
import { prisma } from '@/lib/database/client';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getAffiliateSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const templates = await prisma.dashboardTemplate.findMany({
      where: { affiliateId: session.affiliateId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: templates.map((t) => ({
        id: t.id,
        name: t.name,
        config: t.config,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Affiliate Templates GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load templates' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getAffiliateSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
    }

    // Ensure template belongs to this affiliate
    const template = await prisma.dashboardTemplate.findFirst({
      where: { id, affiliateId: session.affiliateId },
    });
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    await prisma.dashboardTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Affiliate Templates DELETE] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete template' }, { status: 500 });
  }
}
