# Party On Delivery — Public API Contract

**Status:** Draft v0.1 — pre-implementation
**Audience:** External consumers (currently: Premier Concierge at `premierconcierge.co`)
**Base URL:** `https://partyondelivery.com/api/public/v1`

This spec is the **contract** between PartyOnDelivery's backend and any external app that consumes its product catalog, inventory, or checkout. The internal `/api/v1/*` endpoints continue to exist unchanged for the main site — this public surface is a separate, stable, versioned API.

---

## Design principles

1. **Additive — never breaks the main site.** All endpoints live under a new `/api/public/v1` prefix. Internal `/api/v1` endpoints are untouched.
2. **Stateless.** No cookies. Every request carries its own auth (API key) and identifiers (customer ID, cart ID).
3. **Live data.** Inventory, prices, and product status are read from POD's Postgres in real time. No nightly sync.
4. **Channel attribution baked in.** Every order created via this API gets `channel: "<consumer-name>"` so POD admin can filter/report on it.
5. **One Stripe per side.** POD's Stripe creates the PaymentIntent for alcohol. Consumer (concierge) creates its own PaymentIntent on its own Stripe for any non-alcohol items in the same checkout. Money never co-mingles.

---

## Authentication

All requests must include:

```
Authorization: Bearer <api_key>
```

API keys are minted by POD admin at `/ops/api-keys` (to be built). Each key has:

- `name` — human-readable label (`"premierconcierge-prod"`)
- `scopes` — `["products:read", "inventory:read", "delivery:read", "discounts:read", "checkout:write", "orders:read"]`
- `revokedAt` — soft-revoke; lookups exclude revoked keys

Keys are stored as `bcrypt(key)` in `ApiKey.keyHash`. Plain key is shown to admin **once** at creation.

Failed auth returns:

```http
401 Unauthorized
{ "error": "invalid_api_key", "message": "API key missing, invalid, or revoked." }
```

Insufficient scope returns:

```http
403 Forbidden
{ "error": "insufficient_scope", "message": "Key lacks scope: checkout:write" }
```

---

## CORS

The public API allows requests from explicit origins only. Initial allowlist:

- `https://premierconcierge.co`
- `https://*.premierconcierge.co`
- `http://localhost:*` (dev)

Configured via `Access-Control-Allow-Origin` per request.

---

## Rate limits

Per API key, enforced via Vercel KV:

| Bucket | Limit |
|---|---|
| Read endpoints (`GET /products`, `/inventory`, etc.) | 600 req/min |
| Write endpoints (`POST /checkout/session`, etc.) | 60 req/min |

Exceeding returns:

```http
429 Too Many Requests
Retry-After: 60
{ "error": "rate_limited", "message": "Slow down — try again in 60s" }
```

---

## Idempotency

Write endpoints accept an optional header:

```
Idempotency-Key: <client-generated-uuid>
```

If the same key is replayed within 24 hours, the original response is returned and no duplicate side-effect occurs. Strongly recommended for `POST /checkout/session`.

---

## Response envelope

All responses follow this shape:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "requestId": "req_abc123", "timestamp": "2026-05-06T10:00:00Z" }
}
```

Errors:

```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable explanation",
  "meta": { "requestId": "req_abc123", "timestamp": "2026-05-06T10:00:00Z" }
}
```

---

## Endpoints

### Catalog

#### `GET /products`

List products with filters and pagination. Wraps `product-service.getProducts()`.

**Query parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | — | Full-text search on name/vendor |
| `productType` | string | — | e.g. `Whiskey`, `Beer`, `Cocktail Kit` |
| `vendor` | string | — | Brand vendor name |
| `categoryId` | string | — | Internal category UUID |
| `minPrice` | number | — | |
| `maxPrice` | number | — | |
| `inStock` | boolean | `true` | Hide out-of-stock by default |
| `status` | string | `ACTIVE` | `ACTIVE` only — internal/draft hidden |
| `page` | int | 1 | |
| `pageSize` | int | 20 | Max 100 |
| `sortBy` | string | `popularity` | `popularity`, `price`, `name`, `createdAt` |
| `sortOrder` | string | `desc` | `asc`, `desc` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_01H...",
      "handle": "titos-handmade-vodka-750ml",
      "name": "Tito's Handmade Vodka",
      "description": "...",
      "productType": "Vodka",
      "vendor": "Tito's",
      "tags": ["vodka", "popular"],
      "imageUrl": "https://cdn.partyondelivery.com/...",
      "imageUrls": ["...", "..."],
      "priceRange": { "min": 22.99, "max": 22.99 },
      "variants": [
        {
          "id": "var_01H...",
          "title": "750ml",
          "price": 22.99,
          "compareAtPrice": null,
          "sku": "TITOS-750",
          "barcode": "...",
          "inStock": true,
          "availableQty": 47
        }
      ],
      "collections": [{ "id": "...", "handle": "vodka", "name": "Vodka" }]
    }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

**Scopes:** `products:read`

---

#### `GET /products/[id]`

Single product by ID or handle.

```json
{
  "success": true,
  "data": { /* same shape as list item */ }
}
```

Returns `404` with `error: "not_found"` if product doesn't exist or is inactive.

**Scopes:** `products:read`

---

#### `GET /products/[id]/variants`

All variants for a product.

```json
{
  "success": true,
  "data": [{ "id": "...", "title": "...", "price": ..., "inStock": ..., "availableQty": ... }]
}
```

**Scopes:** `products:read`

---

#### `GET /collections`

List all active collections.

```json
{
  "success": true,
  "data": [
    { "id": "...", "handle": "favorites-home-page", "name": "Austin's Favorites", "productCount": 24 },
    { "id": "...", "handle": "cocktail-kits", "name": "Cocktail Kits", "productCount": 44 }
  ]
}
```

**Scopes:** `products:read`

---

#### `GET /collections/[handle]`

Collection detail + first page of products.

```json
{
  "success": true,
  "data": {
    "id": "...",
    "handle": "cocktail-kits",
    "name": "Cocktail Kits",
    "description": "...",
    "imageUrl": "...",
    "products": [ /* product list */ ]
  }
}
```

Supports same pagination params as `/products`.

**Scopes:** `products:read`

---

### Inventory

#### `GET /inventory?variantIds=var_1,var_2,var_3`

Bulk live inventory check. Use this immediately before showing a checkout button to confirm cart items are still available.

**Response:**

```json
{
  "success": true,
  "data": [
    { "variantId": "var_1", "available": true, "qty": 47 },
    { "variantId": "var_2", "available": true, "qty": 3 },
    { "variantId": "var_3", "available": false, "qty": 0 }
  ]
}
```

**Scopes:** `inventory:read`

---

### Delivery

#### `POST /delivery/validate`

Validate that a delivery address + datetime is serviceable, and return the fee.

**Request:**

```json
{
  "zip": "78701",
  "deliveryDate": "2026-06-12",
  "deliveryTime": "14:00",
  "addressLine1": "...",
  "city": "Austin",
  "state": "TX"
}
```

**Response (success):**

```json
{
  "success": true,
  "data": {
    "available": true,
    "deliveryFee": 25.00,
    "minimumOrder": 100.00,
    "zone": "central-austin",
    "estimatedWindow": "1pm – 3pm"
  }
}
```

**Response (out of zone):**

```json
{
  "success": true,
  "data": {
    "available": false,
    "reason": "out_of_zone",
    "message": "We don't deliver to 78610 yet."
  }
}
```

**Scopes:** `delivery:read`

---

### Discounts

#### `POST /discounts/validate`

Check if a discount code is valid for a given cart subtotal. Does **not** apply or reserve the code — just validates.

**Request:**

```json
{
  "code": "SUMMER10",
  "subtotal": 250.00,
  "items": [{ "variantId": "var_1", "qty": 2 }]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "discountAmount": 25.00,
    "type": "percentage",
    "value": 10
  }
}
```

If invalid:

```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "expired",
    "message": "This code has expired."
  }
}
```

**Scopes:** `discounts:read`

---

### Checkout

#### `POST /checkout/session`

The big one. Creates a Stripe PaymentIntent on POD's Stripe, places a soft inventory hold, and returns a `clientSecret` the consumer's Stripe.js can confirm. **All POD-side state for this transaction (cart, customer, fulfillment) is created here.**

**Request:**

```json
{
  "items": [
    { "variantId": "var_titos_750", "qty": 2 },
    { "variantId": "var_topo_chico_12pk", "qty": 1 }
  ],
  "customer": {
    "email": "guest@example.com",
    "name": "Brian Hill",
    "phone": "+15125551234"
  },
  "delivery": {
    "deliveryDate": "2026-06-12",
    "deliveryTime": "14:00",
    "address": {
      "line1": "123 W 6th St",
      "line2": "Apt 405",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    },
    "deliveryType": "HOTEL",
    "deliveryInstructions": "Hand to bellhop, ask for the 'Hill bachelor party'"
  },
  "discountCode": "SUMMER10",
  "channel": "premierconcierge",
  "channelMeta": {
    "conciergeBookingId": "booking_abc123",
    "tripPackage": "lake-travis-weekend"
  },
  "successUrl": "https://premierconcierge.co/booked?stage=alcohol",
  "cancelUrl": "https://premierconcierge.co/checkout?stage=alcohol"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "checkoutSessionId": "cs_test_a1B2c3...",
    "paymentIntentId": "pi_3Px...",
    "clientSecret": "pi_3Px..._secret_xyz",
    "publishableKey": "pk_live_...",
    "stripeCheckoutUrl": "https://checkout.stripe.com/c/pay/cs_...",
    "amounts": {
      "subtotal": 53.97,
      "discount": 5.40,
      "tax": 4.32,
      "deliveryFee": 25.00,
      "total": 77.89,
      "currency": "usd"
    },
    "expiresAt": "2026-05-06T10:30:00Z",
    "inventoryHoldUntil": "2026-05-06T10:30:00Z"
  }
}
```

The consumer can either:
1. Redirect customer to `stripeCheckoutUrl` (Stripe-hosted Checkout — easiest)
2. Use `clientSecret` + `publishableKey` with Stripe Elements on their own page

On payment success, POD's existing `/api/webhooks/stripe` fires, creates the Order with `channel: "premierconcierge"`, hard-deducts inventory, sends customer email, and triggers fulfillment. **Consumer doesn't need to call anything else** — but should poll `GET /orders/[stripeSessionId]` or subscribe to a webhook (see below) to get the order ID.

**Errors:**

| Code | When |
|---|---|
| `inventory_unavailable` | One or more variants are out of stock |
| `delivery_unavailable` | Address/time not serviceable |
| `below_minimum` | Order subtotal below zone minimum |
| `invalid_discount` | Discount code invalid or expired |

**Scopes:** `checkout:write`

---

### Orders

#### `GET /orders/by-session/[stripeSessionId]`

Look up an order by its Stripe Checkout session ID. Use this on consumer's success page to confirm the order was created.

```json
{
  "success": true,
  "data": {
    "id": "ord_01H...",
    "orderNumber": 12847,
    "status": "PENDING",
    "financialStatus": "PAID",
    "fulfillmentStatus": "UNFULFILLED",
    "total": 77.89,
    "deliveryDate": "2026-06-12T14:00:00Z",
    "channel": "premierconcierge",
    "channelMeta": { "conciergeBookingId": "..." },
    "customer": { "email": "...", "name": "..." }
  }
}
```

Returns `404` if no order exists for that session yet (webhook may not have fired). Consumer should retry up to 5 times with backoff.

**Scopes:** `orders:read`

---

#### `GET /orders/[id]`

Get a specific order by ID. Consumer can only fetch orders that match `channel: "<consumer-name>"` — keys are scoped to their own channel.

Same response shape as above, with full `items[]`.

**Scopes:** `orders:read`

---

### Webhooks (POD → Consumer)

Optionally configure a webhook URL per API key. POD POSTs to it on order lifecycle events.

**Configured at key creation:**

```
webhookUrl: https://premierconcierge.co/api/webhooks/pod
webhookSecret: <generated by POD, used for HMAC signature>
```

**Events:**

| Event | When |
|---|---|
| `order.created` | Stripe webhook fired; order saved |
| `order.fulfilled` | Driver marked delivered |
| `order.cancelled` | Order cancelled |
| `order.refunded` | Full or partial refund issued |

**Payload:**

```json
{
  "event": "order.fulfilled",
  "id": "evt_01H...",
  "createdAt": "2026-06-12T14:32:00Z",
  "data": { /* full order object */ }
}
```

**Signature:** `X-POD-Signature: sha256=<hmac-sha256(body, webhookSecret)>`

Consumer must verify signature before trusting payload.

---

## Error code reference

| Code | HTTP | Meaning |
|---|---|---|
| `invalid_api_key` | 401 | Key missing/invalid/revoked |
| `insufficient_scope` | 403 | Key valid but lacks required scope |
| `not_found` | 404 | Resource doesn't exist |
| `validation_error` | 400 | Request body failed validation |
| `inventory_unavailable` | 409 | Stock conflict |
| `delivery_unavailable` | 409 | Address/time not serviceable |
| `below_minimum` | 409 | Subtotal under zone minimum |
| `invalid_discount` | 409 | Bad discount code |
| `rate_limited` | 429 | Too many requests |
| `internal_error` | 500 | Server error — retry safe with idempotency key |

---

## Versioning policy

- This is `v1`. Breaking changes go into `v2`.
- Additive changes (new fields, new endpoints) ship in `v1` without notice.
- Deprecation of `v1` requires 90-day notice via webhook + email to all key holders.
- Both versions can run side-by-side during migration.

---

## Implementation checklist (POD side)

When building, do these in order. **None of these change existing site behavior.**

- [ ] Prisma migration: add `channel`, `channelMeta` to `Order`; add `ApiKey` model
- [ ] Build `/ops/api-keys` admin page (mint, list, revoke)
- [ ] Build `lib/public-api/auth.ts` — middleware to verify Bearer token, attach `apiKey` to request context
- [ ] Build `lib/public-api/cors.ts` — origin allowlist
- [ ] Build `lib/public-api/rate-limit.ts` — Vercel KV-backed leaky bucket
- [ ] Build `lib/public-api/idempotency.ts` — KV-backed idempotency key cache
- [ ] Implement endpoints (mostly thin wrappers around existing services):
  - [ ] `GET /products`, `/products/[id]`, `/products/[id]/variants`
  - [ ] `GET /collections`, `/collections/[handle]`
  - [ ] `GET /inventory`
  - [ ] `POST /delivery/validate`
  - [ ] `POST /discounts/validate`
  - [ ] `POST /checkout/session`
  - [ ] `GET /orders/[id]`, `/orders/by-session/[sessionId]`
- [ ] Update `/api/webhooks/stripe` to read `channel` + `channelMeta` from PaymentIntent metadata, pass through to `Order` on creation
- [ ] Build webhook outbound system (queue + retry on consumer-defined URL)
- [ ] Smoke test from `curl` and from concierge stub

## Implementation checklist (concierge side)

- [ ] Add env vars: `POD_API_URL`, `POD_API_KEY`, `STRIPE_POD_PUBLISHABLE_KEY`
- [ ] Build `lib/pod-client.ts` — typed wrapper, retries, error handling
- [ ] Build cart UI that calls `GET /products` for alcohol section
- [ ] Build live-inventory check before showing checkout button
- [ ] Build two-Stripe checkout flow:
  - [ ] Call `POST /checkout/session` for alcohol → get clientSecret
  - [ ] Confirm with Stripe.js using POD publishable key → first charge
  - [ ] Backend creates Premier PaymentIntent on Premier Stripe → second charge
  - [ ] On both success → confirmation page; on partial failure → auto-void + notify
- [ ] Build `/api/webhooks/pod` to receive order lifecycle events
- [ ] Surface order status in customer's concierge booking dashboard

---

## Open questions

1. **Tax calc:** does POD compute tax server-side or rely on Stripe Tax? → confirms which value `amounts.tax` carries.
2. **Refunds:** does concierge initiate refund via API, or always go through POD admin?
3. **Customer accounts:** should concierge customers also become POD customers automatically, or stay separate?
4. **Group orders:** should the public API support GroupOrderV2 flows, or only single-customer orders for v1?

Resolve these before implementation lands.
