import { describe, it, expect } from 'vitest';
import {
  normalizeFareharborPayload,
  parseFareharborOptInValue,
} from '../fareharbor';

/**
 * Tests for the FareHarbor normalizer. Real FareHarbor payloads are sprawling;
 * these fixtures keep only the fields the normalizer touches so the tests
 * stay readable.
 */

function buildPayload(opts: {
  optInValue?: unknown;
  optInTitle?: string;
  email?: string | null;
  phone?: string | null;
  name?: string;
  startAt?: string;
  itemName?: string;
  groupSize?: number;
  bookingPk?: number | string;
  /** Skip the opt-in custom field entirely (simulates merchant setup gap). */
  noOptInField?: boolean;
  /** Use the flat (no `booking` wrapper) shape. */
  flat?: boolean;
}) {
  const customFields = opts.noOptInField
    ? []
    : [
        {
          custom_field: { title: opts.optInTitle ?? 'Free alcohol delivery info from Party On Delivery' },
          value: opts.optInValue ?? true,
        },
      ];

  const inner = {
    pk: opts.bookingPk ?? 12345,
    contact: {
      name: opts.name ?? 'John Smith',
      email: opts.email === null ? undefined : opts.email ?? 'john@example.com',
      phone: opts.phone === null ? undefined : opts.phone ?? '+15125551234',
    },
    availability: {
      start_at: opts.startAt ?? '2026-06-15T18:00:00-05:00',
      end_at: '2026-06-15T22:00:00-05:00',
      item: { name: opts.itemName ?? '12-person Pontoon' },
    },
    customer_count_total: opts.groupSize ?? 12,
    custom_field_values: customFields,
  };

  return opts.flat ? inner : { booking: inner };
}

describe('parseFareharborOptInValue', () => {
  it('returns true for boolean true', () => {
    expect(parseFareharborOptInValue(true)).toBe(true);
  });

  it.each(['true', 'TRUE', 'Yes', 'y', '1', 'on', 'checked'])(
    'returns true for truthy string %s',
    (s) => {
      expect(parseFareharborOptInValue(s)).toBe(true);
    }
  );

  it('returns true for the number 1', () => {
    expect(parseFareharborOptInValue(1)).toBe(true);
  });

  it.each([false, 'false', 'No', 'n', '0', '', '   ', null, undefined])(
    'returns false for falsy value %s',
    (v) => {
      expect(parseFareharborOptInValue(v)).toBe(false);
    }
  );

  it('returns false for unrelated strings', () => {
    expect(parseFareharborOptInValue('maybe')).toBe(false);
  });
});

describe('normalizeFareharborPayload', () => {
  it('returns ok=true with a normalized lead for an opted-in booking', () => {
    const result = normalizeFareharborPayload(buildPayload({}));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead.email).toBe('john@example.com');
    expect(result.lead.phone).toBe('+15125551234');
    expect(result.lead.firstName).toBe('John');
    expect(result.lead.lastName).toBe('Smith');
    expect(result.lead.optedIn).toBe(true);
    expect(result.lead.sourceWidget).toBe('PARTNER_FAREHARBOR_WEBHOOK');
    expect(result.lead.partnerBookingRef).toBe('12345');
    expect(result.lead.partnerBookingMeta).toMatchObject({
      source_platform: 'fareharbor',
      trip_start_at: '2026-06-15T18:00:00-05:00',
      item_name: '12-person Pontoon',
      group_size: 12,
    });
  });

  it('lowercases and trims the email', () => {
    const result = normalizeFareharborPayload(buildPayload({ email: '  JOHN@Example.COM ' }));
    if (!result.ok) throw new Error(result.reason);
    expect(result.lead.email).toBe('john@example.com');
  });

  it('formats trip_date_display as friendly day-of-week', () => {
    const result = normalizeFareharborPayload(
      buildPayload({ startAt: '2026-06-13T18:00:00Z' }) // 2026-06-13 is a Saturday
    );
    if (!result.ok) throw new Error(result.reason);
    expect(result.lead.partnerBookingMeta?.trip_date_display).toBe('Sat 6/13');
  });

  it('skips lead when opt-in checkbox is unchecked', () => {
    const result = normalizeFareharborPayload(buildPayload({ optInValue: false }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/did not opt in/i);
  });

  it('skips lead when opt-in custom field is missing (merchant setup gap)', () => {
    const result = normalizeFareharborPayload(buildPayload({ noOptInField: true }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/custom field not found/i);
  });

  it('handles "Yes" / "No" string opt-in values (display_value-style)', () => {
    const yes = normalizeFareharborPayload(buildPayload({ optInValue: 'Yes' }));
    const no = normalizeFareharborPayload(buildPayload({ optInValue: 'No' }));
    expect(yes.ok).toBe(true);
    expect(no.ok).toBe(false);
  });

  it('matches opt-in field by alternative substring ("alcohol delivery")', () => {
    const result = normalizeFareharborPayload(
      buildPayload({ optInTitle: 'Sign me up for alcohol delivery offers' })
    );
    expect(result.ok).toBe(true);
  });

  it('rejects payloads with no contact email or phone', () => {
    const result = normalizeFareharborPayload(buildPayload({ email: null, phone: null }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/no email or phone/i);
  });

  it('accepts the flat (no wrapper) payload shape', () => {
    const result = normalizeFareharborPayload(buildPayload({ flat: true }));
    expect(result.ok).toBe(true);
  });

  it('falls back to booking UUID when pk is missing', () => {
    const raw = buildPayload({}) as unknown as { booking: { pk?: unknown; uuid?: string } };
    delete raw.booking.pk;
    raw.booking.uuid = 'abc-def-123';
    const result = normalizeFareharborPayload(raw);
    if (!result.ok) throw new Error(result.reason);
    expect(result.lead.partnerBookingRef).toBe('abc-def-123');
  });

  it('handles single-name contacts (no last name)', () => {
    const result = normalizeFareharborPayload(buildPayload({ name: 'Cher' }));
    if (!result.ok) throw new Error(result.reason);
    expect(result.lead.firstName).toBe('Cher');
    expect(result.lead.lastName).toBeNull();
  });

  it('returns ok=false for non-object payloads', () => {
    expect(normalizeFareharborPayload(null).ok).toBe(false);
    expect(normalizeFareharborPayload('string').ok).toBe(false);
    expect(normalizeFareharborPayload(42).ok).toBe(false);
  });
});
