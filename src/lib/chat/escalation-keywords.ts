/**
 * Escalation keyword detection for the free-form Wayne chat (`/api/chat`).
 *
 * The four classes in `KEYWORDS` MIRROR the playbook's escalation keyword
 * classes (`content/playbook/escalation.md`) and the CRM fork's
 * `apps/web/lib/ai-inbox/escalation-triggers.ts`. Keep the three in sync when
 * any changes — changing one of THOSE lists is a CRM pull request, not a local
 * edit. Word-boundary matched, case-insensitive. Bare "minor" is deliberately
 * excluded ("a minor issue" must not trip safety) — same call as the fork's
 * safety class.
 *
 * `order_issue` and `handoff` are WEB-CHAT-ONLY (see below) and are NOT part
 * of that mirror.
 */

export type EscalationReason =
  | 'safety'
  | 'legal'
  | 'refund'
  | 'complaint'
  | 'order_issue'
  | 'handoff';

/** Most-serious first — the first match wins, so this orders the label. */
const KEYWORDS: Record<'safety' | 'legal' | 'refund' | 'complaint', string[]> = {
  safety: [
    'underage', 'under age', 'under 21', 'not 21', 'fake id', 'minors',
    'teenager', 'high school', 'drunk', 'wasted', 'hammered', 'intoxicated',
    'blacked out', 'passed out', 'overserved', 'over served',
    'alcohol poisoning', 'too much to drink', 'got hurt', 'injured', 'injury',
    'ambulance', 'hospital', 'emergency',
  ],
  legal: [
    'lawyer', 'attorney', 'legal', 'lawsuit', 'sue', 'dispute', 'scam',
    'fraud', 'better business bureau', 'bbb',
  ],
  refund: [
    'refund', 'chargeback', 'charge back', 'money back', 'never received',
    "haven't received", 'have not received', "didn't receive",
    'did not receive', 'still waiting', 'cancel my order', 'cancel order',
  ],
  complaint: [
    'complaint', 'unacceptable', 'terrible', 'awful', 'worst', 'disappointed',
    'frustrated', 'angry', 'ridiculous', 'unhappy',
  ],
};

/**
 * WEB-CHAT-ONLY trigger — NOT part of the CRM keyword mirror above, and
 * deliberately recall-biased. The CRM inbox holds every reply as a draft for
 * human approval, so a human always sees the thread; the web chat replies
 * instantly with NO human in the loop, so anything that sounds like a problem
 * with an existing order / checkout must email the operator (Allan does not
 * watch the text line). Born from two real misses (2026-08-14 + 2026-08-22):
 * customers reported pickup orders still charging the $25 delivery fee, Wayne
 * promised it would be "corrected right away", no keyword fired, nobody was
 * notified, and an order went out wrong.
 */
const ORDER_ISSUE_KEYWORDS: string[] = [
  // something is wrong with an order
  'wrong order', 'order is wrong', 'wrong item', 'wrong items',
  'missing item', 'missing items', 'messed up', 'mixed up',
  // charged incorrectly (the two real incidents both said a fee was "showing"/"still including")
  'overcharged', 'over charged', 'double charged', 'charged twice',
  'charged me twice', 'extra charge', 'showing a delivery fee',
  'still showing', 'still including', 'still charging', 'charging me',
  // asking us to change an existing order (Wayne cannot — a human must)
  'change my order', 'update my order', 'add to my order', 'add to our order',
  'modify my order', 'fix my order', 'forgot to add', 'forgot to order',
  'existing order', 'order number',
  // checkout is broken for them
  "won't let me", 'wont let me', "can't check out", 'cant check out',
  'cannot check out', "can't checkout", 'cant checkout', 'checkout error',
  'not working', 'glitch',
];

/**
 * WEB-CHAT-ONLY, matched against WAYNE'S OWN reply (not the customer's
 * message): whenever Wayne tells a customer a human will handle something,
 * that promise must be TRUE — so it fires the operator email. Without this,
 * "I've flagged this for Allan" was a fabrication whenever no customer
 * keyword happened to match (that is exactly how the Wimberley cooler lead
 * sat unseen on the board, 2026-08-28).
 */
const HANDOFF_PHRASES: string[] = [
  'flagged this', 'flagged that', 'flagged it', 'flagging this',
  'flagging that', 'flagging it', 'flag this for', 'flag it for',
  'flag that for',
  'getting allan', 'pinging allan', 'ping allan', 'in front of allan',
  'allan will', 'human will', 'someone will', 'a human is on it',
  'team will', 'will follow up', 'follow up shortly', 'follow up with you',
  'will reach out', 'get back to you', 'pick this up', 'picks this up',
];

function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesKeyword(text: string, keyword: string): boolean {
  return new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i').test(text);
}

/**
 * Return the first (most-serious) escalation reason present in the CUSTOMER's
 * text, or null. The four mirrored classes win over the web-only
 * `order_issue` so the label stays as serious as the message.
 */
export function detectEscalation(text: string): EscalationReason | null {
  if (!text) return null;
  for (const reason of Object.keys(KEYWORDS) as Array<keyof typeof KEYWORDS>) {
    if (KEYWORDS[reason].some((kw) => matchesKeyword(text, kw))) return reason;
  }
  if (ORDER_ISSUE_KEYWORDS.some((kw) => matchesKeyword(text, kw))) return 'order_issue';
  return null;
}

/**
 * Return `handoff` when WAYNE'S reply promises human follow-up ("I'm pinging
 * Allan right now", "a human will pick this up"), else null. Checked only
 * when the customer's own message matched nothing — a customer-side reason is
 * always the better label.
 */
export function detectAssistantHandoff(assistantText: string): 'handoff' | null {
  if (!assistantText) return null;
  return HANDOFF_PHRASES.some((kw) => matchesKeyword(assistantText, kw)) ? 'handoff' : null;
}

export const REASON_LABEL: Record<EscalationReason, string> = {
  safety: 'Safety / minors / intoxication',
  legal: 'Legal / fraud / dispute',
  refund: 'Refund / cancellation',
  complaint: 'Complaint / negative sentiment',
  order_issue: 'Order problem / needs action',
  handoff: 'Wayne promised a human follow-up',
};
