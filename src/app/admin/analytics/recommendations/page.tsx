'use client';

/**
 * Marketing recommendation triage queue.
 *
 * Reads from /api/admin/analytics/recommendations (GET), updates via POST.
 * Sourced by the snapshot cron (auto-snapshot heuristics) and the Marketing
 * Director agent (director). Operator moves items through:
 *   open → approved → shipped (or rejected / invalidated)
 *
 * Card rendering is delegated to the shared RecommendationCard component so
 * Operations / SEO / Finance queues can reuse it (per Ops Director Phase 1A).
 */

import { useEffect, useState, ReactElement, useCallback } from 'react';
import Link from 'next/link';
import { RecommendationCard } from '@/components/admin/RecommendationCard';
import {
  MARKETING_STATUSES,
  REASON_MIN_CHARS,
  REASON_MODE,
  type RecommendationStatus,
} from '@/lib/recommendations/lifecycle';
import type { RecommendationCardData } from '@/lib/recommendations/card-types';

type Status = RecommendationStatus;
type Domain = 'marketing' | 'seo';
type DomainFilter = Domain | 'all';

type Recommendation = RecommendationCardData & { domain: Domain };

const STATUS_TABS: { value: Status | 'all'; label: string }[] = [
  ...MARKETING_STATUSES.map((s) => ({
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  })),
  { value: 'all', label: 'All' },
];

const DOMAIN_TABS: { value: DomainFilter; label: string }[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'seo', label: 'SEO' },
  { value: 'all', label: 'All' },
];

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
            {recs.map((rec) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                showDomainBadge={domainFilter === 'all'}
                isSaving={savingId === rec.id}
                isExpanded={expanded.has(rec.id)}
                isEditingNotes={editingNotes === rec.id}
                notesValue={notesValue}
                onToggleExpand={toggleExpand}
                onRequestTransition={(r, to) => requestTransition(r as Recommendation, to)}
                onStartEditNotes={(id, initial) => {
                  setEditingNotes(id);
                  setNotesValue(initial);
                }}
                onNotesChange={setNotesValue}
                onSaveNotes={saveNotes}
                onCancelEditNotes={() => {
                  setEditingNotes(null);
                  setNotesValue('');
                }}
              />
            ))}
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
