/**
 * Tests for GET /api/admin/analytics/traffic/booking-links.
 *
 * `/api/admin/**` is NOT covered by middleware, so the handler's own admin gate
 * is the only thing between the internet and this data — it must refuse before
 * any query runs.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextResponse } from 'next/server';

const requireAdminRoleMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/ops-session', () => ({ requireAdminRole: requireAdminRoleMock }));

const getBookingLinkClicksMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/analytics/booking-link-clicks', () => ({
  BOOKING_LINK_WINDOW_DAYS: 30,
  getBookingLinkClicks: getBookingLinkClicksMock,
}));

import { GET } from '../route';

describe('GET /api/admin/analytics/traffic/booking-links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminRoleMock.mockResolvedValue({ role: 'admin' });
    getBookingLinkClicksMock.mockResolvedValue({
      days: 30,
      links: [],
      totals: { human: 3, bot: 1, total: 4 },
      truncated: false,
    });
  });

  it('refuses an unauthenticated or non-admin caller without querying', async () => {
    requireAdminRoleMock.mockResolvedValue(
      NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    );

    const res = await GET();

    expect(res.status).toBe(401);
    expect(getBookingLinkClicksMock).not.toHaveBeenCalled();
  });

  it('returns the 30-day report', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(getBookingLinkClicksMock).toHaveBeenCalledWith(30);
    expect(body.data.totals).toEqual({ human: 3, bot: 1, total: 4 });
  });

  it('returns 500 without leaking the error when the query fails', async () => {
    getBookingLinkClicksMock.mockRejectedValue(new Error('relation "vercel_events" does not exist'));
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('vercel_events');
  });
});
