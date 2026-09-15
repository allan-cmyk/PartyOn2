/**
 * Quick-Buy's date and time pickers mirror the 24-hour minimum (ADR-0010) the
 * landing quote route enforces, and a refusal from either server step shows
 * up in the modal instead of a redirect.
 *
 * Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z), matching the route
 * lead-time tests: Thu 3:00 PM is exactly 24h out.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { LandingConfig, Package } from '../types';

vi.mock('@/lib/leads/client', () => ({
  useLeadCapture: () => ({ onBlurField: vi.fn(), onCheckoutStart: vi.fn() }),
}));
vi.mock('@/lib/leads/fireLeadConversion', () => ({
  fireLeadConversionAndFlush: vi.fn(async () => undefined),
}));
vi.mock('@/lib/analytics/attribution', () => ({ getAttribution: () => null }));
vi.mock('@/lib/experiments/funnelTrack', () => ({ trackFunnelStep: vi.fn() }));
vi.mock('../EmbeddedCheckoutPanel', () => ({ default: () => null }));
vi.mock('../UpsellOverlay', () => ({ default: () => null }));

import QuickBuyModal from '../QuickBuyModal';
import { DELIVERY_TOO_SOON_CODE, LEAD_TIME_MESSAGE, RUSH_NOTE } from '@/lib/delivery/lead-time';

const NOW = new Date('2026-09-16T20:00:00.000Z');

const config = {
  slug: 'austin-bachelorette-party-delivery',
  theme: {
    primary: '#F2D34F',
    primaryText: '#111827',
    navy: '#0B1F33',
    cream: '#FFFDF5',
    blue: '#0B74B8',
    primaryHover: '#E5C440',
  },
} as unknown as LandingConfig;

const pkg = {
  name: 'The Classic',
  defaultPeople: 10,
  lineItems: [
    { handle: 'titos-handmade-vodka-80-1lt', name: "Tito's Handmade Vodka (1L)", unitPrice: 29.99, qty: 2 },
  ],
} as unknown as Package;

function renderModal() {
  return render(
    <QuickBuyModal open onClose={vi.fn()} pkg={pkg} config={config} occasion="bachelorette" />,
  );
}

const dateInput = (c: HTMLElement) => c.querySelector('input[type="date"]') as HTMLInputElement;
const timeSelect = (c: HTMLElement) => c.querySelector('select') as HTMLSelectElement;
const optionValues = (c: HTMLElement) => Array.from(timeSelect(c).options).map((o) => o.value);
const payButton = () => screen.getByRole('button', { name: /pay now/i });

function fillContact() {
  fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Sam Rivera' } });
  fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '512-555-0100' } });
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'sam@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('Street address'), { target: { value: '100 Congress Ave' } });
  fireEvent.change(screen.getByPlaceholderText('ZIP'), { target: { value: '78701' } });
  fireEvent.click(screen.getByRole('checkbox'));
}

function jsonResponse(ok: boolean, body: Record<string, unknown>): Response {
  return { ok, json: async () => body } as unknown as Response;
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('QuickBuyModal — 24-hour minimum', () => {
  it.each([
    { label: 'Wed 3:00 PM', at: '2026-09-16T20:00:00.000Z', min: '2026-09-17' },
    // Thu's 8pm window is still 24h50m out; a UTC "tomorrow" would skip to Friday.
    { label: 'Wed 7:10 PM', at: '2026-09-17T00:10:00.000Z', min: '2026-09-17' },
    // Thu's last window is under 24 hours (plus the form's slack) away.
    { label: 'Wed 8:45 PM', at: '2026-09-17T01:45:00.000Z', min: '2026-09-18' },
  ])('starts the date picker at $min when opened $label CDT', ({ at, min }) => {
    vi.setSystemTime(new Date(at));
    const { container } = renderModal();

    expect(dateInput(container).min).toBe(min);
  });

  it('offers tomorrow only from the window 24 hours out, moving the noon default onto it', () => {
    const { container } = renderModal();
    expect(timeSelect(container).value).toBe('12pm–1pm');

    fireEvent.change(dateInput(container), { target: { value: '2026-09-17' } });

    expect(optionValues(container)[0]).toBe('3pm–4pm');
    expect(optionValues(container)).not.toContain('12pm–1pm');
    expect(timeSelect(container).value).toBe('3pm–4pm');
    expect(screen.getByText(RUSH_NOTE)).toBeInTheDocument();
  });

  it('keeps the chosen window when the new day still offers it', () => {
    const { container } = renderModal();
    fireEvent.change(dateInput(container), { target: { value: '2026-09-18' } });
    fireEvent.change(timeSelect(container), { target: { value: '6pm–7pm' } });

    fireEvent.change(dateInput(container), { target: { value: '2026-09-17' } });

    expect(timeSelect(container).value).toBe('6pm–7pm');
  });

  it('blocks Pay and explains once the chosen window ages past the cutoff', () => {
    const { container } = renderModal();
    fillContact();
    fireEvent.change(dateInput(container), { target: { value: '2026-09-17' } });
    fireEvent.change(timeSelect(container), { target: { value: '3pm–4pm' } }); // exactly 24h
    expect(payButton()).toBeEnabled();

    vi.setSystemTime(new Date(NOW.getTime() + 60_000));
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'Austin TX' } });

    expect(payButton()).toBeDisabled();
    expect(screen.getByText(LEAD_TIME_MESSAGE)).toBeInTheDocument();
    // The select still shows the window the order would carry, not a silent substitute.
    expect(timeSelect(container).value).toBe('3pm–4pm');
    expect(optionValues(container).slice(0, 2)).toEqual(['3pm–4pm', '3:30pm–4:30pm']);
  });

  it('shows the quote route refusal in the modal', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      jsonResponse(false, { success: false, error: LEAD_TIME_MESSAGE, code: DELIVERY_TOO_SOON_CODE }),
    );
    const { container } = renderModal();
    fillContact();
    fireEvent.change(dateInput(container), { target: { value: '2026-09-23' } });

    fireEvent.submit(container.querySelector('#qb-form') as HTMLFormElement);

    expect(await screen.findByText(LEAD_TIME_MESSAGE)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(String(vi.mocked(global.fetch).mock.calls[0][1]?.body));
    expect(sent).toMatchObject({ mode: 'pay-now', deliveryDate: '2026-09-23', deliveryTime: '12pm–1pm' });
  });

  it('shows a checkout-time refusal instead of redirecting to an invoice that cannot be paid', async () => {
    vi.stubEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_123');
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        jsonResponse(true, {
          success: true,
          token: 'tok-1',
          invoiceUrl: 'https://partyondelivery.com/invoice/tok-1',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(false, { success: false, error: 'closed', code: DELIVERY_TOO_SOON_CODE }),
      );
    const { container } = renderModal();
    fillContact();
    fireEvent.change(dateInput(container), { target: { value: '2026-09-23' } });

    fireEvent.submit(container.querySelector('#qb-form') as HTMLFormElement);

    expect(await screen.findByText(LEAD_TIME_MESSAGE)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(String(vi.mocked(global.fetch).mock.calls[1][0])).toBe('/api/v1/invoice/tok-1/checkout');
  });
});
