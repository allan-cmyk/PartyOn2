/**
 * Recommendation lifecycle — shared status state machine.
 *
 * Used by Marketing today; will be reused by Operations, SEO, Finance, CS.
 * Domain-specific code decides which subset of statuses it actually exposes
 * (e.g. Marketing currently ignores `snoozed`). The state machine itself is
 * domain-agnostic.
 *
 * Transitions:
 *   open ─→ approved ─→ shipped ─→ (measured via resultMetricAfter)
 *     │        │           │
 *     │        └────────── re-open ─┐
 *     ├──→ rejected ───── re-open ──┤
 *     ├──→ invalidated ── re-open ──┤
 *     └──→ snoozed ───── re-open ───┘
 */

export type RecommendationStatus =
  | 'open'
  | 'approved'
  | 'shipped'
  | 'rejected'
  | 'invalidated'
  | 'snoozed';

export type RiskTier = 'autonomous' | 'recommend' | 'hard_stop';
export type EffortTier = 's' | 'm' | 'l';

export const ALL_STATUSES: RecommendationStatus[] = [
  'open',
  'approved',
  'shipped',
  'rejected',
  'invalidated',
  'snoozed',
];

/**
 * Statuses currently used by the Marketing Director queue. Operations Director
 * (Phase 1B/1C) may opt into the full set.
 */
export const MARKETING_STATUSES: RecommendationStatus[] = [
  'open',
  'approved',
  'shipped',
  'rejected',
  'invalidated',
];

/**
 * What you can transition TO from each status.
 */
export const VALID_TRANSITIONS: Record<RecommendationStatus, RecommendationStatus[]> = {
  open: ['approved', 'rejected', 'invalidated', 'snoozed'],
  approved: ['shipped', 'open', 'rejected'],
  shipped: ['open'],
  rejected: ['open'],
  invalidated: ['open'],
  snoozed: ['open', 'rejected', 'invalidated'],
};

export function isValidTransition(
  from: RecommendationStatus,
  to: RecommendationStatus
): boolean {
  if (from === to) return false;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Whether a status transition should prompt the operator for a reason.
 * - required: dismissals need an audit trail (mirrored to Obsidian).
 * - optional: outcome notes are useful but not enforced.
 * - none: keep the happy path frictionless.
 */
export const REASON_MODE: Record<RecommendationStatus, 'required' | 'optional' | 'none'> = {
  rejected: 'required',
  invalidated: 'required',
  shipped: 'optional',
  snoozed: 'optional',
  open: 'none',
  approved: 'none',
};

export const REASON_MIN_CHARS = 10;

export type TransitionTone = 'primary' | 'neutral' | 'danger';

export interface TransitionOption {
  to: RecommendationStatus;
  label: string;
  tone: TransitionTone;
}

/**
 * Buttons offered for each current status in the triage UI. Subset of
 * VALID_TRANSITIONS — some valid transitions don't need a top-level button
 * (e.g. open→snoozed is wired through a separate "Snooze" action when Ops
 * needs it).
 */
export const NEXT_TRANSITIONS: Record<RecommendationStatus, TransitionOption[]> = {
  open: [
    { to: 'approved', label: 'Approve', tone: 'primary' },
    { to: 'rejected', label: 'Reject', tone: 'neutral' },
  ],
  approved: [
    { to: 'shipped', label: 'Mark shipped', tone: 'primary' },
    { to: 'open', label: 'Re-open', tone: 'neutral' },
  ],
  shipped: [{ to: 'open', label: 'Re-open', tone: 'neutral' }],
  rejected: [{ to: 'open', label: 'Re-open', tone: 'neutral' }],
  invalidated: [{ to: 'open', label: 'Re-open', tone: 'neutral' }],
  snoozed: [
    { to: 'open', label: 'Re-open', tone: 'neutral' },
    { to: 'rejected', label: 'Reject', tone: 'neutral' },
  ],
};
