/**
 * POST /api/v1/chat/submit
 *
 * Chatbot equivalent of /api/v1/event-quiz/submit. Same job — creates
 * a Lead and returns a redirect URL. Unlike the quiz it does NOT email:
 * the chat's second request (/api/v1/quote/start) owns that, or the two
 * would double-send. See the note at the send site below. Differs in:
 *
 *   1. Captures headcount + delivery date as first-class fields (the
 *      quiz didn't ask either)
 *   2. Returns a personalized drink-order recommendation in the JSON
 *      response so the chat panel can render it inline without a
 *      redirect — caller decides whether to navigate away or stay
 *   3. Holds the 24-hour minimum (ADR-0010): a day with no delivery window
 *      24+ hours out is refused with DELIVERY_TOO_SOON after the lead is
 *      saved, so the chat never recommends an order its next step refuses
 *
 * The Lead row is stamped with metadata.chatQuiz (sibling to
 * metadata.eventQuiz from the quiz flow) so Brian's Stuff → Leads can
 * tell them apart, but both feed the same lead funnel.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { upsertLead, recordEvent } from '@/lib/leads/leadCapture';
import { attributionSchema, compactAttribution } from '@/lib/leads/attribution-schema';
import { targetUrlFor } from '@/lib/eventQuiz/routing';
import { recommendForChat } from '@/lib/chat/recommendation';
import {
  DELIVERY_TOO_SOON_CODE,
  LEAD_TIME_MESSAGE,
  isCalendarDay,
  pickQuoteWindow,
  todayInAustin,
} from '@/lib/delivery/lead-time';
import {
  RUSH_LEAD_TAG,
  recordRushRequest,
  resolveRushRequest,
} from '@/lib/leads/rush-request';
import { mirrorLeadToSheet } from '@/lib/premier/pod-leads-sheet';
import { mirrorLeadToCrm } from '@/lib/leads/crm-mirror';
import { prisma } from '@/lib/database/client';
import {
  allowLeadCaptureEmail,
  allowLeadCaptureIp,
  LEAD_CAPTURE_THROTTLED,
} from '@/lib/security/lead-capture-throttle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional().nullable(),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().nullable(),
  partyType: z.enum([
    'just-deliver',
    'bachelor',
    'bachelorette',
    'corporate',
    'wedding',
    'boat',
    'house',
    'hotel',
  ]),
  headcount: z.number().int().min(1).max(500),
  /** ISO YYYY-MM-DD. A day with no delivery window 24+ hours out is
   *  refused after the lead is saved (ADR-0010). */
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isCalendarDay, 'Not a real calendar date'),
  /** First-touch UTM + ad click ids captured client-side. Optional so
   *  older cached bundles never 400. Without this, chat leads could
   *  never be tied to an ad campaign (the founder's exact question). */
  attribution: attributionSchema,
});

export async function POST(req: NextRequest) {
  // Volumetric guard first, before we even read the body: this route is public
  // and unauthenticated, so a flood should cost as little as possible.
  if (!(await allowLeadCaptureIp(req))) {
    return NextResponse.json(LEAD_CAPTURE_THROTTLED, { status: 429 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'invalid_body', detail: String(err) },
      { status: 400 },
    );
  }

  // The limit that actually matters: the abuse here is mailing one victim over
  // and over, which a rotating-IP attacker does without tripping the check
  // above. Shared across the sibling capture routes so cycling them buys nothing.
  if (!(await allowLeadCaptureEmail(body.email))) {
    return NextResponse.json(LEAD_CAPTURE_THROTTLED, { status: 429 });
  }

  const resumePath = targetUrlFor(body.partyType);

  // Lead upsert + status promote.
  let leadId: string | null = null;
  let hadRushTag = false;
  try {
    const lead = await upsertLead(
      {
        firstName: body.firstName,
        lastName: body.lastName ?? null,
        email: body.email,
        phone: body.phone ?? null,
      },
      {
        sourcePage: '/chat',
        sourceWidget: 'CONTACT_FORM',
        // UTM columns blank-fill + click ids merge into metadata.attribution.
        utmSource: body.attribution?.utmSource,
        utmMedium: body.attribution?.utmMedium,
        utmCampaign: body.attribution?.utmCampaign,
        utmContent: body.attribution?.utmContent,
        utmTerm: body.attribution?.utmTerm,
        gclid: body.attribution?.gclid,
        gbraid: body.attribution?.gbraid,
        wbraid: body.attribution?.wbraid,
        fbclid: body.attribution?.fbclid,
        msclkid: body.attribution?.msclkid,
      },
    );
    if (lead) {
      leadId = lead.id;
      hadRushTag = Array.isArray(lead.tags) && lead.tags.includes(RUSH_LEAD_TAG);
      const prevMeta = (lead.metadata as Record<string, unknown> | null) ?? {};
      const prevAttribution =
        prevMeta.attribution &&
        typeof prevMeta.attribution === 'object' &&
        !Array.isArray(prevMeta.attribution)
          ? (prevMeta.attribution as Record<string, unknown>)
          : {};
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'SUBMITTED',
          // Last-touch stamp: a fresh submit owns the source columns
          // even when the email matched an older lead row.
          sourcePage: '/chat',
          sourceWidget: 'CONTACT_FORM',
          metadata: {
            ...prevMeta,
            ...(body.attribution
              ? {
                  attribution: {
                    ...prevAttribution,
                    ...compactAttribution(body.attribution),
                  },
                }
              : {}),
            chatQuiz: {
              partyType: body.partyType,
              headcount: body.headcount,
              deliveryDate: body.deliveryDate,
              submittedAt: new Date().toISOString(),
              resumePath,
            },
          } as never,
        },
      });
      await recordEvent({
        type: 'FORM_SUBMIT',
        trustedSubmit: true, // server-validated form (zod) — may reopen closed board cards
        leadId: lead.id,
        page: '/chat',
        widget: 'CONTACT_FORM',
        fieldName: 'chat-submit',
        metadata: {
          flow: 'chat',
          partyType: body.partyType,
          headcount: body.headcount,
          deliveryDate: body.deliveryDate,
        },
      });
    }
  } catch (err) {
    console.error('[chat/submit] lead upsert failed', err);
  }

  // NO welcome email here, deliberately. The chat is a TWO-request flow: this
  // route (contact step), then POST /api/v1/quote/start when they click through
  // to their order. Both used to send the same eventQuizWelcomeEmail with the
  // same subject, so anyone who finished the chat got two identical emails
  // seconds apart — 4 real customers did, the closest pair 22s (audit
  // 2026-08-03). Package Builder and Event Quiz each hit only one endpoint,
  // which is why the bug was chat-only.
  //
  // quote/start keeps its send because its link goes to the customer's actual
  // dashboard, where this one only pointed back at the landing page. Someone
  // who leaves contact details and never clicks through now gets no instant
  // mail — they land on /admin/leads as an unanswered lead instead, which is
  // what the work queue is for. If that trade stops being right, enqueue a
  // flag-gated journey here rather than restoring a second instant send.

  // 24-hour minimum (ADR-0010): nothing bookable on that day means the chat
  // can't become an order. The lead is already saved above; flag a rush to
  // the operator (today or later — a past day is a stale page) and refuse,
  // rather than recommend an order the next step would turn away.
  const tooSoon = pickQuoteWindow(body.deliveryDate) === null;
  if (tooSoon && body.deliveryDate >= todayInAustin()) {
    await recordRushRequest({
      leadId,
      source: 'chat',
      deliveryDate: body.deliveryDate,
      partyType: body.partyType,
      headcount: body.headcount,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
    });
  }

  // A bookable day after an earlier rush refusal: clear the board's rush flag.
  if (!tooSoon && leadId && hadRushTag) {
    await resolveRushRequest(leadId, { email: body.email, phone: body.phone });
  }

  // Build the recommendation — what should we suggest they order?
  let recommendation = null;
  if (!tooSoon) {
    try {
      recommendation = await recommendForChat({
        partyType: body.partyType,
        headcount: body.headcount,
      });
    } catch (err) {
      console.error('[chat/submit] recommendation failed', err);
    }
  }

  // Mirror to the POD Leads Google Sheet + CoreLinq CRM. AWAITED — Vercel
  // kills un-awaited promises when the response returns. Never throw.
  await Promise.allSettled([
    mirrorLeadToSheet({
      source: 'party-chat',
      firstName: body.firstName,
      lastName: body.lastName ?? '',
      email: body.email,
      phone: body.phone ?? '',
      arrivalDate: body.deliveryDate,
      partyType: body.partyType,
      headcount: body.headcount,
      ...(tooSoon ? { notes: 'Refused: inside the 24-hour minimum' } : {}),
      leadUrl: leadId ? `https://partyondelivery.com/admin/leads?lead=${leadId}` : '',
    }),
    mirrorLeadToCrm({ leadId }, 'party-chat'),
  ]);

  if (tooSoon) {
    return NextResponse.json(
      { ok: false, code: DELIVERY_TOO_SOON_CODE, error: LEAD_TIME_MESSAGE },
      { status: 422 },
    );
  }

  return NextResponse.json({
    ok: true,
    leadId,
    redirectTo: resumePath,
    recommendation,
  });
}
