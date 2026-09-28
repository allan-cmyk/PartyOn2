/**
 * Booking link clicks — how often the 123.partyondelivery.com short links fire.
 *
 * 123.partyondelivery.com is a redirect-only host. Its rules live in
 * `FUNNEL_HOST_REDIRECTS` (src/lib/seo/funnel-host-redirects.ts, spread first
 * into next.config.ts `redirects()`): the call paths and /reviews are permanent
 * 308s to Google Calendar / the Google review form, /free-quote and
 * /general-info-page-page are temporary 307s, and a `/:path*` catch-all 307s
 * everything else to the homepage. Those links live on flyers, emails, CRM
 * texts and lander CTAs, so a redirect response on one of them is the closest
 * thing we have to a "click" count. Page-view reporting (vercel-events.ts) only
 * counts 200/304, so these never showed up anywhere.
 *
 * HOW WE KNOW A ROW CAME FROM THE 123 HOST — there is no host column.
 * `vercel_events` does not record the request host: the drain's `toEvent()`
 * (src/app/api/webhooks/vercel-drain/route.ts) never reads `proxy.host`. So a
 * row counts only when its path is a tracked link AND its status is exactly
 * the status that path's own 123-host rule answers with — derived from
 * `FUNNEL_HOST_REDIRECTS` (permanent ? 308 : 307), never hard-coded, so this
 * report cannot drift from next.config. On the other project domains
 * (partyondelivery.com, www., party-on2.vercel.app, and info.partyondelivery.com
 * once its DNS moves) those path+status pairs mostly cannot occur:
 *
 * - Main domain: the call paths, /free-quote, /general-info-page-page and the
 *   trailing-period variants have no page and no redirect rule → 404; /reviews
 *   is a real page → 200/304. (Main-domain /review — singular — 308s via
 *   DEAD_LINK_REDIRECTS; it is a different path and is not tracked.)
 * - www.*: middleware sends it to the apex with a 301, never counted.
 * - info.partyondelivery.com: its `/:path*` catch-all answers 307, so
 *   /reviews, /boat-call and the other 308 links are NOT counted from there.
 * - Trailing-slash normalisation: Next.js 308s `/reviews/` → `/reviews` on any
 *   host. Ingest stores the path that was REQUESTED — it strips the query and
 *   collapses repeated slashes (`redactPath`) but never trims a trailing slash —
 *   so that line is stored as `/reviews/`, which no tracked path equals. On the
 *   123 host the same request logs `/reviews/` 308 (excluded) then `/reviews`
 *   308 (counted): one click, once.
 *
 * KNOWN LEAKS, accepted (small):
 * (a) Main-domain and *.vercel.app `//path` requests 308 to `/path`, and
 *     `redactPath` collapses `//` at ingest, so e.g. `//boat-call` is stored as
 *     `/boat-call` 308 and IS counted today. Only scanners send those.
 * (b) info.partyondelivery.com/free-quote and /general-info-page-page hit that
 *     host's 307 catch-all, which matches those paths' expected 307 — so they
 *     would be counted too.
 * The durable fix for both is storing `proxy.host` at ingest (a schema change
 * via the db-migration skill), then filtering on host.
 *
 * Matching is case-insensitive because Next.js matches redirect sources
 * case-insensitively — /Boat-Call is a real click on the 123 host, while on the
 * main domain it is a 404.
 */

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database/client';
import {
  BOT_UA_REGEX,
  REPORTING_TIME_ZONE,
  fillDailySeries,
  type DailyTraffic,
} from '@/lib/analytics/vercel-events';
import {
  FUNNEL_HOST,
  FUNNEL_HOST_REDIRECTS,
  type HostRedirect,
} from '@/lib/seo/funnel-host-redirects';

/** A redirect status one of our funnel rules answers with. */
export type RedirectStatus = 307 | 308;

/** One tracked short link on the 123 host. */
export interface BookingLinkDefinition {
  /** Rule source, lowercase — matched case-insensitively. */
  path: string;
  /** What the link is for, in plain words. */
  label: string;
}

/** A tracked link plus the status its own 123-host rule answers with. */
export interface TrackedBookingLink extends BookingLinkDefinition {
  expectedStatus: RedirectStatus;
}

/**
 * The links to report, in display order. Each must be a literal source in
 * FUNNEL_HOST_REDIRECTS; the tests pin that, and a link whose rule disappears
 * drops out of BOOKING_LINKS rather than being counted against a guessed status.
 */
const TRACKED_LINKS: readonly BookingLinkDefinition[] = [
  { path: '/boat-call', label: 'Boat call booking' },
  { path: '/planning-call', label: 'Planning call booking' },
  { path: '/partnership-call', label: 'Partnership call booking' },
  { path: '/reviews', label: 'Google review form' },
  { path: '/free-quote', label: 'Free quote' },
  { path: '/general-info-page-page', label: 'Old GHL info page' },
  { path: '/reviews.', label: 'Review link typed with a trailing period' },
  { path: '/boat-call.', label: 'Boat call link typed with a trailing period' },
];

/**
 * Path → redirect status for the literal (non-pattern) 123-host rules.
 *
 * @param rules Redirect rules; defaults to the ones next.config actually serves.
 */
export function funnelHostStatusByPath(
  rules: readonly HostRedirect[] = FUNNEL_HOST_REDIRECTS
): Map<string, RedirectStatus> {
  const byPath = new Map<string, RedirectStatus>();
  for (const rule of rules) {
    const onFunnelHost = rule.has?.some((h) => h.type === 'host' && h.value === FUNNEL_HOST);
    if (!onFunnelHost || rule.source.includes(':')) continue;
    const path = rule.source.toLowerCase();
    // First rule wins, exactly as Next.js evaluates them.
    if (!byPath.has(path)) byPath.set(path, rule.permanent ? 308 : 307);
  }
  return byPath;
}

const STATUS_BY_PATH = funnelHostStatusByPath();

/** Tracked links with their expected status, in display order. */
export const BOOKING_LINKS: readonly TrackedBookingLink[] = TRACKED_LINKS.flatMap((link) => {
  const expectedStatus = STATUS_BY_PATH.get(link.path);
  return expectedStatus ? [{ ...link, expectedStatus }] : [];
});

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
export interface BookingLinkPathReport extends TrackedBookingLink {
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

const LINK_BY_PATH = new Map(BOOKING_LINKS.map((l) => [l.path, l]));
const botUserAgent = new RegExp(BOT_UA_REGEX, 'i');
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: REPORTING_TIME_ZONE });

/**
 * Prisma filter for candidate rows: each status group's paths, matched with an
 * exact, case-insensitive `in` (never a prefix match — see the header for
 * `/reviews/`), plus GET or unknown method. A click is a GET; HEAD/POST are
 * link checkers and scanners; a row with no recorded method is kept rather
 * than guessed away.
 *
 * `mode: 'insensitive'` can compile to ILIKE, where `%` and `_` are wildcards.
 * The paths are constants with neither (pinned by a test), so that is safe here.
 *
 * @param since Oldest timestamp to include.
 */
export function buildBookingLinkWhere(since: Date): Prisma.VercelEventWhereInput {
  const pathsByStatus = new Map<RedirectStatus, string[]>();
  for (const link of BOOKING_LINKS) {
    pathsByStatus.set(link.expectedStatus, [...(pathsByStatus.get(link.expectedStatus) ?? []), link.path]);
  }
  const statusGroups = [...pathsByStatus].map(
    ([statusCode, paths]): Prisma.VercelEventWhereInput => ({
      statusCode,
      path: { in: paths, mode: 'insensitive' },
    })
  );
  return {
    timestamp: { gte: since },
    AND: [{ OR: statusGroups }, { OR: [{ method: 'GET' }, { method: null }] }],
  };
}

/**
 * Same test as `buildBookingLinkWhere`, applied in memory so the aggregation is
 * correct on its own, whatever rows it is handed.
 *
 * @param row A stored request.
 * @returns The tracked link the row is a click on, or null.
 */
export function matchBookingLinkClick(row: BookingLinkEventRow): TrackedBookingLink | null {
  if (row.path === null || row.statusCode === null) return null;
  if (row.method !== null && row.method !== 'GET') return null;
  const link = LINK_BY_PATH.get(row.path.toLowerCase());
  return link && row.statusCode === link.expectedStatus ? link : null;
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
    const link = matchBookingLinkClick(row);
    if (!link) continue;
    const key = row.vercelId ?? row.id;
    if (seen.has(key)) continue;
    seen.add(key);

    const day = dayFormatter.format(row.timestamp);
    const byDay = perPath.get(link.path) ?? new Map<string, DailyTraffic>();
    const bucket = byDay.get(day) ?? { day, human: 0, bot: 0 };
    if (isBotRequest(row)) bucket.bot += 1;
    else bucket.human += 1;
    byDay.set(day, bucket);
    perPath.set(link.path, byDay);
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
