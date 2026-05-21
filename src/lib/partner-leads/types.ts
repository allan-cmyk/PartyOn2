/**
 * Shared types for the Partner Lead Capture pipeline.
 *
 * A "partner lead" is someone who has expressed interest in Party On Delivery
 * via one of our partners (FareHarbor checkboxes, partner confirmation emails,
 * partner landing pages on our site, future Airbnb / hotel integrations, etc.).
 *
 * Every partner platform delivers its own payload shape, so we run incoming
 * payloads through a normalizer (one per source) that produces this shared
 * NormalizedPartnerLead shape. Everything downstream — dedup, persistence,
 * GHL push, admin UI — operates on the normalized shape.
 */

import type { LeadSourceWidget } from '@prisma/client';

/**
 * Identifiers for every supported partner platform / capture surface.
 *
 * Add a new value here whenever you add a normalizer in `./normalizers/`.
 */
export type PartnerLeadSource =
  | 'fareharbor'
  | 'landing_page'
  | 'manual';

/**
 * Normalized partner-lead shape produced by every source-specific normalizer.
 *
 * Fields are nullable when the partner platform doesn't provide them. The
 * service layer enforces that at least one of `email` / `phone` is present
 * before persisting.
 */
export interface NormalizedPartnerLead {
  /** Captured email (lowercased, trimmed). Null when the source didn't have one. */
  email: string | null;
  /** Captured phone (digits only, +country prefix preserved). */
  phone: string | null;
  /** Captured first name (best-effort split from full name). */
  firstName: string | null;
  /** Captured last name (best-effort split from full name). */
  lastName: string | null;

  /**
   * Whether the customer explicitly opted in to follow-up marketing.
   *
   * For FareHarbor: state of the opt-in checkbox custom field.
   * For landing-page form posts: implicit `true` (they submitted the form).
   *
   * Leads where `optedIn === false` are intentionally dropped before persistence
   * — we only ever contact customers who said yes.
   */
  optedIn: boolean;

  /**
   * Which on-site widget enum value to record on the Lead row.
   * Drives reporting ("how many leads from FareHarbor vs landing pages?").
   */
  sourceWidget: LeadSourceWidget;

  /**
   * External booking identifier from the partner platform (e.g. FareHarbor
   * booking pk). Used to dedupe re-deliveries of the same `booking.created`
   * event. Null when there's no external booking concept (e.g. landing-page
   * form submission).
   */
  partnerBookingRef: string | null;

  /**
   * Structured booking context surfaced to the admin UI and the GHL
   * automation: trip date, group size, vehicle/property type, pickup location.
   *
   * Shape is partner-specific. Keep keys snake_case so they round-trip into
   * GHL custom fields cleanly.
   */
  partnerBookingMeta: PartnerBookingMeta | null;

  /** UTM context, when present in the payload (mostly for landing-page submissions). */
  utm: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    content: string | null;
    term: string | null;
  };

  /** Page slug or path the lead originated from (for landing-page submissions). */
  sourcePage: string | null;
}

/**
 * Free-form booking context. Shape is partner-specific — these are the most
 * common fields, but normalizers can add platform-specific keys.
 */
export interface PartnerBookingMeta {
  /** Trip/booking start in ISO-8601 with timezone, when known. */
  trip_start_at?: string;
  /** Trip/booking end in ISO-8601 with timezone, when known. */
  trip_end_at?: string;
  /** Friendly trip-date label for SMS templates ("Sat 6/15"). */
  trip_date_display?: string;
  /** Item name from the partner (e.g. "12-person Pontoon"). */
  item_name?: string;
  /** Total customer/guest count on the booking. */
  group_size?: number;
  /** Pickup location string, if applicable. */
  pickup_location?: string;
  /** Raw partner-platform booking URL for ops debugging. */
  partner_booking_url?: string;
  /** Source platform identifier — duplicated here for convenience in GHL. */
  source_platform?: string;
}

/**
 * Result of running a payload through a normalizer.
 *
 * Normalizers never throw on malformed payloads — instead they return
 * `{ ok: false, reason }` so the inbound endpoint can log it and respond
 * with a meaningful 400.
 */
export type NormalizerResult =
  | { ok: true; lead: NormalizedPartnerLead }
  | { ok: false; reason: string };
