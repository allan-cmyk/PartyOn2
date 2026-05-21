/**
 * FareHarbor → NormalizedPartnerLead.
 *
 * FareHarbor fires its booking webhook for every `booking.created`,
 * `booking.updated`, and `booking.cancelled` event. Each payload includes the
 * full booking with booker contact, item, availability window, and every
 * custom-field value the merchant has configured.
 *
 * Our opt-in surface on Centex's booking form is a single optional checkbox
 * custom field — by default unchecked. We identify it by substring-matching
 * the custom field title (the manager pastes a label we provide; we don't
 * need a coordinated ID). Any of these substrings (case-insensitive) marks
 * a field as our opt-in:
 *
 *   - "party on delivery"
 *   - "alcohol delivery"
 *
 * The customer's checkbox state can come back as `true`, `"yes"`, `"true"`,
 * `"1"`, or `1` depending on FareHarbor's serialization of the field type.
 * `parseFareharborOptInValue()` handles all of these.
 *
 * Payload shape reference: developer.fareharbor.com/api/external/v1/
 * (We don't import their full TypeScript schema — they don't publish one —
 *  so we type defensively and accept `unknown` for the raw payload.)
 */

import type { LeadSourceWidget } from '@prisma/client';
import type {
  NormalizerResult,
  NormalizedPartnerLead,
  PartnerBookingMeta,
} from '../types';

/** Substrings (case-insensitive) that identify our opt-in custom field. */
const OPT_IN_TITLE_SUBSTRINGS = ['party on delivery', 'alcohol delivery'];

/** Truthy string values FareHarbor may emit for a checked checkbox. */
const TRUTHY_STRINGS = new Set(['true', 'yes', 'y', '1', 'on', 'checked']);

/**
 * Top-level FareHarbor webhook payload (subset of fields we care about).
 *
 * FareHarbor wraps the booking in `{ booking: {...} }` for webhook deliveries.
 * Some integrations forward it flat — accept both shapes.
 */
interface RawFareharborPayload {
  booking?: RawFareharborBooking;
  // Some forwarders strip the wrapper:
  pk?: number | string;
  uuid?: string;
  contact?: RawFareharborContact;
  availability?: RawFareharborAvailability;
  customer_count_total?: number;
  custom_field_values?: RawFareharborCustomFieldValue[];
  custom_field_instances?: RawFareharborCustomFieldValue[];
}

interface RawFareharborBooking {
  pk?: number | string;
  uuid?: string;
  contact?: RawFareharborContact;
  availability?: RawFareharborAvailability;
  customer_count_total?: number;
  custom_field_values?: RawFareharborCustomFieldValue[];
  custom_field_instances?: RawFareharborCustomFieldValue[];
  dashboard_url?: string;
}

interface RawFareharborContact {
  name?: string;
  email?: string;
  phone?: string;
  normalized_phone?: string;
}

interface RawFareharborAvailability {
  start_at?: string;
  end_at?: string;
  item?: { name?: string };
}

interface RawFareharborCustomFieldValue {
  custom_field?: { title?: string; name?: string };
  display_value?: string;
  value?: string | number | boolean | null;
}

/**
 * Parse a FareHarbor checkbox value into a boolean.
 *
 * FareHarbor's API serializes booleans inconsistently (sometimes a JSON
 * boolean, sometimes a stringified one, sometimes "yes"/"no" depending on
 * how the merchant configured the field type). Accept all common shapes;
 * default to false.
 *
 * Exported so the unit tests can hammer it directly.
 */
export function parseFareharborOptInValue(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return TRUTHY_STRINGS.has(value.trim().toLowerCase());
  }
  return false;
}

/**
 * Best-effort split of "First Last" or "First Middle Last" into firstName +
 * lastName. Returns `{ firstName: null, lastName: null }` when the input is
 * empty or whitespace-only.
 */
function splitName(fullName: string | undefined): { firstName: string | null; lastName: string | null } {
  if (!fullName) return { firstName: null, lastName: null };
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

/**
 * Find the opt-in custom field value in a FareHarbor payload's custom-field array.
 *
 * Returns `null` when the merchant hasn't configured the field at all — that's
 * a setup error, not a "no opt-in" signal, and we surface it differently in
 * the service layer (logged as a warning; the lead is still skipped).
 */
function findOptInValue(fields: RawFareharborCustomFieldValue[] | undefined): boolean | null {
  if (!fields || fields.length === 0) return null;

  for (const field of fields) {
    const title = (field.custom_field?.title || field.custom_field?.name || '').toLowerCase();
    if (!title) continue;
    const isOptInField = OPT_IN_TITLE_SUBSTRINGS.some((needle) => title.includes(needle));
    if (!isOptInField) continue;
    // Prefer raw `value`; fall back to `display_value` ("Yes" / "No").
    if (field.value !== undefined && field.value !== null) {
      return parseFareharborOptInValue(field.value);
    }
    if (field.display_value) {
      return parseFareharborOptInValue(field.display_value);
    }
    return false;
  }

  return null;
}

/**
 * Format a FareHarbor ISO start_at as a friendly trip-date label for SMS:
 *
 *   "Sat 6/15"  ←  "2026-06-15T18:00:00-05:00"
 *
 * Returns undefined on unparsable input — the SMS template falls back to a
 * generic phrase ("your upcoming trip") in that case.
 */
function formatTripDateDisplay(startAt: string | undefined): string | undefined {
  if (!startAt) return undefined;
  const d = new Date(startAt);
  if (isNaN(d.getTime())) return undefined;
  // Render in UTC to avoid TZ shifts on the server — close enough for SMS
  // copy. (FareHarbor itself includes the operator's local TZ offset, so the
  // wall-clock date matches the customer's expectation.)
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
  return `${dow} ${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

/**
 * Run a FareHarbor webhook payload through normalization.
 *
 * Always returns a result; never throws. Callers check `result.ok` and use
 * `result.lead` or `result.reason` accordingly.
 */
export function normalizeFareharborPayload(raw: unknown): NormalizerResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'Payload is not an object' };
  }

  const payload = raw as RawFareharborPayload;
  // Accept both `{ booking: {...} }` (FareHarbor canonical) and a flat shape.
  const booking: RawFareharborBooking = payload.booking ?? (payload as RawFareharborBooking);

  const contact = booking.contact;
  const email = contact?.email?.trim().toLowerCase() || null;
  const phone = (contact?.normalized_phone || contact?.phone || '').trim() || null;

  if (!email && !phone) {
    return { ok: false, reason: 'No email or phone on booking contact' };
  }

  const { firstName, lastName } = splitName(contact?.name);

  const customFields = booking.custom_field_values ?? booking.custom_field_instances;
  const optInValue = findOptInValue(customFields);

  if (optInValue === null) {
    return { ok: false, reason: 'Opt-in custom field not found on booking — merchant setup incomplete' };
  }

  if (!optInValue) {
    return { ok: false, reason: 'Customer did not opt in (checkbox unchecked)' };
  }

  const bookingRef = booking.pk != null ? String(booking.pk) : booking.uuid ?? null;

  const meta: PartnerBookingMeta = {
    source_platform: 'fareharbor',
  };
  if (booking.availability?.start_at) {
    meta.trip_start_at = booking.availability.start_at;
    const display = formatTripDateDisplay(booking.availability.start_at);
    if (display) meta.trip_date_display = display;
  }
  if (booking.availability?.end_at) meta.trip_end_at = booking.availability.end_at;
  if (booking.availability?.item?.name) meta.item_name = booking.availability.item.name;
  if (typeof booking.customer_count_total === 'number') meta.group_size = booking.customer_count_total;
  if (booking.dashboard_url) meta.partner_booking_url = booking.dashboard_url;

  const lead: NormalizedPartnerLead = {
    email,
    phone,
    firstName,
    lastName,
    optedIn: true,
    sourceWidget: 'PARTNER_FAREHARBOR_WEBHOOK' as LeadSourceWidget,
    partnerBookingRef: bookingRef,
    partnerBookingMeta: meta,
    utm: {
      source: 'fareharbor',
      medium: 'partner_webhook',
      campaign: null,
      content: null,
      term: null,
    },
    sourcePage: null,
  };

  return { ok: true, lead };
}
