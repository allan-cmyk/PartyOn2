/**
 * Go High Level (GHL) Webhook — New Order Notifications
 *
 * Fire-and-forget: logs errors, never throws.
 * No-ops silently when GHL_ORDER_WEBHOOK_URL is not set.
 */

const GHL_WEBHOOK_URL = process.env.GHL_ORDER_WEBHOOK_URL;
const GHL_REVIEW_WEBHOOK_URL = process.env.GHL_REVIEW_WEBHOOK_URL;
const GHL_DASHBOARD_WEBHOOK_URL = process.env.GHL_DASHBOARD_WEBHOOK_URL;

// ── Partner Lead push: prefer direct API (PIT + LocationId), fall back to
// ── legacy inbound-webhook URL if only the URL is configured.
const GHL_API_PIT = process.env.GHL_API_PIT;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_API_VERSION = process.env.GHL_API_VERSION ?? '2021-07-28';
const GHL_PARTNER_LEAD_WEBHOOK_URL = process.env.GHL_PARTNER_LEAD_WEBHOOK_URL;

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
  // Dashboard link for orders placed under a GroupOrderV2 (Premier cruise,
  // partner-page dashboard, etc.). Empty string when the order has no group.
  dashboard_url: string;
  share_code: string;
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
  // Optional GroupOrderV2 link — when present, populates dashboard_url so the
  // GHL SMS workflow can include the dashboard link in its template.
  groupOrderV2Id?: string | null;
  groupOrderV2?: { shareCode: string } | null;
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
  const shareCode = order.groupOrderV2?.shareCode || '';
  const dashboardUrl = shareCode
    ? `https://partyondelivery.com/dashboard/${shareCode}`
    : '';

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
    dashboard_url: dashboardUrl,
    share_code: shareCode,
  };
}

/**
 * POST order data to the GHL inbound webhook.
 * Fire-and-forget: logs errors, never throws.
 */
export interface GhlReviewPayload {
  event: 'review.request';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  orderNumber: number;
  orderUrl: string;
  deliveryDate: string;
}

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

/**
 * POST review request data to the GHL review webhook.
 * Fire-and-forget: logs errors, never throws.
 */
export async function sendReviewRequest(payload: GhlReviewPayload): Promise<void> {
  if (!GHL_REVIEW_WEBHOOK_URL) return;

  try {
    const res = await fetch(GHL_REVIEW_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[GHL Review Webhook] Failed:', res.status, await res.text());
    } else {
      console.log('[GHL Review Webhook] Review request sent for order:', payload.orderNumber);
    }
  } catch (err) {
    console.error('[GHL Review Webhook] Error:', err);
  }
}

// ──────────────────────────────────────────────
// Dashboard Created Notification
// ──────────────────────────────────────────────

export interface GhlDashboardPayload {
  event: 'dashboard.created';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dashboard_url: string;
  host_claim_url: string;
  cruise_date: string;
  cruise_type: string;
  booking_id: string;
}

/**
 * POST dashboard data to the GHL dashboard webhook.
 * Fire-and-forget: logs errors, never throws.
 */
export async function notifyDashboardCreated(payload: GhlDashboardPayload): Promise<void> {
  if (!GHL_DASHBOARD_WEBHOOK_URL) return;

  try {
    const res = await fetch(GHL_DASHBOARD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[GHL Dashboard Webhook] Failed:', res.status, await res.text());
    } else {
      console.log('[GHL Dashboard Webhook] Dashboard notification sent:', payload.dashboard_url);
    }
  } catch (err) {
    console.error('[GHL Dashboard Webhook] Error:', err);
  }
}

// ──────────────────────────────────────────────
// Partner Lead Notification
// ──────────────────────────────────────────────

/**
 * Payload posted to GHL when a partner opt-in lead is captured.
 *
 * GHL workflows route by the `partner_slug` field — each partner gets their
 * own SMS/email automation so we can tune copy per vertical (boat rental
 * follow-up reads differently from Airbnb host follow-up). The `tag` field
 * (`partner:<slug>`) is what GHL filters on by convention.
 *
 * `booking_meta` is a free-form bag of partner-platform context (trip date,
 * group size, vehicle type, etc.) — GHL workflows can lift specific keys
 * into their SMS templates.
 */
export interface GhlPartnerLeadPayload {
  event: 'partner_lead.created';
  /** Affiliate.partnerSlug (lowercased) — the GHL workflow filter key. */
  partner_slug: string;
  /** Affiliate.businessName — for human-readable SMS templates. */
  partner_business_name: string;
  /** Affiliate.customerPerk — e.g. "Free Delivery" — for SMS copy. */
  partner_perk: string;
  /** Convenience tag the GHL contact gets ("partner:centex-boat-rentals"). */
  tag: string;
  // Standard GHL contact fields
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  // Source detail for analytics in GHL
  source_widget: string;
  /** External booking-platform reference (FareHarbor pk, etc.). */
  booking_ref: string;
  /** Raw partner booking context (trip date, group size, vehicle, etc.). */
  booking_meta: Record<string, unknown>;
  /** Direct link to the lead in our admin UI for the ops team. */
  lead_admin_url: string;
}

interface NotifyPartnerLeadInput {
  event: 'partner_lead.created';
  partner_slug: string;
  partner_business_name: string;
  partner_perk: string;
  /**
   * Pre-uppercased promo / discount code the customer uses at checkout
   * (e.g. `CENTEXBOATRENTALS`). Lives as its own custom field in GHL so
   * SMS templates can drop it in directly via `{{contact.promo_code}}` —
   * GHL's SMS engine doesn't reliably support Liquid filters like `| upper`.
   */
  promo_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source_widget: string;
  booking_ref: string;
  booking_meta: Record<string, unknown>;
  lead_admin_url: string;
}

/**
 * Push a partner lead into GHL.
 *
 * Preferred path: direct GHL Contacts API via `POST /contacts/upsert`.
 *   - Dedups by email/phone within the location automatically
 *   - Populates the 9 partner custom fields (created May 2026)
 *   - Adds the `partner:<slug>` tag — which triggers the GHL workflow
 *
 * Fallback path: legacy inbound-webhook URL (the original integration). Used
 * only when GHL_API_PIT / GHL_LOCATION_ID are unset. Kept for safety so a
 * misconfigured env doesn't drop leads silently.
 *
 * Fire-and-forget on transport errors (logs, never throws). When NEITHER env
 * configuration is present, this is a silent no-op so local dev and tests
 * don't need GHL credentials.
 */
export async function notifyPartnerLead(input: NotifyPartnerLeadInput): Promise<void> {
  // Preferred: direct Contacts API push.
  if (GHL_API_PIT && GHL_LOCATION_ID) {
    await pushPartnerLeadViaContactsApi(input);
    return;
  }

  // Fallback: legacy inbound webhook URL.
  if (GHL_PARTNER_LEAD_WEBHOOK_URL) {
    await pushPartnerLeadViaInboundWebhook(input);
    return;
  }

  console.log(
    '[GHL Partner Lead] No GHL_API_PIT/GHL_LOCATION_ID and no GHL_PARTNER_LEAD_WEBHOOK_URL; skipping push for',
    input.partner_slug
  );
}

/**
 * Push the lead into GHL via the Contacts API (preferred).
 *
 * Uses `POST /contacts/upsert` so this is idempotent on email/phone — the
 * same contact won't get duplicated if the same customer opts in across two
 * partners (their contact gets BOTH `partner:` tags) or if a re-delivery of
 * the same booking arrives.
 *
 * GHL's upsert merges custom fields by `key`, so we don't need to know
 * GHL field IDs at all — the keys match the fieldKey suffixes assigned when
 * the fields were created (e.g. `contact.partner_slug` → key `partner_slug`).
 */
async function pushPartnerLeadViaContactsApi(input: NotifyPartnerLeadInput): Promise<void> {
  if (!GHL_API_PIT || !GHL_LOCATION_ID) return;

  // Lift commonly-referenced booking meta keys to top-level custom fields so
  // SMS templates can use plain `{{contact.trip_date_display}}` instead of
  // navigating into JSON. Everything else stays in `booking_meta` (we don't
  // push it as a GHL field — it's already on our Lead row).
  const meta = input.booking_meta as Record<string, unknown>;
  const tripDateDisplay = typeof meta.trip_date_display === 'string' ? meta.trip_date_display : '';
  const tripItemName = typeof meta.item_name === 'string' ? meta.item_name : '';
  const groupSize = typeof meta.group_size === 'number' ? meta.group_size : null;

  const body = {
    locationId: GHL_LOCATION_ID,
    firstName: input.first_name || undefined,
    lastName: input.last_name || undefined,
    email: input.email || undefined,
    phone: input.phone || undefined,
    source: `Partner Lead — ${input.partner_business_name}`,
    // Two tags by design:
    //  1. `partner-lead-new` — universal trigger tag. The GHL "Partner Lead
    //     Follow-up" workflow triggers on this single tag, so we never need
    //     to edit the workflow when adding new partners.
    //  2. `partner:<slug>` — segmentation tag for per-partner reporting and
    //     for any future per-partner sub-workflows that need to fire on
    //     specific verticals (boat rental, Airbnb, hotel, etc.).
    tags: ['partner-lead-new', `partner:${input.partner_slug}`],
    customFields: [
      { key: 'partner_slug', field_value: input.partner_slug },
      { key: 'partner_business_name', field_value: input.partner_business_name },
      { key: 'partner_perk', field_value: input.partner_perk },
      { key: 'promo_code', field_value: input.promo_code },
      { key: 'source_widget', field_value: input.source_widget },
      { key: 'booking_ref', field_value: input.booking_ref || '' },
      { key: 'trip_date_display', field_value: tripDateDisplay },
      { key: 'trip_item_name', field_value: tripItemName },
      { key: 'lead_admin_url', field_value: input.lead_admin_url },
      ...(groupSize !== null ? [{ key: 'group_size', field_value: groupSize }] : []),
    ],
  };

  try {
    const res = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GHL_API_PIT}`,
        Version: GHL_API_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[GHL Partner Lead API] Upsert failed:', res.status, text);
      return;
    }
    const data = await res.json().catch(() => ({}));
    const contactId = (data as { contact?: { id?: string } }).contact?.id ?? '(unknown)';
    console.log(
      '[GHL Partner Lead API] Upserted contact',
      contactId,
      'for',
      input.partner_slug,
      input.email || input.phone
    );
  } catch (err) {
    console.error('[GHL Partner Lead API] Error:', err);
  }
}

/** Legacy: POST flat payload to a GHL Inbound Webhook URL. */
async function pushPartnerLeadViaInboundWebhook(input: NotifyPartnerLeadInput): Promise<void> {
  if (!GHL_PARTNER_LEAD_WEBHOOK_URL) return;

  const payload: GhlPartnerLeadPayload = {
    ...input,
    tag: `partner:${input.partner_slug}`,
  };

  try {
    const res = await fetch(GHL_PARTNER_LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error('[GHL Partner Lead Webhook] Failed:', res.status, await res.text());
    } else {
      console.log('[GHL Partner Lead Webhook] Sent for', input.partner_slug, input.email || input.phone);
    }
  } catch (err) {
    console.error('[GHL Partner Lead Webhook] Error:', err);
  }
}
