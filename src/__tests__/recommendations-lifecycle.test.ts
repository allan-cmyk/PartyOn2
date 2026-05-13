import { describe, it, expect } from 'vitest';
import {
  ALL_STATUSES,
  MARKETING_STATUSES,
  NEXT_TRANSITIONS,
  REASON_MIN_CHARS,
  REASON_MODE,
  VALID_TRANSITIONS,
  isValidTransition,
  type RecommendationStatus,
} from '@/lib/recommendations/lifecycle';

describe('recommendations/lifecycle', () => {
  it('exports the full status union', () => {
    expect(ALL_STATUSES).toEqual([
      'open',
      'approved',
      'shipped',
      'rejected',
      'invalidated',
      'snoozed',
    ]);
  });

  it('marketing subset excludes snoozed', () => {
    expect(MARKETING_STATUSES).not.toContain('snoozed');
    expect(MARKETING_STATUSES).toHaveLength(5);
    for (const s of MARKETING_STATUSES) {
      expect(ALL_STATUSES).toContain(s);
    }
  });

  describe('isValidTransition', () => {
    it('allows open → approved/rejected/invalidated/snoozed', () => {
      expect(isValidTransition('open', 'approved')).toBe(true);
      expect(isValidTransition('open', 'rejected')).toBe(true);
      expect(isValidTransition('open', 'invalidated')).toBe(true);
      expect(isValidTransition('open', 'snoozed')).toBe(true);
    });

    it('allows approved → shipped and back to open', () => {
      expect(isValidTransition('approved', 'shipped')).toBe(true);
      expect(isValidTransition('approved', 'open')).toBe(true);
      expect(isValidTransition('approved', 'rejected')).toBe(true);
    });

    it('rejects same-status no-op transitions', () => {
      for (const s of ALL_STATUSES) {
        expect(isValidTransition(s, s)).toBe(false);
      }
    });

    it('blocks shipped → approved or shipped → rejected (must re-open first)', () => {
      expect(isValidTransition('shipped', 'approved')).toBe(false);
      expect(isValidTransition('shipped', 'rejected')).toBe(false);
      expect(isValidTransition('shipped', 'open')).toBe(true);
    });

    it('terminal-ish statuses only transition back to open', () => {
      for (const terminal of ['rejected', 'invalidated'] as const) {
        for (const to of ALL_STATUSES) {
          const expected = to === 'open';
          expect(isValidTransition(terminal, to)).toBe(expected);
        }
      }
    });

    it('snoozed can re-open, reject, or invalidate', () => {
      expect(isValidTransition('snoozed', 'open')).toBe(true);
      expect(isValidTransition('snoozed', 'rejected')).toBe(true);
      expect(isValidTransition('snoozed', 'invalidated')).toBe(true);
      expect(isValidTransition('snoozed', 'approved')).toBe(false);
    });
  });

  describe('REASON_MODE', () => {
    it('requires a reason for dismissals (rejected, invalidated)', () => {
      expect(REASON_MODE.rejected).toBe('required');
      expect(REASON_MODE.invalidated).toBe('required');
    });

    it('makes the reason optional for shipped (outcome notes)', () => {
      expect(REASON_MODE.shipped).toBe('optional');
    });

    it('skips the modal for frictionless transitions (open, approved)', () => {
      expect(REASON_MODE.open).toBe('none');
      expect(REASON_MODE.approved).toBe('none');
    });

    it('covers every status', () => {
      for (const s of ALL_STATUSES) {
        expect(REASON_MODE[s]).toBeDefined();
      }
    });

    it('enforces a minimum length for required reasons', () => {
      expect(REASON_MIN_CHARS).toBeGreaterThan(0);
    });
  });

  describe('NEXT_TRANSITIONS', () => {
    it('every offered button is in VALID_TRANSITIONS', () => {
      for (const status of ALL_STATUSES) {
        const offered = NEXT_TRANSITIONS[status] ?? [];
        for (const opt of offered) {
          expect(VALID_TRANSITIONS[status]).toContain(opt.to);
        }
      }
    });

    it('open offers Approve + Reject', () => {
      const labels = NEXT_TRANSITIONS.open.map((o) => o.label);
      expect(labels).toEqual(['Approve', 'Reject']);
    });

    it('approved offers Mark shipped + Re-open', () => {
      const labels = NEXT_TRANSITIONS.approved.map((o) => o.label);
      expect(labels).toEqual(['Mark shipped', 'Re-open']);
    });

    it('terminal statuses only offer Re-open', () => {
      for (const s of ['shipped', 'rejected', 'invalidated'] as RecommendationStatus[]) {
        const opts = NEXT_TRANSITIONS[s];
        expect(opts).toHaveLength(1);
        expect(opts[0]?.to).toBe('open');
      }
    });
  });
});
