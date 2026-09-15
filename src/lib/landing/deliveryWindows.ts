/**
 * Delivery windows used by the Quick-Buy + Package Builder modals.
 *
 * Spec:
 *   - 1-hour windows starting every 30 minutes
 *   - First window starts at 10:00 AM
 *   - Last window ends at 9:00 PM (so last start = 8:00 PM)
 *   - Sunday is closed (Texas state law for our packaged-store license).
 *     The UI surfaces a note recommending Saturday-evening delivery for
 *     Sunday events.
 *   - Only windows starting 24+ hours out can be booked (ADR-0010) — see
 *     bookableWindows().
 *
 * A window's `value` (what gets stored on the order) uses the storefront and
 * dashboard format, "4:00 PM - 5:00 PM", which the lead-time gate, the Google
 * Calendar sync and the ops views all parse; `label` keeps the short "4pm–5pm"
 * the modals show.
 */

import { RUSH_NOTE, meetsLeadTime } from '@/lib/delivery/lead-time';

export type DeliveryWindow = { value: string; label: string };

/** Label time: "4pm", "10:30am". */
function shortTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour < 12 || hour === 24 ? 'am' : 'pm';
  const m = minute === 0 ? '' : `:${minute.toString().padStart(2, '0')}`;
  return `${h}${m}${period}`;
}

/** Stored time: "4:00 PM", "10:30 AM". */
function clockTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour < 12 || hour === 24 ? 'AM' : 'PM';
  return `${h}:${minute.toString().padStart(2, '0')} ${period}`;
}

/**
 * Build the list of 1-hour windows in 30-min increments from 10am to 9pm.
 * Returns 21 windows: "10:00 AM - 11:00 AM" (label "10am–11am") through
 * "8:00 PM - 9:00 PM".
 */
export function getDeliveryWindows(): DeliveryWindow[] {
  const windows: DeliveryWindow[] = [];
  // Walk every 30 minutes from 10:00 (600 min) to 20:00 (1200 min) start time.
  for (let startMin = 10 * 60; startMin <= 20 * 60; startMin += 30) {
    const endMin = startMin + 60;
    const sh = Math.floor(startMin / 60);
    const sm = startMin % 60;
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;
    windows.push({
      value: `${clockTime(sh, sm)} - ${clockTime(eh, em)}`,
      label: `${shortTime(sh, sm)}–${shortTime(eh, em)}`,
    });
  }
  return windows;
}

/**
 * The windows still bookable on `day` (YYYY-MM-DD): those starting at least
 * 24 hours after `now`, checked with the same meetsLeadTime the server gates
 * on. With no day picked yet every window is listed; a past day, or one
 * entirely inside the cutoff, has none.
 */
export function bookableWindows(day: string, now: Date = new Date()): DeliveryWindow[] {
  const windows = getDeliveryWindows();
  if (!day) return windows;
  return windows.filter((w) => meetsLeadTime(day, w.value, now));
}

/** The short label for a stored window value; any other string comes back unchanged. */
export function windowLabel(value: string): string {
  return getDeliveryWindows().find((w) => w.value === value)?.label ?? value;
}

export function isSunday(isoDate: string): boolean {
  // Treat the ISO date as a calendar date in local time (no TZ surprises).
  if (!isoDate) return false;
  const d = new Date(`${isoDate}T12:00:00`);
  return d.getDay() === 0;
}

export const SUNDAY_CLOSED_NOTE =
  '⚠️ Sundays are closed by TX state law. For Sunday events, schedule Saturday-evening delivery instead.';

/** Shown when the picked day has no bookable window left (ADR-0010). */
export const DAY_CLOSED_NOTE = `That day has no delivery windows left. Please pick a later date. ${RUSH_NOTE}`;

/** Preselected window: noon to 1 PM, one of getDeliveryWindows()' own values. */
export const DEFAULT_DELIVERY_WINDOW: string = '12:00 PM - 1:00 PM';
