/**
 * Landing-modal delivery windows vs the 24-hour minimum (ADR-0010).
 *
 * Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z), like the route
 * lead-time tests: Thu 3:00 PM is exactly 24h out.
 */
import { describe, expect, it } from 'vitest';
import { parseWindowStart } from '@/lib/delivery/lead-time';
import {
  DEFAULT_DELIVERY_WINDOW,
  bookableWindows,
  getDeliveryWindows,
  windowLabel,
} from '../deliveryWindows';

const NOW = new Date('2026-09-16T20:00:00.000Z');

describe('getDeliveryWindows', () => {
  it('stores each window in the format the lead-time gate and calendar read, starting where it says', () => {
    const windows = getDeliveryWindows();
    expect(windows).toHaveLength(21);
    windows.forEach((w, i) => {
      const minutes = 10 * 60 + 30 * i;
      expect(w.value).toMatch(/^\d{1,2}:\d{2} (AM|PM) - \d{1,2}:\d{2} (AM|PM)$/);
      expect(parseWindowStart(w.value)).toEqual({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
    });
    expect(windows[0]).toEqual({ value: '10:00 AM - 11:00 AM', label: '10am–11am' });
    expect(windows[1]).toEqual({ value: '10:30 AM - 11:30 AM', label: '10:30am–11:30am' });
    expect(windows[20]).toEqual({ value: '8:00 PM - 9:00 PM', label: '8pm–9pm' });
  });

  it('preselects a window that is actually one of the options', () => {
    expect(getDeliveryWindows().map((w) => w.value)).toContain(DEFAULT_DELIVERY_WINDOW);
    expect(windowLabel(DEFAULT_DELIVERY_WINDOW)).toBe('12pm–1pm');
  });
});

describe('windowLabel', () => {
  it('returns the short label for a window value and leaves anything else alone', () => {
    expect(windowLabel('4:00 PM - 5:00 PM')).toBe('4pm–5pm');
    expect(windowLabel('Afternoon (12pm–4pm)')).toBe('Afternoon (12pm–4pm)');
  });
});

describe('bookableWindows', () => {
  it('lists every window before a day is picked', () => {
    expect(bookableWindows('', NOW)).toHaveLength(21);
  });

  it('offers tomorrow only from the window exactly 24 hours out', () => {
    const values = bookableWindows('2026-09-17', NOW).map((w) => w.value);
    expect(values).toHaveLength(11);
    expect(values[0]).toBe('3:00 PM - 4:00 PM');
    expect(values[values.length - 1]).toBe('8:00 PM - 9:00 PM');
    expect(values).not.toContain('2:30 PM - 3:30 PM');
  });

  it('offers every window the day after tomorrow', () => {
    expect(bookableWindows('2026-09-18', NOW)).toHaveLength(21);
  });

  it('offers nothing today, on a past day, or on a day that does not exist', () => {
    expect(bookableWindows('2026-09-16', NOW)).toEqual([]);
    expect(bookableWindows('2026-09-10', NOW)).toEqual([]);
    expect(bookableWindows('2026-02-30', NOW)).toEqual([]);
  });
});
