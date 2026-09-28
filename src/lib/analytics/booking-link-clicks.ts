/**
 * Booking link clicks — how often the 123.partyondelivery.com short links fire.
 *
 * 123.partyondelivery.com is a redirect-only host (host-scoped rules at the top
 * of `redirects()` in next.config.ts): /boat-call, /planning-call and
 * /partnership-call 308 to Google Calendar booking pages, /reviews 308s to the
 * Google review form, and anything else 307s to the homepage. Those links live
 * on flyers, emails, CRM texts and lander CTAs, so a redirect response on one of
 * them is the closest thing we have to a "click" count. Page-view reporting
 * (vercel-events.ts) only counts 200/304, so these never showed up anywhere.
 *
 * HOW WE KNOW A ROW CAME FROM THE 123 HOST — there is no host column.
 * `vercel_events` does not record the request host: the drain's `toEvent()`
 * (src/app/api/webhooks/vercel-drain/route.ts) never reads `proxy.host`, and
 * adding a column is a schema change this report deliberately does not make.
 * Instead it leans on a property of our own routing: on every OTHER domain
 * attached to the project (partyondelivery.com, www.partyondelivery.com,
 * party-on2.vercel.app — Vercel's domain list, checked 2026-09-28, has no
 * domain-level redirect on any of them) these exact paths never answer 307/308:
 *
 * - /boat-call, /planning-call, /partnership-call, /free-quote and the
 *   trailing-period variants have no page and no main-domain redirect rule,
 *   so they 404 there.
 * - /reviews is a real page on the main domain, so it answers 200/304.
 * - www.* is sent to the apex by middleware with a 301, which the status
 *   filter below excludes.
 * - Trailing-slash normalisation: Next.js 308s `/reviews/` → `/reviews` on any
 *   host. Ingest stores the path that was REQUESTED — it only strips the query
 *   string and collapses repeated slashes (`redactPath`), it never trims a
 *   trailing slash — so that response is stored as `/reviews/`. Matching is by
 *   exact equality (Prisma `in`, never `startsWith`/`contains`), so it cannot
 *   be counted. On the 123 host the same `/reviews/` request logs two lines,
 *   `/reviews/` 308 (excluded) then `/reviews` 308 (counted): one click, once.
 *
 * Residual risk, accepted: `redactPath` collapses `//reviews` to `/reviews` at
 * ingest, so if the main domain ever answers a double-slash request with a
 * redirect it would be counted here. Only scanners send those. And if someone
 * later adds a main-domain redirect for one of these exact paths, this report
 * would silently start counting it — the real fix then is storing the host at
 * ingest.
 */

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import {
  BOT_UA_REGEX,
  REPORTING_TIME_ZONE,
  fillDailySeries,
  type DailyTraffic,
} from '@/lib/analytics/vercel-events';

/** One tracked short link on the 123 host. */
export interface BookingLinkDefinition {
  /** Exact stored path (case- and slash-sensitive). */
  path: string;
  /** What the link is for, in plain words. */
  label: string;
}

/**
 * The tracked short links, in display order.
 *
 * The trailing-period variants exist because a link typed at the end of a
 * sentence ("book here: 123.partyondelivery.com/reviews.") is often linkified
 * WITH the period. `/free-quote` and the variants fall through to the 307
 * homepage catch-all until their own rules ship; both statuses are counted, so
 * the report is right before and after.
 */
export const BOOKING_LINKS: readonly BookingLinkDefinition[] = [
  { path: '/boat-call', label: 'Boat call booking' },
  { path: '/planning-call', label: 'Planning call booking' },
  { path: '/partnership-call', label: 'Partnership call booking' },
  { path: '/reviews', label: 'Google review form' },
  { path: '/free-quote', label: 'Free quote' },
  { path: '/reviews.', label: 'Review link typed with a trailing period' },
  { path: '/boat-call.', label: 'Boat call link typed with a trailing period' },
];

/** 308 = `permanent: true` rules, 307 = the homepage catch-all. 301 (www) is excluded on purpose. */
export const REDIRECT_STATUS_CODES: readonly number[] = [307, 308];

/** The report's fixed window, in Central-time calendar days (today included). */
export const BOOKING_LINK_WINDOW_DAYS = 30;

/**
 * Most rows one report will read. Real volume is tens to hundreds a month; the
 * cap only stops a bot flood from pulling an unbounded result into memory. The
 * newest rows are kept, and the report says when it was hit.
 */
export const BOOKING_LINK_ROW_CAP = 20_000;

/** The `vercel_events` columns the report reads. */
export interface BookingLinkEventRow {
  id: string;
  vercelId: string | null;
  timestamp: Date;
  path: string | null;
  statusCode: number | null;
  method: string | null;
  userAgent: string | null;
  isDatacenter: boolean | null;
}

/** Clicks on one short link. */
export interface BookingLinkPathReport extends BookingLinkDefinition {
  human: number;
  bot: number;
  total: number;
  /** One entry per Central-time day of the window, oldest first, zero-filled. */
  daily: DailyTraffic[];
}

/** The whole panel's data. */
export interface BookingLinkClickReport {
  days: number;
  /** Every tracked link, in BOOKING_LINKS order — zero rows included. */
  links: BookingLinkPathReport[];
  totals: { human: number; bot: number; total: number };
  /** True when BOOKING_LINK_ROW_CAP was hit, so the oldest days may be short. */
  truncated: boolean;
}

const TRACKED_PATHS = new Set(BOOKING_LINKS.map((l) => l.path));
const botUserAgent = new RegExp(BOT_UA_REGEX, 'i');
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: REPORTING_TIME_ZONE });

/**
 * Prisma filter for candidate rows. Exact `in` matches only — see the header
 * for why a prefix match would count main-domain `/reviews/` normalisation.
 * GET plus unknown method: a click is a GET, HEAD/POST are link checkers and
 * scanners, and a row with no recorded method is kept rather than guessed away.
 *
 * @param since Oldest timestamp to include.
 */
export function buildBookingLinkWhere(since: Date): Prisma.VercelEventWhereInput {
  return {
    timestamp: { gte: since },
    path: { in: BOOKING_LINKS.map((l) => l.path) },
    statusCode: { in: [...REDIRECT_STATUS_CODES] },
    OR: [{ method: 'GET' }, { method: null }],
  };
}

/**
 * Same test as `buildBookingLinkWhere`, applied in memory so the aggregation is
 * correct on its own, whatever rows it is handed.
 *
 * @param row A stored request.
 */
export function isBookingLinkClick(row: BookingLinkEventRow): boolean {
  return (
    row.path !== null &&
    TRACKED_PATHS.has(row.path) &&
    row.statusCode !== null &&
    REDIRECT_STATUS_CODES.includes(row.statusCode) &&
    (row.method === null || row.method === 'GET')
  );
}

/**
 * The page-view classifier's BOT_COND, in JavaScript: a bot-declaring or
 * missing user-agent, or a datacenter client IP. NULL `isDatacenter` counts as
 * not-datacenter, exactly as the SQL does, so the split here and the page-view
 * split elsewhere on the page can never disagree about a request.
 *
 * @param row User-agent and datacenter flag of a stored request.
 */
export function isBotRequest(row: Pick<BookingLinkEventRow, 'userAgent' | 'isDatacenter'>): boolean {
  return row.userAgent === null || botUserAgent.test(row.userAgent) || row.isDatacenter === true;
}

/**
 * Turn raw rows into per-link, per-day human/bot counts. Pure — `now` is
 * injectable so tests don't depend on the clock.
 *
 * Re-delivered drain lines are collapsed on `vercelId ?? id` (the JS twin of
 * the SQL's COUNT(DISTINCT COALESCE(vercel_id, id))). Totals are summed from
 * the zero-filled day series, so they always equal what the daily view shows;
 * rows older than the window's first day are dropped rather than counted in a
 * total no day accounts for.
 *
 * @param rows Candidate rows (anything not a tracked-link redirect is ignored).
 * @param days Window size in Central-time calendar days, today included.
 * @param now Reference time, defaults to the current moment.
 * @param truncated Whether the query hit its row cap.
 */
export function aggregateBookingLinkClicks(
  rows: BookingLinkEventRow[],
  days: number,
  now = new Date(),
  truncated = false
): BookingLinkClickReport {
  const seen = new Set<string>();
  const perPath = new Map<string, Map<string, DailyTraffic>>();

  for (const row of rows) {
    if (!isBookingLinkClick(row) || row.path === null) continue;
    const key = row.vercelId ?? row.id;
    if (seen.has(key)) continue;
    seen.add(key);

    const day = dayFormatter.format(row.timestamp);
    const byDay = perPath.get(row.path) ?? new Map<string, DailyTraffic>();
    const bucket = byDay.get(day) ?? { day, human: 0, bot: 0 };
    if (isBotRequest(row)) bucket.bot += 1;
    else bucket.human += 1;
    byDay.set(day, bucket);
    perPath.set(row.path, byDay);
  }

  const links = BOOKING_LINKS.map((link): BookingLinkPathReport => {
    const daily = fillDailySeries([...(perPath.get(link.path)?.values() ?? [])], days, now);
    const human = daily.reduce((sum, d) => sum + d.human, 0);
    const bot = daily.reduce((sum, d) => sum + d.bot, 0);
    return { ...link, human, bot, total: human + bot, daily };
  });

  const human = links.reduce((sum, l) => sum + l.human, 0);
  const bot = links.reduce((sum, l) => sum + l.bot, 0);
  return { days, links, totals: { human, bot, total: human + bot }, truncated };
}

/**
 * Booking link clicks for the last N Central-time days.
 *
 * Reads one extra 24h so the oldest calendar day is complete even across a DST
 * change; the aggregation then trims to exactly `days` days.
 *
 * @param days Window size in days, today included.
 */
export async function getBookingLinkClicks(
  days = BOOKING_LINK_WINDOW_DAYS
): Promise<BookingLinkClickReport> {
  const now = new Date();
  const since = new Date(now.getTime() - (days + 1) * 86_400_000);

  const rows = await prisma.vercelEvent.findMany({
    where: buildBookingLinkWhere(since),
    select: {
      id: true,
      vercelId: true,
      timestamp: true,
      path: true,
      statusCode: true,
      method: true,
      userAgent: true,
      isDatacenter: true,
    },
    orderBy: { timestamp: 'desc' },
    take: BOOKING_LINK_ROW_CAP,
  });

  return aggregateBookingLinkClicks(rows, days, now, rows.length >= BOOKING_LINK_ROW_CAP);
}
