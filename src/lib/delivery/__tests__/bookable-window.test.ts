/**
 * The 24-hour minimum's picker and quote helpers (ADR-0010): which day the
 * date pickers start on, which window a quote dashboard opens with (enough
 * checkout time to actually pay), and when a request must be refused.
 */
import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_TIME_SLOTS,
  QUOTE_CHECKOUT_RUNWAY_HOURS,
  earliestBookableDay,
  earliestQuoteDay,
  isCalendarDay,
  meetsLeadTime,
  pickQuoteWindow,
  todayInAustin,
} from '../lead-time';

const HOUR = 60 * 60 * 1000;

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

describe('isCalendarDay', () => {
  it('accepts real days, including a leap day', () => {
    expect(isCalendarDay('2026-09-17')).toBe(true);
    expect(isCalendarDay('2028-02-29')).toBe(true);
  });

  it('rejects impossible or malformed days instead of rolling them forward', () => {
    for (const day of ['2026-02-30', '2026-09-31', '2026-13-01', '2026-00-10', '2026-9-7', 'nope']) {
      expect(isCalendarDay(day)).toBe(false);
    }
  });

  it('makes meetsLeadTime fail closed on an impossible day', () => {
    // Date.UTC would read 2027-02-30 as Mar 2 — comfortably "bookable".
    expect(meetsLeadTime('2027-02-30', '12:00 PM - 2:00 PM', WED_3PM)).toBe(false);
  });
});

describe('earliestBookableDay (dashboard picker)', () => {
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
    // 24 hours instead of one calendar day would jump to the 15th. (These
    // helpers don't know about Sundays; only some pickers block them.)
    expect(earliestBookableDay(new Date('2027-03-13T05:30:00.000Z'))).toBe('2027-03-14');
  });
});

describe('earliestQuoteDay (chat + package-builder pickers)', () => {
  it('matches the dashboard picker when there is plenty of time', () => {
    expect(earliestQuoteDay(WED_3PM)).toBe('2026-09-17');
  });

  it("drops tomorrow an hour early, so it can't lapse while the form is filled in", () => {
    // Wed 7:45 PM CDT: tomorrow's 8:30 PM window is still 24h45m out, but not
    // with an hour of slack to finish the chat or builder.
    const now = new Date('2026-09-17T00:45:00.000Z');
    expect(earliestBookableDay(now)).toBe('2026-09-17');
    expect(earliestQuoteDay(now)).toBe('2026-09-18');
  });
});

describe('pickQuoteWindow', () => {
  it('keeps the preferred window when it leaves plenty of checkout time', () => {
    expect(pickQuoteWindow('2026-09-23', '12:00 PM - 2:00 PM', WED_3PM)).toBe('12:00 PM - 2:00 PM');
  });

  it('moves a next-day window far enough out to leave hours, not minutes, to pay', () => {
    const window = pickQuoteWindow('2026-09-17', '12:00 PM - 2:00 PM', WED_3PM);
    expect(window).toBe('6:00 PM - 6:30 PM');
    // Checkout stays open for the full runway...
    expect(
      meetsLeadTime('2026-09-17', window, new Date(WED_3PM.getTime() + QUOTE_CHECKOUT_RUNWAY_HOURS * HOUR)),
    ).toBe(true);
    // ...where the earliest merely-legal window (3:00 PM) would close at once.
    expect(meetsLeadTime('2026-09-17', '3:00 PM - 3:30 PM', new Date(WED_3PM.getTime() + 1))).toBe(false);
  });

  it("falls back to the day's last window when the full runway no longer fits", () => {
    // Wed 7:00 PM CDT: no Thursday window leaves 3 hours, but 8:30 PM still clears 24h.
    expect(pickQuoteWindow('2026-09-17', '12:00 PM - 2:00 PM', new Date('2026-09-17T00:00:00.000Z'))).toBe(
      '8:30 PM - 9:00 PM',
    );
  });

  it('refuses rather than open a last window with under 30 minutes to pay', () => {
    // Wed 8:05 PM CDT: Thursday 8:30 PM still clears 24h, but only by 25 minutes.
    expect(pickQuoteWindow('2026-09-17', null, new Date('2026-09-17T01:05:00.000Z'))).toBeNull();
    // Wed 7:55 PM CDT: 35 minutes of checkout time is enough to open on it.
    expect(pickQuoteWindow('2026-09-17', null, new Date('2026-09-17T00:55:00.000Z'))).toBe('8:30 PM - 9:00 PM');
  });

  it('returns null when nothing that day clears 24h — refuse, never a dead dashboard', () => {
    expect(pickQuoteWindow('2026-09-16', '12:00 PM - 2:00 PM', WED_3PM)).toBeNull();
    expect(pickQuoteWindow('2026-09-17', null, new Date('2026-09-17T01:31:00.000Z'))).toBeNull();
  });

  it('returns null for a past day, an impossible day, or an unreadable date', () => {
    expect(pickQuoteWindow('2026-09-10', null, WED_3PM)).toBeNull();
    expect(pickQuoteWindow('2027-02-30', null, WED_3PM)).toBeNull();
    expect(pickQuoteWindow('not-a-date', null, WED_3PM)).toBeNull();
  });

  it('ignores an unparseable preferred label instead of passing it through', () => {
    expect(pickQuoteWindow('2026-09-23', 'afternoon-ish', WED_3PM)).toBe('10:00 AM - 10:30 AM');
  });

  it('always finds a window on the day the chat and builder pickers offer', () => {
    for (const iso of [
      '2026-09-16T20:00:00.000Z',
      '2026-09-17T01:30:00.000Z',
      '2026-09-17T01:31:00.000Z',
      '2026-12-31T23:59:00.000Z',
      '2027-03-13T05:30:00.000Z',
    ]) {
      const now = new Date(iso);
      expect(pickQuoteWindow(earliestQuoteDay(now), null, now)).not.toBeNull();
    }
  });
});
