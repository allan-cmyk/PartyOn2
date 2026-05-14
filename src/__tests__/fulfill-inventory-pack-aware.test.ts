/**
 * Tests for the pack-aware fulfillment math in fulfillInventoryForOrder.
 *
 * The actual function is DB-bound (Prisma transactions), so these tests
 * cover the pure subtraction logic — the same formula the function applies
 * per item. If a real-DB integration test ever lands, it should assert
 * end-to-end on the same scenarios.
 */

import { describe, it, expect } from 'vitest';
import { unitsOffShelf } from '@/lib/inventory/services/pick-inventory-service';

function computeRemainingFulfillQty(args: {
  pickState: { packed: boolean; shortBy: number } | undefined;
  packBaseQty: number; // qty used at pack time (item.quantity, or item.qty * bc.qty)
  fulfillQty: number; // qty being fulfilled (effectiveQty after refunds)
}): number {
  const { pickState, packBaseQty, fulfillQty } = args;
  const alreadyPacked = pickState ? unitsOffShelf(pickState, packBaseQty) : 0;
  return Math.max(0, fulfillQty - alreadyPacked);
}

describe('fulfillInventoryForOrder — pack-aware subtraction', () => {
  it('un-packed line: fulfills the full effective quantity', () => {
    expect(
      computeRemainingFulfillQty({
        pickState: undefined,
        packBaseQty: 10,
        fulfillQty: 10,
      }),
    ).toBe(10);

    expect(
      computeRemainingFulfillQty({
        pickState: { packed: false, shortBy: 0 },
        packBaseQty: 10,
        fulfillQty: 10,
      }),
    ).toBe(10);
  });

  it('fully-packed line: fulfillment is a no-op (avoids double-decrement)', () => {
    expect(
      computeRemainingFulfillQty({
        pickState: { packed: true, shortBy: 0 },
        packBaseQty: 10,
        fulfillQty: 10,
      }),
    ).toBe(0);
  });

  it('packed with shortage: fulfillment skips because remaining shortBy never left the shelf', () => {
    // Packed 8 of 10 (2 short). Pack-time decremented 8.
    // Fulfillment shouldn't decrement the 2 that were never off the shelf — those stay.
    expect(
      computeRemainingFulfillQty({
        pickState: { packed: true, shortBy: 2 },
        packBaseQty: 10,
        fulfillQty: 10,
      }),
    ).toBe(2);
  });

  it('refunded before delivery: fulfillment uses effective qty, floors negatives', () => {
    // Order had qty=10. 3 refunded after pack. effectiveQty=7. But pack moved 10 units.
    // floor(7 - 10) = 0. Refund-side flow handles the over-decrement separately.
    expect(
      computeRemainingFulfillQty({
        pickState: { packed: true, shortBy: 0 },
        packBaseQty: 10,
        fulfillQty: 7,
      }),
    ).toBe(0);
  });

  it('idempotent: calling fulfillment twice on a packed order still decrements 0 the second time', () => {
    // First fulfillment leaves pick state untouched (packed: true). Second call
    // sees the same packed state → still skips.
    const first = computeRemainingFulfillQty({
      pickState: { packed: true, shortBy: 0 },
      packBaseQty: 10,
      fulfillQty: 10,
    });
    const second = computeRemainingFulfillQty({
      pickState: { packed: true, shortBy: 0 },
      packBaseQty: 10,
      fulfillQty: 10,
    });
    expect(first).toBe(0);
    expect(second).toBe(0);
  });

  it('bundle component scenario: packBaseQty multiplies parent × component qty', () => {
    // Bundle with 2 parents, each containing 3 of this component → packBaseQty = 6.
    // Operator packed all 6 with no short. fulfillQty also 6 (no refunds).
    expect(
      computeRemainingFulfillQty({
        pickState: { packed: true, shortBy: 0 },
        packBaseQty: 6,
        fulfillQty: 6,
      }),
    ).toBe(0);

    // Same bundle, operator was 1 short on the component.
    expect(
      computeRemainingFulfillQty({
        pickState: { packed: true, shortBy: 1 },
        packBaseQty: 6,
        fulfillQty: 6,
      }),
    ).toBe(1);
  });
});
