/**
 * Minimum order lead time — single source of truth for "is this delivery
 * soon enough that we refuse the order?"
 *
 * Business rule (operator decision 2026-09-13, after order #527): customers
 * may not place an order whose delivery window starts less than 24 hours
 * from now. Applies to every customer-facing checkout — storefront cart and
 * group/boat dashboards. Ops-created draft orders/invoices are deliberately
 * exempt: the operator hand-approving an exception IS the escape hatch.
 *
 * Timezone: all comparisons happen in America/Chicago wall-clock terms,
 * matching todayCT()/austinDateString elsewhere. `deliveryDate` is stored as
 * a calendar day at noon UTC, so the stored instant must never be compared
 * directly — combine the calendar day with the delivery window's start time
 * instead.
 *
 * Client-safe: pure date math, no server imports.
 */

const TZ = 'America/Chicago';

/** Hours of notice every customer-placed order must give. */
export const MINIMUM_LEAD_TIME_HOURS = 24;

/**
 * Earliest wall-clock delivery window we offer (10:00 AM CT). Used as the
 * window start when an order has no parseable delivery time — the strictest
 * assumption that is still physically real.
 */
const FALLBACK_WINDOW_START = { hour: 10, minute: 0 };

/**
 * Customer-facing refusal copy. The phone number is the deliberate escape
 * hatch: a genuine rush becomes a call the operator can choose to take (and
 * fulfill via an ops-created invoice) instead of an order we silently fail.
 */
export const LEAD_TIME_MESSAGE =
  `Orders must be placed at least ${MINIMUM_LEAD_TIME_HOURS} hours before your delivery time. ` +
  'Please pick a later delivery window — or call or text us at (737) 371-9700 and we may be able to help.';

/**
 * Dashboard-flavored refusal copy: a cruise/dashboard guest cannot "pick a
 * later window" (the event date is fixed), so this variant explains the
 * cutoff instead. Shared by every group-order checkout route so the wording
 * cannot drift between "pay my tab" and "pay all tabs".
 */
export const DASHBOARD_LEAD_TIME_MESSAGE =
  `Online ordering closes ${MINIMUM_LEAD_TIME_HOURS} hours before delivery, and this ` +
  `delivery is less than ${MINIMUM_LEAD_TIME_HOURS} hours away. Call or text us at (737) 371-9700 and we may be able to help.`;

/**
 * Parse the starting time out of a delivery window label.
 * Accepts "12:00 PM - 2:00 PM", "12:00 PM – 2:00 PM", or a bare "10:30 AM".
 * Returns null when no time can be found.
 */
export function parseWindowStart(
  deliveryTime: string | null | undefined,
): { hour: number; minute: number } | null {
  if (!deliveryTime) return null;
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(deliveryTime);
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/** Date portion (YYYY-MM-DD) of an instant in Austin time. */
function austinDateString(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: TZ });
}

/**
 * Coerce a stored delivery date (noon-UTC Date, "YYYY-MM-DD", or full ISO
 * string) into its calendar day. ISO strings are trusted on their date
 * portion — the noon-UTC storage convention means the UTC date IS the
 * intended calendar day; Date instances go through Austin normalization.
 */
function coerceToDayString(input: Date | string): string | null {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return austinDateString(input);
  }
  const dayMatch = /^(\d{4}-\d{2}-\d{2})/.exec(input);
  if (dayMatch) return dayMatch[1];
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return austinDateString(parsed);
}

/**
 * Cached at module scope: constructing an Intl.DateTimeFormat is ~7x the cost
 * of using one, and the checkout calendar calls meetsLeadTime for every
 * day-cell × slot combination per render.
 */
const ZONE_WALL_CLOCK_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

/** The instant's wall clock in `TZ`, expressed as a Date.UTC-style ms value. */
function zoneWallClockMs(instant: Date): number {
  const parts = ZONE_WALL_CLOCK_FORMAT.formatToParts(instant);
  const get = (type: string): number =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  // Some ICU builds render midnight as "24" with hour12: false.
  const hour = get('hour') % 24;
  return Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));
}

/**
 * The UTC instant at which a given Austin wall-clock time occurs.
 * Two-pass fixed-point search over the zone offset — exact across DST
 * transitions for any real-world offset.
 */
function centralWallClockToUtc(dayStr: string, hour: number, minute: number): Date {
  const [y, m, d] = dayStr.split('-').map(Number);
  const desired = Date.UTC(y, m - 1, d, hour, minute, 0);
  let ts = desired;
  for (let i = 0; i < 2; i++) {
    const diff = zoneWallClockMs(new Date(ts)) - desired;
    if (diff === 0) break;
    ts -= diff;
  }
  return new Date(ts);
}

/**
 * The UTC instant a delivery window starts, from the stored calendar day and
 * the window label. Missing/unparseable time falls back to 10:00 AM CT.
 * Returns null only when the date itself is unusable.
 */
export function deliveryWindowStartUtc(
  deliveryDate: Date | string,
  deliveryTime?: string | null,
): Date | null {
  const dayStr = coerceToDayString(deliveryDate);
  if (!dayStr) return null;
  const start = parseWindowStart(deliveryTime) ?? FALLBACK_WINDOW_START;
  return centralWallClockToUtc(dayStr, start.hour, start.minute);
}

/**
 * Does this delivery window start at least MINIMUM_LEAD_TIME_HOURS from now?
 *
 * Unparseable dates return FALSE (fail closed): a date the server cannot
 * understand must not sail past the one gate that exists because of #527.
 */
export function meetsLeadTime(
  deliveryDate: Date | string | null | undefined,
  deliveryTime?: string | null,
  now: Date = new Date(),
): boolean {
  if (deliveryDate == null) return false;
  const start = deliveryWindowStartUtc(deliveryDate, deliveryTime);
  if (!start) return false;
  return start.getTime() - now.getTime() >= MINIMUM_LEAD_TIME_HOURS * 60 * 60 * 1000;
}
