/**
 * Write-boundary regression for the pickup delivery-fee bug.
 *
 * The dashboard's pickup toggle sends `{ ...STORE_PICKUP_ADDRESS, isPickup: true }`,
 * but DeliveryAddressSchema is a plain z.object — before it declared `isPickup`,
 * Zod silently STRIPPED the flag at validation, so updateTab priced the tab from
 * the store's own zip (78752 → $25 Central Austin) with deliveryFeeWaived=false,
 * and the customer was charged a delivery fee on a pickup order. These tests
 * pin the whole write boundary: the schema must retain the flag, and every fee
 * writer must persist deliveryFee=0 + deliveryFeeWaived=true for pickup.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STORE_PICKUP_ADDRESS } from '@/lib/delivery/pickup';

const prismaMock = vi.hoisted(() => ({
  subOrder: {
    findUnique: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
  groupOrderV2: { update: vi.fn() },
}));

vi.mock('@/lib/database/client', () => ({ prisma: prismaMock }));
// Not exercised by createTab/updateTab, mocked so importing the service is light.
vi.mock('@/lib/leads/dashboard-lead', () => ({ mirrorDashboardHostLead: vi.fn() }));
vi.mock('@/lib/products/availability', () => ({
  assertVariantsPurchasable: vi.fn(),
  ProductNotPurchasableError: class ProductNotPurchasableError extends Error {},
}));

import { UpdateTabSchema, CreateGroupOrderV2Schema } from '../validation';
import { createTab, updateTab } from '../service';

const PICKUP_ADDRESS = { ...STORE_PICKUP_ADDRESS, isPickup: true };
const DELIVERY_ADDRESS = {
  address1: '500 Congress Ave',
  city: 'Austin',
  province: 'TX',
  zip: '78701', // Central Austin — $25 base rate
  country: 'US',
};

/** Minimal persisted-tab shape for the mocked create/update returns. */
function tabRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tab-1',
    groupOrderId: 'g1',
    name: 'Tab',
    position: 0,
    status: 'OPEN',
    orderType: null,
    partyType: null,
    deliveryDate: null,
    deliveryDateConfirmed: false,
    deliveryTime: 'TBD',
    deliveryAddress: PICKUP_ADDRESS,
    deliveryPhone: null,
    deliveryNotes: null,
    deliveryContextType: 'HOUSE',
    orderDeadline: null,
    deliveryFee: 0,
    deliveryFeeWaived: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    draftItems: [],
    purchasedItems: [],
    deliveryInvoice: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.subOrder.aggregate.mockResolvedValue({ _max: { position: 0 } });
  prismaMock.subOrder.findUnique.mockResolvedValue(tabRow());
  prismaMock.subOrder.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
    Promise.resolve(tabRow(data))
  );
  prismaMock.subOrder.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
    Promise.resolve(tabRow(data))
  );
});

describe('DeliveryAddressSchema retains isPickup (the bug was Zod stripping it)', () => {
  it('UpdateTabSchema keeps isPickup: true through parsing', () => {
    const parsed = UpdateTabSchema.parse({ deliveryAddress: PICKUP_ADDRESS });
    expect(parsed.deliveryAddress?.isPickup).toBe(true);
  });

  it('CreateGroupOrderV2Schema keeps isPickup on tab addresses', () => {
    const parsed = CreateGroupOrderV2Schema.parse({
      name: 'Test Group',
      hostName: 'Host',
      tabs: [{ name: 'Tab 1', deliveryAddress: PICKUP_ADDRESS }],
    });
    expect(parsed.tabs[0].deliveryAddress?.isPickup).toBe(true);
  });

  it('leaves delivery addresses without the flag untouched', () => {
    const parsed = UpdateTabSchema.parse({ deliveryAddress: DELIVERY_ADDRESS });
    expect(parsed.deliveryAddress?.isPickup).toBeUndefined();
  });
});

describe('updateTab fee writer', () => {
  it('persists deliveryFee=0 + deliveryFeeWaived=true for a pickup address', async () => {
    await updateTab('tab-1', { deliveryAddress: PICKUP_ADDRESS });

    const { data } = prismaMock.subOrder.update.mock.calls[0][0];
    expect(Number(data.deliveryFee)).toBe(0);
    expect(data.deliveryFeeWaived).toBe(true);
  });

  it('end-to-end through the schema: a PATCH-shaped pickup payload still zeroes the fee', async () => {
    // This is the exact pipeline the dashboard uses (route validates, service writes).
    // Before isPickup was declared in the schema, this test would have failed with
    // deliveryFee=25 — the store zip's Central Austin rate.
    const parsed = UpdateTabSchema.parse({ deliveryAddress: PICKUP_ADDRESS });
    await updateTab('tab-1', parsed);

    const { data } = prismaMock.subOrder.update.mock.calls[0][0];
    expect(Number(data.deliveryFee)).toBe(0);
    expect(data.deliveryFeeWaived).toBe(true);
  });

  it('still prices a real delivery address from its zone (and un-waives)', async () => {
    await updateTab('tab-1', { deliveryAddress: DELIVERY_ADDRESS });

    const { data } = prismaMock.subOrder.update.mock.calls[0][0];
    expect(Number(data.deliveryFee)).toBe(25);
    expect(data.deliveryFeeWaived).toBe(false);
  });
});

describe('createTab fee writer', () => {
  it('a tab born with a pickup address is born fee-free and waived', async () => {
    await createTab('g1', { name: 'Pickup Tab', deliveryAddress: PICKUP_ADDRESS });

    const { data } = prismaMock.subOrder.create.mock.calls[0][0];
    expect(Number(data.deliveryFee)).toBe(0);
    expect(data.deliveryFeeWaived).toBe(true);
  });

  it('a tab born with a delivery address keeps its zone fee', async () => {
    await createTab('g1', { name: 'Delivery Tab', deliveryAddress: DELIVERY_ADDRESS });

    const { data } = prismaMock.subOrder.create.mock.calls[0][0];
    expect(Number(data.deliveryFee)).toBe(25);
    expect(data.deliveryFeeWaived).toBe(false);
  });
});
