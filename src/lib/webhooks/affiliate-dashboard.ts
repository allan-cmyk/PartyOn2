/**
 * Affiliate Dashboard Webhook — Validation + Helpers
 *
 * Used by the POST /api/webhooks/create-dashboard endpoint to validate
 * inbound payloads from affiliate partners and build dashboard inputs.
 */

import { z } from 'zod';

// ──────────────────────────────────────────────
// Zod schema for inbound webhook payload
// ──────────────────────────────────────────────

const rawWebhookSchema = z.object({
  customer_name: z.string().min(1, 'customer_name is required'),
  customer_phone: z.string().min(1, 'customer_phone is required'),
  customer_email: z.string().email('customer_email must be a valid email'),
  // Accept either cruise_date or arrival (Xola sends "arrival")
  cruise_date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'must be YYYY-MM-DD').optional(),
  arrival: z.string().optional(),
  // cruise_start_time is optional -- defaults to "2:00 PM" delivery window if not provided
  cruise_start_time: z.string().optional(),
  items_name: z.string().min(1, 'items_name is required'),
  // guest_count can arrive as number or string from Zapier
  guest_count: z.union([
    z.number().int().positive(),
    z.string().transform((s) => parseInt(s, 10)),
  ]).pipe(z.number().int().positive('guest_count must be a positive integer')),
  // Xola booking ID for cross-referencing
  booking_id: z.string().optional(),
});

export const affiliateWebhookSchema = rawWebhookSchema.transform((data) => {
  // Normalize arrival -> cruise_date
  const cruiseDate = data.cruise_date || data.arrival;
  if (!cruiseDate) {
    throw new Error('Either cruise_date or arrival is required');
  }
  // Extract just the date portion (Xola may send full datetime)
  const dateOnly = cruiseDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    throw new Error('cruise_date/arrival must start with YYYY-MM-DD');
  }
  return {
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email,
    cruise_date: dateOnly,
    cruise_start_time: data.cruise_start_time || null,
    items_name: data.items_name,
    guest_count: data.guest_count,
    booking_id: data.booking_id || null,
  };
});

export type AffiliateWebhookPayload = z.output<typeof affiliateWebhookSchema>;

// ──────────────────────────────────────────────
// Cruise type normalization
// ──────────────────────────────────────────────

export type CruiseType = 'private' | 'disco';

export function normalizeCruiseType(itemsName: string): CruiseType {
  return itemsName.toLowerCase().includes('private') ? 'private' : 'disco';
}

// ──────────────────────────────────────────────
// Name builders
// ──────────────────────────────────────────────

export function buildCruiseTabName(cruiseType: CruiseType, customerName: string): string {
  if (cruiseType === 'private') {
    return `${customerName} Private Cruise Drink Delivery!`;
  }
  return 'ATX Disco Cruise Drink Delivery!';
}

export const LODGING_TAB_NAME = 'Stock-the-House/BnB/Hotel';

export function buildDashboardTitle(customerName: string): string {
  return `${customerName} Drink Delivery!`;
}

// ──────────────────────────────────────────────
// Time formatting
// ──────────────────────────────────────────────

/** Default delivery window when no cruise start time is provided */
const DEFAULT_DELIVERY_WINDOW = '12:00 PM - 2:00 PM';

/**
 * Compute a 2h-to-1h delivery window before cruise start.
 * E.g. cruise at 14:00 -> "12:00 PM - 1:00 PM"
 * Falls back to default window if no start time given.
 */
export function formatDeliveryWindow(cruiseStartTime: string | null): string {
  if (!cruiseStartTime) return DEFAULT_DELIVERY_WINDOW;
  const [h, m] = cruiseStartTime.split(':').map(Number);
  const totalMinutes = h * 60 + m;

  const windowStart = totalMinutes - 120; // 2 hours before
  const windowEnd = totalMinutes - 60;    // 1 hour before

  return `${formatTime12h(windowStart)} - ${formatTime12h(windowEnd)}`;
}

function formatTime12h(totalMinutes: number): string {
  // Handle underflow (e.g. cruise at 01:00)
  const mins = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const display = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return minutes === 0 ? `${display}:00 ${period}` : `${display}:${String(minutes).padStart(2, '0')} ${period}`;
}

// ──────────────────────────────────────────────
// Outbound callback
// ──────────────────────────────────────────────

export interface DashboardCallbackPayload {
  pod_dashboard_url: string;
  customer_email: string;
  booking_id: string | null;
}

/**
 * POST dashboard data to the affiliate's callback URL.
 * Fire-and-forget with one retry after 30s on failure.
 * Includes callbackApiKey as "apikey" header if provided.
 */
export async function sendDashboardCallback(
  callbackUrl: string,
  callbackApiKey: string | null,
  payload: DashboardCallbackPayload
): Promise<'SENT' | 'FAILED' | 'RETRIED'> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (callbackApiKey) {
    headers['apikey'] = callbackApiKey;
  }

  const doPost = async (): Promise<boolean> => {
    try {
      const res = await fetch(callbackUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error('[Affiliate Callback] Failed:', res.status, await res.text());
        return false;
      }
      console.log('[Affiliate Callback] Sent to', callbackUrl);
      return true;
    } catch (err) {
      console.error('[Affiliate Callback] Error:', err);
      return false;
    }
  };

  if (await doPost()) return 'SENT';

  // Retry once after 30s
  await new Promise((resolve) => setTimeout(resolve, 30_000));
  if (await doPost()) return 'RETRIED';

  return 'FAILED';
}
