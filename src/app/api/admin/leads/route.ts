/**
 * GET /api/admin/leads
 *
 * List leads with optional filters. Powers the /admin/leads admin page.
 *
 * Query params:
 *   - affiliateId       : filter to a single partner
 *   - status            : LeadStatus enum value
 *   - sourceWidget      : LeadSourceWidget enum value
 *   - search            : substring match on email / phone / firstName / lastName
 *   - from, to          : ISO date strings, filter on createdAt
 *   - cursor, limit     : keyset pagination on createdAt desc (default 50)
 *   - format=csv        : return CSV instead of JSON for export
 */

import { NextRequest, NextResponse } from 'next/server';
import { Prisma, type LeadSourceWidget, type LeadStatus } from '@prisma/client';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { prisma } from '@/lib/prisma';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function buildWhere(searchParams: URLSearchParams): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  const affiliateId = searchParams.get('affiliateId');
  if (affiliateId) where.affiliateId = affiliateId;

  const status = searchParams.get('status');
  if (status) where.status = status as LeadStatus;

  const sourceWidget = searchParams.get('sourceWidget');
  if (sourceWidget) where.sourceWidget = sourceWidget as LeadSourceWidget;

  const search = searchParams.get('search')?.trim();
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  // By default exclude ARCHIVED leads from the main list (they clutter the
  // dashboard). Admin can pass status=ARCHIVED explicitly.
  if (!status) {
    where.status = { not: 'ARCHIVED' };
  }

  return where;
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const sp = request.nextUrl.searchParams;
    const where = buildWhere(sp);

    const limit = Math.min(
      Math.max(parseInt(sp.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        affiliate: {
          select: { id: true, code: true, partnerSlug: true, businessName: true },
        },
      },
    });

    // CSV export branch
    if (sp.get('format') === 'csv') {
      const header = [
        'id',
        'created_at',
        'partner',
        'partner_slug',
        'status',
        'source_widget',
        'first_name',
        'last_name',
        'email',
        'phone',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'partner_booking_ref',
        'order_id',
        'source_page',
      ];
      const rows = leads.map((l) => [
        l.id,
        l.createdAt.toISOString(),
        l.affiliate?.businessName ?? '',
        l.affiliate?.partnerSlug ?? '',
        l.status,
        l.sourceWidget ?? '',
        l.firstName ?? '',
        l.lastName ?? '',
        l.email ?? '',
        l.phone ?? '',
        l.utmSource ?? '',
        l.utmMedium ?? '',
        l.utmCampaign ?? '',
        l.partnerBookingRef ?? '',
        l.orderId ?? '',
        l.sourcePage ?? '',
      ]);
      const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Summary counts for the filter bar — cheap aggregate.
    const total = await prisma.lead.count({ where });

    return NextResponse.json({
      success: true,
      data: leads,
      total,
    });
  } catch (error) {
    console.error('[Admin Leads API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list leads' }, { status: 500 });
  }
}
