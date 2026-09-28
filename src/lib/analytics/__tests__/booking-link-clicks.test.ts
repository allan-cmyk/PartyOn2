/**
 * Tests for the booking-link click report.
 *
 * `vercel_events` has no host column, so the report relies on the rule that
 * these exact paths only ever answer 307/308 on 123.partyondelivery.com. The
 * cases that would break that rule — main-domain trailing-slash normalisation
 * of `/reviews/`, the real `/reviews` page's 200s, the www 301 — are pinned
 * here, along with the human/bot split, which must match the page-view
 * classifier exactly.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const findManyMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/database/client', () => ({
  prisma: { vercelEvent: { findMany: findManyMock } },
  kv: {},
  isKVConfigured: () => false,
}));

import {
  BOOKING_LINKS,
  BOOKING_LINK_ROW_CAP,
  aggregateBookingLinkClicks,
  buildBookingLinkWhere,
  getBookingLinkClicks,
  isBookingLinkClick,
  isBotRequest,
  type BookingLinkEventRow,
} from '../booking-link-clicks';

const CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

// Noon UTC = 7am Central — the same calendar day in both zones.
const NOW = new Date('2026-09-28T12:00:00Z');

let seq = 0;
function row(overrides: Partial<BookingLinkEventRow>): BookingLinkEventRow {
  seq += 1;
  return {
    id: `row-${seq}`,
    vercelId: `v-${seq}`,
    timestamp: new Date('2026-09-27T18:00:00Z'),
    path: '/boat-call',
    statusCode: 308,
    method: 'GET',
    userAgent: IPHONE,
    isDatacenter: false,
    ...overrides,
  };
}

function linkFor(report: ReturnType<typeof aggregateBookingLinkClicks>, path: string) {
  const link = report.links.find((l) => l.path === path);
  if (!link) throw new Error(`no row for ${path}`);
  return link;
}

describe('aggregateBookingLinkClicks', () => {
  it('counts 307 and 308 redirects per link, split human vs bot', () => {
    const report = aggregateBookingLinkClicks(
      [
        row({ path: '/boat-call', userAgent: IPHONE }),
        row({ path: '/boat-call', userAgent: CHROME }),
        row({ path: '/boat-call', userAgent: GOOGLEBOT }),
        row({ path: '/reviews', userAgent: IPHONE }),
        // /free-quote still falls through to the 307 homepage catch-all.
        row({ path: '/free-quote', statusCode: 307, userAgent: CHROME }),
        row({ path: '/reviews.', statusCode: 307, userAgent: IPHONE }),
      ],
      30,
      NOW
    );

    expect(linkFor(report, '/boat-call')).toMatchObject({ human: 2, bot: 1, total: 3 });
    expect(linkFor(report, '/reviews')).toMatchObject({ human: 1, bot: 0, total: 1 });
    expect(linkFor(report, '/free-quote')).toMatchObject({ human: 1, bot: 0, total: 1 });
    expect(linkFor(report, '/reviews.')).toMatchObject({ human: 1, bot: 0, total: 1 });
    expect(report.totals).toEqual({ human: 5, bot: 1, total: 6 });
  });

  it('does NOT count the main-domain trailing-slash 308 of /reviews/', () => {
    // Next.js answers /reviews/ with a 308 to /reviews on every host. Ingest
    // stores the requested path, so it lands as "/reviews/" — never "/reviews".
    const report = aggregateBookingLinkClicks(
      [row({ path: '/reviews/', statusCode: 308 }), row({ path: '/boat-call/', statusCode: 308 })],
      30,
      NOW
    );
    expect(report.totals.total).toBe(0);
    expect(linkFor(report, '/reviews').total).toBe(0);
  });

  it('ignores the real /reviews page views and the www 301', () => {
    const report = aggregateBookingLinkClicks(
      [
        row({ path: '/reviews', statusCode: 200 }),
        row({ path: '/reviews', statusCode: 304 }),
        row({ path: '/reviews', statusCode: 301 }),
        row({ path: '/boat-call', statusCode: 404 }),
      ],
      30,
      NOW
    );
    expect(report.totals.total).toBe(0);
  });

  it('ignores other paths, HEAD requests and near-miss spellings', () => {
    const report = aggregateBookingLinkClicks(
      [
        row({ path: '/' }),
        row({ path: '/general-info-page-page', statusCode: 307 }),
        row({ path: '/Reviews' }),
        row({ path: '/reviews-page' }),
        row({ path: '/boat-call', method: 'HEAD' }),
        row({ path: null }),
      ],
      30,
      NOW
    );
    expect(report.totals.total).toBe(0);
  });

  it('keeps a row with no recorded method rather than guessing it away', () => {
    const report = aggregateBookingLinkClicks([row({ method: null })], 30, NOW);
    expect(report.totals.total).toBe(1);
  });

  it('classifies bots exactly like the page-view split: bot UA, missing UA, or datacenter IP', () => {
    const report = aggregateBookingLinkClicks(
      [
        row({ userAgent: GOOGLEBOT }),
        row({ userAgent: null }),
        row({ userAgent: CHROME, isDatacenter: true }),
        // NULL flag = ingested before the flag existed — not invented as a bot.
        row({ userAgent: CHROME, isDatacenter: null }),
        row({ userAgent: IPHONE, isDatacenter: false }),
      ],
      30,
      NOW
    );
    expect(linkFor(report, '/boat-call')).toMatchObject({ human: 2, bot: 3, total: 5 });
  });

  it('collapses re-delivered drain lines on vercelId, falling back to id', () => {
    const report = aggregateBookingLinkClicks(
      [
        row({ id: 'a', vercelId: 'dup' }),
        row({ id: 'b', vercelId: 'dup' }),
        row({ id: 'c', vercelId: null }),
      ],
      30,
      NOW
    );
    expect(report.totals.total).toBe(2);
  });

  it('buckets by Central-time day, zero-fills, and keeps totals equal to the daily sum', () => {
    const report = aggregateBookingLinkClicks(
      [
        // 03:00 UTC on the 27th is 10pm on the 26th in Austin.
        row({ timestamp: new Date('2026-09-27T03:00:00Z') }),
        row({ timestamp: new Date('2026-09-28T11:00:00Z'), userAgent: GOOGLEBOT }),
        // Before the 3-day window's first day — dropped, not silently totalled.
        row({ timestamp: new Date('2026-09-20T18:00:00Z') }),
      ],
      3,
      NOW
    );

    const boat = linkFor(report, '/boat-call');
    expect(boat.daily).toEqual([
      { day: '2026-09-26', human: 1, bot: 0 },
      { day: '2026-09-27', human: 0, bot: 0 },
      { day: '2026-09-28', human: 0, bot: 1 },
    ]);
    expect(boat).toMatchObject({ human: 1, bot: 1, total: 2 });
    expect(report.totals.total).toBe(2);
  });

  it('always returns every tracked link, in display order, even with no rows', () => {
    const report = aggregateBookingLinkClicks([], 30, NOW);
    expect(report.links.map((l) => l.path)).toEqual(BOOKING_LINKS.map((l) => l.path));
    expect(report.links.every((l) => l.daily.length === 30 && l.total === 0)).toBe(true);
    expect(report.truncated).toBe(false);
  });
});

describe('buildBookingLinkWhere', () => {
  it('matches paths exactly — a prefix match would count main-domain /reviews/', () => {
    const since = new Date('2026-08-28T00:00:00Z');
    const where = buildBookingLinkWhere(since);

    expect(where.timestamp).toEqual({ gte: since });
    expect(where.path).toEqual({ in: BOOKING_LINKS.map((l) => l.path) });
    expect(where.statusCode).toEqual({ in: [307, 308] });
    expect(where.OR).toEqual([{ method: 'GET' }, { method: null }]);
  });
});

describe('isBookingLinkClick / isBotRequest', () => {
  it('agree with the query filter and the SQL bot condition', () => {
    expect(isBookingLinkClick(row({}))).toBe(true);
    expect(isBookingLinkClick(row({ statusCode: 302 }))).toBe(false);
    expect(isBotRequest({ userAgent: IPHONE, isDatacenter: null })).toBe(false);
    expect(isBotRequest({ userAgent: 'curl/8.4.0', isDatacenter: false })).toBe(true);
  });
});

describe('getBookingLinkClicks', () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it('reads with the exact-match filter, newest first, capped', async () => {
    findManyMock.mockResolvedValue([row({ timestamp: new Date() })]);

    const report = await getBookingLinkClicks(30);

    const args = findManyMock.mock.calls[0][0];
    expect(args.where.path).toEqual({ in: BOOKING_LINKS.map((l) => l.path) });
    expect(args.orderBy).toEqual({ timestamp: 'desc' });
    expect(args.take).toBe(BOOKING_LINK_ROW_CAP);
    expect(report.totals.total).toBe(1);
    expect(report.truncated).toBe(false);
  });

  it('flags the report when the row cap was hit', async () => {
    findManyMock.mockResolvedValue(
      Array.from({ length: BOOKING_LINK_ROW_CAP }, () => row({ timestamp: new Date() }))
    );
    const report = await getBookingLinkClicks(30);
    expect(report.truncated).toBe(true);
  });
});
