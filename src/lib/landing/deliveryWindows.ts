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
 */

export type DeliveryWindow = { value: string; label: string };

function fmt(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour < 12 || hour === 24 ? 'am' : 'pm';
  const m = minute === 0 ? '' : `:${minute.toString().padStart(2, '0')}`;
  return `${h}${m}${period}`;
}

/**
 * Build the list of 1-hour windows in 30-min increments from 10am to 9pm.
 * Returns 23 windows: 10:00–11:00, 10:30–11:30, … 8:00pm–9:00pm.
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
    const label = `${fmt(sh, sm)}–${fmt(eh, em)}`;
    windows.push({ value: label, label });
  }
  return windows;
}

export function isSunday(isoDate: string): boolean {
  // Treat the ISO date as a calendar date in local time (no TZ surprises).
  if (!isoDate) return false;
  const d = new Date(`${isoDate}T12:00:00`);
  return d.getDay() === 0;
}

export const SUNDAY_CLOSED_NOTE =
  '⚠️ Sundays are closed by TX state law. For Sunday events, schedule Saturday-evening delivery instead.';

export const DEFAULT_DELIVERY_WINDOW: string = '12:00pm–1:00pm';
