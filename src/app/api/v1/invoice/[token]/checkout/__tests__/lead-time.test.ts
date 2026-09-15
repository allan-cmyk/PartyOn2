/**
 * /api/v1/invoice/[token]/checkout refuses whatever canDraftOrderBePaid
 * refuses, passes its code along, and opens no Stripe session for it.
 *
 * Runs the real canDraftOrderBePaid, which (ADR-0010) holds a self-serve draft
 * to the 24-hour minimum until an operator sends it from ops; operator invoices
 * are exempt. Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z): Thu noon is
 * 21h out, Thu 4 PM is 25h.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/database/client', () => ({ prisma: {} }));

const stripeMock = vi.hoisted(() => ({
  checkout: { sessions: { create: vi.fn() } },
  coupons: { create: vi.fn() },
}));
vi.mock('@/lib/stripe/client', () => ({ stripe: stripeMock }));

const draftMock = vi.hoisted(() => ({
  getDraftOrderByToken: vi.fn(),
  updateDraftOrderStatus: vi.fn(),
}));
vi.mock('@/lib/draft-orders', async () => {
  const { canDraftOrderBePaid } = await vi.importActual<Record<string, unknown>>(
    '@/lib/draft-orders/service',
  );
  return { canDraftOrderBePaid, ...draftMock };
});

vi.mock('@/lib/discounts/discount-engine', () => ({ validateDiscountCode: vi.fn() }));
vi.mock('@/lib/tax', () => ({
  getTaxRateForZip: vi.fn(() => ({ rate: 0.0825, description: 'Austin' })),
  DEFAULT_TAX_RATE: 0.0825,
}));

import { POST } from '../route';
import { DELIVERY_TOO_SOON_CODE, INVOICE_LEAD_TIME_MESSAGE } from '@/lib/delivery/lead-time';

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
    expiresAt: null,
    sentAt: null,
    createdBy: 'landing:bachelorette',
    customerEmail: 'sam@example.com',
    customerName: 'Sam Rivera',
    deliveryCity: 'Austin',
    deliveryState: 'TX',
    deliveryZip: '78701',
    deliveryDate: new Date('2026-09-17T12:00:00.000Z'), // tomorrow
    deliveryTime: '12:00 PM - 1:00 PM', // 21h out
    items: [
      { productId: 'prod-1', variantId: 'var-1', title: "Tito's Handmade Vodka", quantity: 2, price: 29.99 },
    ],
    subtotal: 59.98,
    taxAmount: 4.95,
    deliveryFee: 30,
    discountAmount: 0,
    discountCode: null,
    affiliateCode: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
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

describe('POST /api/v1/invoice/[token]/checkout — 24-hour minimum', () => {
  it('refuses a Quick-Buy draft inside 24 hours with the lead-time code, before Stripe', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(draft());

    const res = await POST(request(), PARAMS);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: INVOICE_LEAD_TIME_MESSAGE,
      code: DELIVERY_TOO_SOON_CODE,
    });
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
    expect(draftMock.updateDraftOrderStatus).not.toHaveBeenCalled();
  });

  it('opens checkout once the window is 24+ hours out', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(draft({ deliveryTime: '4:00 PM - 5:00 PM' }));

    const res = await POST(request(), PARAMS);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ success: true, sessionId: 'cs_test_1', clientSecret: 'cs_secret_1' });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledOnce();
  });

  it('refuses a quote the landing flow emailed itself, inside 24 hours', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(
      draft({ status: 'SENT', sentAt: new Date('2026-09-15T15:00:00.000Z') }),
    );

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe(DELIVERY_TOO_SOON_CODE);
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it('opens checkout inside 24 hours for a draft an operator sent from ops', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(
      draft({
        status: 'SENT',
        sentAt: new Date('2026-09-16T19:30:00.000Z'),
        createdBy: 'ops-sent:landing:bachelorette',
      }),
    );

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(200);
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledOnce();
  });

  it('opens checkout inside 24 hours for an operator invoice', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(draft({ createdBy: null }));

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(200);
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledOnce();
  });

  it('keeps status refusals free of a lead-time code', async () => {
    draftMock.getDraftOrderByToken.mockResolvedValue(draft({ status: 'PAID' }));

    const res = await POST(request(), PARAMS);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'This invoice has already been paid' });
  });
});
