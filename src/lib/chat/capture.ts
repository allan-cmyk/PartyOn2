/**
 * Wayne chat capture orchestration.
 *
 * `persistChatTurn` runs after each `/api/chat` reply (via `after()`, so it never
 * blocks the response). It (1) upserts the ChatConversation transcript, (2) emails
 * Allan once when the conversation escalates — a customer keyword
 * (refund/complaint/legal/safety/order_issue) OR Wayne's own reply promising a
 * human follow-up (`handoff`, so "I'm getting Allan" is never a fabrication) —
 * (3) creates a Lead — reusing the exact machinery the quiz uses (`upsertLead`,
 * `recordEvent`, `mirrorLeadToCrm`, which auto-flows the lead to the CRM + Lead
 * Flow board) — when the customer gives contact info, and (4) emails Allan when
 * that lead capture happens without an escalation email on the same turn
 * (operator ask 2026-09-08: chats that need addressing must reach him — he does
 * not watch the text line or the board day-to-day).
 *
 * NEVER throws: a capture hiccup must not affect the customer's chat.
 */
import { LeadEventType } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import { upsertLead, findLead, recordEvent } from '@/lib/leads/leadCapture';
import { enrollLeadIfEligible } from '@/lib/leads/pipeline';
import { mirrorLeadToCrm, leadBoardUrl } from '@/lib/leads/crm-mirror';
import type { AttributionInput } from '@/lib/leads/attribution-schema';
import { detectEscalation, detectAssistantHandoff } from './escalation-keywords';
import { parseContact, hasContact } from './parse-contact';
import { sendChatEscalationEmail, sendChatLeadCapturedEmail } from './escalation-alert';
import { sendChatEscalationSms } from './escalation-sms';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatTurnInput {
  conversationId: string;
  /** Full transcript so far, including the assistant reply just produced. */
  messages: ChatMessage[];
  firstPage?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  /** Full first-touch snapshot (utm ×5 + click ids + landing/referrer) —
      newer widgets send it; the 3 legacy utm fields above stay for old
      cached bundles. */
  attribution?: AttributionInput | null;
}

export async function persistChatTurn(input: ChatTurnInput): Promise<void> {
  try {
    const { conversationId, messages } = input;
    if (!conversationId || !Array.isArray(messages) || messages.length === 0) return;

    const userMessages = messages.filter((m) => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content ?? '';
    const lastAssistantMessage =
      [...messages].reverse().find((m) => m.role === 'assistant')?.content ?? '';
    // Customer-side keywords first (the serious labels); if none, Wayne's own
    // reply promising a human ("I'm pinging Allan right now") escalates as
    // `handoff` — whenever Wayne says a human is coming, that must be true.
    const reason =
      detectEscalation(lastUserMessage) ?? detectAssistantHandoff(lastAssistantMessage);
    const contact = parseContact(userMessages.map((m) => m.content).join('\n'));

    // 1. Upsert the transcript (create on first turn, replace messages each turn).
    const convo = await prisma.chatConversation.upsert({
      where: { conversationId },
      create: {
        conversationId,
        messages: messages as unknown as object,
        firstPage: input.firstPage ?? null,
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        escalated: Boolean(reason),
        escalationReason: reason,
      },
      update: {
        messages: messages as unknown as object,
        ...(reason ? { escalated: true, escalationReason: reason } : {}),
      },
    });

    // 2. Capture a Lead when contact is present and not already linked.
    let leadId: string | null = convo.leadId;
    if (hasContact(contact) && !leadId) {
      // A chat-parsed name may only populate a lead THIS conversation creates.
      // upsertLead fills blank fields on a matched row, so anyone who knows a
      // customer's phone or email could otherwise plant a name on that customer's
      // record from unauthenticated chat text ("5125550001--Evil Hacker--…") and
      // it would reach the CRM's "Hi {firstName}" SMS (security review
      // 2026-09-06). Linking by email/phone is unchanged.
      const existing = await findLead({ email: contact.email, phone: contact.phone });
      const lead = await upsertLead(
        {
          email: contact.email,
          phone: contact.phone,
          ...(existing ? {} : { firstName: contact.firstName, lastName: contact.lastName }),
        },
        {
          sourcePage: input.firstPage ?? '/chat',
          sourceWidget: 'WAYNE_CHAT',
          utmSource: input.attribution?.utmSource ?? input.utmSource ?? null,
          utmMedium: input.attribution?.utmMedium ?? input.utmMedium ?? null,
          utmCampaign: input.attribution?.utmCampaign ?? input.utmCampaign ?? null,
          utmContent: input.attribution?.utmContent ?? null,
          utmTerm: input.attribution?.utmTerm ?? null,
          gclid: input.attribution?.gclid ?? null,
          gbraid: input.attribution?.gbraid ?? null,
          wbraid: input.attribution?.wbraid ?? null,
          fbclid: input.attribution?.fbclid ?? null,
          msclkid: input.attribution?.msclkid ?? null,
        }
      );
      if (lead) {
        leadId = lead.id;
        await recordEvent({
          type: LeadEventType.FORM_SUBMIT,
          leadId: lead.id,
          page: input.firstPage ?? '/chat',
          widget: 'WAYNE_CHAT',
          // NOT trustedSubmit: unlike the concierge/quote/contact forms, a chat
          // "contact" is regex-parsed from unauthenticated freeform text on the
          // public /api/chat endpoint. Marking it trusted would let an anonymous
          // caller reopen a victim's WON/LOST board card just by typing their
          // email into the chat (security review 2026-07-22, HIGH-1). The lead is
          // still captured + mirrored; it just can't force a stage reopen.
          trustedSubmit: false,
          metadata: { conversationId, via: 'wayne-chat' },
        });
        // Put the lead on the Lead Flow board as NEW so an operator sees it and
        // follows up. `enrollLeadIfEligible` only enrolls null-stage leads, so —
        // unlike the trusted `handleSubmitSignal` — it can NEVER reopen a WON/LOST
        // card from unauthenticated chat text (that's the HIGH we're avoiding).
        // allowPartial: a chat contact is a PARTIAL lead, but a genuine inquiry
        // (Wayne asked for + got their number) an operator should work.
        await enrollLeadIfEligible(lead.id, { allowPartial: true });
        await prisma.chatConversation.update({
          where: { id: convo.id },
          data: { leadId: lead.id, contactCapturedAt: new Date() },
        });
        // Fire-and-forget CRM mirror (never throws; inert until CORELINQ_INGEST_URL set).
        await mirrorLeadToCrm({ leadId: lead.id }, 'wayne-chat');

        // Notify Allan the moment a chat leaves contact info — unless the
        // escalation email below is about to go out this same turn (it already
        // carries the contact + board link; two emails would be noise).
        const escalationEmailDue = Boolean(reason && !convo.escalationNotifiedAt);
        if (!escalationEmailDue) {
          await sendChatLeadCapturedEmail({
            conversationId,
            transcript: messages,
            leadUrl: leadBoardUrl(lead.id),
            contact,
            firstPage: input.firstPage ?? null,
          });
        }
      }
    }

    // 3. Escalation alert — at most once per conversation. SMS is the pager
    // (operator ask 2026-09-08), email the durable record with the transcript.
    // `handoff` (Wayne merely promised a follow-up) stays email-only so routine
    // quote chats don't page Allan's cell. Stamp when EITHER channel got
    // through — retrying the other on later turns would double-page; the one
    // that failed is in the logs.
    if (reason && !convo.escalationNotifiedAt) {
      const leadUrl = leadId ? leadBoardUrl(leadId) : null;
      const emailSent = await sendChatEscalationEmail({
        conversationId,
        reason,
        lastUserMessage,
        transcript: messages,
        leadUrl,
        contact,
      });
      const smsSent =
        reason !== 'handoff'
          ? await sendChatEscalationSms({
              conversationId,
              reason,
              lastUserMessage,
              contact,
              leadUrl,
            })
          : false;
      if (emailSent || smsSent) {
        await prisma.chatConversation.update({
          where: { id: convo.id },
          data: { escalationNotifiedAt: new Date() },
        });
      }
    }
  } catch (err) {
    console.warn('[wayne-capture] persistChatTurn failed:', err);
  }
}
