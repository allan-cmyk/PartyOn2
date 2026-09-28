'use client';

import { ReactElement, useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import type {
  BookingLinkClickReport,
  BookingLinkPathReport,
} from '@/lib/analytics/booking-link-clicks';

const ROW_GRID = 'grid grid-cols-[1.25rem_1fr_3.5rem_3.5rem_3.5rem] items-center gap-2';

/** Days that had at least one click, newest first — the zero days add nothing. */
function DailyBreakdown({ link }: { link: BookingLinkPathReport }): ReactElement {
  const active = link.daily.filter((d) => d.human + d.bot > 0).reverse();
  return (
    <div className="pb-3">
      {active.map((d) => (
        <div key={d.day} className={`${ROW_GRID} py-1 text-sm text-gray-700`}>
          <span />
          <span>{format(parseISO(d.day), 'EEE, MMM d')}</span>
          <span className="text-right">{d.human}</span>
          <span className="text-right">{d.bot}</span>
          <span className="text-right">{d.human + d.bot}</span>
        </div>
      ))}
    </div>
  );
}

/** Path, what it is, and its counts. */
function LinkLabel({ link }: { link: BookingLinkPathReport }): ReactElement {
  return (
    <span className="min-w-0">
      <span className="block font-medium text-gray-900 break-all">{link.path}</span>
      <span className="block text-sm text-gray-500">{link.label}</span>
    </span>
  );
}

/** One link. Rows with clicks expand to their per-day counts. */
function LinkRow({ link }: { link: BookingLinkPathReport }): ReactElement {
  const counts = (
    <>
      <span className="text-right text-gray-900">{link.human}</span>
      <span className="text-right text-gray-900">{link.bot}</span>
      <span className="text-right font-semibold text-gray-900">{link.total}</span>
    </>
  );

  if (link.total === 0) {
    return (
      <div className={`${ROW_GRID} py-2 text-sm border-b border-gray-100`}>
        <span />
        <LinkLabel link={link} />
        {counts}
      </div>
    );
  }

  return (
    <details className="group border-b border-gray-100">
      <summary className={`${ROW_GRID} py-2 text-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50`}>
        <svg
          className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <LinkLabel link={link} />
        {counts}
      </summary>
      <DailyBreakdown link={link} />
    </details>
  );
}

/** The loaded report: header row, one row per link, totals and the caveats. */
function ClickTable({ data }: { data: BookingLinkClickReport }): ReactElement {
  return (
    <>
      {data.truncated && (
        <p className="text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-md p-2 mb-3">
          Row limit reached — the oldest days may be undercounted.
        </p>
      )}
      <div className={`${ROW_GRID} pb-2 text-sm font-medium text-gray-500 border-b border-gray-200`}>
        <span />
        <span>Link</span>
        <span className="text-right">Human</span>
        <span className="text-right">Bot</span>
        <span className="text-right">Total</span>
      </div>
      {data.links.map((link) => (
        <LinkRow key={link.path} link={link} />
      ))}
      <div className={`${ROW_GRID} pt-2 text-sm font-semibold text-gray-900`}>
        <span />
        <span>All links</span>
        <span className="text-right">{data.totals.human}</span>
        <span className="text-right">{data.totals.bot}</span>
        <span className="text-right">{data.totals.total}</span>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Counts redirects the short links answered. A browser that already followed a
        permanent redirect can reuse it from its own cache without asking us again, so
        repeat clicks from the same phone may be missing. Human vs bot uses the same test
        as page views above; some bots pass as human, so treat the human column as an
        upper bound.
      </p>
    </>
  );
}

/**
 * Clicks on the 123.partyondelivery.com short links (call bookings, review
 * form, free quote, old GHL info page), counted from the redirect responses in
 * the Vercel log drain. Fixed 30-day window, independent of the page's window
 * selector.
 */
export default function BookingLinkClicksPanel(): ReactElement {
  const [data, setData] = useState<BookingLinkClickReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/analytics/traffic/booking-links', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = (await res.json()) as { data: BookingLinkClickReport };
        if (!cancelled) setData(json.data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="card">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Booking link clicks</h3>
        <p className="text-sm text-gray-500">
          123.partyondelivery.com short links · last 30 days · tap a link for its daily counts
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : !data ? (
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      ) : (
        <ClickTable data={data} />
      )}
    </div>
  );
}
