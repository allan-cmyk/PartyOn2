/**
 * Partner ("via <partner>") free-delivery banner rules for the dashboard.
 *
 * Tab checkout waives the delivery fee and pays commission for the
 * dashboard's OWN partner (GroupOrderV2.affiliate) — it never reads the
 * visitor's ref_code cookie or a promo saved in their browser. So the banner
 * may only name that partner. Before 2026-10-08 the dashboard read the 30-day
 * ref cookie and let it win, so a partner who had once visited another
 * partner's page saw every one of their own quotes labelled "via <other
 * partner>" (DTR Bartending's quotes showed "via Inn Cahoots"), and a cookie
 * on a partner-less dashboard promised free delivery checkout never gave.
 */

import type { AppliedPromo, GroupOrderV2Full } from './types';

/** The dashboard's own partner, as returned on GroupOrderV2Full. */
export type DashboardPartner = NonNullable<GroupOrderV2Full['affiliate']>;

/** Build the free-delivery banner promo for the dashboard's own partner. */
export function buildPartnerPromo(partner: DashboardPartner): AppliedPromo {
  return {
    type: 'affiliate',
    code: partner.code,
    label: `Free Delivery (via ${partner.businessName})`,
    discountAmount: 0,
    freeDelivery: true,
    affiliateId: partner.id,
  };
}

/**
 * Bring a restored/applied promo in line with what checkout honors.
 *
 * - Discount-code promos are left alone (checkout validates those itself).
 * - A partner promo for the dashboard's own partner is kept (same reference,
 *   so callers can detect "no change" with ===); one naming any other
 *   partner is replaced with the dashboard's partner.
 * - With no promo yet, a partnered dashboard gets its partner's promo.
 * - On a dashboard with no partner, a partner promo is dropped.
 */
export function reconcileDashboardPromo(
  promo: AppliedPromo | null,
  partner: DashboardPartner | null | undefined
): AppliedPromo | null {
  if (promo?.type === 'discount') return promo;
  if (!partner) return null;
  const expected = buildPartnerPromo(partner);
  if (promo && promo.affiliateId === partner.id && promo.label === expected.label) {
    return promo;
  }
  return expected;
}

/**
 * What the dashboard should do with its banner promo right now, or null to
 * leave it as is. A first-time apply waits until the visitor has joined (and
 * is `celebrate`d with confetti); correcting a wrong promo restored from
 * localStorage doesn't wait. Applying the result and calling again returns
 * null, so an effect that depends on the promo settles after one update.
 */
export function planPartnerPromo(
  current: AppliedPromo | null,
  partner: DashboardPartner | null | undefined,
  hasJoined: boolean
): { promo: AppliedPromo | null; celebrate: boolean } | null {
  const next = reconcileDashboardPromo(current, partner);
  if (next === current) return null;
  if (!current && !hasJoined) return null;
  return { promo: next, celebrate: !current && next !== null };
}

/**
 * Why a partner promo typed into the promo box can't apply here, or null when
 * it can. Only covers validate-promo's `type: 'affiliate'` result — a partner
 * with NO matching Discount row — which checkout ignores (it never sends that
 * code; the waiver comes from the dashboard's own partner). Partner codes that
 * DO have a Discount row come back as `type: 'discount'` and are honored at
 * checkout via discountCode, so they are deliberately not rejected here.
 */
export function partnerCodeRejection(
  promo: AppliedPromo,
  partner: DashboardPartner | null | undefined
): string | null {
  if (promo.type !== 'affiliate') return null;
  if (!partner) return "This referral code can't be applied to this dashboard.";
  if (promo.affiliateId !== partner.id) {
    return `This dashboard already gets free delivery through ${partner.businessName}.`;
  }
  return null;
}
