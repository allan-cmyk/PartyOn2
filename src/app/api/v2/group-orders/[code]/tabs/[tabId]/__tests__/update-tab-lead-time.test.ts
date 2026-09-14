/**
 * PATCH tab — 24-hour lead-time gate on the delivery-window WRITE.
 *
 * The checkout routes gate payment, but the date itself is set here; without
 * this gate a participant could pay against a compliant date and then move
 * the tab to "in two hours" (the #527 ops-blindside, minus even the
 * cancellation signal). Rule: a change may never leave the window inside
 * 24 hours UNLESS the window was already inside 24 hours and the change
 * pushes it LATER — that rescue is what makes a stale dashboard orderable
 * again.
 *
 * The clock is pinned (Wed 2026-09-16, 3:00 PM CDT) so every case is
 * deterministic: relative dates here would flip outcomes by hour of day and
 * hit the schema's Sunday refinement one day in seven.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const serviceMock = vi.hoisted(() => ({
  getGroupOrderByCode: vi.fn(),
  getParticipantById: vi.fn(),
  isParticipantHost: vi.fn(),
  isActiveParticipant: vi.fn(),
  updateTab: vi.fn(),
  deleteTab: vi.fn(),
}));

vi.mock('@/lib/group-orders-v2/service', () => serviceMock);

import { PATCH } from '../route';

const PARAMS = { params: Promise.resolve({ code: 'ABC123', tabId: 'tab-1' }) };

// Wed 2026-09-16 15:00 CDT (20:00Z). Thu 17th noon is 21h out (too soon);
// Thu 17th 4 PM is 25h out (compliant); none of the dates used is a Sunday.
const NOW = new Date('2026-09-16T20:00:00.000Z');

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new Request('http://localhost/api/v2/group-orders/ABC123/tabs/tab-1', {
    method: 'PATCH',
    body: JSON.stringify({ participantId: 'p1', ...body }),
  }) as unknown as NextRequest;
}

function group(tabOverrides: Record<string, unknown> = {}) {
  return {
    id: 'g1',
    shareCode: 'ABC123',
    status: 'ACTIVE',
    tabs: [
      {
        id: 'tab-1',
        status: 'OPEN',
        deliveryDate: '2026-10-16T12:00:00.000Z', // a Friday, a month out
        deliveryDateConfirmed: true,
        deliveryTime: '12:00 PM - 2:00 PM',
        ...tabOverrides,
      },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  serviceMock.isActiveParticipant.mockResolvedValue(true);
  serviceMock.isParticipantHost.mockResolvedValue(true);
  serviceMock.updateTab.mockResolvedValue({ id: 'tab-1' });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PATCH tab — delivery-window lead-time gate', () => {
  it('refuses pulling a compliant tab inside 24 hours', async () => {
    serviceMock.getGroupOrderByCode.mockResolvedValue(group());

    // Tomorrow at noon — 21 hours out.
    const res = await PATCH(
      makeRequest({ deliveryDate: '2026-09-17', deliveryTime: '12:00 PM - 2:00 PM' }),
      PARAMS,
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('DELIVERY_DATE_TOO_SOON');
    expect(serviceMock.updateTab).not.toHaveBeenCalled();
  });

  it('refuses a time-only change that lands inside 24h (date unchanged)', async () => {
    // Tab already tomorrow 8 PM (29h out, compliant); pulling only the TIME
    // back to 10 AM (19h) must not slip past the gate.
    serviceMock.getGroupOrderByCode.mockResolvedValue(
      group({ deliveryDate: '2026-09-17T12:00:00.000Z', deliveryTime: '8:00 PM - 9:00 PM' }),
    );

    const res = await PATCH(makeRequest({ deliveryTime: '10:00 AM - 11:00 AM' }), PARAMS);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe('DELIVERY_DATE_TOO_SOON');
    expect(serviceMock.updateTab).not.toHaveBeenCalled();
  });

  it('allows rescuing an already-too-soon window by pushing it LATER', async () => {
    // Tab is tomorrow 10 AM (19h out — inside the cutoff). Moving it to
    // tomorrow 8 PM is still inside 24h, but LATER — the rescue must pass.
    serviceMock.getGroupOrderByCode.mockResolvedValue(
      group({ deliveryDate: '2026-09-17T12:00:00.000Z', deliveryTime: '10:00 AM - 11:00 AM' }),
    );

    const res = await PATCH(makeRequest({ deliveryTime: '8:00 PM - 9:00 PM' }), PARAMS);

    expect(res.status).toBe(200);
    expect(serviceMock.updateTab).toHaveBeenCalledOnce();
  });

  it('allows a normal far-future date change', async () => {
    serviceMock.getGroupOrderByCode.mockResolvedValue(group());

    const res = await PATCH(
      makeRequest({ deliveryDate: '2026-10-23', deliveryTime: '12:00 PM - 2:00 PM' }),
      PARAMS,
    );

    expect(res.status).toBe(200);
    expect(serviceMock.updateTab).toHaveBeenCalledOnce();
  });

  it('leaves non-date updates alone', async () => {
    serviceMock.getGroupOrderByCode.mockResolvedValue(group());

    const res = await PATCH(makeRequest({ deliveryNotes: 'gate code 4411' }), PARAMS);

    expect(res.status).toBe(200);
    expect(serviceMock.updateTab).toHaveBeenCalledOnce();
  });
});
