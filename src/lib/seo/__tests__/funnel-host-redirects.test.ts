/**
 * Pins the 123.partyondelivery.com / info.partyondelivery.com redirect map.
 *
 * These links are in customers' hands (texts, emails, flyers, the Instagram
 * bio), so a mistyped Google schedule ID or a catch-all moved above a real
 * rule would silently break bookings. The expected URLs are written out in
 * full here on purpose: the module and this test must both change to move a
 * booking page.
 */
import { describe, expect, it } from 'vitest';
// The same compiler Next.js uses to turn `redirects()` into the routes
// manifest Vercel serves, so matching here mirrors production.
import { buildCustomRoute } from 'next/dist/lib/build-custom-route';
import type { Redirect } from 'next/dist/lib/load-custom-routes';
import nextConfig from '../../../../next.config';
import {
  BOOKING_PAGES,
  DEAD_LINK_REDIRECTS,
  FUNNEL_HOST,
  FUNNEL_HOST_REDIRECTS,
  GOOGLE_REVIEW_FORM_URL,
  INFO_HOST,
  INFO_HOST_REDIRECTS,
} from '../funnel-host-redirects';

const BOAT =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0A5IpzCavw3gYFKYBSqqdRr1DyaiX4ietgCDLgg20EKhpPu7gdrsrJM5P5zlC8Z6-9JQq5g-Fb';
const PLANNING =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1LJme7vhebZTdmWQ0dvKFd7CUquhr8bmXkgH7KMRDuKeY8PDETRMJx4utUhg6zBIt0SguTVRrW';
const PARTNERSHIP =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0pjDaVscvHzyhes4RkjsBbx6fn5EjFmCzJypDCBU_qRv2vgC4uuYuLcRdDzap9zeGhAbldL8iE';
const REVIEW = 'https://g.page/r/CWO9-KA4uBqaEAE/review';
const HOME = 'https://partyondelivery.com/';

interface Resolved {
  destination: string;
  status: number;
}

/** First-match resolution, the way Next/Vercel apply redirect rules. */
type AnyRedirect = Redirect;

function resolve(rules: AnyRedirect[], host: string, path: string): Resolved | null {
  for (const rule of rules) {
    // Only host conditions are modelled; any other `has` condition can't match
    // here. Test paths carry no query string, so a `missing` query condition is
    // always satisfied (e.g. /products → /order unless ?search=).
    if (rule.has?.some((h) => h.type !== 'host' || h.value !== host)) continue;
    if (rule.missing?.some((m) => m.type !== 'query')) continue;
    const built = buildCustomRoute('redirect', rule, ['/_next']) as {
      regex: string;
      statusCode: number;
    };
    if (new RegExp(built.regex, 'i').test(path)) {
      return { destination: rule.destination, status: built.statusCode };
    }
  }
  return null;
}

describe('booking page constants', () => {
  it('match the live Google appointment schedules exactly', () => {
    expect(BOOKING_PAGES).toEqual({ boatCall: BOAT, planningCall: PLANNING, partnershipCall: PARTNERSHIP });
    expect(GOOGLE_REVIEW_FORM_URL).toBe(REVIEW);
  });
});

describe('123.partyondelivery.com', () => {
  const cases: Array<[string, string, number]> = [
    ['/boat-call', BOAT, 308],
    ['/Boat-Call', BOAT, 308],
    ['/boat-call.', BOAT, 308],
    ['/planning-call', PLANNING, 308],
    ['/partnership-call', PARTNERSHIP, 308],
    ['/reviews', REVIEW, 308],
    ['/reviews.', REVIEW, 308],
    ['/free-quote', 'https://partyondelivery.com/plan-event', 307],
    ['/general-info-page-page', PLANNING, 307],
    ['/holiday-cocktails', 'https://partyondelivery.com/cocktail-kits', 307],
    ['/', HOME, 307],
    ['/some-old-funnel-page', HOME, 307],
    ['/boat-call-extra', HOME, 307],
  ];

  it.each(cases)('%s → %s (%i)', (path, destination, status) => {
    expect(resolve(FUNNEL_HOST_REDIRECTS, FUNNEL_HOST, path)).toEqual({ destination, status });
  });

  it('every rule is scoped to the host and the catch-all is last', () => {
    for (const rule of FUNNEL_HOST_REDIRECTS) {
      expect(rule.has).toEqual([{ type: 'host', value: FUNNEL_HOST }]);
    }
    const catchAll = FUNNEL_HOST_REDIRECTS.findIndex((r) => r.source === '/:path*');
    expect(catchAll).toBe(FUNNEL_HOST_REDIRECTS.length - 1);
  });
});

describe('info.partyondelivery.com', () => {
  const cases: Array<[string, string, number]> = [
    ['/widget/bookings/pod-partnerships', PARTNERSHIP, 308],
    ['/widget/booking/Ney4qFhSbziV2uOz9O6S', PARTNERSHIP, 308],
    ['/widget/bookings/pod-boat-cruise-call', BOAT, 308],
    ['/widget/booking/yQkEdXRNRmYnA6yD2LFs', BOAT, 308],
    ['/l/abc123', HOME, 307],
    ['/', HOME, 307],
  ];

  it.each(cases)('%s → %s (%i)', (path, destination, status) => {
    expect(resolve(INFO_HOST_REDIRECTS, INFO_HOST, path)).toEqual({ destination, status });
  });

  it('every rule is scoped to the host and the catch-all is last', () => {
    for (const rule of INFO_HOST_REDIRECTS) {
      expect(rule.has).toEqual([{ type: 'host', value: INFO_HOST }]);
    }
    expect(INFO_HOST_REDIRECTS.at(-1)?.source).toBe('/:path*');
  });
});

describe('next.config.ts redirects()', () => {
  it('puts every host-scoped rule before any other rule', async () => {
    const all = await nextConfig.redirects!();
    const hostScoped = [...FUNNEL_HOST_REDIRECTS, ...INFO_HOST_REDIRECTS];
    expect(all.slice(0, hostScoped.length)).toEqual(hostScoped);
    // No other rule anywhere is scoped to these hosts.
    const strays = all
      .slice(hostScoped.length)
      .filter((r) => r.has?.some((h) => h.value === FUNNEL_HOST || h.value === INFO_HOST));
    expect(strays).toEqual([]);
  });

  it('routes main-domain /review and /cart, and never lets them leak onto the funnel hosts', async () => {
    const all = await nextConfig.redirects!();
    expect(resolve(all, 'partyondelivery.com', '/review')).toEqual({ destination: REVIEW, status: 308 });
    expect(resolve(all, 'partyondelivery.com', '/cart')).toEqual({ destination: '/order', status: 307 });
    expect(resolve(all, 'partyondelivery.com', '/cart/shared/abc')).toBeNull();
    expect(resolve(all, 'partyondelivery.com', '/reviews')).toBeNull();
    expect(resolve(all, 'partyondelivery.com', '/boat-call')).toBeNull();
    expect(resolve(all, FUNNEL_HOST, '/cart')).toEqual({ destination: HOME, status: 307 });
    expect(DEAD_LINK_REDIRECTS.every((r) => r.has === undefined)).toBe(true);
  });
});
