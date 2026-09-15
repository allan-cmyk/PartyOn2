/**
 * quote/start holds the 24-hour minimum (ADR-0010) before it builds anything.
 *
 * The bug this guards: the chat and package builder sent inside-24h dates
 * straight into createDashboardOrder, minting dashboards whose own checkout
 * refuses payment. Now a bookable day opens on a window that leaves real
 * checkout time, a day with no bookable window is refused (lead kept, rush
 * flagged, no dashboard, no welcome email), and impossible dates never reach
 * the lead-time math at all.
 *
 * Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z), matching the tab PATCH
 * lead-time tests: Thu noon is 21h out, Thu 3:00 PM exactly 24h.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const throttleMock = vi.hoisted(() => ({
  allowLeadCaptureIp: vi.fn(),
  allowLeadCaptureEmail: vi.fn(),
  LEAD_CAPTURE_THROTTLED: { ok: false, error: 'rate_limited' },
}));
vi.mock('@/lib/security/lead-capture-throttle', () => throttleMock);

const leadCaptureMock = vi.hoisted(() => ({ upsertLead: vi.fn(), recordEvent: vi.fn() }));
vi.mock('@/lib/leads/leadCapture', () => leadCaptureMock);

vi.mock('@/lib/leads/affiliate-resolve', () => ({ resolveAffiliateId: vi.fn(async () => null) }));

const serviceMock = vi.hoisted(() => ({ createDashboardOrder: vi.fn(), addDraftItem: vi.fn() }));
vi.mock('@/lib/group-orders-v2/service', () => serviceMock);

const prismaMock = vi.hoisted(() => ({
  lead: { update: vi.fn() },
  product: { findMany: vi.fn() },
}));
vi.mock('@/lib/database/client', () => ({ prisma: prismaMock }));

const emailMock = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@/lib/email/resend-client', () => emailMock);

vi.mock('@/lib/email/templates/event-quiz-welcome', () => ({
  eventQuizWelcomeEmail: vi.fn(() => ({ subject: 'Welcome', html: '<p>hi</p>', text: 'hi' })),
}));

const rushMock = vi.hoisted(() => ({
  recordRushRequest: vi.fn(),
  resolveRushRequest: vi.fn(),
  RUSH_LEAD_TAG: 'rush',
}));
vi.mock('@/lib/leads/rush-request', () => rushMock);

const sheetMock = vi.hoisted(() => ({ mirrorLeadToSheet: vi.fn() }));
vi.mock('@/lib/premier/pod-leads-sheet', () => sheetMock);

const crmMock = vi.hoisted(() => ({ mirrorLeadToCrm: vi.fn() }));
vi.mock('@/lib/leads/crm-mirror', () => crmMock);

import { POST } from '../route';
import { LEAD_TIME_MESSAGE, QUOTE_CHECKOUT_RUNWAY_HOURS, meetsLeadTime } from '@/lib/delivery/lead-time';

const NOW = new Date('2026-09-16T20:00:00.000Z');
const HOUR = 60 * 60 * 1000;

function request(overrides: Record<string, unknown> = {}): NextRequest {
  return new NextRequest('http://localhost/api/v1/quote/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Sam',
      email: 'sam@example.com',
      phone: '512-555-0100',
      partyType: 'bachelorette',
      headcount: 12,
      deliveryDate: '2026-09-23',
      source: 'package-builder',
      ...overrides,
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  throttleMock.allowLeadCaptureIp.mockResolvedValue(true);
  throttleMock.allowLeadCaptureEmail.mockResolvedValue(true);
  leadCaptureMock.upsertLead.mockResolvedValue({ id: 'lead-1', metadata: null, tags: [] });
  leadCaptureMock.recordEvent.mockResolvedValue(undefined);
  prismaMock.lead.update.mockResolvedValue({ id: 'lead-1' });
  prismaMock.product.findMany.mockResolvedValue([]);
  serviceMock.createDashboardOrder.mockResolvedValue({
    shareCode: 'ABC123',
    participants: [{ id: 'host-1', isHost: true }],
    tabs: [{ id: 'tab-1' }],
  });
  emailMock.sendEmail.mockResolvedValue('resend-id');
  rushMock.recordRushRequest.mockResolvedValue(undefined);
  rushMock.resolveRushRequest.mockResolvedValue(undefined);
  sheetMock.mirrorLeadToSheet.mockResolvedValue(undefined);
  crmMock.mirrorLeadToCrm.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('POST /api/v1/quote/start — 24-hour minimum', () => {
  it('opens a week-out dashboard on the usual midday window', async () => {
    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, shareCode: 'ABC123', redirectTo: '/dashboard/ABC123' });
    expect(body).not.toHaveProperty('isLastMinute');
    const input = serviceMock.createDashboardOrder.mock.calls[0][0];
    expect(input).toMatchObject({ deliveryDate: '2026-09-23', deliveryTime: '12:00 PM - 2:00 PM' });
    // The deep-stock menu is an ops-only switch now; quotes never set it.
    expect(input).not.toHaveProperty('isLastMinute');
    expect(rushMock.recordRushRequest).not.toHaveBeenCalled();
    expect(rushMock.resolveRushRequest).not.toHaveBeenCalled();
    expect(emailMock.sendEmail).toHaveBeenCalledTimes(1); // the welcome email
  });

  it('opens tomorrow on a window that leaves hours to pay, not a dead noon slot', async () => {
    const res = await POST(request({ deliveryDate: '2026-09-17' }));

    expect(res.status).toBe(200);
    const window = serviceMock.createDashboardOrder.mock.calls[0][0].deliveryTime;
    expect(window).toBe('6:00 PM - 6:30 PM');
    expect(
      meetsLeadTime('2026-09-17', window, new Date(NOW.getTime() + QUOTE_CHECKOUT_RUNWAY_HOURS * HOUR)),
    ).toBe(true);
    expect(rushMock.recordRushRequest).not.toHaveBeenCalled();
  });

  it("falls back to tomorrow's last window once the full runway no longer fits", async () => {
    vi.setSystemTime(new Date('2026-09-17T00:00:00.000Z')); // Wed 7:00 PM CDT

    const res = await POST(request({ deliveryDate: '2026-09-17' }));

    expect(res.status).toBe(200);
    expect(serviceMock.createDashboardOrder.mock.calls[0][0].deliveryTime).toBe('8:30 PM - 9:00 PM');
  });

  it('refuses today: keeps the lead, flags the rush, builds nothing', async () => {
    const res = await POST(request({ deliveryDate: '2026-09-16' }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body).toEqual({ ok: false, code: 'DELIVERY_TOO_SOON', error: LEAD_TIME_MESSAGE });
    expect(leadCaptureMock.upsertLead).toHaveBeenCalledTimes(1);
    expect(rushMock.recordRushRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: 'lead-1',
        source: 'package-builder',
        deliveryDate: '2026-09-16',
        firstName: 'Sam',
        email: 'sam@example.com',
        phone: '512-555-0100',
      }),
    );
    expect(serviceMock.createDashboardOrder).not.toHaveBeenCalled();
    expect(emailMock.sendEmail).not.toHaveBeenCalled();
    // Still mirrored, so the sheet and CRM see every captured lead.
    expect(sheetMock.mirrorLeadToSheet).toHaveBeenCalledWith(
      expect.objectContaining({ notes: expect.stringContaining('24-hour minimum') }),
    );
  });

  it('refuses tomorrow late in the evening, once none of its windows clear 24h', async () => {
    vi.setSystemTime(new Date('2026-09-17T01:31:00.000Z')); // Wed 8:31 PM CDT

    const res = await POST(request({ deliveryDate: '2026-09-17' }));

    expect(res.status).toBe(422);
    expect(rushMock.recordRushRequest).toHaveBeenCalledTimes(1);
    expect(serviceMock.createDashboardOrder).not.toHaveBeenCalled();
  });

  it('refuses a past day without paging the operator', async () => {
    const res = await POST(request({ deliveryDate: '2026-09-10' }));

    expect(res.status).toBe(422);
    expect(rushMock.recordRushRequest).not.toHaveBeenCalled();
    expect(serviceMock.createDashboardOrder).not.toHaveBeenCalled();
  });

  it('rejects an impossible calendar date before writing anything', async () => {
    // Shaped like a date, but date math would roll it forward to Mar 2.
    const res = await POST(request({ deliveryDate: '2027-02-30' }));

    expect(res.status).toBe(400);
    expect(leadCaptureMock.upsertLead).not.toHaveBeenCalled();
    expect(rushMock.recordRushRequest).not.toHaveBeenCalled();
    expect(serviceMock.createDashboardOrder).not.toHaveBeenCalled();
  });

  it('clears an earlier rush flag once the same lead books a bookable day', async () => {
    leadCaptureMock.upsertLead.mockResolvedValue({ id: 'lead-1', metadata: null, tags: ['rush'] });

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(rushMock.resolveRushRequest).toHaveBeenCalledWith('lead-1', {
      email: 'sam@example.com',
      phone: '512-555-0100',
    });
  });
});
