/**
 * Premiere Credit SMS — posts the `premiere.credit.issued` event to the
 * CoreLinq CRM via the shared postToCoreLinq helper; the CRM texts the code +
 * expiry from (737) 371-9700. Lives in its own file because
 * src/lib/webhooks/ghl.ts is already near the 500-line limit. (File and
 * type names are legacy from GoHighLevel, which was cancelled 2026-09-22.)
 *
 * The GHL leg below is dead: it no-ops when GHL_PREMIERE_CREDIT_WEBHOOK_URL
 * is unset, which it should stay. Fire-and-forget: logs errors, never throws.
 */

import { postToCoreLinq } from './ghl';

const GHL_PREMIERE_CREDIT_WEBHOOK_URL = process.env.GHL_PREMIERE_CREDIT_WEBHOOK_URL;

export interface GhlPremiereCreditPayload {
  event: 'premiere.credit.issued';
  /** GHL-standard contact fields (used by the Upsert Contact action). */
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  /** Template variables for the SMS body. */
  credit_code: string;
  credit_amount: string; // e.g. "336.21"
  expires_on: string;    // human-formatted, e.g. "September 20, 2026"
  redeem_url: string;
  /** Tag the receiving workflow applies to the contact. */
  tags: ['premiere-credit'];
}

/**
 * POST a Premiere credit to the CoreLinq CRM, which texts the customer the
 * code. The legacy GHL leg only fires if its URL is set (it should not be).
 */
export async function notifyPremiereCreditIssued(
  payload: GhlPremiereCreditPayload,
): Promise<void> {
  await postToCoreLinq(payload);
  if (!GHL_PREMIERE_CREDIT_WEBHOOK_URL) return;

  try {
    const res = await fetch(GHL_PREMIERE_CREDIT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[GHL Premiere Credit Webhook] Failed:', res.status, await res.text());
    } else {
      console.log('[GHL Premiere Credit Webhook] Sent:', payload.credit_code);
    }
  } catch (err) {
    console.error('[GHL Premiere Credit Webhook] Error:', err);
  }
}
