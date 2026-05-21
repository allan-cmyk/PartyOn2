/**
 * GET   /api/admin/leads/[id]  — full Lead detail + events timeline
 * PATCH /api/admin/leads/[id]  — update status / notes (admin actions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { LeadStatus } from '@prisma/client';
import { requireOpsAuth } from '@/lib/auth/ops-session';
import { prisma } from '@/lib/prisma';
import { notifyPartnerLead } from '@/lib/webhooks/ghl';

const patchSchema = z.object({
  status: z.enum(['ANONYMOUS', 'PARTIAL', 'SUBMITTED', 'CONVERTED', 'ARCHIVED']).optional(),
  notes: z.string().max(5000).optional(),
  /** Set true to re-fire the GHL partner-lead webhook (manual re-push). */
  rePushToGhl: z.boolean().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        affiliate: {
          select: {
            id: true,
            code: true,
            partnerSlug: true,
            businessName: true,
            customerPerk: true,
          },
        },
        events: {
          orderBy: { occurredAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('[Admin Lead Detail API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const auth = await requireOpsAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const existing = await prisma.lead.findUnique({
      where: { id },
      include: {
        affiliate: {
          select: {
            id: true,
            code: true,
            partnerSlug: true,
            businessName: true,
            customerPerk: true,
          },
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const updateData: { status?: LeadStatus; notes?: string } = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

    let updated = existing;
    if (Object.keys(updateData).length > 0) {
      updated = await prisma.lead.update({
        where: { id },
        data: updateData,
        include: {
          affiliate: {
            select: {
              id: true,
              code: true,
              partnerSlug: true,
              businessName: true,
              customerPerk: true,
            },
          },
        },
      });

      // Audit event so the timeline shows the manual change.
      await prisma.leadEvent.create({
        data: {
          leadId: id,
          type: 'CUSTOM',
          metadata: {
            source: 'admin_manual',
            change: updateData,
          },
        },
      });
    }

    // Manual GHL re-push (only when explicitly requested — usually to retry
    // after a GHL outage).
    if (parsed.data.rePushToGhl && existing.affiliate) {
      try {
        await notifyPartnerLead({
          event: 'partner_lead.created',
          partner_slug: existing.affiliate.partnerSlug ?? existing.affiliate.code.toLowerCase(),
          partner_business_name: existing.affiliate.businessName,
          partner_perk: existing.affiliate.customerPerk,
          promo_code: existing.affiliate.code,
          first_name: existing.firstName ?? '',
          last_name: existing.lastName ?? '',
          email: existing.email ?? '',
          phone: existing.phone ?? '',
          source_widget: existing.sourceWidget ?? '',
          booking_ref: existing.partnerBookingRef ?? '',
          booking_meta: (existing.partnerBookingMeta as Record<string, unknown> | null) ?? {},
          lead_admin_url: `https://partyondelivery.com/admin/leads/${existing.id}`,
        });
        await prisma.leadEvent.create({
          data: {
            leadId: id,
            type: 'CUSTOM',
            metadata: { source: 'admin_manual', action: 'ghl_re_push' },
          },
        });
      } catch (err) {
        console.error('[Admin Lead PATCH] GHL re-push failed:', err);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('[Admin Lead PATCH] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 500 });
  }
}
