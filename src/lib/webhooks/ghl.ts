/**
 * Go High Level (GHL) Webhook — New Order Notifications
 *
 * Fire-and-forget: logs errors, never throws.
 * No-ops silently when GHL_ORDER_WEBHOOK_URL is not set.
 */

const GHL_WEBHOOK_URL = process.env.GHL_ORDER_WEBHOOK_URL;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface GhlOrderPayload {
  event: 'order.created';
  orderNumber: number;
  orderType: string;
  orderUrl: string;
  // GHL-standard contact fields (used by Create Contact action)
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  // Legacy fields (kept for backwards compat with existing workflows)
  customerName: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  itemsSummary: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  deliveryType: string;
  deliveryInstructions: string;
  createdAt: string;
}

/** Shape accepted by buildGhlPayload — matches OrderWithItems and raw Prisma orders */
interface OrderLike {
  id: string;
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  items: Array<{
    title: string;
    variantTitle: string | null;
    quantity: number;
    price: { toString(): string } | number;
  }>;
  subtotal: { toString(): string } | number;
  taxAmount: { toString(): string } | number;
  deliveryFee: { toString(): string } | number;
  discountAmount: { toString(): string } | number;
  total: { toString(): string } | number;
  deliveryDate: Date;
  deliveryTime: string;
  deliveryAddress: Record<string, string> | unknown;
  deliveryType?: string;
  deliveryInstructions: string | null;
  createdAt: Date;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatAddress(addr: Record<string, string> | null | undefined): string {
  if (!addr) return '';
  const parts: string[] = [];
  if (addr.address1) parts.push(addr.address1);
  if (addr.address2) parts.push(addr.address2);
  if (addr.city) parts.push(addr.city);
  const stateZip = [addr.province, addr.zip].filter(Boolean).join(' ');
  if (stateZip) parts.push(stateZip);
  return parts.join(', ');
}

function buildItemsSummary(
  items: Array<{ title: string; variantTitle: string | null; quantity: number; price: { toString(): string } | number }>
): string {
  return items
    .map((item) => {
      const name =
        item.variantTitle && item.variantTitle !== 'Default Title'
          ? `${item.title} - ${item.variantTitle}`
          : item.title;
      return `${item.quantity}x ${name} ($${Number(item.price).toFixed(2)})`;
    })
    .join(', ');
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Build a flat GHL webhook payload from an order object.
 */
export function buildGhlPayload(order: OrderLike, orderType: string): GhlOrderPayload {
  const addr = (order.deliveryAddress ?? {}) as Record<string, string>;
  const nameParts = order.customerName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    event: 'order.created',
    orderNumber: order.orderNumber,
    orderType,
    orderUrl: `https://partyondelivery.com/ops/orders/${order.id}`,
    // GHL-standard contact fields
    first_name: firstName,
    last_name: lastName,
    email: order.customerEmail,
    phone: order.customerPhone || '',
    // Legacy fields
    customerName: order.customerName,
    customerFirstName: firstName,
    customerLastName: lastName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone || '',
    itemsSummary: buildItemsSummary(order.items),
    subtotal: Number(order.subtotal),
    tax: Number(order.taxAmount),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discountAmount),
    total: Number(order.total),
    deliveryDate: order.deliveryDate.toISOString().split('T')[0],
    deliveryTime: order.deliveryTime,
    deliveryAddress: formatAddress(addr),
    deliveryType: order.deliveryType || 'HOUSE',
    deliveryInstructions: order.deliveryInstructions || '',
    createdAt: order.createdAt.toISOString(),
  };
}

/**
 * POST order data to the GHL inbound webhook.
 * Fire-and-forget: logs errors, never throws.
 */
export async function notifyNewOrder(payload: GhlOrderPayload): Promise<void> {
  if (!GHL_WEBHOOK_URL) return;

  try {
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[GHL Webhook] Failed:', res.status, await res.text());
    } else {
      console.log('[GHL Webhook] Order notification sent:', payload.orderNumber);
    }
  } catch (err) {
    console.error('[GHL Webhook] Error:', err);
  }
}
