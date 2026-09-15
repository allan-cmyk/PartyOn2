/**
 * chat/submit holds the 24-hour minimum (ADR-0010) at the contact step.
 *
 * The chat is a two-request flow (chat/submit, then quote/start). Refusing a
 * day with no bookable window HERE — after the lead is saved — means the
 * customer sees the call/text message right away instead of a recommendation
 * the next step would turn away, and the operator still hears about the rush.
 *
 * Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z).
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

const prismaMock = vi.hoisted(() => ({ lead: { update: vi.fn() } }));
vi.mock('@/lib/database/client', () => ({ prisma: prismaMock }));

const recMock = vi.hoisted(() => ({ recommendForChat: vi.fn() }));
vi.mock('@/lib/chat/recommendation', () => recMock);

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

import { POST } from '../submit/route';
import { LEAD_TIME_MESSAGE } from '@/lib/delivery/lead-time';

const NOW = new Date('2026-09-16T20:00:00.000Z');

function request(deliveryDate: string): NextRequest {
  return new NextRequest('http://localhost/api/v1/chat/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Codie',
      email: 'codie@example.com',
      phone: '512-555-0101',
      partyType: 'hotel',
      headcount: 13,
      deliveryDate,
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
  recMock.recommendForChat.mockResolvedValue({ items: [] });
  rushMock.recordRushRequest.mockResolvedValue(undefined);
  rushMock.resolveRushRequest.mockResolvedValue(undefined);
  sheetMock.mirrorLeadToSheet.mockResolvedValue(undefined);
  crmMock.mirrorLeadToCrm.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('POST /api/v1/chat/submit — 24-hour minimum', () => {
  it('refuses today after saving the lead, and flags the rush', async () => {
    const res = await POST(request('2026-09-16'));

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      code: 'DELIVERY_TOO_SOON',
      error: LEAD_TIME_MESSAGE,
    });
    expect(leadCaptureMock.upsertLead).toHaveBeenCalledTimes(1);
    expect(rushMock.recordRushRequest).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: 'lead-1', source: 'chat', deliveryDate: '2026-09-16' }),
    );
    // No recommendation for an order the next step would refuse.
    expect(recMock.recommendForChat).not.toHaveBeenCalled();
    expect(crmMock.mirrorLeadToCrm).toHaveBeenCalledTimes(1);
  });

  it('recommends for tomorrow while an afternoon window still clears 24h', async () => {
    const res = await POST(request('2026-09-17'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body).not.toHaveProperty('isLastMinute');
    expect(recMock.recommendForChat).toHaveBeenCalledTimes(1);
    expect(rushMock.recordRushRequest).not.toHaveBeenCalled();
    expect(rushMock.resolveRushRequest).not.toHaveBeenCalled();
  });

  it('refuses a stale past day without paging the operator', async () => {
    const res = await POST(request('2026-09-01'));

    expect(res.status).toBe(422);
    expect(rushMock.recordRushRequest).not.toHaveBeenCalled();
  });

  it('rejects an impossible calendar date before writing a lead', async () => {
    const res = await POST(request('2027-02-30'));

    expect(res.status).toBe(400);
    expect(leadCaptureMock.upsertLead).not.toHaveBeenCalled();
    expect(rushMock.recordRushRequest).not.toHaveBeenCalled();
  });

  it('clears an earlier rush flag once the same lead picks a bookable day', async () => {
    leadCaptureMock.upsertLead.mockResolvedValue({ id: 'lead-1', metadata: null, tags: ['rush'] });

    const res = await POST(request('2026-09-23'));

    expect(res.status).toBe(200);
    expect(rushMock.resolveRushRequest).toHaveBeenCalledWith('lead-1', {
      email: 'codie@example.com',
      phone: '512-555-0101',
    });
  });
});
