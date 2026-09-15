/**
 * Draft-order provenance — who minted an invoice decides whether ADR-0010's
 * operator exception applies to it.
 *
 * Invoices an operator created (and so hand-approved) stay payable at
 * /invoice/[token] even inside 24 hours: that is the sanctioned rush path.
 * Drafts a customer minted through a public, self-serve flow are not covered —
 * they sit unpaid behind the same /invoice link, so paying them must still
 * clear the 24-hour minimum.
 *
 * Client-safe: no server imports.
 */

/** createdBy prefix stamped by the public landing-page quote route: `landing:<occasion>`. */
export const LANDING_DRAFT_CREATED_BY_PREFIX = 'landing:';

/** createdBy stamped by the legacy v1 group checkout on the host's invoice. */
export const GROUP_ORDER_DRAFT_CREATED_BY = 'group-order-system';

/** createdBy for a draft minted by the public landing-page quote route. */
export function landingDraftCreatedBy(occasion: string): string {
  return `${LANDING_DRAFT_CREATED_BY_PREFIX}${occasion}`;
}

/**
 * True when a customer created this draft through a public flow (landing-page
 * Quick-Buy / quote, legacy group checkout) rather than an operator. Ops,
 * ops-agent and amendment invoices return false and keep the exception.
 */
export function isSelfServeDraftOrder(draft: { createdBy: string | null }): boolean {
  const createdBy = draft.createdBy ?? '';
  return (
    createdBy.startsWith(LANDING_DRAFT_CREATED_BY_PREFIX) ||
    createdBy === GROUP_ORDER_DRAFT_CREATED_BY
  );
}
