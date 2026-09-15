/**
 * Quick-Buy's pickers mirror the 24-hour minimum (ADR-0010) the landing quote
 * route enforces, without ever changing a window behind the customer's back.
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
import { DAY_CLOSED_NOTE } from '@/lib/landing/deliveryWindows';
import { LEAD_TIME_MESSAGE, RUSH_NOTE } from '@/lib/delivery/lead-time';

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
const enabledOptions = (c: HTMLElement) =>
  Array.from(timeSelect(c).options)
    .filter((o) => !o.disabled)
    .map((o) => o.value);
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
  // setup.ts's clearAllMocks keeps queued once-responses; drop them so one
  // test's unused reply can't leak into the next.
  vi.mocked(global.fetch).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('QuickBuyModal — 24-hour minimum', () => {
  it.each([
    // Thu's 8pm window is still 24h50m out; the old UTC "tomorrow" skipped to Friday.
    { label: 'Wed 7:10 PM', at: '2026-09-17T00:10:00.000Z', min: '2026-09-17' },
    // Thu's 8pm window is 24h15m out, inside the form's slack, so Friday is first.
    { label: 'Wed 7:45 PM', at: '2026-09-17T00:45:00.000Z', min: '2026-09-18' },
  ])('starts the date picker at $min when opened $label CDT', ({ at, min }) => {
    vi.setSystemTime(new Date(at));
    const { container } = renderModal();

    expect(dateInput(container).min).toBe(min);
  });

  it('flags the preselected noon window instead of swapping it when tomorrow can no longer take it', () => {
    const { container } = renderModal();
    fillContact();
    expect(timeSelect(container).value).toBe('12:00 PM - 1:00 PM');

    fireEvent.change(dateInput(container), { target: { value: '2026-09-17' } });

    expect(timeSelect(container).value).toBe('12:00 PM - 1:00 PM');
    expect(screen.getByText(LEAD_TIME_MESSAGE)).toBeInTheDocument();
    expect(payButton()).toBeDisabled();
    expect(enabledOptions(container)[0]).toBe('3:00 PM - 4:00 PM');
    expect(enabledOptions(container)).not.toContain('12:00 PM - 1:00 PM');
  });

  it('never replaces a window the customer chose', () => {
    const { container } = renderModal();
    fillContact();
    fireEvent.change(timeSelect(container), { target: { value: '10:00 AM - 11:00 AM' } });
    fireEvent.change(dateInput(container), { target: { value: '2026-09-17' } });

    expect(timeSelect(container).value).toBe('10:00 AM - 11:00 AM');
    expect(screen.getByText(LEAD_TIME_MESSAGE)).toBeInTheDocument();
    expect(payButton()).toBeDisabled();

    fireEvent.change(timeSelect(container), { target: { value: '4:00 PM - 5:00 PM' } });

    expect(screen.queryByText(LEAD_TIME_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText(RUSH_NOTE)).toBeInTheDocument();
    expect(payButton()).toBeEnabled();
  });

  it('blocks Pay and explains once the chosen window ages past the cutoff', () => {
    const { container } = renderModal();
    fillContact();
    fireEvent.change(dateInput(container), { target: { value: '2026-09-17' } });
    fireEvent.change(timeSelect(container), { target: { value: '3:00 PM - 4:00 PM' } }); // exactly 24h
    expect(payButton()).toBeEnabled();

    vi.setSystemTime(new Date(NOW.getTime() + 60_000));
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'Austin TX' } });

    expect(payButton()).toBeDisabled();
    expect(screen.getByText(LEAD_TIME_MESSAGE)).toBeInTheDocument();
    // The select still shows the window the order would carry, under its short label.
    expect(timeSelect(container).value).toBe('3:00 PM - 4:00 PM');
    const stale = timeSelect(container).options[0];
    expect(stale.disabled).toBe(true);
    expect(stale.textContent).toBe('3pm–4pm');
  });

  it('says to pick a later date when the chosen day has no windows left', () => {
    const { container } = renderModal();
    fillContact();
    // Typed below the picker's min: today has no window 24 hours out.
    fireEvent.change(dateInput(container), { target: { value: '2026-09-16' } });

    expect(screen.getByText(DAY_CLOSED_NOTE)).toBeInTheDocument();
    expect(screen.queryByText(LEAD_TIME_MESSAGE)).not.toBeInTheDocument();
    expect(enabledOptions(container)).toEqual([]);
    expect(payButton()).toBeDisabled();
  });

  it('sends the stored window format and shows the quote route refusal', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      jsonResponse(false, { success: false, error: LEAD_TIME_MESSAGE, code: 'DELIVERY_TOO_SOON' }),
    );
    const { container } = renderModal();
    fillContact();
    fireEvent.change(dateInput(container), { target: { value: '2026-09-23' } });

    fireEvent.submit(container.querySelector('#qb-form') as HTMLFormElement);

    expect(await screen.findByText(LEAD_TIME_MESSAGE)).toBeInTheDocument();
    const sent = JSON.parse(String(vi.mocked(global.fetch).mock.calls[0][1]?.body));
    expect(sent).toMatchObject({
      mode: 'pay-now',
      deliveryDate: '2026-09-23',
      deliveryTime: '12:00 PM - 1:00 PM',
    });
  });

  it('lets the customer pay again after going back from embedded checkout', async () => {
    vi.stubEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_123');
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        jsonResponse(true, {
          success: true,
          token: 'tok-1',
          invoiceUrl: 'https://partyondelivery.com/invoice/tok-1',
        }),
      )
      .mockResolvedValueOnce(jsonResponse(true, { success: true, clientSecret: 'cs_secret_1' }));
    const { container } = renderModal();
    fillContact();
    fireEvent.change(dateInput(container), { target: { value: '2026-09-23' } });

    fireEvent.submit(container.querySelector('#qb-form') as HTMLFormElement);
    fireEvent.click(await screen.findByRole('button', { name: /edit order details/i }));

    expect(payButton()).toBeEnabled();
  });
});
