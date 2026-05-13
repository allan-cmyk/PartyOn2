/**
 * Shared types for the RecommendationCard UI.
 *
 * Marketing recs are advisory (actionPayload is always null) — operator
 * reads, decides, ships outside the queue. Operations recs (Phase 1B/1C)
 * will carry an ActionPayload describing an inline button: re-pack a cooler,
 * adjust inventory, etc.
 */

import type { RecommendationStatus, RiskTier, EffortTier } from './lifecycle';

/**
 * Domain identifier. Open string so adding `ops`, `finance`, `cs` doesn't
 * require touching this file each time a new director comes online.
 */
export type RecommendationDomainId = 'marketing' | 'seo' | 'ops' | 'finance' | 'cs' | string;

/**
 * Visual severity hint. Distinct from RiskTier (which gates autonomy) —
 * severity is "how loud should this card look in the queue".
 */
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Evidence {
  metric?: string | null;
  currentValue?: string | null;
  targetValue?: string | null;
  impactDollarsMonthly?: number | null;
  segment?: string | null;
}

/**
 * Describes an inline action the operator can trigger from the card.
 * Marketing recs leave this null. Operations recs carry e.g.
 * { kind: 'repack-cooler', params: { coolerId: '...', items: [...] } }.
 * The card component renders a button when present; the click handler is
 * passed in from the page via RecommendationCardProps.onExecuteAction.
 */
export interface ActionPayload {
  kind: string;
  label?: string;
  params: Record<string, unknown>;
}

export interface MetricSnapshot {
  capturedAt: string;
  snapshotDate: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  marginCoveragePct: number | null;
}

/**
 * The shape the card renders. Compatible with the API GET response —
 * page-level types should extend this rather than duplicating fields.
 */
export interface RecommendationCardData {
  id: string;
  domain: RecommendationDomainId;
  source: string;
  generatedAt: string;
  title: string;
  body: string | null;
  segment: string | null;
  metric: string | null;
  currentValue: string | null;
  targetValue: string | null;
  impactDollarsMonthly: number | null;
  effortTier: EffortTier | null;
  riskTier: RiskTier;
  status: RecommendationStatus;
  shippedAt: string | null;
  notes: string | null;
  resultMetricBefore: MetricSnapshot | null;
  resultMetricAfter: MetricSnapshot | null;
  /** Null for advisory (Marketing) recs; populated for actionable (Ops) recs. */
  actionPayload?: ActionPayload | null;
  /** Optional severity hint. Marketing today doesn't set this. */
  severity?: Severity;
}

export interface RecommendationCardProps {
  rec: RecommendationCardData;
  /**
   * When true, the domain badge is rendered (used when the queue is showing
   * mixed-domain results). Marketing-only view hides it.
   */
  showDomainBadge?: boolean;
  isSaving?: boolean;
  isExpanded?: boolean;
  isEditingNotes?: boolean;
  notesValue?: string;
  onToggleExpand?: (id: string) => void;
  onRequestTransition?: (rec: RecommendationCardData, to: RecommendationStatus) => void;
  onStartEditNotes?: (id: string, initial: string) => void;
  onNotesChange?: (value: string) => void;
  onSaveNotes?: (id: string) => void;
  onCancelEditNotes?: () => void;
  /** Reserved for Phase 1B/1C — Marketing today never invokes this. */
  onExecuteAction?: (rec: RecommendationCardData) => void;
}
