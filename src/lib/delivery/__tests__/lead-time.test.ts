import { describe, expect, it } from 'vitest';
import {
  MINIMUM_LEAD_TIME_HOURS,
  deliveryWindowStartUtc,
  meetsLeadTime,
  parseWindowStart,
} from '../lead-time';

describe('parseWindowStart', () => {
  it('parses a storefront window label', () => {
    expect(parseWindowStart('12:00 PM - 2:00 PM')).toEqual({ hour: 12, minute: 0 });
  });

  it('parses an en-dash window label', () => {
    expect(parseWindowStart('10:00 AM – 11:00 AM')).toEqual({ hour: 10, minute: 0 });
  });

  it('parses a bare start time with minutes', () => {
    expect(parseWindowStart('10:30 AM')).toEqual({ hour: 10, minute: 30 });
  });

  it('handles the 12 AM / 12 PM pivot', () => {
    expect(parseWindowStart('12:15 AM')).toEqual({ hour: 0, minute: 15 });
    expect(parseWindowStart('12:15 PM')).toEqual({ hour: 12, minute: 15 });
  });

  it('returns null for missing or unparseable labels', () => {
    expect(parseWindowStart(undefined)).toBeNull();
    expect(parseWindowStart('')).toBeNull();
    expect(parseWindowStart('afternoon-ish')).toBeNull();
  });
});

describe('deliveryWindowStartUtc', () => {
  it('converts a CDT (summer) wall clock to the right instant', () => {
    // 2026-09-12 12:00 PM America/Chicago is UTC-5 → 17:00Z.
    expect(deliveryWindowStartUtc('2026-09-12', '12:00 PM - 2:00 PM')?.toISOString()).toBe(
      '2026-09-12T17:00:00.000Z',
    );
  });

  it('converts a CST (winter) wall clock to the right instant', () => {
    // 2026-01-15 12:00 PM America/Chicago is UTC-6 → 18:00Z.
    expect(deliveryWindowStartUtc('2026-01-15', '12:00 PM - 1:00 PM')?.toISOString()).toBe(
      '2026-01-15T18:00:00.000Z',
    );
  });

  it('is correct on the spring-forward day', () => {
    // 2026-03-08: clocks jump at 2am; 10:00 AM is already CDT (UTC-5).
    expect(deliveryWindowStartUtc('2026-03-08', '10:00 AM - 11:00 AM')?.toISOString()).toBe(
      '2026-03-08T15:00:00.000Z',
    );
  });

  it('is correct on the fall-back day', () => {
    // 2026-11-01: clocks fall back at 2am; 10:00 AM is CST (UTC-6).
    expect(deliveryWindowStartUtc('2026-11-01', '10:00 AM - 11:00 AM')?.toISOString()).toBe(
      '2026-11-01T16:00:00.000Z',
    );
  });

  it('falls back to 10:00 AM CT when the time is missing', () => {
    expect(deliveryWindowStartUtc('2026-09-12', null)?.toISOString()).toBe(
      '2026-09-12T15:00:00.000Z',
    );
  });

  it('accepts a stored noon-UTC Date and keeps its calendar day', () => {
    expect(
      deliveryWindowStartUtc(new Date('2026-09-12T12:00:00.000Z'), '12:00 PM - 2:00 PM')?.toISOString(),
    ).toBe('2026-09-12T17:00:00.000Z');
  });

  it('accepts a full ISO string on its date portion', () => {
    expect(
      deliveryWindowStartUtc('2026-09-12T12:00:00.000Z', '12:00 PM - 2:00 PM')?.toISOString(),
    ).toBe('2026-09-12T17:00:00.000Z');
  });

  it('returns null for garbage dates', () => {
    expect(deliveryWindowStartUtc('not-a-date', '12:00 PM')).toBeNull();
  });
});

describe('meetsLeadTime', () => {
  it('blocks the order #527 scenario: next-day noon ordered at 3:36 PM', () => {
    // Exactly what Alex West did on 2026-09-11 (20:36Z = 3:36 PM CDT) for a
    // 2026-09-12 12–2 PM delivery — ~20.4 hours of notice.
    const placedAt = new Date('2026-09-11T20:36:00.000Z');
    expect(meetsLeadTime('2026-09-12', '12:00 PM - 2:00 PM', placedAt)).toBe(false);
  });

  it('allows the same window two days out', () => {
    const placedAt = new Date('2026-09-11T20:36:00.000Z');
    expect(meetsLeadTime('2026-09-13', '12:00 PM - 2:00 PM', placedAt)).toBe(true);
  });

  it('allows exactly 24 hours of notice', () => {
    const placedAt = new Date('2026-09-11T17:00:00.000Z'); // noon CDT the day before
    expect(meetsLeadTime('2026-09-12', '12:00 PM - 2:00 PM', placedAt)).toBe(true);
  });

  it('blocks one minute inside the cutoff', () => {
    const placedAt = new Date('2026-09-11T17:01:00.000Z');
    expect(meetsLeadTime('2026-09-12', '12:00 PM - 2:00 PM', placedAt)).toBe(false);
  });

  it('uses the 10:00 AM fallback when no time was chosen', () => {
    // 6 PM CDT the day before a time-less delivery → only 16h to a 10 AM start.
    const placedAt = new Date('2026-09-11T23:00:00.000Z');
    expect(meetsLeadTime('2026-09-12', null, placedAt)).toBe(false);
    expect(meetsLeadTime('2026-09-13', null, placedAt)).toBe(true);
  });

  it('fails closed on missing or invalid dates', () => {
    expect(meetsLeadTime(null, '12:00 PM')).toBe(false);
    expect(meetsLeadTime(undefined, '12:00 PM')).toBe(false);
    expect(meetsLeadTime('garbage', '12:00 PM')).toBe(false);
  });

  it('exports a 24-hour rule', () => {
    expect(MINIMUM_LEAD_TIME_HOURS).toBe(24);
  });
});
