/**
 * Operator SMS alert when a free-form Wayne chat escalates — the pager to the
 * email's paper trail (operator ask 2026-09-08: "send a text — better for an
 * escalation"). Sends via the Twilio REST API directly (no SDK dep — one
 * form-encoded POST), because GHL is abandoned (operator, 2026-09-08) and the
 * codebase has no other SMS transport.
 *
 * Fire-and-forget, time-bounded, never throws. Inert (returns false) until
 * ALL of TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER /
 * OPS_ALERT_PHONE are set. `handoff` escalations stay email-only (the caller
 * gates); texting every promised follow-up would page Allan for routine quote
 * chats.
 */
import { REASON_LABEL, type EscalationReason } from './escalation-keywords';
import type { ParsedContact } from './parse-contact';

const SEND_TIMEOUT_MS = 3000;
const SMS_MAX = 320;

export interface ChatEscalationSmsInput {
  conversationId: string;
  reason: EscalationReason;
  lastUserMessage: string;
  contact: ParsedContact;
  leadUrl: string | null;
}

/**
 * Build the operator SMS body (≤320 chars). Pure — unit-tested directly.
 * Shape: label → quoted trigger snippet → customer contact → where to act.
 */
export function buildEscalationSmsBody(input: ChatEscalationSmsInput): string {
  const label = REASON_LABEL[input.reason];
  const snippet = input.lastUserMessage.replace(/\s+/g, ' ').trim().slice(0, 120);
  const contactLine =
    [input.contact.firstName, input.contact.phone, input.contact.email]
      .filter(Boolean)
      .join(' ')
      .slice(0, 60) || 'no contact yet';
  const link = input.leadUrl ?? 'partyondelivery.com/admin/leads';
  return `POD chat escalation — ${label}. "${snippet}" From: ${contactLine}. ${link}`.slice(
    0,
    SMS_MAX
  );
}

/**
 * Text Allan through Twilio. Returns true only when Twilio accepted the
 * message (2xx — the caller may stamp `escalationNotifiedAt` on it). Env is
 * read per-call, not at module load, so tests and serverless env changes
 * behave. Uses a plain From number; if a Messaging Service is ever needed,
 * swap `From` for `MessagingServiceSid`.
 */
export async function sendChatEscalationSms(input: ChatEscalationSmsInput): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.OPS_ALERT_PHONE;
  if (!sid || !token || !from || !to) return false;

  try {
    const res = await Promise.race([
      fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: from,
          Body: buildEscalationSmsBody(input),
        }),
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), SEND_TIMEOUT_MS)),
    ]);
    if (!res) {
      console.error('[wayne-capture] escalation SMS timed out');
      return false;
    }
    if (!res.ok) {
      // Never log the response verbatim-with-auth context; status + Twilio's
      // error body are enough to debug (no secrets in Twilio error JSON).
      console.error('[wayne-capture] escalation SMS failed:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[wayne-capture] escalation SMS error:', err);
    return false;
  }
}
