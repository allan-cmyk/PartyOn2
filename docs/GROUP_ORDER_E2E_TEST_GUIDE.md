# Group Ordering: Local Inventory + Stripe E2E Test Guide

## Overview

This guide documents how to test the complete group ordering flow using:
- **Local inventory** (PostgreSQL database, not Shopify)
- **Stripe payments** (test mode)
- **Local cart system** (`NEXT_PUBLIC_USE_CUSTOM_CART=true`)

## Prerequisites

### 1. Environment Configuration

Verify these are set in `.env.local`:

```env
# Required
NEXT_PUBLIC_USE_CUSTOM_CART=true
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...

# Optional but recommended
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Products in Database

Products must exist in the local PostgreSQL database. Verify with:

```bash
node scripts/check-db-status.mjs
```

Expected output:
```
Products: 1000+
Variants: 1000+
```

If products are missing, sync from Shopify (requires `SHOPIFY_ADMIN_API_TOKEN`).

### 3. Stripe CLI (for webhooks)

Install Stripe CLI and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Save the webhook secret it outputs to `STRIPE_WEBHOOK_SECRET`.

### 4. Dev Server

```bash
npm run dev
```

---

## Automated Test Script

Run the complete flow with:

```bash
node scripts/test-group-order-e2e.mjs
```

This script will:
1. Create a group order
2. Create a cart and add items
3. Join the group order
4. Lock the order
5. Create checkout (draft order + invoice)
6. Create Stripe checkout session

After the script completes, manually open the Stripe Checkout URL to complete payment.

---

## Manual Test Flow

### Phase 1: Create Group Order

**API Call:**
```bash
curl -X POST http://localhost:3000/api/group-orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Boat Party",
    "customerId": "test-customer-123",
    "customerName": "Test Host",
    "deliveryDate": "2026-01-31T14:00:00.000Z",
    "deliveryTime": "2:00 PM - 4:00 PM",
    "deliveryAddress": {
      "address1": "123 Test Street",
      "city": "Austin",
      "province": "TX",
      "zip": "78701"
    }
  }'
```

**Expected Response:**
```json
{
  "id": "group_1234567890",
  "shareCode": "ABC123",
  "shareUrl": "http://localhost:3000/group/ABC123",
  "status": "active"
}
```

### Phase 2: Create Cart & Add Items

**Create Cart:**
```bash
curl http://localhost:3000/api/v1/cart
```

**Add Items:**
```bash
curl -X POST http://localhost:3000/api/v1/cart \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "add",
    "productId": "<product-uuid>",
    "variantId": "<variant-uuid>",
    "quantity": 5,
    "price": 25.00
  }'
```

### Phase 3: Join Group Order

```bash
curl -X POST http://localhost:3000/api/group-orders/id/<GROUP_ORDER_ID>/join \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Test Participant",
    "guestEmail": "participant@test.com",
    "cartId": "<CART_UUID>"
  }'
```

**Then update cart totals:**
```bash
curl -X POST http://localhost:3000/api/group-orders/<SHARE_CODE>/update-cart \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "<CART_UUID>",
    "cartTotal": 125.00,
    "itemCount": 5
  }'
```

### Phase 4: Lock Group Order

```bash
curl -X POST http://localhost:3000/api/group-orders/<SHARE_CODE>/lock-order \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "groupOrder": {
    "status": "locked"
  }
}
```

### Phase 5: Create Checkout

```bash
curl -X POST http://localhost:3000/api/group-orders/<SHARE_CODE>/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "hostEmail": "host@test.com",
    "hostPhone": "512-555-0100"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "draftOrder": {
    "id": "<uuid>",
    "token": "<uuid>",
    "invoiceUrl": "http://localhost:3000/invoice/<token>",
    "totalPrice": "150.25"
  },
  "checkoutUrl": "http://localhost:3000/invoice/<token>"
}
```

### Phase 6: Create Stripe Session

```bash
curl -X POST http://localhost:3000/api/v1/invoice/<TOKEN>/checkout
```

**Expected Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/c/pay/...",
  "sessionId": "cs_test_..."
}
```

### Phase 7: Complete Payment

1. Open the Stripe Checkout URL in browser
2. Use test card: `4242 4242 4242 4242`
3. Expiry: Any future date
4. CVC: Any 3 digits
5. Complete payment

### Phase 8: Verify Order Created

Check webhook logs for:
```
[Stripe Webhook] Received event: checkout.session.completed
[Stripe Webhook] Processing draft order payment: <id>
[Stripe Webhook] Order created from draft order: <order_number>
```

Verify in database:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.order.findMany({
  orderBy: { createdAt: 'desc' },
  take: 1,
  include: { items: true }
}).then(orders => {
  console.log(JSON.stringify(orders, null, 2));
  prisma.\$disconnect();
});
"
```

---

## Verification Checkpoints

| Step | Expected | How to Verify |
|------|----------|---------------|
| Group order created | Share code returned | Check response |
| Cart created | UUID returned | Check response |
| Items added | Subtotal calculated | Check cart.subtotal |
| Participant joined | participantId returned | Check response |
| Cart totals synced | Participant shows cart total | Get group order |
| Order locked | status = "locked" | Check response |
| Draft order created | Token returned | Check response/database |
| Invoice email sent | Email in logs | Check server logs |
| Stripe session created | Checkout URL returned | Check response |
| Webhook received | Logs show event | Check server logs |
| Order created | Record in database | Query orders table |
| Delivery task created | Record in database | Query delivery_tasks table |

---

## Troubleshooting

### "Group order not found" during checkout

**Cause:** The create-checkout route was using in-memory store instead of database.

**Fix:** Applied in this session - now uses `db.getOrderByCode()` instead of `groupOrderStore.getOrderByCode()`.

### "Order must be locked before checkout"

**Cause:** Status mismatch - lock-order was setting 'closed' instead of 'locked'.

**Fix:** Applied in this session - lock-order now sets status to 'locked'.

### "Only the host can lock the group"

**Cause:** Host verification failing when hostCustomerId is null.

**Fix:** Applied in this session - host verification is skipped when hostCustomerId was not stored.

### Webhook not received

**Solutions:**
1. Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Verify `STRIPE_WEBHOOK_SECRET` matches CLI output
3. Check server is accessible at localhost:3000

### Cart items not found during checkout

**Cause:** Participant's cart was empty or cart ID is invalid.

**Solutions:**
1. Verify cart exists: Query `carts` table by ID
2. Verify items added: Query `cart_items` table
3. Ensure `NEXT_PUBLIC_USE_CUSTOM_CART=true` before creating cart

---

## Code Changes Made

### 1. `src/app/api/group-orders/[code]/lock-order/route.ts`
- Changed status from 'closed' to 'locked'
- Skip host verification when hostCustomerId is null

### 2. `src/app/api/group-orders/[code]/create-checkout/route.ts`
- Changed from `groupOrderStore` (in-memory) to `db` (database)
- Updated type annotations to use `GroupOrderWithParticipants`

---

## Files Involved

| File | Purpose |
|------|---------|
| `/api/group-orders/create` | Create group order |
| `/api/group-orders/[code]` | Get group order by code |
| `/api/group-orders/id/[id]/join` | Join group order |
| `/api/group-orders/[code]/update-cart` | Sync cart totals |
| `/api/group-orders/[code]/lock-order` | Lock order (prevents new joins) |
| `/api/group-orders/[code]/create-checkout` | Create draft order + invoice |
| `/api/v1/cart` | Cart operations |
| `/api/v1/invoice/[token]/checkout` | Create Stripe session |
| `/api/webhooks/stripe` | Handle payment confirmation |
| `/lib/stripe/webhooks.ts` | Order creation logic |
| `/lib/group-orders/database.ts` | Database operations |
| `/lib/draft-orders/index.ts` | Draft order creation |
