'use client';

/**
 * Shared RecommendationCard — renders one row of the triage queue.
 *
 * Marketing uses this today (advisory recs, no inline action). Operations
 * (Phase 1B/1C) will pass `onExecuteAction` so the card sprouts an inline
 * action button derived from `rec.actionPayload`.
 *
 * Stateless — all UI state (expanded, editing notes) is lifted to the page.
 */

import { ReactElement } from 'react';
import { NEXT_TRANSITIONS, type RecommendationStatus } from '@/lib/recommendations/lifecycle';
import type {
  MetricSnapshot,
  RecommendationCardData,
  RecommendationCardProps,
} from '@/lib/recommendations/card-types';
import type { RiskTier, EffortTier } from '@/lib/recommendations/lifecycle';

const RISK_LABEL: Record<RiskTier, string> = {
  autonomous: 'Autonomous',
  recommend: 'Recommend',
  hard_stop: 'Hard stop',
};

const EFFORT_LABEL: Record<EffortTier, string> = { s: 'S', m: 'M', l: 'L' };

function sourceLabel(source: string): string {
  if (source === 'seo-director') return 'SEO Director';
  if (source === 'director') return 'Director';
  if (source === 'auto-snapshot') return 'Heuristic';
  return 'Manual';
}

export function RecommendationCard({
  rec,
  showDomainBadge = false,
  isSaving = false,
  isExpanded = false,
  isEditingNotes = false,
  notesValue = '',
  onToggleExpand,
  onRequestTransition,
  onStartEditNotes,
  onNotesChange,
  onSaveNotes,
  onCancelEditNotes,
  onExecuteAction,
}: RecommendationCardProps): ReactElement {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <StatusBadge status={rec.status} />
              {showDomainBadge && rec.domain && (
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
                {sourceLabel(rec.source)}
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
              {rec.body && onToggleExpand && (
                <button
                  onClick={() => onToggleExpand(rec.id)}
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
              onChange={(status) => onRequestTransition?.(rec, status)}
              onExecuteAction={onExecuteAction}
            />
          </div>
        </div>

        {(rec.resultMetricBefore || rec.resultMetricAfter) && (
          <MeasurementBlock before={rec.resultMetricBefore} after={rec.resultMetricAfter} />
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          {isEditingNotes ? (
            <div>
              <textarea
                value={notesValue}
                onChange={(e) => onNotesChange?.(e.target.value)}
                placeholder="Why this status? Outcome notes after shipping?"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSaveNotes?.(rec.id)}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  Save notes
                </button>
                <button
                  onClick={() => onCancelEditNotes?.()}
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
                onClick={() => onStartEditNotes?.(rec.id, rec.notes ?? '')}
                className="text-xs text-blue-600 hover:underline shrink-0"
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartEditNotes?.(rec.id, '')}
              className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
            >
              + Add notes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: RecommendationStatus }): ReactElement {
  const styles: Record<RecommendationStatus, string> = {
    open: 'bg-amber-50 text-amber-800 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-gray-100 text-gray-600 border-gray-200',
    invalidated: 'bg-gray-100 text-gray-500 border-gray-200',
    snoozed: 'bg-slate-100 text-slate-600 border-slate-200',
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
  onExecuteAction,
}: {
  rec: RecommendationCardData;
  isSaving: boolean;
  onChange: (status: RecommendationStatus) => void;
  onExecuteAction?: (rec: RecommendationCardData) => void;
}): ReactElement {
  const opts = NEXT_TRANSITIONS[rec.status] ?? [];
  return (
    <div className="flex gap-2 flex-wrap md:justify-end">
      {rec.actionPayload && onExecuteAction && (
        <button
          onClick={() => onExecuteAction(rec)}
          disabled={isSaving}
          className="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-brand-yellow text-gray-900 hover:bg-yellow-400"
        >
          {rec.actionPayload.label ?? 'Run action'}
        </button>
      )}
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
