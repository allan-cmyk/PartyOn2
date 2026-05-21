/**
 * Partner Lead Service
 *
 * Persist a NormalizedPartnerLead and emit a downstream GHL notification.
 *
 * Dedup strategy:
 *   1. If `affiliateId + partnerBookingRef` already exists → update fields,
 *      record a LeadEvent, and return `{ created: false }`. We do NOT
 *      re-fire GHL for the same booking (FareHarbor sends
 *      booking.updated webhooks every time the customer or merchant edits
 *      the booking — refiring would spam SMS).
 *   2. Otherwise match by `affiliateId + email` (case-insensitive). If a
 *      Lead exists, attach this booking ref + update fields.
 *   3. Otherwise create a new Lead.
 *
 * Status transitions:
 *   - Brand new Lead from a partner webhook starts at SUBMITTED (they
 *     actively opted in).
 *   - An existing ANONYMOUS/PARTIAL Lead that gets a partner-confirmed
 *     opt-in is upgraded to SUBMITTED.
 *   - An existing CONVERTED Lead is left CONVERTED (don't downgrade).
 */

import type { Lead, LeadStatus, Prisma, Affiliate } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { notifyPartnerLead } from '@/lib/webhooks/ghl';
import type { NormalizedPartnerLead } from './types';

export interface PersistPartnerLeadInput {
  lead: NormalizedPartnerLead;
  affiliate: Pick<Affiliate, 'id' | 'code' | 'partnerSlug' | 'businessName' | 'customerPerk'>;
  /** Should we push to GHL? Default true. Set false for tests or admin replays. */
  pushToGhl?: boolean;
}

export interface PersistPartnerLeadResult {
  lead: Lead;
  created: boolean;
  ghlPushed: boolean;
  reason?: string;
}

/**
 * Decide the status of a Lead after a partner opt-in.
 *
 * Never downgrade — an already-CONVERTED lead stays CONVERTED.
 */
function nextStatus(current: LeadStatus | undefined): LeadStatus {
  if (current === 'CONVERTED') return 'CONVERTED';
  return 'SUBMITTED';
}

/**
 * Find an existing Lead to update. Order of preference:
 *   1. Same affiliate + same partnerBookingRef (repeat webhook for same booking)
 *   2. Same affiliate + same email
 *   3. Same affiliate + same phone (when no email)
 *
 * We deliberately scope by affiliate so the same email submitted across two
 * different partners produces two distinct leads (different conversion
 * journeys, different attribution).
 */
async function findExistingLead(
  affiliateId: string,
  input: NormalizedPartnerLead
): Promise<Lead | null> {
  if (input.partnerBookingRef) {
    const byRef = await prisma.lead.findFirst({
      where: { affiliateId, partnerBookingRef: input.partnerBookingRef },
    });
    if (byRef) return byRef;
  }
  if (input.email) {
    const byEmail = await prisma.lead.findFirst({
      where: { affiliateId, email: input.email },
    });
    if (byEmail) return byEmail;
  }
  if (input.phone) {
    const byPhone = await prisma.lead.findFirst({
      where: { affiliateId, phone: input.phone },
    });
    if (byPhone) return byPhone;
  }
  return null;
}

/**
 * Persist a normalized partner lead and (by default) push to GHL.
 *
 * Idempotent: re-running with the same `partnerBookingRef` for the same
 * affiliate updates the existing Lead and DOES NOT re-push to GHL.
 *
 * Never throws on the GHL push — that's fire-and-forget. Throws on DB errors
 * so the caller can return a 5xx.
 */
export async function persistPartnerLead(
  input: PersistPartnerLeadInput
): Promise<PersistPartnerLeadResult> {
  const { lead, affiliate, pushToGhl = true } = input;

  const existing = await findExistingLead(affiliate.id, lead);

  let saved: Lead;
  let created: boolean;
  let isDuplicateBooking = false;

  if (existing) {
    // Duplicate booking — same partner booking ref already on file.
    // Update mutable fields but don't re-fire GHL.
    isDuplicateBooking =
      !!lead.partnerBookingRef && existing.partnerBookingRef === lead.partnerBookingRef;

    const data: Prisma.LeadUpdateInput = {
      // Only overwrite null/empty fields — never blank out captured data.
      email: existing.email ?? lead.email,
      phone: existing.phone ?? lead.phone,
      firstName: existing.firstName ?? lead.firstName,
      lastName: existing.lastName ?? lead.lastName,
      status: nextStatus(existing.status),
      sourceWidget: lead.sourceWidget,
      sourcePage: existing.sourcePage ?? lead.sourcePage,
      utmSource: existing.utmSource ?? lead.utm.source,
      utmMedium: existing.utmMedium ?? lead.utm.medium,
      utmCampaign: existing.utmCampaign ?? lead.utm.campaign,
      utmContent: existing.utmContent ?? lead.utm.content,
      utmTerm: existing.utmTerm ?? lead.utm.term,
      partnerBookingRef: existing.partnerBookingRef ?? lead.partnerBookingRef,
      partnerBookingMeta: (lead.partnerBookingMeta ??
        existing.partnerBookingMeta ??
        undefined) as Prisma.InputJsonValue | undefined,
    };

    saved = await prisma.lead.update({ where: { id: existing.id }, data });
    created = false;
  } else {
    saved = await prisma.lead.create({
      data: {
        email: lead.email,
        phone: lead.phone,
        firstName: lead.firstName,
        lastName: lead.lastName,
        status: 'SUBMITTED',
        sourcePage: lead.sourcePage,
        sourceWidget: lead.sourceWidget,
        utmSource: lead.utm.source,
        utmMedium: lead.utm.medium,
        utmCampaign: lead.utm.campaign,
        utmContent: lead.utm.content,
        utmTerm: lead.utm.term,
        affiliateId: affiliate.id,
        partnerBookingRef: lead.partnerBookingRef,
        partnerBookingMeta: (lead.partnerBookingMeta ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
    created = true;
  }

  // Record the LeadEvent for the timeline (always, even for duplicate webhooks).
  await prisma.leadEvent.create({
    data: {
      leadId: saved.id,
      type: 'FORM_SUBMIT',
      page: lead.sourcePage,
      widget: lead.sourceWidget,
      metadata: {
        source: 'partner_lead_service',
        duplicate_booking: isDuplicateBooking,
        partner_slug: affiliate.partnerSlug,
        partner_booking_ref: lead.partnerBookingRef,
      } as Prisma.InputJsonValue,
    },
  });

  // GHL push: only on first capture of a given booking. Re-deliveries of the
  // same FareHarbor webhook are silent on the messaging side.
  let ghlPushed = false;
  let reason: string | undefined;
  if (pushToGhl && !isDuplicateBooking) {
    try {
      await notifyPartnerLead({
        event: 'partner_lead.created',
        partner_slug: affiliate.partnerSlug ?? affiliate.code.toLowerCase(),
        partner_business_name: affiliate.businessName,
        partner_perk: affiliate.customerPerk,
        // Affiliate.code is already uppercase (e.g. CENTEXBOATRENTALS), which
        // is what we want SMS templates to drop in via {{contact.promo_code}}.
        promo_code: affiliate.code,
        first_name: saved.firstName ?? '',
        last_name: saved.lastName ?? '',
        email: saved.email ?? '',
        phone: saved.phone ?? '',
        source_widget: saved.sourceWidget ?? '',
        booking_ref: saved.partnerBookingRef ?? '',
        booking_meta: (saved.partnerBookingMeta as Record<string, unknown> | null) ?? {},
        lead_admin_url: `https://partyondelivery.com/admin/leads/${saved.id}`,
      });
      ghlPushed = true;
    } catch (err) {
      reason = `GHL push failed: ${err instanceof Error ? err.message : String(err)}`;
      // Don't propagate — partner webhooks must return 200 to FareHarbor or
      // they'll retry, and we already have the data persisted.
      console.error('[Partner Lead Service]', reason);
    }
  } else if (isDuplicateBooking) {
    reason = 'Duplicate booking ref — GHL push skipped';
  }

  return { lead: saved, created, ghlPushed, reason };
}
