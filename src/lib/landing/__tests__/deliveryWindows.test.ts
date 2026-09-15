/**
 * Landing-modal delivery windows vs the 24-hour minimum (ADR-0010).
 *
 * Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z), like the route
 * lead-time tests: Thu 3:00 PM is exactly 24h out.
 */
import { describe, expect, it } from 'vitest';
import { parseWindowStart } from '@/lib/delivery/lead-time';
import { DEFAULT_DELIVERY_WINDOW, bookableWindows, getDeliveryWindows } from '../deliveryWindows';

const NOW = new Date('2026-09-16T20:00:00.000Z');

describe('getDeliveryWindows', () => {
  it('labels every window with a start the lead-time gate can read', () => {
    const windows = getDeliveryWindows();
    expect(windows).toHaveLength(21);
    windows.forEach((w, i) => {
      const minutes = 10 * 60 + 30 * i;
      expect(parseWindowStart(w.value)).toEqual({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
    });
  });

  it('preselects a window that is actually one of the options', () => {
    expect(getDeliveryWindows().map((w) => w.value)).toContain(DEFAULT_DELIVERY_WINDOW);
    expect(parseWindowStart(DEFAULT_DELIVERY_WINDOW)).toEqual({ hour: 12, minute: 0 });
  });
});

describe('bookableWindows', () => {
  it('lists every window before a day is picked', () => {
    expect(bookableWindows('', NOW)).toHaveLength(21);
  });

  it('offers tomorrow only from the window exactly 24 hours out', () => {
    const values = bookableWindows('2026-09-17', NOW).map((w) => w.value);
    expect(values).toHaveLength(11);
    expect(values[0]).toBe('3pm–4pm');
    expect(values[values.length - 1]).toBe('8pm–9pm');
    expect(values).not.toContain('2:30pm–3:30pm');
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
