/**
 * Draft-order provenance: which drafts a customer minted through a public
 * delivery checkout, and so stay under ADR-0010's 24-hour minimum when paid.
 *
 * Operator invoices are exempt, including when paid at /invoice/[token]: an
 * operator hand-approving a rush IS the escape hatch. A self-serve draft is
 * held to the rule until an invoice is sent for it. Sending it (an operator's
 * Send, or the landing quote flow's own email, whose date is a placeholder
 * the wedding calculator never asks for) makes it an invoice like any other.
 *
 * Every file that creates draft orders is classified in
 * __tests__/draft-creators.test.ts, so a new public flow can't slip into the
 * operator exemption unnoticed.
 *
 * Client-safe: no server imports.
 */

const LANDING_DRAFT_CREATED_BY_PREFIX = 'landing:';

/** createdBy stamped by the legacy v1 group checkout on the host's invoice. */
export const GROUP_ORDER_DRAFT_CREATED_BY = 'group-order-system';

/** createdBy stamped by the Full Moon ticket route: an event ticket, not a delivery. */
export const FULL_MOON_TICKET_DRAFT_CREATED_BY = 'full-moon-ticket';

/** createdBy for a draft minted by the public landing-page quote route. */
export function landingDraftCreatedBy(occasion: string): string {
  return `${LANDING_DRAFT_CREATED_BY_PREFIX}${occasion}`;
}

/**
 * True when a customer created this draft through a public delivery checkout
 * (landing-page Quick-Buy / quote, legacy group checkout). Operator, ops-agent
 * and amendment invoices, and event tickets, return false.
 */
export function isSelfServeDeliveryDraft(draft: { createdBy: string | null }): boolean {
  const createdBy = draft.createdBy ?? '';
  return (
    createdBy.startsWith(LANDING_DRAFT_CREATED_BY_PREFIX) ||
    createdBy === GROUP_ORDER_DRAFT_CREATED_BY
  );
}

/**
 * Whether paying this draft must still clear the 24-hour minimum: a
 * self-serve delivery draft that no invoice was ever sent for.
 */
export function mustMeetLeadTimeToPay(draft: {
  createdBy: string | null;
  sentAt: Date | null;
}): boolean {
  return isSelfServeDeliveryDraft(draft) && draft.sentAt == null;
}
