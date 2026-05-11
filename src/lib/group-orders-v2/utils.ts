/**
 * Group Orders V2 - Utility Functions
 * Share code generation, deadline computation, helpers
 */

import crypto from 'crypto';

/**
 * Generate a unique 6-character alphanumeric share code
 * Uses uppercase letters + digits, excluding ambiguous chars (0/O, 1/I/L)
 */
export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Compute order deadline = deliveryDate - 4 hours
 */
export function computeOrderDeadline(deliveryDate: Date): Date {
  const deadline = new Date(deliveryDate);
  deadline.setHours(deadline.getHours() - 4);
  return deadline;
}

/**
 * Check if a date falls on a Sunday (no Sunday deliveries)
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

/**
 * Default expiration window.
 *
 * Without a delivery date, falls back to 30 days from now. With a delivery date
 * (or list of dates — e.g. multi-tab orders), extends to `bufferDays` past the
 * latest delivery, with a floor of 30 days from now. This prevents long-lead
 * bookings (e.g. boat cruises booked >30 days out) from auto-closing before
 * the actual delivery date.
 */
export function defaultExpiresAt(deliveryDate?: Date | Date[], bufferDays = 7): Date {
  const floor = new Date();
  floor.setDate(floor.getDate() + 30);

  if (!deliveryDate) return floor;

  const dates = Array.isArray(deliveryDate) ? deliveryDate : [deliveryDate];
  if (dates.length === 0) return floor;

  const latest = dates.reduce((max, d) => (d > max ? d : max));
  const fromDelivery = new Date(latest);
  fromDelivery.setDate(fromDelivery.getDate() + bufferDays);

  return fromDelivery > floor ? fromDelivery : floor;
}

/**
 * Find earliest deadline across tabs
 */
export function findEarliestDeadline(deadlines: Date[]): Date | null {
  if (deadlines.length === 0) return null;
  return deadlines.reduce((min, d) => (d < min ? d : min));
}

/**
 * Find earliest delivery date across tabs
 */
export function findEarliestDelivery(dates: Date[]): Date | null {
  if (dates.length === 0) return null;
  return dates.reduce((min, d) => (d < min ? d : min));
}

/**
 * Determine countdown target: earliest deadline if in the future,
 * otherwise earliest delivery date
 */
export function computeCountdownTarget(
  earliestDeadline: Date | null,
  earliestDelivery: Date | null
): Date | null {
  const now = new Date();
  if (earliestDeadline && earliestDeadline > now) {
    return earliestDeadline;
  }
  if (earliestDelivery && earliestDelivery > now) {
    return earliestDelivery;
  }
  return null;
}
