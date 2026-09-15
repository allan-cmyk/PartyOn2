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
 * Machine-readable refusal code — the same one the cart, checkout, and
 * group-order routes already return, so any client can branch on it.
 */
export const DELIVERY_TOO_SOON_CODE = 'DELIVERY_TOO_SOON';

/**
 * Note shown beside customer-facing date pickers, whose minimum is
 * earliestQuoteDay(). There is no online same-day option (ADR-0010), so a
 * call or text is the only rush path this points at.
 */
export const RUSH_NOTE =
  `Online orders need at least ${MINIMUM_LEAD_TIME_HOURS} hours' notice. ` +
  'Need it sooner? Call or text (737) 371-9700 and we may be able to help.';

/**
 * Minutes of slack the self-serve date pickers (chat, package builder) add on
 * top of the 24-hour minimum, so a day can't slip inside the cutoff while the
 * customer is still filling in the rest of the form.
 */
export const PICKER_MARGIN_MINUTES = 60;

/**
 * Hours of checkout time a self-serve quote dashboard should open with. Tab
 * checkout re-checks the 24-hour minimum at pay time, so a window that clears
 * it by minutes goes dead before the host — or their group — can pay.
 */
export const QUOTE_CHECKOUT_RUNWAY_HOURS = 3;

/**
 * The least checkout time pickQuoteWindow's last-window fallback may leave;
 * below it the quote is refused instead. Half of PICKER_MARGIN_MINUTES, so a
 * day the pickers offered is only refused if the form took over half an hour.
 */
export const QUOTE_MIN_RUNWAY_MINUTES = 30;

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

/**
 * True when a YYYY-MM-DD string names a real calendar day. Date math silently
 * rolls impossible parts forward ("2026-02-30" → Mar 2, "2026-13-01" → Jan 1
 * 2027), which would let a malformed date slip past the lead-time checks.
 */
export function isCalendarDay(day: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
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
 * A date portion that isn't a real calendar day is unusable (null).
 */
function coerceToDayString(input: Date | string): string | null {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return austinDateString(input);
  }
  const dayMatch = /^(\d{4}-\d{2}-\d{2})/.exec(input);
  if (dayMatch) return isCalendarDay(dayMatch[1]) ? dayMatch[1] : null;
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

const HOUR_MS = 60 * 60 * 1000;

/**
 * Build the dashboard's delivery windows: 30-minute slots from 10:00 AM to
 * 9:00 PM CT, labeled "10:00 AM - 10:30 AM" (the format parseWindowStart and
 * the tab routes read).
 */
function buildDashboardTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 10; h <= 20; h++) {
    for (const m of [0, 30]) {
      const hour = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const nextH = m === 30 ? h + 1 : h;
      const nextM = m === 30 ? 0 : 30;
      const nextHour = nextH % 12 || 12;
      const nextAmpm = nextH < 12 ? 'AM' : 'PM';
      const start = `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
      const end = `${nextHour}:${nextM.toString().padStart(2, '0')} ${nextAmpm}`;
      slots.push(`${start} - ${end}`);
    }
  }
  return slots;
}

/**
 * Delivery windows a customer can pick on a dashboard tab. Shared by the
 * dashboard's delivery-details picker and the quote flow's opening window, so
 * both agree on what "a bookable window" is.
 */
export const DASHBOARD_TIME_SLOTS: readonly string[] = buildDashboardTimeSlots();

/** Today's calendar day (YYYY-MM-DD) in Austin. */
export function todayInAustin(now: Date = new Date()): string {
  return austinDateString(now);
}

/** Calendar arithmetic on a YYYY-MM-DD day — DST-proof, unlike adding 24 hours. */
function addCalendarDays(dayStr: string, days: number): string {
  const [y, m, d] = dayStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * Earliest Austin calendar day (YYYY-MM-DD) that still has a dashboard window
 * at least MINIMUM_LEAD_TIME_HOURS away — the dashboard date picker's minimum.
 *
 * The LAST window (8:30 PM) is what's checked: late in the evening, the day
 * that contains now+24h has no window left that clears the cutoff, and
 * offering it would make every slot fail one by one with no explanation.
 */
export function earliestBookableDay(now: Date = new Date()): string {
  const day = austinDateString(new Date(now.getTime() + MINIMUM_LEAD_TIME_HOURS * HOUR_MS));
  const lastSlot = DASHBOARD_TIME_SLOTS[DASHBOARD_TIME_SLOTS.length - 1];
  return meetsLeadTime(day, lastSlot, now) ? day : addCalendarDays(day, 1);
}

/**
 * First day the self-serve pickers (chat, package builder) offer:
 * earliestBookableDay with PICKER_MARGIN_MINUTES of slack, so the day is still
 * bookable when the customer submits the form.
 */
export function earliestQuoteDay(now: Date = new Date()): string {
  return earliestBookableDay(new Date(now.getTime() + PICKER_MARGIN_MINUTES * 60 * 1000));
}

/**
 * The delivery window a self-serve quote dashboard opens with on `day`:
 *   1. `preferred`, when it leaves QUOTE_CHECKOUT_RUNWAY_HOURS of checkout time
 *   2. otherwise the first dashboard window that does
 *   3. otherwise the day's last window, if it still leaves
 *      QUOTE_MIN_RUNWAY_MINUTES of checkout time (a short runway — the
 *      dashboard's LeadTimeNotice shows when it closes)
 *
 * Returns null when no window that day leaves even that much (inside or within
 * minutes of the cutoff, in the past, or not a real date). Callers must refuse
 * those requests rather than create a dashboard nobody could pay for.
 */
export function pickQuoteWindow(
  day: string,
  preferred?: string | null,
  now: Date = new Date(),
): string | null {
  const withRunway = new Date(now.getTime() + QUOTE_CHECKOUT_RUNWAY_HOURS * HOUR_MS);
  if (preferred && parseWindowStart(preferred) && meetsLeadTime(day, preferred, withRunway)) {
    return preferred;
  }
  const roomy = DASHBOARD_TIME_SLOTS.find((slot) => meetsLeadTime(day, slot, withRunway));
  if (roomy) return roomy;
  const lastSlot = DASHBOARD_TIME_SLOTS[DASHBOARD_TIME_SLOTS.length - 1];
  const withMinimum = new Date(now.getTime() + QUOTE_MIN_RUNWAY_MINUTES * 60 * 1000);
  return meetsLeadTime(day, lastSlot, withMinimum) ? lastSlot : null;
}
