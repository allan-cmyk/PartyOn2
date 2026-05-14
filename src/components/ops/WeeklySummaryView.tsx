'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';

interface WeeklyItem {
  qty: number;
  title: string;
}

interface WeeklyPayment {
  orderNumber: number;
  payer: string;
  payerDiffers: boolean;
  phone: string;
  email: string;
  items: WeeklyItem[];
  total: number;
}

interface WeeklyManifestMatch {
  cruiseDate: string;
  timeSlot: string | null;
  boat: string | null;
  clientName: string | null;
  package: string | null;
  headcount: number | null;
  sheetTab: string | null;
  occasion: string | null;
}

type ShortType = 'DISCO' | 'PRIVATE' | 'HOUSE';

interface WeeklyCooler {
  key: string;
  isCooler: boolean;
  shareCode: string | null;
  deliveryDate: string;
  deliveryTime: string;
  primaryName: string;
  groupTitle: string | null;
  address: string;
  deliveryNotes: string;
  isGroup: boolean;
  source: string;
  partyType: string | null;
  extId: string | null;
  hostPhone: string;
  hostEmail: string;
  manifestMatch: WeeklyManifestMatch | null;
  payments: WeeklyPayment[];
  aggregatedItems: Array<{ title: string; qty: number }>;
  total: number;
  totalItems: number;
  uniqueSkus: number;
  isVeryLarge: boolean;
  shortType: ShortType;
  isBoatish: boolean;
}

interface WeeklyStats {
  coolers: number;
  payments: number;
  totalRevenue: number;
  disco: number;
  privateCruise: number;
  house: number;
  veryLarge: number;
  manifestMatched: number;
  manifestMissing: number;
}

interface WeeklySummaryResponse {
  ok: boolean;
  stats: WeeklyStats;
  coolersByDate: Array<{ date: string; coolers: WeeklyCooler[]; total: number }>;
  range: { start: string; end: string; days: number };
  fetchedAt: string;
  error?: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDateLong(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DAY_NAMES[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function fmtDateShort(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DAY_SHORT[d.getUTCDay()]} ${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

function todayCT(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

interface TimePill {
  label: 'AM' | 'PM' | 'EVE' | 'TBD' | '?';
  cls: string;
}

function timeOfDayPill(timeStr: string): TimePill {
  if (!timeStr || timeStr === 'TBD') {
    return { label: 'TBD', cls: 'bg-gray-200 text-gray-700' };
  }
  const m = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return { label: '?', cls: 'bg-gray-200 text-gray-700' };
  let hour = parseInt(m[1], 10);
  const isPM = m[3].toUpperCase() === 'PM';
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  if (hour < 12) return { label: 'AM', cls: 'bg-amber-200 text-amber-900' };
  if (hour < 17) return { label: 'PM', cls: 'bg-sky-200 text-sky-900' };
  return { label: 'EVE', cls: 'bg-indigo-900 text-white' };
}

function typeTagClasses(t: ShortType): { label: string; cls: string; labelCls: string } {
  if (t === 'DISCO') {
    return {
      label: 'Disco',
      cls: 'bg-orange-500 text-white ring-1 ring-inset ring-orange-700',
      labelCls: 'text-orange-700',
    };
  }
  if (t === 'PRIVATE') {
    return {
      label: 'Private',
      cls: 'bg-teal-600 text-white ring-1 ring-inset ring-teal-800',
      labelCls: 'text-teal-700',
    };
  }
  return {
    label: 'House',
    cls: 'bg-emerald-800 text-white ring-1 ring-inset ring-emerald-900',
    labelCls: 'text-emerald-800',
  };
}

function IconRefresh({ spinning }: { spinning: boolean }): ReactElement {
  return (
    <svg
      className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-3.5-7.13" />
      <polyline points="21 4 21 10 15 10" />
    </svg>
  );
}

function IconPrint(): ReactElement {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

export default function WeeklySummaryView(): ReactElement {
  const [start, setStart] = useState<string>(todayCT());
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<WeeklySummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  const fetchSummary = useCallback(async (s: string, d: number) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/weekly-summary?start=${s}&days=${d}`, {
        cache: 'no-store',
      });
      const json: WeeklySummaryResponse = await res.json();
      if (reqId !== reqIdRef.current) return;
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setData(json);
    } catch (err) {
      if (reqId !== reqIdRef.current) return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(start, days);
    // Only on mount; subsequent fetches go through the Refresh button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => fetchSummary(start, days);
  const handlePrint = () => window.print();

  const fetchedAtLabel = useMemo(() => {
    if (!data?.fetchedAt) return '';
    return new Date(data.fetchedAt).toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric',
    });
  }, [data?.fetchedAt]);

  return (
    <div className="bg-gray-50 print:bg-white -mx-4 md:-mx-6 -my-0 md:-my-4 print:m-0">
      {/* Toolbar — sticky on desktop, static on mobile (mobile orders page already has its own sticky search bar above), hidden in print */}
      <div className="md:sticky md:top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 print:hidden">
        <div className="container-custom py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[180px]">
              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-[0.1em] text-gray-900 uppercase leading-none">
                Weekly Checklist
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                Paid coolers — picker + delivery sheet
                {fetchedAtLabel && (
                  <>
                    {' '}· <span className="text-gray-400">refreshed {fetchedAtLabel} CT</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-medium">Start</span>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="input-premium !min-h-[44px] !py-2 !px-3 !text-sm !w-[160px]"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-medium">Days</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v)) setDays(Math.max(1, Math.min(30, v)));
                  }}
                  className="input-premium !min-h-[44px] !py-2 !px-3 !text-sm !w-[80px]"
                />
              </label>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="btn-primary !min-h-[44px] !py-2 !px-4 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-wait"
              >
                <IconRefresh spinning={loading} />
                <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn-secondary !min-h-[44px] !py-2 !px-4 inline-flex items-center gap-2"
              >
                <IconPrint />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block px-4 pt-3 pb-2 border-b border-gray-300">
        <div className="flex items-baseline justify-between">
          <h1 className="font-heading text-xl font-bold tracking-[0.08em] text-gray-900 uppercase">
            Weekly Delivery Checklist
          </h1>
          <div className="text-[10px] text-gray-600">
            {data && (
              <>
                {fmtDateLong(data.range.start)} – {fmtDateLong(data.range.end)} · paid orders only
              </>
            )}
          </div>
        </div>
      </div>

      <main className="container-custom py-4 md:py-6 print:py-0 print:px-4">
        {error && (
          <div
            className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 print:hidden"
            role="alert"
          >
            <strong className="font-semibold">Failed to load:</strong> {error}
          </div>
        )}

        {data && (
          <>
            <StatsGrid stats={data.stats} />

            {data.coolersByDate.length === 0 && (
              <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                <p className="font-heading text-xl tracking-[0.08em] uppercase text-gray-500">
                  No paid coolers in this window
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Try expanding the days or picking a different start date.
                </p>
              </div>
            )}

            <div className="mt-5 md:mt-6 space-y-6 print:space-y-3 print:mt-2">
              {data.coolersByDate.map((day) => (
                <DaySection key={day.date} date={day.date} total={day.total} coolers={day.coolers} />
              ))}
            </div>
          </>
        )}

        {!data && !error && (
          <div className="mt-8 flex items-center justify-center py-12 text-gray-400 print:hidden">
            <IconRefresh spinning={true} />
            <span className="ml-3 text-sm">Loading deliveries…</span>
          </div>
        )}
      </main>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.4in;
          }
          body {
            background: white !important;
          }
          .ops-print-hide,
          nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatsGrid({ stats }: { stats: WeeklyStats }): ReactElement {
  const tiles: Array<{ label: string; value: string; accent?: string }> = [
    { label: 'Coolers', value: String(stats.coolers) },
    { label: 'Sub-pays', value: String(stats.payments) },
    { label: 'Revenue', value: fmtMoney(stats.totalRevenue), accent: 'text-brand-blue' },
    { label: 'Disco', value: String(stats.disco), accent: 'text-orange-600' },
    { label: 'Private', value: String(stats.privateCruise), accent: 'text-teal-700' },
    { label: 'House', value: String(stats.house), accent: 'text-emerald-800' },
    { label: 'Very large', value: String(stats.veryLarge), accent: 'text-orange-600' },
    {
      label: 'Manifest',
      value: `${stats.manifestMatched}/${stats.manifestMatched + stats.manifestMissing}`,
      accent: stats.manifestMissing > 0 ? 'text-red-600' : 'text-emerald-700',
    },
  ];
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 print:grid-cols-8 print:gap-1">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 print:rounded print:border-gray-300 print:px-2 print:py-1"
        >
          <div className={`font-heading text-xl md:text-2xl font-bold tracking-tight leading-none ${t.accent || 'text-gray-900'} print:text-base`}>
            {t.value}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-gray-500 print:text-[8px]">
            {t.label}
          </div>
        </div>
      ))}
    </section>
  );
}

function DaySection({
  date,
  total,
  coolers,
}: {
  date: string;
  total: number;
  coolers: WeeklyCooler[];
}): ReactElement {
  return (
    <section className="break-inside-avoid-page">
      <div
        className="flex items-baseline justify-between rounded-t-lg bg-brand-blue px-3 py-2 text-white print:rounded-none print:py-1"
        style={{ breakAfter: 'avoid' }}
      >
        <h2 className="font-heading text-lg md:text-xl font-bold tracking-[0.1em] uppercase">
          {fmtDateLong(date)}
        </h2>
        <div className="text-xs md:text-sm font-medium opacity-90">
          {coolers.length} cooler{coolers.length === 1 ? '' : 's'} · {fmtMoney(total)}
        </div>
      </div>
      <div className="space-y-3 print:space-y-2">
        {coolers.map((c) => (
          <CoolerCard key={c.key} cooler={c} />
        ))}
      </div>
    </section>
  );
}

function CoolerCard({ cooler: c }: { cooler: WeeklyCooler }): ReactElement {
  const pill = timeOfDayPill(c.deliveryTime);
  const tag = typeTagClasses(c.shortType);

  const headerBase = c.primaryName.replace(/\s*\+\d+\s*more$/i, '').trim().toLowerCase();
  const onlyPayerName = c.payments.length === 1 ? (c.payments[0].payer || '').trim().toLowerCase() : null;
  const showSubOrders =
    c.payments.length > 1 || (onlyPayerName && onlyPayerName !== headerBase);

  const hostContact = [c.hostPhone, c.hostEmail].filter(Boolean).join(' · ');

  return (
    <article
      data-share-code={c.shareCode || undefined}
      className={[
        'overflow-hidden border border-gray-200 bg-white break-inside-avoid',
        'print:border-gray-400',
        c.isVeryLarge ? 'border-l-4 border-l-orange-500' : '',
      ].join(' ')}
    >
      {/* Banner */}
      <div
        className={`px-3 md:px-4 pt-2.5 pb-2 border-b-2 border-gray-300 ${
          c.isVeryLarge
            ? 'bg-gradient-to-r from-orange-50 via-gray-50 to-gray-50'
            : 'bg-gray-50'
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.08em] ${pill.cls}`}
          >
            {pill.label}
          </span>
          <span className="text-sm md:text-base font-bold text-gray-900 leading-none">
            {c.deliveryTime || 'TBD'}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-extrabold tracking-[0.06em] uppercase leading-none ${tag.cls}`}
          >
            {tag.label}
          </span>
          {c.isVeryLarge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.08em] bg-orange-100 text-orange-800 ring-1 ring-orange-400">
              VERY LARGE
            </span>
          )}
          {c.shareCode && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 ml-auto">
              code {c.shareCode}
              {c.extId && <span className="text-gray-400"> · Premier#{c.extId.slice(0, 12)}</span>}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="flex-shrink-0 inline-block w-5 h-5 border-2 border-gray-900 rounded-sm bg-white"
              aria-label="Pick checkbox"
            />
            <h3 className="font-heading text-xl md:text-2xl font-extrabold tracking-[0.02em] text-gray-900 leading-tight break-words">
              {c.primaryName}
            </h3>
          </div>
          <span
            className={`ml-auto font-mono text-[11px] md:text-xs font-bold tracking-[0.08em] uppercase text-brand-blue whitespace-nowrap`}
          >
            {fmtDateShort(c.deliveryDate)}
            <span className="text-gray-400 mx-1">·</span>
            {pill.label}
            <span className="text-gray-400 mx-1">·</span>
            <span className={tag.labelCls}>{c.shortType}</span>
          </span>
        </div>

        {c.groupTitle && (
          <div className="mt-1 ml-7 text-xs italic text-gray-600">
            <span className="not-italic font-semibold text-gray-700">Group:</span> {c.groupTitle}
          </div>
        )}
      </div>

      {/* Body — 2 col on md+, single col on mobile, ALWAYS 2 col in print */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-3 md:gap-4 px-3 md:px-4 py-3 print:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] print:gap-3 print:px-3 print:py-2">
        {/* Left column */}
        <div className="min-w-0 flex flex-col">
          {c.isBoatish && c.manifestMatch && (
            <ManifestOk match={c.manifestMatch} />
          )}
          {c.isBoatish && !c.manifestMatch && (
            <div className="text-[11px] font-semibold rounded-sm px-2 py-1 mb-1 bg-red-50 text-red-800 border border-red-200">
              ⚠ NOT FOUND on boat manifest — verify before loading
            </div>
          )}

          <div className="text-xs text-gray-700 leading-snug">
            <span className="text-gray-500">📍</span> {c.address || 'No address on file'}
          </div>
          {hostContact && (
            <div className="text-xs text-gray-700 leading-snug mt-0.5">
              <span className="text-gray-500">👤</span> {hostContact}
            </div>
          )}

          {!showSubOrders && c.payments[0] && (
            <SingleContact payment={c.payments[0]} />
          )}

          {c.deliveryNotes && (
            <div className="mt-2 rounded-sm bg-yellow-50 border-l-4 border-yellow-600 px-2 py-1 text-[11px] text-yellow-900">
              <span className="font-bold">Notes:</span> {c.deliveryNotes}
            </div>
          )}

          {showSubOrders && <SubOrders payments={c.payments} />}

          <div className="mt-auto pt-2 mt-2 border-t-2 border-brand-blue flex items-baseline justify-between font-bold">
            <span className="text-sm uppercase tracking-[0.08em] text-gray-700">Order total</span>
            <span className="text-base text-gray-900">{fmtMoney(c.total)}</span>
          </div>
        </div>

        {/* Right column — aggregated SKU list */}
        <div className="min-w-0">
          <h4 className="font-heading text-xs font-bold tracking-[0.1em] uppercase text-brand-blue mb-1">
            Cooler contents · {c.totalItems} items · {c.uniqueSkus} SKUs
          </h4>
          <ul className="text-xs leading-tight space-y-0.5">
            {c.aggregatedItems.map((it) => (
              <li key={it.title} className="flex gap-1.5">
                <span className="font-mono font-bold text-brand-blue tabular-nums w-7 flex-shrink-0 text-right">
                  {it.qty}×
                </span>
                <span className="text-gray-800">{it.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function ManifestOk({ match }: { match: WeeklyManifestMatch }): ReactElement {
  const bits: string[] = [];
  if (match.boat) bits.push(match.boat);
  if (match.timeSlot) bits.push(match.timeSlot);
  if (match.package) bits.push(match.package);
  if (match.headcount) bits.push(`${match.headcount} guests`);
  if (match.sheetTab) bits.push(match.sheetTab);
  return (
    <div className="text-[11px] rounded-sm px-2 py-1 mb-1 bg-emerald-50 text-emerald-900 border border-emerald-200 leading-snug">
      <span className="font-bold">✓ Boat manifest match — </span>
      {match.clientName && (
        <>
          Cruise host: <b>{match.clientName}</b>
          {bits.length > 0 ? ' · ' : ''}
        </>
      )}
      {bits.join(' · ')}
    </div>
  );
}

function SingleContact({ payment }: { payment: WeeklyPayment }): ReactElement | null {
  const contact = [payment.phone, payment.email].filter(Boolean).join(' · ');
  if (!contact) return null;
  return (
    <div className="mt-0.5 text-xs text-gray-600">
      <span className="text-gray-500">☎</span> {contact}
    </div>
  );
}

function SubOrders({ payments }: { payments: WeeklyPayment[] }): ReactElement {
  const heading = payments.length === 1 ? 'Sub-order (1 payer)' : `Sub-orders (${payments.length} payers)`;
  return (
    <div className="mt-3 pt-2 border-t border-gray-200">
      <h4 className="font-heading text-xs font-bold tracking-[0.1em] uppercase text-brand-blue mb-1.5">
        {heading}
      </h4>
      <div className="space-y-1.5">
        {payments.map((p, i) => (
          <div
            key={`${p.orderNumber}-${i}`}
            className="break-inside-avoid border border-gray-300 border-l-[3px] border-l-brand-blue rounded-sm bg-white px-2 py-1.5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm font-bold text-gray-900 min-w-0">
                <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-gray-400 mr-1.5">
                  Paid by
                </span>
                <span className="break-words">{p.payer}</span>
                {p.orderNumber && (
                  <span className="text-[10px] font-normal text-gray-400 ml-1.5">#{p.orderNumber}</span>
                )}
              </div>
              <span className="text-xs font-bold text-brand-blue tabular-nums whitespace-nowrap">
                {fmtMoney(p.total)}
              </span>
            </div>
            {(p.phone || p.email) && (
              <div className="mt-0.5 text-[11px] text-gray-600">
                <span className="text-gray-400">☎</span>{' '}
                {[p.phone, p.email].filter(Boolean).join(' · ')}
              </div>
            )}
            {p.items.length > 0 && (
              <ul className="mt-1 text-[11px] leading-snug list-disc pl-4 marker:text-gray-300">
                {p.items.map((it, idx) => (
                  <li key={idx} className="text-gray-800">
                    <span className="font-mono font-bold text-gray-900">{it.qty}×</span> {it.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
