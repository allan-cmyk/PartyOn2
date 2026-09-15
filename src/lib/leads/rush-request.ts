/**
 * Rush requests — a self-serve quote asked for a delivery inside the 24-hour
 * minimum (ADR-0010).
 *
 * The website refuses those orders and shows the customer (737) 371-9700
 * (operator decision 2026-09-15: customers inside 24 hours get the refusal
 * message with the phone number, and there is no rush option online). The
 * chat and the package builder have already collected a name, email, and
 * phone by then, so the request isn't dropped: the lead is tagged `rush` on
 * /admin/leads and the operator gets an email, then decides whether to call
 * back and hand-build an ops invoice (the one escape hatch the ADR allows).
 *
 * Never throws — bookkeeping or email trouble must not change what the
 * customer sees. Server-only (Prisma + Resend).
 */
import { EmailType } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import { sendEmail } from '@/lib/email/resend-client';

/** Lead.tags value that marks a rush request on the Lead Flow board. */
export const RUSH_LEAD_TAG = 'rush';

const OPS_ALERT_EMAIL = process.env.OPS_ALERT_EMAIL || 'allan@partyondelivery.com';
const SEND_TIMEOUT_MS = 3000;
/** Another try for the same day inside this window re-stamps the lead but sends no second email. */
const REALERT_AFTER_MS = 6 * 60 * 60 * 1000;

/** What the alert needs — every field already Zod-validated by the calling route. */
export interface RushRequestInput {
  /** The Lead row the route just upserted, or null if that write failed. */
  leadId: string | null;
  /** Which quote surface refused the request (chat, package-builder, …). */
  source: string;
  /** Requested delivery day, YYYY-MM-DD. */
  deliveryDate: string;
  partyType: string;
  headcount: number;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
}

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

/** Minimal HTML escape for text and attribute contexts (& first). */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** "2026-09-17" → "Thu, Sep 17", read as a calendar day (no timezone drift). */
function prettyDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Tag the lead and stamp metadata.rushRequest. Returns true when the operator
 * was already emailed about this same day within REALERT_AFTER_MS.
 */
async function stampRushLead(
  leadId: string,
  input: RushRequestInput,
  now: Date,
): Promise<boolean> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { tags: true, metadata: true },
  });
  if (!lead) return false;

  const meta = asObject(lead.metadata);
  const prev = asObject(meta.rushRequest);
  const prevAlertedAt = typeof prev.alertedAt === 'string' ? Date.parse(prev.alertedAt) : NaN;
  const recentlyAlerted =
    prev.deliveryDate === input.deliveryDate &&
    Number.isFinite(prevAlertedAt) &&
    now.getTime() - prevAlertedAt < REALERT_AFTER_MS;

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      tags: lead.tags.includes(RUSH_LEAD_TAG) ? lead.tags : [...lead.tags, RUSH_LEAD_TAG],
      metadata: {
        ...meta,
        rushRequest: {
          deliveryDate: input.deliveryDate,
          source: input.source,
          requestedAt: now.toISOString(),
          // Keep the original alert time so the quiet window doesn't slide.
          ...(recentlyAlerted ? { alertedAt: prev.alertedAt } : {}),
        },
      } as never,
    },
  });
  return recentlyAlerted;
}

/** Record that the operator email went out, so a quick retry doesn't re-send. */
async function markAlerted(leadId: string, now: Date): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { metadata: true },
  });
  if (!lead) return;
  const meta = asObject(lead.metadata);
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      metadata: {
        ...meta,
        rushRequest: { ...asObject(meta.rushRequest), alertedAt: now.toISOString() },
      } as never,
    },
  });
}

/** Build the operator email. Every customer-supplied value is escaped. */
export function buildRushAlertEmail(input: RushRequestInput): { subject: string; html: string } {
  const name = [input.firstName, input.lastName].filter(Boolean).join(' ') || '(no name)';
  const when = prettyDay(input.deliveryDate);
  const rows: Array<[string, string]> = [
    ['Customer', name],
    ['Email', input.email],
    ['Phone', input.phone || '(not given)'],
    ['Requested delivery', when],
    ['Party', `${input.partyType}, ${input.headcount} people`],
    ['Came from', input.source],
  ];
  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#555">${escapeHtml(label)}</td><td style="padding:4px 0"><b>${escapeHtml(value)}</b></td></tr>`,
    )
    .join('');
  const leadLink = input.leadId
    ? `<p><a href="https://partyondelivery.com/admin/leads?lead=${encodeURIComponent(input.leadId)}">Open the lead on the board →</a></p>`
    : '<p style="color:#888">The lead row could not be saved — the contact details above are all there is.</p>';

  const html = `
    <h2>Rush request — delivery less than 24 hours away</h2>
    <p>A customer tried to order online for a delivery inside the 24-hour minimum. The website refused it and showed them (737) 371-9700. Call them back if you can take it (ops invoice), or let it go.</p>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${table}</table>
    ${leadLink}
    <p style="color:#888;font-size:12px">Automated ops alert. The lead is tagged "rush" on /admin/leads. Another try for the same day within 6 hours won't send a second email.</p>
  `;
  // Header values must stay on one line whatever the customer typed.
  const subject = `Rush request: ${name} wants delivery ${when}`.replace(/[\r\n]+/g, ' ');
  return { subject, html };
}

/** Email the operator. True only if the send completed inside the timeout. */
async function sendRushAlertEmail(input: RushRequestInput): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const { subject, html } = buildRushAlertEmail(input);
    const result = await Promise.race([
      sendEmail({
        to: OPS_ALERT_EMAIL,
        subject,
        type: EmailType.WELCOME, // reuse — internal ops alert, no dedicated type (matches the chat alerts)
        html,
        metadata: {
          kind: 'rush-request',
          source: input.source,
          deliveryDate: input.deliveryDate,
          ...(input.leadId ? { leadId: input.leadId } : {}),
        },
      }),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), SEND_TIMEOUT_MS);
      }),
    ]);
    return result !== null;
  } catch (err) {
    console.error('[rush-request] alert email failed:', err);
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Tag the lead `rush`, stamp what was asked for, and email the operator —
 * at most once per lead and day within REALERT_AFTER_MS. Never throws.
 */
export async function recordRushRequest(
  input: RushRequestInput,
  now: Date = new Date(),
): Promise<void> {
  let alreadyAlerted = false;
  if (input.leadId) {
    try {
      alreadyAlerted = await stampRushLead(input.leadId, input, now);
    } catch (err) {
      console.error('[rush-request] lead stamp failed:', err);
    }
  }
  if (alreadyAlerted) return;

  const sent = await sendRushAlertEmail(input);
  if (sent && input.leadId) {
    try {
      await markAlerted(input.leadId, now);
    } catch (err) {
      console.error('[rush-request] alert stamp failed:', err);
    }
  }
}
