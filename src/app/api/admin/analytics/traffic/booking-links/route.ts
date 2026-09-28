import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth/ops-session';
import { BOOKING_LINK_WINDOW_DAYS, getBookingLinkClicks } from '@/lib/analytics/booking-link-clicks';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/traffic/booking-links
 *
 * Redirect "clicks" on the 123.partyondelivery.com short links (/boat-call,
 * /planning-call, /partnership-call, /reviews, /free-quote,
 * /general-info-page-page and trailing-period variants) for the last 30 days,
 * per link and per day, split human vs bot. See
 * `src/lib/analytics/booking-link-clicks.ts` for how rows are attributed to that
 * host without a host column.
 *
 * Fixed window on purpose: the panel answers "are the links being used this
 * month", independent of the page's 7/30/90 selector.
 */
export async function GET(): Promise<NextResponse> {
  // /api/admin/** is not covered by middleware, so this handler gates itself.
  // Admin role (a superset of requireOpsAuth: session required AND role=admin),
  // matching the sibling /api/admin/analytics/traffic route — the nav-level
  // admin restriction is only a client-side redirect.
  const auth = await requireAdminRole();
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await getBookingLinkClicks(BOOKING_LINK_WINDOW_DAYS);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[admin/analytics/traffic/booking-links]', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
