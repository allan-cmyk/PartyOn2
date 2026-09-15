/**
 * canDraftOrderBePaid holds self-serve drafts to the 24-hour minimum
 * (ADR-0010) until an invoice is sent for them. Invoice checkout, the item
 * editor and the discount box all run this one check, so they can't disagree
 * about whether an invoice is still payable online.
 *
 * Clock pinned to Wed 2026-09-16 3:00 PM CDT (20:00Z): Thu noon is 21h out,
 * Thu 4 PM is 25h.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/database/client', () => ({ prisma: {} }));

import { canDraftOrderBePaid } from '../service';
import type { DraftOrderWithTotal } from '../types';
import { DELIVERY_TOO_SOON_CODE, INVOICE_LEAD_TIME_MESSAGE } from '@/lib/delivery/lead-time';

const NOW = new Date('2026-09-16T20:00:00.000Z');

const REFUSED = { canPay: false, reason: INVOICE_LEAD_TIME_MESSAGE, code: DELIVERY_TOO_SOON_CODE };

function draft(overrides: Partial<DraftOrderWithTotal> = {}): DraftOrderWithTotal {
  return {
    status: 'PENDING',
    expiresAt: null,
    sentAt: null,
    createdBy: 'landing:bachelorette',
    deliveryDate: new Date('2026-09-17T12:00:00.000Z'), // tomorrow
    deliveryTime: '12:00 PM - 1:00 PM', // 21h out
    ...overrides,
  } as DraftOrderWithTotal;
}

beforeEach(() => {
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('canDraftOrderBePaid — 24-hour minimum for self-serve drafts', () => {
  it('refuses an unsent Quick-Buy draft whose window is now inside 24 hours', () => {
    expect(canDraftOrderBePaid(draft())).toEqual(REFUSED);
  });

  it('refuses one whose delivery date has already passed, with copy that is still true', () => {
    expect(
      canDraftOrderBePaid(draft({ deliveryDate: new Date('2026-09-01T12:00:00.000Z') })),
    ).toEqual(REFUSED);
  });

  it('still takes payment for an unsent self-serve draft 24+ hours out', () => {
    expect(canDraftOrderBePaid(draft({ deliveryTime: '4:00 PM - 5:00 PM' }))).toEqual({ canPay: true });
  });

  it('holds the legacy group checkout invoice to the same minimum', () => {
    expect(canDraftOrderBePaid(draft({ createdBy: 'group-order-system' }))).toEqual(REFUSED);
  });

  it('reads an old short label by the strict 10 AM fallback (fails closed)', () => {
    // Thu 4pm is really 25h out, but '4pm–5pm' is not a format the gate parses.
    expect(canDraftOrderBePaid(draft({ deliveryTime: '4pm–5pm' }))).toEqual(REFUSED);
  });

  it('lets a wedding quote be paid after its placeholder date, since its invoice was sent', () => {
    expect(
      canDraftOrderBePaid(
        draft({
          createdBy: 'landing:wedding',
          sentAt: new Date('2026-08-15T15:00:00.000Z'),
          deliveryDate: new Date('2026-09-14T12:00:00.000Z'),
          deliveryTime: 'Afternoon (12pm–4pm)',
        }),
      ),
    ).toEqual({ canPay: true });
  });

  it('lets ops approve a rush by sending the invoice', () => {
    expect(canDraftOrderBePaid(draft({ sentAt: new Date('2026-09-16T19:30:00.000Z') }))).toEqual({
      canPay: true,
    });
  });

  it.each([null, 'admin', 'ops-agent', 'ops-agent-cli'])(
    'never applies it to operator invoices (createdBy %s)',
    (createdBy) => {
      expect(canDraftOrderBePaid(draft({ createdBy }))).toEqual({ canPay: true });
    },
  );

  it('answers with the paid and expired refusals first', () => {
    expect(canDraftOrderBePaid(draft({ status: 'PAID' }))).toEqual({
      canPay: false,
      reason: 'This invoice has already been paid',
    });
    expect(canDraftOrderBePaid(draft({ expiresAt: new Date('2026-09-15T00:00:00.000Z') }))).toEqual({
      canPay: false,
      reason: 'This invoice has expired',
    });
  });
});
