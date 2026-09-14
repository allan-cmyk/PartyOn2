/**
 * Delivery fee engine. There is one delivery tier: express delivery was removed
 * 2026-09-14 (the 24-hour minimum lead time made it unsellable), so these pin
 * the base-rate + free-threshold behavior every checkout relies on and guard
 * against an express tier creeping back in.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RATE,
  DELIVERY_ZONES,
  calculateDeliveryFee,
  getDeliveryRate,
  getDeliveryZonesSummary,
} from '../rates';

describe('calculateDeliveryFee', () => {
  it('charges the zone base rate below the free-delivery threshold', () => {
    expect(calculateDeliveryFee('78704', 150)).toEqual({
      fee: 25,
      originalFee: 25,
      discountApplied: false,
      discountReason: undefined,
      zone: 'Central Austin',
      minimumOrderMet: true,
    });
  });

  it('waives the fee at the threshold but keeps the original fee', () => {
    const result = calculateDeliveryFee('78734', 300); // Lakeway — Greater Austin
    expect(result.fee).toBe(0);
    expect(result.originalFee).toBe(30);
    expect(result.discountApplied).toBe(true);
    expect(result.discountReason).toBe('Free delivery for orders over $300');
  });

  it('flags an unmet order minimum without changing the fee', () => {
    const result = calculateDeliveryFee('78613', 100); // Cedar Park — Extended Austin
    expect(result.fee).toBe(40);
    expect(result.minimumOrderMet).toBe(false);
  });
});

describe('no express tier', () => {
  it('no zone, rate lookup, summary, or fee result carries express data', () => {
    for (const zone of DELIVERY_ZONES) expect(zone).not.toHaveProperty('expressRate');
    expect(DEFAULT_RATE).not.toHaveProperty('expressRate');
    expect(getDeliveryRate('78701')).not.toHaveProperty('expressRate');
    for (const row of getDeliveryZonesSummary()) expect(row).not.toHaveProperty('expressRate');
    expect(calculateDeliveryFee('78701', 50)).not.toHaveProperty('isExpress');
  });
});
