/**
 * Landing-page form post → NormalizedPartnerLead.
 *
 * Used by the public `POST /api/v1/partner-lead` endpoint. Customers submit
 * email + phone (+ optional name) directly on a `/partners/<slug>/welcome`
 * page; affiliate attribution comes from the `ref_code` cookie (set by
 * middleware on `/partners/<slug>` visits).
 *
 * Unlike FareHarbor payloads, the customer's act of submitting the form IS
 * the opt-in, so `optedIn` is always `true` when validation passes.
 */

import type { LeadSourceWidget } from '@prisma/client';
import type { NormalizerResult, NormalizedPartnerLead } from '../types';

/**
 * Input shape posted by the landing-page form. Validation is done in the
 * route handler via Zod; this function trusts the shape but defends against
 * whitespace / empty-string sloppiness.
 */
export interface LandingPageLeadInput {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  sourcePage?: string | null;
  /** `true` when the customer was on a confirmation-email CTA flow (UTM hint). */
  cameFromConfirmationEmail?: boolean;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    term?: string | null;
  };
}

/** Trim a string-or-nullish to a non-empty string, or null. */
function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeLandingPagePayload(input: LandingPageLeadInput): NormalizerResult {
  const email = clean(input.email)?.toLowerCase() ?? null;
  const phone = clean(input.phone);

  if (!email && !phone) {
    return { ok: false, reason: 'Form submission requires at least one of email or phone' };
  }

  // Distinguish a "post-booking email click" from a "raw landing page visit"
  // by widget type — drives different copy/automation in GHL.
  const sourceWidget: LeadSourceWidget = input.cameFromConfirmationEmail
    ? ('PARTNER_EMAIL_OPTIN' as LeadSourceWidget)
    : ('PARTNER_LANDING_PAGE' as LeadSourceWidget);

  const lead: NormalizedPartnerLead = {
    email,
    phone,
    firstName: clean(input.firstName),
    lastName: clean(input.lastName),
    optedIn: true,
    sourceWidget,
    partnerBookingRef: null,
    partnerBookingMeta: null,
    utm: {
      source: clean(input.utm?.source ?? null),
      medium: clean(input.utm?.medium ?? null),
      campaign: clean(input.utm?.campaign ?? null),
      content: clean(input.utm?.content ?? null),
      term: clean(input.utm?.term ?? null),
    },
    sourcePage: clean(input.sourcePage),
  };

  return { ok: true, lead };
}
