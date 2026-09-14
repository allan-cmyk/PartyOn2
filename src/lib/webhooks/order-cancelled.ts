/**
 * Order-cancelled CRM notification (order #527, 2026-09-12: a cancel that
 * only emailed left the customer's SMS thread ending at "your order is
 * confirmed" while the delivery silently never came).
 *
 * CoreLinq only — no GHL leg; GHL was decommissioned before this event
 * existed. Lives outside ghl.ts to keep that file from growing further past
 * the 500-line ceiling.
 */

import { postToCoreLinq, withSanitizedNames } from './ghl';

export interface GhlOrderCancelledPayload {
  event: 'order.cancelled';
  orderNumber: number;
  /** Store ops deep link, e.g. https://partyondelivery.com/ops/orders/<uuid>. */
  orderUrl: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  customerName: string;
  /** True when this cancel actually sent money back. */
  refunded: boolean;
  /** Pre-formatted refund amount, e.g. "780.20". Empty when refunded=false. */
  refundAmount: string;
  total: number;
  /** ISO YYYY-MM-DD; the CRM renders it human-readable. Empty if unset. */
  deliveryDate: string;
  deliveryTime: string;
  cancelledAt: string;
}

/** Order shape the cancellation notification needs (subset of a Prisma Order). */
interface CancelledOrderLike {
  id: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  total: { toString(): string } | number;
  deliveryDate: Date | string | null;
  deliveryTime: string | null;
}

/**
 * Build the order.cancelled payload. `cancelledAt` is the instant stamped on
 * Order.cancelledAt by the winning claim, so the DB and the CRM timeline
 * agree on when the cancel happened. Exported for cancelOrder and its tests.
 */
export function buildOrderCancelledPayload(
  order: CancelledOrderLike,
  refund: { amount: number } | null,
  cancelledAt: Date = new Date(),
): GhlOrderCancelledPayload {
  const nameParts = order.customerName.trim().split(/\s+/);
  return withSanitizedNames({
    event: 'order.cancelled',
    orderNumber: order.orderNumber,
    orderUrl: `https://partyondelivery.com/ops/orders/${order.id}`,
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    email: order.customerEmail,
    // customerPhone ONLY — the same selection order.created uses. deliveryPhone
    // can legitimately be someone else (dock contact, housesitter), and this
    // text carries refund amounts; it must reach the payer or no one.
    // slice(0, 24) matches the CRM ingest schema's cap so an overlong value
    // degrades to a failed toE164 lookup instead of 400-ing the whole event.
    phone: (order.customerPhone || '').trim().slice(0, 24),
    customerName: order.customerName,
    refunded: !!refund,
    refundAmount: refund ? refund.amount.toFixed(2) : '',
    total: Number(order.total),
    deliveryDate: order.deliveryDate
      ? new Date(order.deliveryDate).toISOString().split('T')[0]
      : '',
    deliveryTime: order.deliveryTime || '',
    cancelledAt: cancelledAt.toISOString(),
  });
}

/**
 * Tell the CRM an order was cancelled so it texts the customer.
 * Fire-and-forget via postToCoreLinq: logs + alerts on failure, never throws.
 */
export async function notifyOrderCancelled(payload: GhlOrderCancelledPayload): Promise<void> {
  await postToCoreLinq(payload);
}
