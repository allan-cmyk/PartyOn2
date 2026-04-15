'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type ViewTab = 'upcoming' | 'today' | 'weekly';

interface PublicOrderInfo {
  orderNumber: number;
  fulfillmentStatus: string;
}

interface PublicDiscoBooking {
  id: number;
  clientName: string;
  clientPhone: string | null;
  headcount: number | null;
  package: string | null;
  addOns: string | null;
  podFlag: boolean;
  occasion: string | null;
  order: PublicOrderInfo | null;
}

interface PublicScheduleEntry {
  id: number;
  boat: string;
  timeSlot: string | null;
  clientName: string;
  clientPhone: string | null;
  occasion: string | null;
  headcount: number | null;
  addOns: string | null;
  podFlag: boolean;
  captainCrew: string | null;
  dj: string | null;
  photographer: string | null;
  avgAge: string | null;
  type: 'disco' | 'private';
  isDiscoRow: boolean;
  discoBookings: PublicDiscoBooking[];
  order: PublicOrderInfo | null;
}

interface PublicData {
  dateRange: { from: string; to: string };
  schedule: Record<string, Record<string, PublicScheduleEntry[]>>;
}

const VIEW_LABELS: Record<ViewTab, string> = {
  upcoming: 'Upcoming Parties',
  today: "Today's Schedule",
  weekly: 'Custom Date Range',
};

export default function PublicBoatScheduleClient({
  sharedKey,
  setCookie,
}: {
  sharedKey: string;
  setCookie: boolean;
}) {
  const [view, setView] = useState<ViewTab>('upcoming');
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<Set<number>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // On first visit via ?key=, store in a long-lived cookie so future visits
  // don't need the query string. Also strip ?key= from URL for cleanliness.
  useEffect(() => {
    if (setCookie && typeof document !== 'undefined') {
      const sixMonths = 60 * 60 * 24 * 180;
      document.cookie = `pbs_key=${encodeURIComponent(sharedKey)}; Max-Age=${sixMonths}; Path=/; SameSite=Lax${
        window.location.protocol === 'https:' ? '; Secure' : ''
      }`;
      const url = new URL(window.location.href);
      url.searchParams.delete('key');
      window.history.replaceState({}, '', url.toString());
    }
  }, [setCookie, sharedKey]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ view });
      if (view === 'weekly' && dateFrom && dateTo) {
        params.set('from', dateFrom);
        params.set('to', dateTo);
      }
      const res = await fetch(`/api/public/boat-schedule?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (view === 'weekly') {
          if (!dateFrom) setDateFrom(json.dateRange.from);
          if (!dateTo) setDateTo(json.dateRange.to);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [view, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRow(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-none">
              Boat Schedule
            </h1>
            <p className="text-xs text-gray-500 mt-1.5 uppercase tracking-widest">
              Premier Party Cruises
            </p>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  View
                </div>
                {(['upcoming', 'today', 'weekly'] as ViewTab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setView(t);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${
                      view === t ? 'text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {view === t && <span className="mr-1">•</span>}
                    {VIEW_LABELS[t]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-semibold">
            <span className="w-1 h-4 bg-blue-900 rounded-full" />
            {VIEW_LABELS[view]}
            {view === 'upcoming' && (
              <span className="text-gray-400 normal-case tracking-normal font-normal">
                next 21 days
              </span>
            )}
          </div>
        </div>

        {view === 'weekly' && (
          <div className="flex items-center gap-2 mb-4 flex-wrap text-sm">
            <label className="text-gray-600">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <label className="text-gray-600">to</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={load}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
            >
              Refresh
            </button>
          </div>
        )}

        {loading && <div className="text-center py-12 text-gray-400">Loading...</div>}

        {!loading && data && (
          <>
            {Object.keys(data.schedule).length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                {view === 'upcoming'
                  ? 'No parties booked in the next 21 days'
                  : 'No bookings for this range'}
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(data.schedule)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, timeSlots]) => (
                    <DaySection
                      key={date}
                      date={date}
                      timeSlots={timeSlots}
                      expandedRow={expandedRow}
                      onToggleRow={toggleRow}
                    />
                  ))}
              </div>
            )}
          </>
        )}

        <footer className="mt-12 pb-8 text-center text-[10px] text-gray-400 uppercase tracking-widest">
          Party On Delivery &middot; Read only
        </footer>
      </div>
    </div>
  );
}

function DaySection({
  date,
  timeSlots,
  expandedRow,
  onToggleRow,
}: {
  date: string;
  timeSlots: Record<string, PublicScheduleEntry[]>;
  expandedRow: Set<number>;
  onToggleRow: (id: number) => void;
}) {
  const allEntries: PublicScheduleEntry[] = [];
  for (const slot of Object.keys(timeSlots).sort()) {
    for (const e of timeSlots[slot]) allEntries.push(e);
  }

  const boatSet = new Set<string>();
  let bookings = 0;
  let podCount = 0;
  for (const e of allEntries) {
    boatSet.add(e.boat);
    if (e.clientName) {
      bookings++;
      if (e.podFlag) podCount++;
    }
    if (e.isDiscoRow) {
      bookings += e.discoBookings.length;
      podCount += e.discoBookings.filter(b => b.podFlag).length;
    }
  }

  const visible = allEntries.filter(e => e.clientName);
  if (visible.length === 0) return null;

  return (
    <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <header className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">
          {formatDateLong(date)}
        </h3>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
          <span>{boatSet.size} boats</span>
          <span className="mx-1.5 text-gray-300">/</span>
          <span>{bookings} {bookings === 1 ? 'party' : 'parties'}</span>
          {podCount > 0 && (
            <>
              <span className="mx-1.5 text-gray-300">/</span>
              <span className="text-purple-700">{podCount} POD</span>
            </>
          )}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/60 text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="w-6" />
              <th className="px-3 py-2 text-left font-semibold">Boat</th>
              <th className="px-2 py-2 text-left font-semibold">Type</th>
              <th className="px-2 py-2 text-left font-semibold">Captain</th>
              <th className="px-2 py-2 text-left font-semibold">Time</th>
              <th className="px-2 py-2 text-left font-semibold">POD</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(entry => (
              <EntryRow
                key={entry.id}
                entry={entry}
                isExpanded={expandedRow.has(entry.id)}
                onToggle={() => onToggleRow(entry.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EntryRow({
  entry,
  isExpanded,
  onToggle,
}: {
  entry: PublicScheduleEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const timeTint = getTimeOfDayTint(entry.timeSlot);

  return (
    <>
      <tr
        className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${timeTint}`}
        onClick={onToggle}
      >
        <td className="w-6 pl-3 text-gray-400 align-middle">
          <span
            className="inline-block transition-transform text-xs"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ▶
          </span>
        </td>
        <td className="px-3 py-2.5 font-semibold text-gray-900">{entry.boat}</td>
        <td className="px-2 py-2.5">
          <TypePill type={entry.type} />
        </td>
        <td className="px-2 py-2.5 text-gray-700 font-mono text-xs">
          {entry.captainCrew || '—'}
        </td>
        <td className="px-2 py-2.5 font-mono text-xs text-gray-700 whitespace-nowrap">
          {entry.timeSlot || '—'}
        </td>
        <td className="px-2 py-2.5">
          {entry.order ? (
            <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm font-mono">
              #{entry.order.orderNumber}
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </td>
      </tr>

      {isExpanded && (
        <tr className={timeTint}>
          <td colSpan={6} className="pl-10 pr-4 py-4 border-t border-gray-100">
            {entry.isDiscoRow ? (
              <DiscoExpansion entry={entry} />
            ) : (
              <PrivateExpansion entry={entry} />
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function PrivateExpansion({ entry }: { entry: PublicScheduleEntry }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">
            Client
          </div>
          <div className="font-semibold text-gray-900">{entry.clientName}</div>
          {entry.clientPhone && (
            <a
              href={`tel:${entry.clientPhone}`}
              className="text-xs font-mono text-gray-600 hover:text-blue-700"
            >
              {formatPhone(entry.clientPhone)}
            </a>
          )}
        </div>
        <div className="flex items-center gap-6">
          <StatBlock label="Headcount" value={entry.headcount?.toString() || '—'} />
          <StatBlock label="Age" value={entry.avgAge || '—'} />
          {entry.occasion && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">
                Occasion
              </div>
              <OccasionBadge occasion={entry.occasion} />
            </div>
          )}
        </div>
      </div>

      {entry.addOns && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">
            Add-ons / Packages
          </div>
          <div className="text-sm text-gray-800 leading-snug">{entry.addOns}</div>
        </div>
      )}

      {((entry.dj && entry.dj !== 'NA') ||
        (entry.photographer && entry.photographer !== 'NA')) && (
        <div className="flex gap-6">
          {entry.dj && entry.dj !== 'NA' && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">
                DJ
              </div>
              <div className="text-sm text-gray-800">{entry.dj}</div>
            </div>
          )}
          {entry.photographer && entry.photographer !== 'NA' && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">
                Photog
              </div>
              <div className="text-sm text-gray-800">{entry.photographer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiscoExpansion({ entry }: { entry: PublicScheduleEntry }) {
  if (entry.discoBookings.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No disco bookings for this slot yet.
      </div>
    );
  }

  const isBach = (occ: string | null) => (occ || '').toLowerCase().includes('bachelorette');
  const isBachelor = (occ: string | null) => {
    const o = (occ || '').toLowerCase();
    return o.includes('bachelor') && !o.includes('bachelorette');
  };
  const bySize = (a: PublicDiscoBooking, b: PublicDiscoBooking) =>
    (b.headcount ?? 0) - (a.headcount ?? 0);
  const bacheloretteList = entry.discoBookings.filter(b => isBach(b.occasion)).sort(bySize);
  const bachelorList = entry.discoBookings.filter(b => isBachelor(b.occasion)).sort(bySize);
  const otherList = entry.discoBookings.filter(
    b => !isBach(b.occasion) && !isBachelor(b.occasion),
  );
  const sortedBookings = [...bacheloretteList, ...bachelorList, ...otherList];

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
        <div className="text-[10px] uppercase tracking-widest text-purple-700 font-semibold">
          {entry.discoBookings.length}{' '}
          {entry.discoBookings.length === 1 ? 'disco party' : 'disco parties'}
          {bacheloretteList.length > 0 && (
            <span className="ml-2 text-pink-700">{bacheloretteList.length} bachelorette</span>
          )}
          {bachelorList.length > 0 && (
            <span className="ml-2 text-blue-700">{bachelorList.length} bachelor</span>
          )}
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          {entry.captainCrew && <span className="mr-3">Capt: {entry.captainCrew}</span>}
          {entry.dj && entry.dj !== 'NA' && entry.dj !== 'PLEASE ASSIGN' && (
            <span className="mr-3">DJ: {entry.dj}</span>
          )}
          {entry.photographer &&
            entry.photographer !== 'NA' &&
            entry.photographer !== 'PLEASE ASSIGN' && (
              <span>Photog: {entry.photographer}</span>
            )}
        </div>
      </div>
      <div className="overflow-x-auto border border-purple-100 rounded-md">
        <table className="w-full text-xs">
          <thead className="bg-purple-50 text-purple-900">
            <tr>
              <th className="px-3 py-1.5 text-left font-semibold uppercase tracking-widest text-[10px]">
                Client
              </th>
              <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-widest text-[10px]">
                Phone
              </th>
              <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-widest text-[10px]">
                Type
              </th>
              <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-widest text-[10px]">
                Ppl
              </th>
              <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-widest text-[10px]">
                Add-ons
              </th>
              <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-widest text-[10px]">
                POD
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map(b => {
              const occ = (b.occasion || '').toLowerCase();
              const isBachelorette = occ.includes('bachelorette');
              const isBachelorOcc = occ.includes('bachelor') && !isBachelorette;
              return (
                <tr key={b.id} className="border-t border-purple-100 hover:bg-purple-50/50">
                  <td className="px-3 py-1.5 font-medium">{b.clientName}</td>
                  <td className="px-2 py-1.5 font-mono text-gray-600">
                    {b.clientPhone ? (
                      <a
                        href={`tel:${b.clientPhone}`}
                        className="hover:text-blue-700"
                      >
                        {formatPhone(b.clientPhone)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {isBachelorette ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800">
                        Bachelorette
                      </span>
                    ) : isBachelorOcc ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Bachelor
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">{b.headcount !== null ? b.headcount : '—'}</td>
                  <td className="px-2 py-1.5 text-gray-600 max-w-xs truncate">
                    {b.addOns || '—'}
                  </td>
                  <td className="px-2 py-1.5">
                    {b.order ? (
                      <span className="text-blue-700 font-medium font-mono">
                        #{b.order.orderNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TypePill({ type }: { type: 'disco' | 'private' }) {
  return type === 'disco' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-800">
      Disco
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-700">
      Private
    </span>
  );
}

function OccasionBadge({ occasion }: { occasion: string }) {
  const o = occasion.toLowerCase();
  let color = 'bg-slate-100 text-slate-700';
  if (o.includes('bachelorette')) color = 'bg-pink-100 text-pink-800';
  else if (o.includes('bachelor')) color = 'bg-blue-100 text-blue-800';
  else if (o.includes('family')) color = 'bg-green-100 text-green-800';
  else if (o.includes('corporate')) color = 'bg-gray-200 text-gray-800';
  else if (o.includes('disco')) color = 'bg-purple-100 text-purple-800';
  else if (o.includes('birthday')) color = 'bg-yellow-100 text-yellow-800';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}
    >
      {occasion}
    </span>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function getTimeOfDayTint(timeSlot: string | null): string {
  if (!timeSlot) return '';
  const match = timeSlot.match(/^(\d{1,2})/);
  if (!match) return '';
  const hour = parseInt(match[1], 10);
  if (hour >= 6 && hour <= 11) return 'bg-amber-50/60';
  return 'bg-sky-50/50';
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
