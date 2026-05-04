/**
 * Adapter — turn an AnalyticsSnapshot (+ supplemental queries) into the
 * structured BriefingEmailData used by the chart-driven email template.
 *
 * Time-series charts (revenue trend, margin coverage trend) pull the last 8
 * snapshots so we don't bloat the snapshot itself. If history is missing,
 * the corresponding chart gets nulled out and the renderer skips it.
 */

import { prisma } from '@/lib/database/client';
import type { AnalyticsSnapshot, RecommendationItem } from '@prisma/client';
import type {
  BriefingEmailData,
  EffortTier,
  RiskTier,
  Tone,
} from '@/lib/email/templates/marketing-briefing';

interface SegmentRow {
  segment: string;
  orders: number;
  revenue: number;
  margin: number | null;
  averageOrderValue: number;
  averageMarginPct: number | null;
}

interface AffiliateRoiRow {
  code: string;
  businessName: string;
  orders: number;
  revenue: number;
  margin: number | null;
  commissionPaid: number;
  netMargin: number | null;
  roiPct: number | null;
}

interface ChannelRow {
  channel: string;
  revenue: number;
  priorRevenue?: number;
  deltaPct?: number;
}

interface ProductMarginRow {
  product: string;
  revenue: number;
  marginPct: number;
}

interface BuildPayloadInput {
  snapshot: AnalyticsSnapshot;
  weekLabel: string;       // "2026-W18"
  issueNumber: number;     // 18
  year: number;
  generatedAt: Date;
  openRecs: RecommendationItem[];
  archiveUrl: string;
  queueUrl: string;
}

const formatGeneratedDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });

function effortFromTier(t: string | null): EffortTier {
  if (t === 's' || t === 'S') return 'S';
  if (t === 'l' || t === 'L') return 'L';
  return 'M';
}

function riskFromTier(t: string | null): RiskTier {
  if (t === 'autonomous' || t === 'recommend' || t === 'hard_stop') return t;
  return 'recommend';
}

export async function buildBriefingPayloadFromSnapshot(
  input: BuildPayloadInput
): Promise<BriefingEmailData> {
  const { snapshot, weekLabel, issueNumber, year, generatedAt, openRecs, archiveUrl, queueUrl } = input;

  // ---------- pull supplemental snapshots for trend charts ----------
  const recentSnapshots = await prisma.analyticsSnapshot.findMany({
    orderBy: { date: 'desc' },
    take: 8,
    select: { date: true, revenue: true, marginData: true, comparisonData: true },
  });
  // Reverse to chronological order (oldest → newest).
  const trendSnapshots = recentSnapshots.slice().reverse();

  // ---------- top action ----------
  // Promote the highest-impact open rec to the "top action" callout.
  const topRec = openRecs
    .filter((r) => r.status === 'open' && (r.impactDollarsMonthly ?? 0) > 0)
    .sort((a, b) => (b.impactDollarsMonthly ?? 0) - (a.impactDollarsMonthly ?? 0))[0];

  const topAction: BriefingEmailData['topAction'] = topRec
    ? {
        headline: topRec.title,
        body: (topRec.body ?? '').trim().slice(0, 240) || 'See full recommendation in triage queue.',
        impactPill: topRec.impactDollarsMonthly
          ? `+ $${topRec.impactDollarsMonthly.toLocaleString()} / month margin recovered`
          : 'High-impact action',
      }
    : null;

  // ---------- stats ----------
  const segmentData = (snapshot.segmentData ?? {}) as { segments?: SegmentRow[] };
  const comparisonData = (snapshot.comparisonData ?? {}) as { segments?: SegmentRow[] };
  const marginData = (snapshot.marginData ?? {}) as {
    affiliateRoi?: AffiliateRoiRow[];
    coveragePct?: number;
    channels?: ChannelRow[];
    lowMarginProducts?: ProductMarginRow[];
  };

  const movers = (segmentData.segments ?? []).filter((c) => {
    const p = (comparisonData.segments ?? []).find((x) => x.segment === c.segment);
    if (!p || p.revenue === 0) return false;
    return Math.abs((c.revenue - p.revenue) / p.revenue) >= 0.2;
  });

  const negativeRoi = (marginData.affiliateRoi ?? []).filter((a) => a.netMargin != null && a.netMargin < 0);
  const flagsCount = negativeRoi.length + (segmentData.segments ?? []).filter((c) => {
    const p = (comparisonData.segments ?? []).find((x) => x.segment === c.segment);
    if (!p || p.revenue === 0) return false;
    return ((c.revenue - p.revenue) / p.revenue) <= -0.2;
  }).length;

  const coveragePct = marginData.coveragePct ?? 0;

  // Sparkline data: last 8 weeks where available (we approximate from recent snapshots)
  const coverageSpark = trendSnapshots
    .map((s) => {
      const md = (s.marginData ?? {}) as { coveragePct?: number };
      return md.coveragePct ?? 0;
    })
    .filter((v) => v >= 0);

  const stats: BriefingEmailData['stats'] = [
    {
      label: 'Open Recs',
      value: String(openRecs.filter((r) => r.status === 'open').length),
      tone: 'neutral',
    },
    {
      label: 'Movers',
      value: String(movers.length),
      tone: 'neutral',
    },
    {
      label: 'Flags',
      value: String(flagsCount),
      tone: flagsCount > 0 ? 'caution' : 'neutral',
    },
    {
      label: 'Margin Coverage',
      value: `${Math.round(coveragePct)}%`,
      tone: coveragePct >= 70 ? 'good' : coveragePct >= 40 ? 'caution' : 'urgent',
      spark: coverageSpark.length >= 2 ? coverageSpark : undefined,
    },
  ];

  // Add sparkline to stat 0 (Open Recs) only if we can derive trend; for now leave undefined.
  // (This is an obvious next-iteration hook.)

  // ---------- analyst note ----------
  // Prefer a "non-obvious" finding from the data; falls back to null gracefully.
  let analystNote: string | null = null;
  const repeatRate = (segmentData as { repeatRate?: Array<{ segment: string; repeatRatePct: number }> }).repeatRate ?? [];
  const unknownRepeat = repeatRate.find((r) => r.segment === 'unknown');
  const generalRepeat = repeatRate.find((r) => r.segment === 'general');
  if (unknownRepeat && generalRepeat && unknownRepeat.repeatRatePct > generalRepeat.repeatRatePct * 1.3) {
    analystNote = `The <strong>"unknown" segment shows ${unknownRepeat.repeatRatePct}% repeat rate</strong> — meaningfully higher than general (${generalRepeat.repeatRatePct}%). Either misclassified data or an untracked high-LTV cohort. Worth a one-day audit before designing retention plays.`;
  }

  // ---------- prioritized actions ----------
  const actions: BriefingEmailData['actions'] = openRecs
    .filter((r) => r.status === 'open')
    .sort((a, b) => (b.impactDollarsMonthly ?? 0) - (a.impactDollarsMonthly ?? 0))
    .slice(0, 3)
    .map((r, i) => ({
      rank: String(i + 1).padStart(2, '0'),
      title: r.title,
      whyNow: (r.body ?? '').trim().slice(0, 320) || 'See triage queue for details.',
      effort: effortFromTier(r.effortTier),
      risk: riskFromTier(r.riskTier),
      impact: r.impactDollarsMonthly ? `+ $${r.impactDollarsMonthly.toLocaleString()} / mo` : 'See queue',
    }));

  // ---------- charts ----------
  // Revenue trend: 8 most recent snapshots' revenue.
  const revenueTrend = trendSnapshots.length >= 2
    ? {
        labels: trendSnapshots.map((s) => `W${weekOfDate(s.date)}`),
        values: trendSnapshots.map((s) => Number(s.revenue ?? 0)),
        latestDeltaPct: percentDelta(
          Number(trendSnapshots[trendSnapshots.length - 1].revenue ?? 0),
          Number(trendSnapshots[trendSnapshots.length - 2].revenue ?? 0)
        ),
      }
    : null;

  // Channel mix: from snapshot-level channel rollup if present, else from session counts.
  const channels = marginData.channels ?? [];
  const channelMix = channels.length
    ? channels.slice(0, 4).map((c) => ({
        label: c.channel,
        value: c.revenue,
        deltaPct: c.deltaPct ?? null,
        tone: 'neutral' as Tone,
      }))
    : null;

  const affiliateRoi = (marginData.affiliateRoi ?? []).length
    ? marginData.affiliateRoi!
        .filter((a) => a.roiPct != null)
        .sort((a, b) => (b.roiPct ?? 0) - (a.roiPct ?? 0))
        .slice(0, 5)
        .map((a) => ({
          partner: a.businessName,
          roiPct: Math.round(a.roiPct ?? 0),
        }))
    : null;

  const marginByProduct = (marginData.lowMarginProducts ?? []).length
    ? marginData.lowMarginProducts!
        .sort((a, b) => b.marginPct - a.marginPct)
        .slice(0, 6)
        .map((p) => ({ product: p.product, marginPct: Math.round(p.marginPct) }))
    : null;

  const marginCoverageTrend = coverageSpark.length >= 2
    ? {
        labels: trendSnapshots.map((s) => `W${weekOfDate(s.date)}`),
        values: coverageSpark.map((v) => Math.round(v)),
        goalPct: 70,
      }
    : null;

  // ---------- whats lacking ----------
  const whatsLacking: string[] = [];
  if (!channelMix) whatsLacking.push('Channel revenue rollup is not in the snapshot yet.');
  if (!affiliateRoi) whatsLacking.push('Affiliate ROI data not yet populated.');
  if (!marginByProduct) whatsLacking.push('Top low-margin products list not yet populated.');
  if (coveragePct < 70) whatsLacking.push(`Margin coverage at ${Math.round(coveragePct)}% — recommendations gate at 70%.`);

  return {
    weekLabel,
    issueNumber,
    year,
    generatedDate: formatGeneratedDate(generatedAt),
    topAction,
    stats,
    analystNote,
    actions,
    charts: {
      revenueTrend,
      channelMix,
      affiliateRoi,
      marginByProduct,
      marginCoverageTrend,
    },
    whatsLacking,
    links: { archive: archiveUrl, queue: queueUrl },
    generatedAtIso: generatedAt.toISOString(),
    marginCoveragePct: Math.round(coveragePct),
  };
}

// ---------- small helpers ----------

function percentDelta(latest: number, prior: number): number {
  if (prior === 0) return 0;
  return ((latest - prior) / prior) * 100;
}

function weekOfDate(date: Date | string): string {
  const d = new Date(date);
  const u = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = u.getUTCDay() || 7;
  u.setUTCDate(u.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(u.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((u.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return String(week).padStart(2, '0');
}
