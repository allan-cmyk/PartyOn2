/**
 * Pick Inventory Service — pure transition logic tests.
 *
 * Covers each row of the pack/unpack/short-adjust truth table in
 * docs/OPERATIONS-DIRECTOR-AGENT-BUILDOUT.md §7.
 */

import { describe, it, expect } from 'vitest';
import {
  computePickInventoryChange,
  unitsOffShelf,
} from '@/lib/inventory/services/pick-inventory-service';

describe('unitsOffShelf', () => {
  it('returns 0 when not packed', () => {
    expect(unitsOffShelf({ packed: false, shortBy: 0 }, 10)).toBe(0);
    expect(unitsOffShelf({ packed: false, shortBy: 4 }, 10)).toBe(0);
  });

  it('returns orderQty - shortBy when packed', () => {
    expect(unitsOffShelf({ packed: true, shortBy: 0 }, 10)).toBe(10);
    expect(unitsOffShelf({ packed: true, shortBy: 3 }, 10)).toBe(7);
  });

  it('floors at 0 when shortBy exceeds orderQty', () => {
    expect(unitsOffShelf({ packed: true, shortBy: 99 }, 10)).toBe(0);
  });
});

describe('computePickInventoryChange', () => {
  it('packed false → true, full quantity → decrement reason=pack', () => {
    const change = computePickInventoryChange(
      { packed: false, shortBy: 0 },
      { packed: true, shortBy: 0 },
      10,
    );
    expect(change).toEqual({ delta: 10, reason: 'pack' });
  });

  it('packed false → true with shortBy → decrement minus shortBy, reason=pack', () => {
    const change = computePickInventoryChange(
      { packed: false, shortBy: 0 },
      { packed: true, shortBy: 2 },
      10,
    );
    expect(change).toEqual({ delta: 8, reason: 'pack' });
  });

  it('packed true → false → increment back, reason=unpack', () => {
    const change = computePickInventoryChange(
      { packed: true, shortBy: 0 },
      { packed: false, shortBy: 0 },
      10,
    );
    expect(change).toEqual({ delta: -10, reason: 'unpack' });
  });

  it('packed true → false preserves shortBy in increment, reason=unpack', () => {
    const change = computePickInventoryChange(
      { packed: true, shortBy: 3 },
      { packed: false, shortBy: 3 },
      10,
    );
    expect(change).toEqual({ delta: -7, reason: 'unpack' });
  });

  it('shortBy increases while packed → increment back, reason=pack-short-adjust', () => {
    // Was packed with 0 short; operator now marks 2 short → those 2 units were never off the shelf
    const change = computePickInventoryChange(
      { packed: true, shortBy: 0 },
      { packed: true, shortBy: 2 },
      10,
    );
    expect(change).toEqual({ delta: -2, reason: 'pack-short-adjust' });
  });

  it('shortBy decreases while packed → further decrement, reason=pack-short-adjust', () => {
    const change = computePickInventoryChange(
      { packed: true, shortBy: 3 },
      { packed: true, shortBy: 1 },
      10,
    );
    expect(change).toEqual({ delta: 2, reason: 'pack-short-adjust' });
  });

  it('packed unchanged AND shortBy unchanged → null (idempotent)', () => {
    expect(
      computePickInventoryChange(
        { packed: false, shortBy: 0 },
        { packed: false, shortBy: 0 },
        10,
      ),
    ).toBeNull();

    expect(
      computePickInventoryChange(
        { packed: true, shortBy: 2 },
        { packed: true, shortBy: 2 },
        10,
      ),
    ).toBeNull();
  });

  it('packed false → true with shortBy >= orderQty → no decrement (all short)', () => {
    expect(
      computePickInventoryChange(
        { packed: false, shortBy: 0 },
        { packed: true, shortBy: 10 },
        10,
      ),
    ).toBeNull();
  });

  it('handles orderQty=0 cleanly (zero-quantity rows produce no movement)', () => {
    expect(
      computePickInventoryChange(
        { packed: false, shortBy: 0 },
        { packed: true, shortBy: 0 },
        0,
      ),
    ).toBeNull();
  });
});
