/**
 * The dashboard's "Free Delivery (via <partner>)" banner may only name the
 * dashboard's own partner — the only partner tab checkout honors. Regression
 * for 2026-10-08: DTR Bartending's quotes showed "via Inn Cahoots" because a
 * ref cookie from Inn Cahoots' partner page won over the dashboard's partner
 * and was then cached in localStorage per dashboard.
 */
import { describe, it, expect } from 'vitest';
import {
  buildPartnerPromo,
  reconcileDashboardPromo,
  planPartnerPromo,
  partnerCodeRejection,
} from '../partner-promo';
import type { AppliedPromo } from '../types';

const DTR = { id: 'aff-dtr', code: 'DTRbartending', businessName: 'DTR Bartending' };
const INN = { id: 'aff-inn', code: 'MISCHIEF', businessName: 'Inn Cahoots' };

const discountPromo: AppliedPromo = {
  type: 'discount',
  code: 'SAVE10',
  label: 'Save 10 (-$10.00)',
  discountAmount: 10,
  freeDelivery: false,
};

// Shape the old cookie effect saved to localStorage (code was the affiliate id).
const staleCookiePromo: AppliedPromo = {
  type: 'affiliate',
  code: INN.id,
  label: 'Free Delivery (via Inn Cahoots)',
  discountAmount: 0,
  freeDelivery: true,
  affiliateId: INN.id,
};

describe('buildPartnerPromo', () => {
  it('labels free delivery with the partner name', () => {
    expect(buildPartnerPromo(DTR)).toEqual({
      type: 'affiliate',
      code: 'DTRbartending',
      label: 'Free Delivery (via DTR Bartending)',
      discountAmount: 0,
      freeDelivery: true,
      affiliateId: 'aff-dtr',
    });
  });
});

describe('reconcileDashboardPromo', () => {
  it("replaces another partner's saved promo with the dashboard's own partner", () => {
    expect(reconcileDashboardPromo(staleCookiePromo, DTR)).toEqual(buildPartnerPromo(DTR));
  });

  it("applies the dashboard's partner when nothing is applied yet", () => {
    expect(reconcileDashboardPromo(null, DTR)).toEqual(buildPartnerPromo(DTR));
  });

  it('returns the same object when the promo already matches (no re-render loop)', () => {
    const current = buildPartnerPromo(DTR);
    expect(reconcileDashboardPromo(current, DTR)).toBe(current);
  });

  it('refreshes the label when the partner was renamed', () => {
    const old = { ...buildPartnerPromo(DTR), label: 'Free Delivery (via DTR)' };
    expect(reconcileDashboardPromo(old, DTR)?.label).toBe('Free Delivery (via DTR Bartending)');
  });

  it('drops a partner promo on a dashboard with no partner (checkout would not waive the fee)', () => {
    expect(reconcileDashboardPromo(staleCookiePromo, null)).toBeNull();
    expect(reconcileDashboardPromo(staleCookiePromo, undefined)).toBeNull();
  });

  it('shows nothing on a dashboard with no partner and no promo', () => {
    expect(reconcileDashboardPromo(null, null)).toBeNull();
  });

  it('leaves discount-code promos alone, with or without a partner', () => {
    expect(reconcileDashboardPromo(discountPromo, DTR)).toBe(discountPromo);
    expect(reconcileDashboardPromo(discountPromo, null)).toBe(discountPromo);
  });
});

describe('planPartnerPromo (what the dashboard effect does)', () => {
  it("swaps a saved 'via Inn Cahoots' for DTR on DTR's dashboard, even before joining, without confetti", () => {
    expect(planPartnerPromo(staleCookiePromo, DTR, false)).toEqual({
      promo: buildPartnerPromo(DTR),
      celebrate: false,
    });
  });

  it("applies the dashboard's partner with confetti once the visitor has joined", () => {
    expect(planPartnerPromo(null, DTR, true)).toEqual({
      promo: buildPartnerPromo(DTR),
      celebrate: true,
    });
  });

  it('waits for the visitor to join before the first apply', () => {
    expect(planPartnerPromo(null, DTR, false)).toBeNull();
  });

  it('clears a saved partner promo on a dashboard with no partner', () => {
    expect(planPartnerPromo(staleCookiePromo, null, true)).toEqual({ promo: null, celebrate: false });
  });

  it('settles: applying the plan and planning again does nothing', () => {
    for (const [current, partner] of [
      [staleCookiePromo, DTR],
      [null, DTR],
      [staleCookiePromo, null],
    ] as const) {
      const first = planPartnerPromo(current, partner, true);
      expect(first).not.toBeNull();
      expect(planPartnerPromo(first!.promo, partner, true)).toBeNull();
    }
  });

  it('leaves a matching partner promo or a discount code alone', () => {
    expect(planPartnerPromo(buildPartnerPromo(DTR), DTR, true)).toBeNull();
    expect(planPartnerPromo(discountPromo, DTR, true)).toBeNull();
    expect(planPartnerPromo(discountPromo, null, true)).toBeNull();
  });
});

describe('partnerCodeRejection', () => {
  const typed = (partner: typeof DTR): AppliedPromo => buildPartnerPromo(partner);

  it("accepts the dashboard's own partner code", () => {
    expect(partnerCodeRejection(typed(DTR), DTR)).toBeNull();
  });

  it("rejects another partner's code, naming the dashboard's partner", () => {
    expect(partnerCodeRejection(typed(INN), DTR)).toBe(
      'This dashboard already gets free delivery through DTR Bartending.'
    );
  });

  it('rejects a partner code on a dashboard with no partner', () => {
    expect(partnerCodeRejection(typed(INN), null)).toBe(
      "This referral code can't be applied to this dashboard."
    );
  });

  // Includes partner codes that have a matching Discount row: validate-promo
  // returns those as 'discount', and checkout honors them via discountCode.
  it('never rejects discount codes', () => {
    expect(partnerCodeRejection(discountPromo, DTR)).toBeNull();
    expect(partnerCodeRejection(discountPromo, null)).toBeNull();
  });
});
