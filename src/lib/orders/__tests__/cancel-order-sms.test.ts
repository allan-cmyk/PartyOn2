/**
 * cancelOrder — every won cancel must tell the CRM so the customer gets a text.
 *
 * Prod incident (order #527, 2026-09-12): an order was cancelled ~2 hours
 * before its delivery window and only the cancellation EMAIL went out — to a
 * work address. The customer's SMS thread still ended at "your order #527 is
 * confirmed", and nobody told them the delivery wasn't coming. The
 * order.cancelled event exists so the CRM can text the customer; these tests
 * pin when it fires (exactly once, only for the winning cancel) and what it
 * carries (refund facts, the phone to text).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNotifyOrderCancelled = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/webhooks/order-cancelled', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/webhooks/order-cancelled')>();
  return {
    ...actual,
    notifyOrderCancelled: (...a: unknown[]) => mockNotifyOrderCancelled(...a),
  };
});

// --- Stripe + refund plumbing (only exercised by the refunding case) ---
const mockRefundsCreate = vi.fn();
vi.mock('@/lib/stripe/client', () => ({
  stripe: { refunds: { create: (...a: unknown[]) => mockRefundsCreate(...a) } },
}));
vi.mock('@/lib/stripe/refund-utils', () => ({
  CANCEL_REFUND_TYPE: 'order-cancel',
  getMaxRefundable: vi.fn().mockResolvedValue(780.2),
  findCancelRefund: vi.fn().mockResolvedValue(null),
}));
vi.mock('@/lib/inventory/services/order-service', () => ({
  createRefund: vi.fn().mockResolvedValue('refund-row-1'),
  recomputeOrderFinancialStatus: vi.fn().mockResolvedValue(undefined),
  releaseCommittedInventory: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/email/email-service', () => ({
  sendOrderCancellationEmail: vi.fn().mockResolvedValue(undefined),
  sendRefundProcessedEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/email/templates/order-cancellation', () => ({
  generateOrderCancellationEmail: vi.fn().mockReturnValue('<html></html>'),
}));

let orderStatus = 'CONFIRMED';
const mockOrderFindUnique = vi.fn(async () => ({ ...baseOrder(), status: orderStatus }));
const mockOrderUpdateMany = vi.fn(
  async ({ where, data }: { where: { status?: { notIn?: string[] } }; data: { status: string } }) => {
    if ((where.status?.notIn ?? []).includes(orderStatus)) return { count: 0 };
    orderStatus = data.status;
    return { count: 1 };
  },
);

vi.mock('@/lib/database/client', () => ({
  prisma: {
    order: {
      findUnique: (...a: unknown[]) => mockOrderFindUnique(...(a as [])),
      updateMany: (...a: unknown[]) =>
        mockOrderUpdateMany(...(a as unknown as Parameters<typeof mockOrderUpdateMany>)),
    },
    refund: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    deliveryTask: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  },
}));

function baseOrder() {
  return {
    id: 'order-527',
    orderNumber: 527,
    customerName: 'Alex West',
    customerEmail: 'awest@example.com',
    customerPhone: '+15125550100',
    total: 780.2,
    fulfillmentStatus: 'PENDING',
    deliveryDate: new Date('2026-09-12T12:00:00.000Z'),
    deliveryTime: '12:00 PM - 2:00 PM',
    stripePaymentIntentId: 'pi_test_527',
    items: [],
    refunds: [],
  };
}

describe('cancelOrder — order.cancelled CRM event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderStatus = 'CONFIRMED';
    mockNotifyOrderCancelled.mockResolvedValue(undefined);
    mockRefundsCreate.mockResolvedValue({ id: 're_test_1', status: 'succeeded' });
  });

  it('fires exactly one order.cancelled event when a non-refunding cancel wins', async () => {
    const { cancelOrder } = await import('@/lib/orders/cancel-order');
    const result = await cancelOrder('order-527', { issueRefund: false });

    expect(result.ok).toBe(true);
    expect(mockNotifyOrderCancelled).toHaveBeenCalledTimes(1);
    expect(mockNotifyOrderCancelled).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'order.cancelled',
        orderNumber: 527,
        first_name: 'Alex',
        last_name: 'West',
        phone: '+15125550100',
        refunded: false,
        refundAmount: '',
        deliveryDate: '2026-09-12',
        deliveryTime: '12:00 PM - 2:00 PM',
      }),
    );
  });

  it('carries the refund facts when the cancel refunds', async () => {
    const { cancelOrder } = await import('@/lib/orders/cancel-order');
    const result = await cancelOrder('order-527', { issueRefund: true });

    expect(result.ok).toBe(true);
    expect(mockNotifyOrderCancelled).toHaveBeenCalledTimes(1);
    expect(mockNotifyOrderCancelled).toHaveBeenCalledWith(
      expect.objectContaining({ refunded: true, refundAmount: '780.20' }),
    );
  });

  it('stays silent when the order is already terminal (no double text)', async () => {
    orderStatus = 'CANCELLED';

    const { cancelOrder } = await import('@/lib/orders/cancel-order');
    const result = await cancelOrder('order-527', { issueRefund: false });

    expect(result.ok).toBe(false);
    expect(mockNotifyOrderCancelled).not.toHaveBeenCalled();
  });

  it('a notify failure does not fail the cancel itself', async () => {
    mockNotifyOrderCancelled.mockRejectedValue(new Error('CRM down'));

    const { cancelOrder } = await import('@/lib/orders/cancel-order');
    const result = await cancelOrder('order-527', { issueRefund: false });

    expect(result.ok).toBe(true);
  });
});

describe('buildOrderCancelledPayload', () => {
  it('never falls back to deliveryPhone — refund details go to the payer or no one', async () => {
    const { buildOrderCancelledPayload } = await import('@/lib/webhooks/order-cancelled');
    const payload = buildOrderCancelledPayload(
      { ...baseOrder(), customerPhone: null },
      null,
    );
    expect(payload.phone).toBe('');
  });

  it('formats the refund amount and tolerates a missing delivery date', async () => {
    const { buildOrderCancelledPayload } = await import('@/lib/webhooks/order-cancelled');
    const payload = buildOrderCancelledPayload(
      { ...baseOrder(), deliveryDate: null, deliveryTime: null },
      { amount: 12.5 },
    );
    expect(payload.refunded).toBe(true);
    expect(payload.refundAmount).toBe('12.50');
    expect(payload.deliveryDate).toBe('');
    expect(payload.deliveryTime).toBe('');
  });
});
