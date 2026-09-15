/**
 * The 24-hour minimum's picker helpers (ADR-0010): which day every
 * customer-facing date picker starts on, and which window a quote dashboard
 * opens with — or null, meaning the request must be refused.
 */
import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_TIME_SLOTS,
  earliestBookableDay,
  firstBookableWindow,
  meetsLeadTime,
  todayInAustin,
} from '../lead-time';

// Wed 2026-09-16 3:00 PM CDT (20:00Z) — the same pinned moment as the tab
// PATCH lead-time tests: Thu noon is 21h out, Thu 3:00 PM is exactly 24h.
const WED_3PM = new Date('2026-09-16T20:00:00.000Z');

describe('DASHBOARD_TIME_SLOTS', () => {
  it('runs in 30-minute windows from 10:00 AM to 9:00 PM', () => {
    expect(DASHBOARD_TIME_SLOTS[0]).toBe('10:00 AM - 10:30 AM');
    expect(DASHBOARD_TIME_SLOTS[DASHBOARD_TIME_SLOTS.length - 1]).toBe('8:30 PM - 9:00 PM');
    expect(DASHBOARD_TIME_SLOTS).toHaveLength(22);
  });
});

describe('todayInAustin', () => {
  it('uses the Austin calendar day, not the UTC one', () => {
    // 11:30 PM CDT Wednesday is already Thursday in UTC.
    expect(todayInAustin(new Date('2026-09-17T04:30:00.000Z'))).toBe('2026-09-16');
  });
});

describe('earliestBookableDay', () => {
  it('never offers today', () => {
    // 7:00 AM CDT Wednesday.
    expect(earliestBookableDay(new Date('2026-09-16T12:00:00.000Z'))).toBe('2026-09-17');
  });

  it('offers tomorrow in the afternoon, when its later windows clear 24h', () => {
    expect(earliestBookableDay(WED_3PM)).toBe('2026-09-17');
  });

  it("still offers tomorrow at 8:30 PM — its last window is exactly 24h out", () => {
    expect(earliestBookableDay(new Date('2026-09-17T01:30:00.000Z'))).toBe('2026-09-17');
  });

  it('skips tomorrow one minute later, when none of its windows clear 24h', () => {
    expect(earliestBookableDay(new Date('2026-09-17T01:31:00.000Z'))).toBe('2026-09-18');
  });

  it('works from the Austin day late at night, not the UTC day', () => {
    // 11:30 PM CDT Wednesday (04:30Z Thursday): Thursday is gone, Friday is first.
    expect(earliestBookableDay(new Date('2026-09-17T04:30:00.000Z'))).toBe('2026-09-18');
  });

  it('does not skip a day across the spring-forward clock change', () => {
    // Fri 2027-03-12 11:30 PM CST. The cutoff lands late Saturday the 13th, so
    // the first bookable day is Sunday the 14th — the 23-hour DST day. Adding
    // 24 hours instead of one calendar day would jump to the 15th. (Sundays are
    // closed; the pickers' own Sunday checks handle that separately.)
    expect(earliestBookableDay(new Date('2027-03-13T05:30:00.000Z'))).toBe('2027-03-14');
  });

  it('always returns a day that really has a bookable window', () => {
    for (const iso of [
      '2026-09-16T20:00:00.000Z',
      '2026-09-17T01:31:00.000Z',
      '2026-12-31T23:59:00.000Z',
      '2027-03-13T05:30:00.000Z',
    ]) {
      const now = new Date(iso);
      expect(firstBookableWindow(earliestBookableDay(now), null, now)).not.toBeNull();
    }
  });
});

describe('firstBookableWindow', () => {
  it('keeps the preferred window when it clears 24h', () => {
    expect(firstBookableWindow('2026-09-23', '12:00 PM - 2:00 PM', WED_3PM)).toBe(
      '12:00 PM - 2:00 PM',
    );
  });

  it('moves a too-soon preferred window to the first one that clears 24h', () => {
    // Thu noon is 21h out; Thu 3:00 PM is exactly 24h.
    expect(firstBookableWindow('2026-09-17', '12:00 PM - 2:00 PM', WED_3PM)).toBe(
      '3:00 PM - 3:30 PM',
    );
    expect(meetsLeadTime('2026-09-17', '3:00 PM - 3:30 PM', WED_3PM)).toBe(true);
    expect(meetsLeadTime('2026-09-17', '2:30 PM - 3:00 PM', WED_3PM)).toBe(false);
  });

  it('returns null when nothing that day clears 24h — refuse, never a dead dashboard', () => {
    expect(firstBookableWindow('2026-09-16', '12:00 PM - 2:00 PM', WED_3PM)).toBeNull();
  });

  it('returns null for a past day or an unreadable date', () => {
    expect(firstBookableWindow('2026-09-10', null, WED_3PM)).toBeNull();
    expect(firstBookableWindow('not-a-date', null, WED_3PM)).toBeNull();
  });

  it('ignores an unparseable preferred label instead of passing it through', () => {
    expect(firstBookableWindow('2026-09-23', 'afternoon-ish', WED_3PM)).toBe('10:00 AM - 10:30 AM');
  });
});
