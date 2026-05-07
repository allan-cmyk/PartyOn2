'use client';

/**
 * Marketing recommendation triage queue.
 *
 * Reads from /api/admin/analytics/recommendations (GET), updates via POST.
 * Sourced by the snapshot cron (auto-snapshot heuristics) and the Marketing
 * Director agent (director). Operator moves items through:
 *   open → approved → shipped (or rejected / invalidated)
 */

import { useEffect, useState, ReactElement, useCallback } from 'react';
import Link from 'next/link';

type Status = 'open' | 'approved' | 'shipped' | 'rejected' | 'invalidated';
type Domain = 'marketing' | 'seo';
type DomainFilter = Domain | 'all';
type RiskTier = 'autonomous' | 'recommend' | 'hard_stop';
type EffortTier = 's' | 'm' | 'l';

interface MetricSnapshot {
  capturedAt: string;
  snapshotDate: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  marginCoveragePct: number | null;
}

interface Recommendation {
  id: string;
  generatedAt: string;
  source: string;
  domain: Domain;
  title: string;
  body: string | null;
  segment: string | null;
  metric: string | null;
  currentValue: string | null;
  targetValue: string | null;
  impactDollarsMonthly: number | null;
  effortTier: EffortTier | null;
  riskTier: RiskTier;
  status: Status;
  shippedAt: string | null;
  notes: string | null;
  resultMetricBefore: MetricSnapshot | null;
  resultMetricAfter: MetricSnapshot | null;
}

const STATUS_TABS: { value: Status | 'all'; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'approved', label: 'Approved' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'invalidated', label: 'Invalidated' },
  { value: 'all', label: 'All' },
];

const DOMAIN_TABS: { value: DomainFilter; label: string }[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'seo', label: 'SEO' },
  { value: 'all', label: 'All' },
];

const RISK_LABEL: Record<RiskTier, string> = {
  autonomous: 'Autonomous',
  recommend: 'Recommend',
  hard_stop: 'Hard stop',
};

const EFFORT_LABEL: Record<EffortTier, string> = { s: 'S', m: 'M', l: 'L' };

/**
 * Whether a status transition should prompt the operator for a reason before applying.
 * - Reject: required (every dismissal needs an audit trail in Obsidian via the GitHub mirror)
 * - Mark shipped: optional (outcome notes are useful for the 14-day measurement loop but not required)
 * - Everything else (Approve, Re-open): no modal — keep the happy path frictionless
 */
const REASON_MODE: Record<Status, 'required' | 'optional' | 'none'> = {
  rejected: 'required',
  shipped: 'optional',
  open: 'none',
  approved: 'none',
  invalidated: 'required',
};

const REASON_MIN_CHARS = 10;

export default function RecommendationsTriagePage(): ReactElement {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<Status | 'all'>('open');
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('marketing');
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [pendingTransition, setPendingTransition] = useState<{ rec: Recommendation; toStatus: Status } | null>(null);

  const fetchRecs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (domainFilter !== 'all') params.set('domain', domainFilter);
      params.set('limit', '200');
      const res = await fetch(`/api/admin/analytics/recommendations?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setRecs(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, domainFilter]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  const updateStatus = async (id: string, status: Status, notes?: string) => {
    setSavingId(id);
    try {
      const res = await fetch('/api/admin/analytics/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, ...(notes !== undefined ? { notes } : {}) }),
      });
      if (res.ok) await fetchRecs();
    } catch (err) {
      console.error('Failed to update', err);
    } finally {
      setSavingId(null);
    }
  };

  const saveNotes = async (id: string) => {
    const rec = recs.find((r) => r.id === id);
    if (!rec) return;
    await updateStatus(id, rec.status, notesValue);
    setEditingNotes(null);
    setNotesValue('');
  };

  /**
   * Routes a status-change click. If the target status requires/accepts a reason, opens
   * the transition modal; otherwise applies directly. Keeps Approve/Re-open frictionless.
   */
  const requestTransition = (rec: Recommendation, toStatus: Status) => {
    if (REASON_MODE[toStatus] === 'none') {
      void updateStatus(rec.id, toStatus);
      return;
    }
    setPendingTransition({ rec, toStatus });
  };

  const submitTransition = async (reason: string) => {
    if (!pendingTransition) return;
    const { rec, toStatus } = pendingTransition;
    const trimmed = reason.trim();
    const notes = trimmed.length > 0 ? trimmed : undefined;
    await updateStatus(rec.id, toStatus, notes);
    setPendingTransition(null);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const counts = recs.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin/dashboard" className="text-blue-600 text-sm hover:underline">← Admin</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Analytics</span>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Recommendations</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading tracking-[0.05em]">Recommendation queue</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Marketing Director agent and snapshot heuristics propose actions here.
              Move them through open → approved → shipped (or reject) so the agent stops re-suggesting.
            </p>
          </div>
          <button
            onClick={fetchRecs}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm shadow-sm"
          >
            Refresh
          </button>
        </div>

        {/* Domain tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mr-1">Domain</span>
            {DOMAIN_TABS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDomainFilter(d.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  domainFilter === d.value
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === t.value
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
                {filter !== 'all' && filter === t.value && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                    {recs.length}
                  </span>
                )}
                {filter === 'all' && counts[t.value as Status] !== undefined && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                    {counts[t.value as Status]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
        ) : recs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-sm">No recommendations match this filter.</p>
            {filter === 'open' && domainFilter === 'marketing' && (
              <p className="text-gray-400 text-xs mt-2">
                The Marketing Director will populate this queue on the next weekly briefing run.
              </p>
            )}
            {filter === 'open' && domainFilter === 'seo' && (
              <p className="text-gray-400 text-xs mt-2">
                The SEO Director Phase 1 snapshot pipeline isn&apos;t live yet. SEO recs will start
                appearing here once <code className="px-1 bg-gray-100 rounded">/api/cron/seo-snapshot</code> ships.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recs.map((rec) => {
              const isExpanded = expanded.has(rec.id);
              const isSaving = savingId === rec.id;
              const isEditingThisNotes = editingNotes === rec.id;

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <StatusBadge status={rec.status} />
                          {domainFilter === 'all' && rec.domain && (
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                rec.domain === 'seo'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {rec.domain === 'seo' ? 'SEO' : 'Marketing'}
                            </span>
                          )}
                          {rec.segment && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-medium">
                              {rec.segment}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {rec.source === 'seo-director'
                              ? 'SEO Director'
                              : rec.source === 'director'
                                ? 'Director'
                                : rec.source === 'auto-snapshot'
                                  ? 'Heuristic'
                                  : 'Manual'}
                            {' · '}
                            {new Date(rec.generatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 leading-snug">{rec.title}</h3>
                        {rec.body && !isExpanded && (
                          <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{rec.body}</p>
                        )}
                        {rec.body && isExpanded && (
                          <p className="text-sm text-gray-700 mt-1.5 whitespace-pre-wrap leading-relaxed">{rec.body}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {rec.impactDollarsMonthly != null && (
                            <span className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 font-semibold">
                              ${rec.impactDollarsMonthly.toLocaleString()}/mo
                            </span>
                          )}
                          {rec.effortTier && (
                            <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold">
                              Effort · {EFFORT_LABEL[rec.effortTier]}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-md font-semibold ${
                              rec.riskTier === 'hard_stop'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : rec.riskTier === 'autonomous'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            Risk · {RISK_LABEL[rec.riskTier]}
                          </span>
                          {rec.metric && (
                            <span className="text-xs px-2 py-1 rounded-md bg-gray-50 text-gray-600 font-mono">
                              {rec.metric}
                            </span>
                          )}
                          {rec.body && (
                            <button
                              onClick={() => toggleExpand(rec.id)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {isExpanded ? 'Show less' : 'Show details'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end shrink-0">
                        <ActionButtons
                          rec={rec}
                          isSaving={isSaving}
                          onChange={(status) => requestTransition(rec, status)}
                        />
                      </div>
                    </div>

                    {/* Measurement block — appears for shipped recs once before is captured */}
                    {(rec.resultMetricBefore || rec.resultMetricAfter) && (
                      <MeasurementBlock before={rec.resultMetricBefore} after={rec.resultMetricAfter} />
                    )}

                    {/* Notes block */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {isEditingThisNotes ? (
                        <div>
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            placeholder="Why this status? Outcome notes after shipping?"
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => saveNotes(rec.id)}
                              disabled={isSaving}
                              className="px-3 py-1.5 text-sm bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60"
                            >
                              Save notes
                            </button>
                            <button
                              onClick={() => { setEditingNotes(null); setNotesValue(''); }}
                              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : rec.notes ? (
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mr-2">Notes</span>
                            {rec.notes}
                          </div>
                          <button
                            onClick={() => { setEditingNotes(rec.id); setNotesValue(rec.notes ?? ''); }}
                            className="text-xs text-blue-600 hover:underline shrink-0"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingNotes(rec.id); setNotesValue(''); }}
                          className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                        >
                          + Add notes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {pendingTransition && (
        <TransitionModal
          rec={pendingTransition.rec}
          toStatus={pendingTransition.toStatus}
          isSaving={savingId === pendingTransition.rec.id}
          onCancel={() => setPendingTransition(null)}
          onSubmit={submitTransition}
        />
      )}
    </div>
  );
}

function TransitionModal({
  rec,
  toStatus,
  isSaving,
  onCancel,
  onSubmit,
}: {
  rec: Recommendation;
  toStatus: Status;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}): ReactElement {
  const mode = REASON_MODE[toStatus];
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const tooShort = mode === 'required' && trimmed.length < REASON_MIN_CHARS;
  const heading = toStatus === 'rejected'
    ? 'Reject — why?'
    : toStatus === 'shipped'
    ? 'Mark shipped — outcome notes (optional)'
    : toStatus === 'invalidated'
    ? 'Invalidate — why?'
    : 'Add a reason';
  const placeholder = toStatus === 'rejected'
    ? 'Explain why this rec is being dismissed. Reference an ADR if applicable (e.g. M0001).'
    : toStatus === 'shipped'
    ? 'What did you actually ship? Any deviations from the rec? Captured for the 14-day measurement loop.'
    : 'Reason…';
  const submitLabel = toStatus === 'rejected'
    ? 'Reject'
    : toStatus === 'shipped'
    ? 'Mark shipped'
    : toStatus === 'invalidated'
    ? 'Invalidate'
    : 'Confirm';
  const submitTone = toStatus === 'rejected' || toStatus === 'invalidated' ? 'danger' : 'primary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transition-modal-heading"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="transition-modal-heading" className="text-lg font-semibold text-gray-900">{heading}</h2>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{rec.title}</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full mt-4 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          autoFocus
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${tooShort ? 'text-red-600' : 'text-gray-500'}`}>
            {mode === 'required'
              ? `Required · ${trimmed.length}/${REASON_MIN_CHARS} min`
              : 'Optional — leave blank to skip'}
          </span>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={isSaving || tooShort}
            className={`px-4 py-2 text-sm rounded-lg font-semibold disabled:opacity-50 ${
              submitTone === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-brand-blue text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? '…' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }): ReactElement {
  const styles: Record<Status, string> = {
    open: 'bg-amber-50 text-amber-800 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-gray-100 text-gray-600 border-gray-200',
    invalidated: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function MeasurementBlock({
  before,
  after,
}: {
  before: MetricSnapshot | null;
  after: MetricSnapshot | null;
}): ReactElement {
  const fmtMoney = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const fmtDelta = (b: number | null, a: number | null) => {
    if (b == null || a == null || b === 0) return null;
    const pct = ((a - b) / b) * 100;
    const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '—';
    return { pct, label: `${arrow} ${Math.abs(pct).toFixed(0)}%` };
  };

  const revenueDelta = before && after ? fmtDelta(before.revenue, after.revenue) : null;
  const ordersDelta = before && after ? fmtDelta(before.orders, after.orders) : null;
  const aovDelta = before && after ? fmtDelta(before.averageOrderValue, after.averageOrderValue) : null;
  const coverageDelta =
    before && after && before.marginCoveragePct != null && after.marginCoveragePct != null
      ? fmtDelta(before.marginCoveragePct, after.marginCoveragePct)
      : null;

  const toneClass = (d: { pct: number } | null) =>
    d == null
      ? 'text-gray-400'
      : d.pct > 0
      ? 'text-green-700'
      : d.pct < 0
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
        Measurement {after ? '(14 days post-ship)' : '(awaiting 14-day capture)'}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {[
          { label: 'Revenue', before: before?.revenue, after: after?.revenue, delta: revenueDelta, fmt: fmtMoney },
          { label: 'Orders', before: before?.orders, after: after?.orders, delta: ordersDelta, fmt: (n: number) => n.toString() },
          { label: 'AOV', before: before?.averageOrderValue, after: after?.averageOrderValue, delta: aovDelta, fmt: fmtMoney },
          {
            label: 'Coverage',
            before: before?.marginCoveragePct ?? null,
            after: after?.marginCoveragePct ?? null,
            delta: coverageDelta,
            fmt: (n: number) => `${n}%`,
          },
        ].map((m) => (
          <div key={m.label} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{m.label}</div>
            <div className="text-base font-semibold text-gray-900">
              {m.before != null ? m.fmt(m.before) : '—'}
              {' → '}
              {m.after != null ? m.fmt(m.after) : <span className="text-gray-400">pending</span>}
            </div>
            {m.delta && (
              <div className={`text-xs font-semibold mt-0.5 ${toneClass(m.delta)}`}>{m.delta.label}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButtons({
  rec,
  isSaving,
  onChange,
}: {
  rec: Recommendation;
  isSaving: boolean;
  onChange: (status: Status) => void;
}): ReactElement {
  const transitions: Record<Status, Array<{ to: Status; label: string; tone: 'primary' | 'neutral' | 'danger' }>> = {
    open: [
      { to: 'approved', label: 'Approve', tone: 'primary' },
      { to: 'rejected', label: 'Reject', tone: 'neutral' },
    ],
    approved: [
      { to: 'shipped', label: 'Mark shipped', tone: 'primary' },
      { to: 'open', label: 'Re-open', tone: 'neutral' },
    ],
    shipped: [
      { to: 'open', label: 'Re-open', tone: 'neutral' },
    ],
    rejected: [
      { to: 'open', label: 'Re-open', tone: 'neutral' },
    ],
    invalidated: [
      { to: 'open', label: 'Re-open', tone: 'neutral' },
    ],
  };

  const opts = transitions[rec.status];
  return (
    <div className="flex gap-2 flex-wrap md:justify-end">
      {opts.map((opt) => {
        const cls =
          opt.tone === 'primary'
            ? 'bg-brand-blue text-white hover:bg-blue-700'
            : opt.tone === 'danger'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50';
        return (
          <button
            key={opt.to}
            onClick={() => onChange(opt.to)}
            disabled={isSaving}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${cls}`}
          >
            {isSaving ? '…' : opt.label}
          </button>
        );
      })}
    </div>
  );
}
