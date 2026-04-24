/**
 * A/B test statistical significance — two-proportion z-test on conversion rate.
 *
 * Picks the variant with the highest conversion rate and computes a p-value
 * vs. the control. Caller decides the confidence threshold to declare a winner
 * (typical: 0.95).
 */

export interface VariantStat {
  id: string;
  name: string;
  isControl: boolean;
  impressions: number;
  conversions: number;
}

export interface VariantWithSignificance extends VariantStat {
  conversionRate: number;
  liftPct: number | null;
  pValue: number | null;
  confidence: number | null;
}

export interface SignificanceResult {
  variants: VariantWithSignificance[];
  winner: VariantWithSignificance | null;
  control: VariantWithSignificance | null;
  hasEnoughData: boolean;
}

const MIN_IMPRESSIONS_PER_VARIANT = 100;

/**
 * Compute significance for a set of A/B variants.
 * @param variants Stats for each variant (one must be marked isControl).
 * @param confidenceThreshold Default 0.95. Winner is declared only when the leader's
 *        confidence vs. control exceeds this and has enough data.
 */
export function computeSignificance(
  variants: VariantStat[],
  confidenceThreshold = 0.95
): SignificanceResult {
  const control = variants.find((v) => v.isControl) ?? variants[0] ?? null;
  const controlRate = control ? safeRate(control.conversions, control.impressions) : 0;

  const enriched: VariantWithSignificance[] = variants.map((v) => {
    const rate = safeRate(v.conversions, v.impressions);
    if (!control || v.id === control.id) {
      return { ...v, conversionRate: rate, liftPct: null, pValue: null, confidence: null };
    }
    const { pValue } = twoProportionZTest(
      control.conversions,
      control.impressions,
      v.conversions,
      v.impressions
    );
    const liftPct = controlRate > 0 ? ((rate - controlRate) / controlRate) * 100 : null;
    return {
      ...v,
      conversionRate: rate,
      liftPct,
      pValue,
      confidence: pValue == null ? null : 1 - pValue,
    };
  });

  const hasEnoughData = variants.every((v) => v.impressions >= MIN_IMPRESSIONS_PER_VARIANT);

  const controlEnriched = control ? enriched.find((v) => v.id === control.id) ?? null : null;

  // Winner: highest rate variant whose confidence beats threshold and rate > control rate.
  let winner: VariantWithSignificance | null = null;
  if (hasEnoughData && controlEnriched) {
    const challengers = enriched.filter((v) => v.id !== controlEnriched.id);
    const leader = challengers.reduce<VariantWithSignificance | null>(
      (best, v) => (best == null || v.conversionRate > best.conversionRate ? v : best),
      null
    );
    if (
      leader &&
      leader.conversionRate > controlEnriched.conversionRate &&
      leader.confidence != null &&
      leader.confidence >= confidenceThreshold
    ) {
      winner = leader;
    }
  }

  return { variants: enriched, winner, control: controlEnriched, hasEnoughData };
}

function safeRate(conversions: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return conversions / impressions;
}

/**
 * Two-sided two-proportion z-test.
 * Returns { z, pValue } where pValue is the probability of observing a difference
 * this large or larger under the null hypothesis of equal rates.
 */
export function twoProportionZTest(
  cA: number,
  nA: number,
  cB: number,
  nB: number
): { z: number; pValue: number } {
  if (nA <= 0 || nB <= 0) return { z: 0, pValue: 1 };
  const pA = cA / nA;
  const pB = cB / nB;
  const pPool = (cA + cB) / (nA + nB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));
  if (se === 0) return { z: 0, pValue: 1 };
  const z = (pB - pA) / se;
  const pValue = 2 * (1 - standardNormalCdf(Math.abs(z)));
  return { z, pValue };
}

/**
 * Standard normal CDF via Abramowitz & Stegun 26.2.17 approximation.
 * Error bound ~ 7.5e-8 — plenty accurate for A/B decisions.
 */
function standardNormalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + 0.2316419 * absX);
  const d = 0.3989422804014327 * Math.exp((-absX * absX) / 2);
  const p =
    d *
    t *
    (0.319381530 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 0.5 + sign * (0.5 - p);
}
