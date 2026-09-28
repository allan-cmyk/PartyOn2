import { describe, expect, it, vi } from 'vitest';

vi.mock('googleapis', () => ({ google: {} }));

import { parseDeliveryTime } from '../google-calendar';

// Delivery dates are stored at noon UTC.
const DAY = new Date('2026-10-03T12:00:00Z');

describe('parseDeliveryTime', () => {
  it('reads an exact window', () => {
    expect(parseDeliveryTime(DAY, '1:00 PM - 1:30 PM')).toEqual({
      start: '2026-10-03T13:00:00',
      end: '2026-10-03T13:30:00',
      exact: true,
    });
  });

  it('treats a single start time as an exact one-hour window', () => {
    expect(parseDeliveryTime(DAY, '10:00 AM')).toEqual({
      start: '2026-10-03T10:00:00',
      end: '2026-10-03T11:00:00',
      exact: true,
    });
  });

  // These windows are guesses; they must be flagged so the calendar event is
  // created as Free and can't block call-booking slots for hours.
  it.each([
    ['Afternoon', '12:00:00', '17:00:00'],
    ['Morning', '09:00:00', '12:00:00'],
    ['Evening', '17:00:00', '21:00:00'],
    ['whenever works', '09:00:00', '17:00:00'],
  ])('flags "%s" as a guessed window', (text, start, end) => {
    expect(parseDeliveryTime(DAY, text)).toEqual({
      start: `2026-10-03T${start}`,
      end: `2026-10-03T${end}`,
      exact: false,
    });
  });
});
