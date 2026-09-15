/**
 * Draft-order provenance: which drafts a customer minted through a public
 * delivery checkout, and so stay under ADR-0010's 24-hour minimum when paid.
 *
 * Operator invoices are exempt, including when paid at /invoice/[token]: an
 * operator hand-approving a rush IS the escape hatch. A self-serve draft is
 * held to the rule until an operator sends it from ops, which makes it an
 * operator invoice (operatorSentCreatedBy). Emails a public flow sends on its
 * own (the landing quote flow's invoice email) never lift the rule, or any
 * caller could mint an exempt invoice.
 *
 * Every file that creates draft orders is classified in
 * __tests__/draft-creators.test.ts, so a new public flow can't slip into the
 * operator exemption unnoticed.
 *
 * Client-safe: no server imports.
 */

const LANDING_DRAFT_CREATED_BY_PREFIX = 'landing:';

/** Prefix stamped when an operator sends a customer-created draft from ops. */
const OPERATOR_SENT_PREFIX = 'ops-sent:';

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
 * (landing-page Quick-Buy / quote, legacy group checkout) and no operator has
 * sent it since. Operator, ops-agent and amendment invoices, operator-sent
 * drafts, and event tickets return false.
 */
export function isSelfServeDeliveryDraft(draft: { createdBy: string | null }): boolean {
  const createdBy = draft.createdBy ?? '';
  return (
    createdBy.startsWith(LANDING_DRAFT_CREATED_BY_PREFIX) ||
    createdBy === GROUP_ORDER_DRAFT_CREATED_BY
  );
}

/**
 * The createdBy to store when an operator sends a draft from ops: a self-serve
 * draft becomes an operator invoice, keeping its origin after the prefix;
 * anything else is returned unchanged.
 */
export function operatorSentCreatedBy(createdBy: string | null): string | null {
  return isSelfServeDeliveryDraft({ createdBy }) ? `${OPERATOR_SENT_PREFIX}${createdBy}` : createdBy;
}
