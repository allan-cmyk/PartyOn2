/**
 * The promo box shows the reason when the dashboard refuses a validated code
 * (a `type: 'affiliate'` partner promo checkout wouldn't honor — see
 * partnerCodeRejection in partner-promo.ts).
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromoCodeInput from '../PromoCodeInput';
import type { AppliedPromo } from '@/lib/group-orders-v2/types';

const innPromo: AppliedPromo = {
  type: 'affiliate',
  code: 'MISCHIEF',
  label: 'Free Delivery (via Inn Cahoots)',
  discountAmount: 0,
  freeDelivery: true,
  affiliateId: 'aff-inn',
};

vi.mock('@/lib/group-orders-v2/api-client', () => ({
  validatePromoCode: vi.fn(async () => innPromo),
}));

function typeAndApply(code: string) {
  fireEvent.change(screen.getByPlaceholderText('Promo or referral code'), {
    target: { value: code },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
}

describe('PromoCodeInput', () => {
  it('shows the message when onApply rejects the code', async () => {
    const onApply = vi.fn(async () => {
      throw new Error('This dashboard already gets free delivery through DTR Bartending.');
    });
    render(<PromoCodeInput appliedPromo={null} subtotal={0} onApply={onApply} onRemove={vi.fn()} />);

    typeAndApply('mischief');

    expect(
      await screen.findByText('This dashboard already gets free delivery through DTR Bartending.')
    ).toBeTruthy();
    expect(onApply).toHaveBeenCalledWith(innPromo);
    // The typed code stays so the visitor can see what was refused.
    expect((screen.getByPlaceholderText('Promo or referral code') as HTMLInputElement).value).toBe(
      'MISCHIEF'
    );
  });

  it('clears the input when onApply accepts the code', async () => {
    const onApply = vi.fn(async () => {});
    render(<PromoCodeInput appliedPromo={null} subtotal={0} onApply={onApply} onRemove={vi.fn()} />);

    typeAndApply('mischief');

    await waitFor(() =>
      expect((screen.getByPlaceholderText('Promo or referral code') as HTMLInputElement).value).toBe('')
    );
    expect(screen.queryByText(/already gets free delivery/)).toBeNull();
  });
});
