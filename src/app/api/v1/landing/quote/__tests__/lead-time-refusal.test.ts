/**
 * /api/v1/landing/quote holds the 24-hour minimum (ADR-0010) before it builds
 * anything.
 *
 * The gap this closes: Quick-Buy (and the other landing callers) minted a
 * customer-payable DraftOrder for any date. Both modes are gated (quote mode
 * emails a payable invoice too), and a refused request touches nothing.
 *
 * Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z), matching the other
 * lead-time route tests: Thu noon is 21h out, Thu 3:00 PM exactly 24h.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const prismaMock = vi.hoisted(() => ({
  product: { findMany: vi.fn() },
  draftOrder: { update: vi.fn() },
}));
vi.mock('@/lib/database/client', () => ({ prisma: prismaMock }));

const draftMock = vi.hoisted(() => ({
  createDraftOrder: vi.fn(),
  calculateDraftOrderAmounts: vi.fn(),
}));
vi.mock('@/lib/draft-orders', () => draftMock);

const emailMock = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend-client', () => emailMock);
vi.mock('@/lib/email/templates/invoice', () => ({
  generateInvoiceEmail: vi.fn(() => '<p>invoice</p>'),
  generateInvoiceSubject: vi.fn(() => 'Your invoice'),
}));
vi.mock('@/lib/email/template-content', () => ({
  getInvoiceTextOverrides: vi.fn(async () => ({})),
}));

const followupsMock = vi.hoisted(() => ({ cancelJobsForEmail: vi.fn(), enqueueJourney: vi.fn() }));
vi.mock('@/lib/followups/enqueue', () => followupsMock);

const mirrorsMock = vi.hoisted(() => ({
  mirrorQuickBuyLead: vi.fn(),
  mirrorLeadToSheet: vi.fn(),
  mirrorLeadToCrm: vi.fn(),
}));
vi.mock('@/lib/leads/quickbuy-lead', () => ({ mirrorQuickBuyLead: mirrorsMock.mirrorQuickBuyLead }));
vi.mock('@/lib/premier/pod-leads-sheet', () => ({ mirrorLeadToSheet: mirrorsMock.mirrorLeadToSheet }));
vi.mock('@/lib/leads/crm-mirror', () => ({ mirrorLeadToCrm: mirrorsMock.mirrorLeadToCrm }));

vi.mock('@/lib/security/rate-limit', () => ({ checkRateLimit: vi.fn(async () => true) }));
vi.mock('@/lib/leads/affiliate-resolve', () => ({ resolveAffiliateId: vi.fn(async () => null) }));

import { POST } from '../route';
import { LEAD_TIME_MESSAGE } from '@/lib/delivery/lead-time';

const NOW = new Date('2026-09-16T20:00:00.000Z');

function request(overrides: Record<string, unknown> = {}): NextRequest {
  return new NextRequest('http://localhost/api/v1/landing/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'pay-now',
      occasion: 'bachelorette',
      customerName: 'Sam Rivera',
      customerEmail: 'sam@example.com',
      customerPhone: '512-555-0100',
      groupSize: 12,
      deliveryDate: '2026-09-23', // a week out
      deliveryTime: '12:00 PM - 1:00 PM',
      deliveryAddress: '100 Congress Ave',
      deliveryCity: 'Austin',
      deliveryZip: '78701',
      items: [{ handle: 'titos-handmade-vodka-80-1lt', qty: 2 }],
      ...overrides,
    }),
  });
}

/** A refused request may not look anything up, create a draft, email, enqueue, or mirror a lead. */
function expectNothingTouched() {
  expect(prismaMock.product.findMany).not.toHaveBeenCalled();
  expect(draftMock.createDraftOrder).not.toHaveBeenCalled();
  expect(emailMock.sendEmail).not.toHaveBeenCalled();
  expect(followupsMock.cancelJobsForEmail).not.toHaveBeenCalled();
  expect(followupsMock.enqueueJourney).not.toHaveBeenCalled();
  expect(mirrorsMock.mirrorQuickBuyLead).not.toHaveBeenCalled();
  expect(mirrorsMock.mirrorLeadToSheet).not.toHaveBeenCalled();
  expect(mirrorsMock.mirrorLeadToCrm).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  prismaMock.product.findMany.mockResolvedValue([
    {
      id: 'prod-1',
      handle: 'titos-handmade-vodka-80-1lt',
      title: "Tito's Handmade Vodka",
      variants: [{ id: 'var-1', title: '1L', price: 29.99 }],
      images: [],
    },
  ]);
  prismaMock.draftOrder.update.mockResolvedValue({});
  draftMock.calculateDraftOrderAmounts.mockReturnValue({
    subtotal: 59.98,
    taxAmount: 4.95,
    deliveryFee: 30,
    discountAmount: 0,
  });
  draftMock.createDraftOrder.mockImplementation(async (input: Record<string, unknown>) => ({
    ...input,
    id: 'draft-1',
    token: 'tok-1',
    discountCode: null,
    total: 94.93,
  }));
  emailMock.sendEmail.mockResolvedValue('resend-id');
  followupsMock.cancelJobsForEmail.mockResolvedValue(undefined);
  followupsMock.enqueueJourney.mockResolvedValue({ enqueued: true });
  mirrorsMock.mirrorQuickBuyLead.mockResolvedValue(undefined);
  mirrorsMock.mirrorLeadToSheet.mockResolvedValue(undefined);
  mirrorsMock.mirrorLeadToCrm.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('POST /api/v1/landing/quote — 24-hour minimum', () => {
  it('creates a week-out Quick-Buy draft as before', async () => {
    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ success: true, mode: 'pay-now', token: 'tok-1' });
    expect(draftMock.createDraftOrder).toHaveBeenCalledOnce();
    expect(draftMock.createDraftOrder.mock.calls[0][0]).toMatchObject({
      deliveryDate: new Date('2026-09-23T12:00:00.000Z'),
      deliveryTime: '12:00 PM - 1:00 PM',
      createdBy: 'landing:bachelorette',
    });
  });

  it('refuses tomorrow noon (21h out) before touching anything', async () => {
    const res = await POST(request({ deliveryDate: '2026-09-17' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ success: false, error: LEAD_TIME_MESSAGE, code: 'DELIVERY_TOO_SOON' });
    expectNothingTouched();
  });

  it('refuses quote mode too — it emails a payable invoice', async () => {
    // No window sent: the route default "Afternoon (12pm–4pm)" has no clock
    // time the gate reads, so it counts as 10 AM — 19h out.
    const res = await POST(
      request({ mode: 'quote', deliveryDate: '2026-09-17', deliveryTime: undefined }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe('DELIVERY_TOO_SOON');
    expectNothingTouched();
  });

  it('judges a Quick-Buy window by its start: tomorrow 4 PM is 25h out and goes through', async () => {
    const res = await POST(request({ deliveryDate: '2026-09-17', deliveryTime: '4:00 PM - 5:00 PM' }));

    expect(res.status).toBe(200);
    expect(draftMock.createDraftOrder.mock.calls[0][0]).toMatchObject({
      deliveryDate: new Date('2026-09-17T12:00:00.000Z'),
      deliveryTime: '4:00 PM - 5:00 PM',
    });
  });

  it('holds the boundary: exactly 24h passes, the window 30 minutes sooner does not', async () => {
    const exact = await POST(request({ deliveryDate: '2026-09-17', deliveryTime: '3:00 PM - 4:00 PM' }));
    expect(exact.status).toBe(200);

    const sooner = await POST(
      request({ deliveryDate: '2026-09-17', deliveryTime: '2:30 PM - 3:30 PM' }),
    );
    expect(sooner.status).toBe(400);
    expect((await sooner.json()).code).toBe('DELIVERY_TOO_SOON');
    expect(draftMock.createDraftOrder).toHaveBeenCalledOnce();
  });

  it('reads a short label from a page loaded before this change by the strict 10 AM fallback', async () => {
    // Thu 4pm is really 25h out, but '4pm–5pm' is not a format the gate parses: it fails closed.
    const res = await POST(request({ deliveryDate: '2026-09-17', deliveryTime: '4pm–5pm' }));

    expect(res.status).toBe(400);
    expectNothingTouched();
  });

  it('still emails the invoice for a quote two days out', async () => {
    const res = await POST(
      request({ mode: 'quote', deliveryDate: '2026-09-18', deliveryTime: undefined }),
    );

    expect(res.status).toBe(200);
    expect(emailMock.sendEmail).toHaveBeenCalledOnce();
  });

  it('refuses today and past days', async () => {
    const today = await POST(request({ deliveryDate: '2026-09-16', deliveryTime: '8:00 PM - 9:00 PM' }));
    expect(today.status).toBe(400);

    const past = await POST(request({ deliveryDate: '2026-07-03', deliveryTime: '12:00 PM' }));
    expect(past.status).toBe(400);
    expect((await past.json()).code).toBe('DELIVERY_TOO_SOON');
    expectNothingTouched();
  });

  it.each([
    { label: 'an impossible date', deliveryDate: '2026-02-30' },
    // Stored as Sept 17 once normalized to noon UTC, but its text says Sept 18.
    { label: 'a timestamp naming a later day than it stores', deliveryDate: '2026-09-18T01:00:00+05:00' },
    { label: 'free text', deliveryDate: 'next friday' },
  ])('rejects $label before the lead-time math', async ({ deliveryDate }) => {
    const res = await POST(request({ deliveryDate }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('invalid_body');
    expectNothingTouched();
  });
});
