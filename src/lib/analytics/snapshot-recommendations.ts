/**
 * Heuristic recommendations generated from nightly snapshot rollups.
 * Different from `recommendations.ts` — those operate on first-party behavior/experiment/sales
 * shapes; these consume the segment / affiliate / product-margin rollups the cron already pulls.
 *
 * Output is fed into persistRecommendations() so each finding shows up in the open queue.
 * Title+segment dedupe in the store means the same finding doesn't insert again next night
 * if it's still open (or if ops has already approved it).
 */

import type { SegmentRollup, AffiliateRoiRow, ProductMarginRow } from './internal-rollups';
import type { RecommendationInput } from './recommendation-store';

const SEGMENT_MIN_ORDERS = 5;          // segment must have at least this many orders to flag
const AFFILIATE_NEG_ROI_MIN_COMMISSION = 50; // dollars — ignore tiny dust
const PRODUCT_LOW_MARGIN_THRESHOLD = 25;     // %
const PRODUCT_TOP_N_BY_REVENUE = 10;
const SEGMENT_WOW_DROP_PCT = 20;             // flag segments down 20%+ WoW
const COVERAGE_THRESHOLD_PCT = 70;           // below this, margin-derived flags are suppressed in favor of a data-quality flag

export function buildSnapshotRecommendations(input: {
  segments: SegmentRollup[];
  segmentsPrior: SegmentRollup[];
  affiliateRoi: AffiliateRoiRow[];
  productMargins: ProductMarginRow[];
}): RecommendationInput[] {
  const recs: RecommendationInput[] = [];

  // 1. Negative-ROI affiliates (commission paid > attributable margin) — suppressed when
  //    margin coverage is too low (replaced with a data-quality flag instead).
  for (const a of input.affiliateRoi) {
    if (a.commissionPaid < AFFILIATE_NEG_ROI_MIN_COMMISSION) continue;
    if (a.marginCoveragePct < COVERAGE_THRESHOLD_PCT) {
      recs.push({
        title: `Affiliate ${a.code}: margin coverage too low to evaluate ROI`,
        body: [
          `${a.businessName} (code ${a.code}) drove ${a.orders} orders and $${a.revenue.toLocaleString()} revenue,`,
          `but only ${a.marginCoveragePct.toFixed(0)}% of that revenue has cost data — ROI calculation is unreliable.`,
          `Action: process more distributor invoices via Receive Shipment, then re-evaluate.`,
        ].join(' '),
        metric: `affiliate-coverage:${a.code}`,
        currentValue: `${a.marginCoveragePct.toFixed(0)}% coverage`,
        targetValue: `>${COVERAGE_THRESHOLD_PCT}% coverage`,
        effortTier: 'm',
        riskTier: 'recommend',
      });
      continue;
    }
    if (a.netMargin == null || a.netMargin >= 0) continue;
    recs.push({
      title: `Review affiliate ${a.code} — negative ROI`,
      body: [
        `${a.businessName} (code ${a.code}) drove ${a.orders} orders and $${a.revenue.toLocaleString()} revenue this period,`,
        `with ${a.marginCoveragePct.toFixed(0)}% margin coverage.`,
        `Generated $${a.margin?.toLocaleString() ?? '—'} attributable margin against $${a.commissionPaid.toLocaleString()} in commission.`,
        `Net margin is $${a.netMargin.toLocaleString()} (${a.roiPct ?? '—'}% ROI). Investigate: rate too high, product mix low-margin, or fraud/self-referral pattern.`,
      ].join(' '),
      metric: `affiliate-roi:${a.code}`,
      currentValue: `${a.roiPct ?? '—'}% ROI`,
      targetValue: '>0% ROI',
      impactDollarsMonthly: Math.abs(Math.round(a.netMargin)),
      effortTier: 's',
      riskTier: 'recommend',
    });
  }

  // 2. Segment WoW revenue drop
  for (const s of input.segments) {
    if (s.orders < SEGMENT_MIN_ORDERS) continue;
    const prior = input.segmentsPrior.find((p) => p.segment === s.segment);
    if (!prior || prior.revenue === 0) continue;
    const dropPct = ((prior.revenue - s.revenue) / prior.revenue) * 100;
    if (dropPct < SEGMENT_WOW_DROP_PCT) continue;
    recs.push({
      title: `Segment ${s.segment} revenue down ${dropPct.toFixed(0)}% WoW`,
      body: `${s.segment} segment: ${s.orders} orders / $${s.revenue.toLocaleString()} (was ${prior.orders} / $${prior.revenue.toLocaleString()} prior 30 days). Investigate landing page changes, ad spend, seasonality.`,
      segment: s.segment,
      metric: `segment-revenue-wow:${s.segment}`,
      currentValue: `$${s.revenue.toLocaleString()}`,
      targetValue: `$${prior.revenue.toLocaleString()}`,
      impactDollarsMonthly: Math.round(prior.revenue - s.revenue),
      effortTier: 'm',
      riskTier: 'recommend',
    });
  }

  // 3. Top-revenue product with low margin — only flag when coverage is high enough that
  //    the margin% is trustworthy. Below threshold, the marginPct is computed from a thin
  //    slice of items and isn't representative.
  const top = [...input.productMargins].sort((a, b) => b.revenue - a.revenue).slice(0, PRODUCT_TOP_N_BY_REVENUE);
  for (const p of top) {
    if (p.revenue === 0) continue;
    if (p.marginCoveragePct < COVERAGE_THRESHOLD_PCT) continue;
    if (p.marginPct >= PRODUCT_LOW_MARGIN_THRESHOLD) continue;
    recs.push({
      title: `Low margin on top-revenue product: ${p.title}`,
      body: `${p.title} drove $${p.revenue.toLocaleString()} revenue (${p.unitsSold} units) at ${p.marginPct}% margin (${p.marginCoveragePct.toFixed(0)}% cost coverage). Options: raise price (check elasticity), de-feature, or renegotiate COGS with distributor.`,
      metric: `product-margin:${p.productId}`,
      currentValue: `${p.marginPct}%`,
      targetValue: `${PRODUCT_LOW_MARGIN_THRESHOLD}%+`,
      impactDollarsMonthly: Math.round(p.revenue * ((PRODUCT_LOW_MARGIN_THRESHOLD - p.marginPct) / 100)),
      effortTier: 's',
      riskTier: 'recommend',
    });
  }

  return recs;
}
