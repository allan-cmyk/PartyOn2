/**
 * Shared measurement window math.
 *
 * A recommendation is "due for measurement" once it's been shipped for
 * MEASUREMENT_WINDOW_DAYS — the cron route then captures a fresh metric
 * snapshot into resultMetricAfter. Marketing today; reused by Operations,
 * Finance, and any other domain that ships rec-driven changes.
 *
 * Pure functions — no DB, no I/O. The marketing cron route owns "what
 * to capture" (revenue/AOV/coverage); this module owns "when to capture".
 */

export const MEASUREMENT_WINDOW_DAYS = 14;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Recommendations shipped at or before this cutoff are due for measurement.
 */
export function measurementCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - MEASUREMENT_WINDOW_DAYS * MS_PER_DAY);
}

/**
 * True when a shipped rec has crossed the measurement window. Returns false
 * for null/undefined shippedAt so callers don't need to null-check.
 */
export function isDueForMeasurement(
  shippedAt: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!shippedAt) return false;
  const shipped = typeof shippedAt === 'string' ? new Date(shippedAt) : shippedAt;
  if (Number.isNaN(shipped.getTime())) return false;
  return shipped.getTime() <= measurementCutoff(now).getTime();
}

/**
 * Whole days between shippedAt and now. Floors at 0 — never negative.
 */
export function daysSinceShipped(
  shippedAt: Date | string,
  now: Date = new Date()
): number {
  const shipped = typeof shippedAt === 'string' ? new Date(shippedAt) : shippedAt;
  const diff = now.getTime() - shipped.getTime();
  if (diff <= 0) return 0;
  return Math.floor(diff / MS_PER_DAY);
}
