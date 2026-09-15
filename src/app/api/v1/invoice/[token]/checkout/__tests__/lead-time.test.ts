/**
 * /api/v1/invoice/[token]/checkout — the 24-hour minimum at pay time for
 * drafts a customer minted (ADR-0010).
 *
 * Operator invoices stay exempt (exception a: ops hand-approved the rush). A
 * self-serve draft does not: a Quick-Buy draft created a week out can be
 * opened from its /invoice link the morning of delivery, so the check runs
 * here, before the Stripe session is created.
 *
 * Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z): Thu noon is 21h out,
 * Thu 4 PM is 25h.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const stripeMock = vi.hoisted(() => ({
  checkout: { sessions: { create: vi.fn() } },
  coupons: { create: vi.fn() },
}));
vi.mock('@/lib/stripe/client', () => ({ stripe: stripeMock }));

const draftMock = vi.hoisted(() => ({
  getDraftOrderByToken: vi.fn(),
  updateDraftOrderStatus: vi.fn(),
  canDraftOrderBePaid: vi.fn(),
}));
vi.mock('@/lib/draft-orders', async () => ({
  ...(await vi.importActual('@/lib/draft-orders/provenance')),
  ...draftMock,
}));

vi.mock('@/lib/discounts/discount-engine', () => ({ validateDiscountCode: vi.fn() }));
vi.mock('@/lib/tax', () => ({
  getTaxRateForZip: vi.fn(() => ({ rate: 0.0825, description: 'Austin' })),
  DEFAULT_TAX_RATE: 0.0825,
}));

import { POST } from '../route';
import { DASHBOARD_LEAD_TIME_MESSAGE } from '@/lib/delivery/lead-time';

const NOW = new Date('2026-09-16T20:00:00.000Z');
const PARAMS = { params: Promise.resolve({ token: 'tok-1' }) };

function request(): NextRequest {
  return new NextRequest('http://localhost/api/v1/invoice/tok-1/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embedded: true }),
  });
}

function draft(overrides: Record<string, unknown> = {}) {
  return {
    id: 'draft-1',
    token: 'tok-1',
    status: 'PENDING',
    customerEmail: 'sam@example.com',
    customerName: 'Sam Rivera',
    deliveryCity: 'Austin',
    deliveryState: 'TX',
    deliveryZip: '78701',
    deliveryDate: new Date('2026-09-17T12:00:00.000Z'), // tomorrow
    deliveryTime: '12pm–1pm', // 21h out
    items: [
      { productId: 'prod-1', variantId: 'var-1', title: "Tito's Handmade Vodka", quantity: 2, price: 29.99 },
    ],
    subtotal: 59.98,
    taxAmount: 4.95,
    deliveryFee: 30,
    discountAmount: 0,
    discountCode: null,
    affiliateCode: null,
    createdBy: 'landing:bachelorette',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  draftMock.canDraftOrderBePaid.mockReturnValue({ canPay: true });
  draftMock.updateDraftOrderStatus.mockResolvedValue({});
  stripeMock.checkout.sessions.create.mockResolvedValue({
    id: 'cs_test_1',
    url: null,
    client_secret: 'cs_secret_1',
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('POST /api/v1/invoice/[token]/checkout — 24-hour minimum for self-serve drafts', () => {
  it('refuses a Quick-Buy draft whose window is now inside 24 hours, before Stripe', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(draft());

    const res = await POST(request(), PARAMS);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: DASHBOARD_LEAD_TIME_MESSAGE,
      code: 'DELIVERY_TOO_SOON',
    });
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
    expect(draftMock.updateDraftOrderStatus).not.toHaveBeenCalled();
  });

  it('refuses a legacy group-checkout invoice the same way', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(draft({ createdBy: 'group-order-system' }));

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('DELIVERY_TOO_SOON');
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it('opens checkout for a self-serve draft still 24+ hours out', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(draft({ deliveryTime: '4pm–5pm' })); // 25h

    const res = await POST(request(), PARAMS);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ success: true, sessionId: 'cs_test_1', clientSecret: 'cs_secret_1' });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledOnce();
  });

  it.each([null, 'ops-agent', 'admin'])(
    'keeps operator invoices exempt inside 24 hours (createdBy %s)',
    async (createdBy) => {
      draftMock.getDraftOrderByToken.mockResolvedValue(draft({ createdBy }));

      const res = await POST(request(), PARAMS);

      expect(res.status).toBe(200);
      expect(stripeMock.checkout.sessions.create).toHaveBeenCalledOnce();
    },
  );

  it('lets the paid / cancelled / expired refusals answer first', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(draft());
    draftMock.canDraftOrderBePaid.mockReturnValue({
      canPay: false,
      reason: 'This invoice has already been paid',
    });

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'This invoice has already been paid' });
  });
});
