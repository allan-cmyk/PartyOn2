import { describe, it, expect } from 'vitest';
import {
  MEASUREMENT_WINDOW_DAYS,
  daysSinceShipped,
  isDueForMeasurement,
  measurementCutoff,
} from '@/lib/recommendations/measurement';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('recommendations/measurement', () => {
  it('exports the 14-day window constant', () => {
    expect(MEASUREMENT_WINDOW_DAYS).toBe(14);
  });

  describe('measurementCutoff', () => {
    it('is exactly 14 days before now', () => {
      const now = new Date('2026-05-20T12:00:00Z');
      const cutoff = measurementCutoff(now);
      const expected = new Date(now.getTime() - 14 * DAY_MS);
      expect(cutoff.toISOString()).toBe(expected.toISOString());
    });
  });

  describe('isDueForMeasurement', () => {
    const now = new Date('2026-05-20T12:00:00Z');

    it('false for null/undefined shippedAt', () => {
      expect(isDueForMeasurement(null, now)).toBe(false);
      expect(isDueForMeasurement(undefined, now)).toBe(false);
    });

    it('false when shipped less than 14 days ago', () => {
      const shipped = new Date(now.getTime() - 13 * DAY_MS);
      expect(isDueForMeasurement(shipped, now)).toBe(false);
    });

    it('true when shipped exactly 14 days ago', () => {
      const shipped = new Date(now.getTime() - 14 * DAY_MS);
      expect(isDueForMeasurement(shipped, now)).toBe(true);
    });

    it('true when shipped more than 14 days ago', () => {
      const shipped = new Date(now.getTime() - 30 * DAY_MS);
      expect(isDueForMeasurement(shipped, now)).toBe(true);
    });

    it('accepts ISO strings', () => {
      const shipped = new Date(now.getTime() - 20 * DAY_MS).toISOString();
      expect(isDueForMeasurement(shipped, now)).toBe(true);
    });

    it('returns false for unparseable input rather than throwing', () => {
      expect(isDueForMeasurement('not-a-date', now)).toBe(false);
    });
  });

  describe('daysSinceShipped', () => {
    const now = new Date('2026-05-20T12:00:00Z');

    it('floors fractional days', () => {
      const shipped = new Date(now.getTime() - 3 * DAY_MS - 5 * 60 * 60 * 1000);
      expect(daysSinceShipped(shipped, now)).toBe(3);
    });

    it('returns 0 for future-shipped (clock skew safety)', () => {
      const shipped = new Date(now.getTime() + DAY_MS);
      expect(daysSinceShipped(shipped, now)).toBe(0);
    });

    it('returns 0 for the moment of shipping', () => {
      expect(daysSinceShipped(now, now)).toBe(0);
    });

    it('accepts ISO strings', () => {
      const shipped = new Date(now.getTime() - 7 * DAY_MS).toISOString();
      expect(daysSinceShipped(shipped, now)).toBe(7);
    });
  });
});
