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
 * Email volume is bounded three ways: the calling routes' per-IP and per-email
 * throttles, one email per lead per REALERT_AFTER_MS, and a global hourly cap
 * (ALERT_EMAILS_PER_HOUR). Past the cap the lead is still tagged — only the
 * email is skipped — so a scripted flood of fresh identities can't bury the
 * operator's inbox or the Resend account customer emails depend on.
 *
 * Never throws — bookkeeping or email trouble must not change what the
 * customer sees. Server-only (Prisma + Resend).
 */
import { EmailType } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import { sendEmail } from '@/lib/email/resend-client';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { normalizeEmail } from './email-validation';
import { sanitizeName } from './leadCapture';
import { phoneLast10 } from './phone';

/** Lead.tags value that marks a rush request on the Lead Flow board. */
export const RUSH_LEAD_TAG = 'rush';

const OPS_ALERT_EMAIL = process.env.OPS_ALERT_EMAIL || 'allan@partyondelivery.com';
const SEND_TIMEOUT_MS = 3000;
/** A lead gets at most one rush email per this window; later tries re-stamp the lead only. */
const REALERT_AFTER_MS = 6 * 60 * 60 * 1000;
/** Rush emails allowed per hour across all leads, whatever identities the requests use. */
const ALERT_EMAILS_PER_HOUR = 20;

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

/** Contact details already stored on the matched Lead row. */
export interface OnFileContact {
  email: string | null;
  phone: string | null;
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
 * True when the submitted email or phone differs from what the matched Lead
 * already has. upsertLead matches on email OR phone, so a request can pair a
 * real customer's number with someone else's details.
 */
function contactMismatch(input: RushRequestInput, onFile?: OnFileContact | null): boolean {
  if (!onFile) return false;
  const emailOnFile = normalizeEmail(onFile.email);
  const emailSent = normalizeEmail(input.email);
  const phoneOnFile = phoneLast10(onFile.phone);
  const phoneSent = phoneLast10(input.phone);
  const emailDiffers = !!emailOnFile && !!emailSent && emailOnFile !== emailSent;
  const phoneDiffers = !!phoneOnFile && !!phoneSent && phoneOnFile !== phoneSent;
  return emailDiffers || phoneDiffers;
}

/**
 * Tag the lead and stamp metadata.rushRequest. Reports whether the operator
 * was already emailed about this lead within REALERT_AFTER_MS, plus the
 * contact details on file for the alert's mismatch check.
 */
async function stampRushLead(
  leadId: string,
  input: RushRequestInput,
  now: Date,
): Promise<{ recentlyAlerted: boolean; onFile: OnFileContact } | null> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { tags: true, metadata: true, email: true, phone: true },
  });
  if (!lead) return null;

  const meta = asObject(lead.metadata);
  const prev = asObject(meta.rushRequest);
  const prevAlertedAt = typeof prev.alertedAt === 'string' ? Date.parse(prev.alertedAt) : NaN;
  const recentlyAlerted =
    Number.isFinite(prevAlertedAt) && now.getTime() - prevAlertedAt < REALERT_AFTER_MS;

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
          // Who asked (normalized): only the same contact can later clear the flag.
          requestedBy: { email: normalizeEmail(input.email), phone: phoneLast10(input.phone) },
          // Keep the original alert time so the quiet window doesn't slide.
          ...(recentlyAlerted ? { alertedAt: prev.alertedAt } : {}),
        },
      } as never,
    },
  });
  return { recentlyAlerted, onFile: { email: lead.email, phone: lead.phone } };
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

/**
 * Build the operator email. Names go through sanitizeName (invisible and
 * control characters) and every customer-supplied value is HTML-escaped.
 */
export function buildRushAlertEmail(
  input: RushRequestInput,
  onFile?: OnFileContact | null,
): { subject: string; html: string } {
  const name =
    [sanitizeName(input.firstName), sanitizeName(input.lastName)].filter(Boolean).join(' ') ||
    '(no name)';
  const when = prettyDay(input.deliveryDate);
  const mismatch = contactMismatch(input, onFile);
  const rows: Array<[string, string]> = [
    ['Customer', name],
    ['Email', input.email],
    ['Phone', input.phone || '(not given)'],
    ['Requested delivery', when],
    ['Party', `${input.partyType}, ${input.headcount} people`],
    ['Came from', input.source],
  ];
  if (mismatch) {
    rows.push(['On file for this lead', [onFile?.email, onFile?.phone].filter(Boolean).join(' · ')]);
  }
  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#555">${escapeHtml(label)}</td><td style="padding:4px 0"><b>${escapeHtml(value)}</b></td></tr>`,
    )
    .join('');
  const warning = mismatch
    ? '<p style="color:#b91c1c"><b>Check before calling:</b> the email or phone submitted does not match what this lead already has on file, so these contact details may not belong to whoever made the request.</p>'
    : '';
  const leadLink = input.leadId
    ? `<p><a href="https://partyondelivery.com/admin/leads?lead=${encodeURIComponent(input.leadId)}">Open the lead on the board →</a></p>`
    : '<p style="color:#888">The lead row could not be saved — the contact details above are all there is.</p>';

  const html = `
    <h2>Rush request — delivery less than 24 hours away</h2>
    <p>A customer tried to order online for a delivery inside the 24-hour minimum. The website refused it and showed them (737) 371-9700. Call them back if you can take it (ops invoice), or let it go.</p>
    ${warning}
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${table}</table>
    ${leadLink}
    <p style="color:#888;font-size:12px">Automated ops alert. The lead is tagged "rush" on /admin/leads. More tries from the same lead within 6 hours won't send another email.</p>
  `;
  // Header values must stay on one line whatever the customer typed.
  const subject = `Rush request: ${name} wants delivery ${when}`.replace(/[\r\n]+/g, ' ');
  return { subject, html };
}

/** Global hourly cap on rush emails. A limiter error allows the send, like the route throttles. */
async function withinAlertCap(): Promise<boolean> {
  try {
    return await checkRateLimit('rush-alert-email', 'global', ALERT_EMAILS_PER_HOUR, 60 * 60);
  } catch (err) {
    console.error('[rush-request] alert cap check failed:', err);
    return true;
  }
}

/** Email the operator. True only if the send completed inside the timeout. */
async function sendRushAlertEmail(
  input: RushRequestInput,
  onFile?: OnFileContact | null,
): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const { subject, html } = buildRushAlertEmail(input, onFile);
    const result = await Promise.race([
      sendEmail({
        to: OPS_ALERT_EMAIL,
        subject,
        type: EmailType.WELCOME, // reuse — internal ops alert, no dedicated type (matches the other ops alerts)
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
 * Tag the lead `rush`, stamp what was asked for, and email the operator — at
 * most once per lead within REALERT_AFTER_MS and within the global hourly cap.
 * Never throws.
 */
export async function recordRushRequest(
  input: RushRequestInput,
  now: Date = new Date(),
): Promise<void> {
  let stamp: Awaited<ReturnType<typeof stampRushLead>> = null;
  if (input.leadId) {
    try {
      stamp = await stampRushLead(input.leadId, input, now);
    } catch (err) {
      console.error('[rush-request] lead stamp failed:', err);
    }
  }
  if (stamp?.recentlyAlerted) return;

  if (!(await withinAlertCap())) {
    console.warn('[rush-request] alert email skipped: hourly cap reached (lead still tagged)');
    return;
  }

  const sent = await sendRushAlertEmail(input, stamp?.onFile);
  if (sent && input.leadId) {
    try {
      await markAlerted(input.leadId, now);
    } catch (err) {
      console.error('[rush-request] alert stamp failed:', err);
    }
  }
}

/**
 * Clear the rush flag once the same customer books a day that clears the
 * 24-hour minimum — the rush need is gone, so the board badge shouldn't linger.
 *
 * Only the contact that made the rush request can clear it: upsertLead matches
 * on email OR phone, so a request pairing this lead's phone with someone else's
 * email must not wipe a real customer's flag. The old alert time is dropped so
 * a genuinely new rush from this lead still emails. No-op when the lead isn't
 * tagged. Never throws.
 */
export async function resolveRushRequest(
  leadId: string,
  contact: { email: string; phone?: string | null },
  now: Date = new Date(),
): Promise<void> {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { tags: true, metadata: true },
    });
    if (!lead || !lead.tags.includes(RUSH_LEAD_TAG)) return;
    const meta = asObject(lead.metadata);
    const rush = asObject(meta.rushRequest);
    const requestedBy = asObject(rush.requestedBy);
    const sameEmail =
      typeof requestedBy.email !== 'string' || requestedBy.email === normalizeEmail(contact.email);
    const samePhone =
      typeof requestedBy.phone !== 'string' || requestedBy.phone === phoneLast10(contact.phone);
    if (!sameEmail || !samePhone) return;

    const resolved: JsonObject = { ...rush, resolvedAt: now.toISOString() };
    delete resolved.alertedAt;
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        tags: lead.tags.filter((tag) => tag !== RUSH_LEAD_TAG),
        metadata: { ...meta, rushRequest: resolved } as never,
      },
    });
  } catch (err) {
    console.error('[rush-request] resolve failed:', err);
  }
}
