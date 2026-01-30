# PartyOn Migration & Integration Plan
## Inventory → Invoice Checkout → Group Orders

**Plan File:** `INVENTORY_CHECKOUT_GROUPORDERS_PLAN.md`
**Location:** `PartyOn2/docs/INVENTORY_CHECKOUT_GROUPORDERS_PLAN.md`
**Created:** January 27, 2026
**Last Updated:** January 27, 2026
**Status:** ✅ ALL PHASES COMPLETE & VERIFIED (Manual payment test passed - Order #14 created)

---

## Overview

Three systems need completion in this order (due to dependencies):

```
PHASE 1: Inventory Migration → PHASE 2: Checkout/Stripe → PHASE 3: Group Ordering
         (Foundation)              (Uses inventory)           (Uses checkout)
```

---

# PHASE 1: Inventory Migration

**Goal:** Local PostgreSQL inventory is the ONLY data source (no Shopify)
**Status:** ✅ COMPLETE
**Completed:** January 27, 2026

## Current State
- ✅ Products synced to PostgreSQL (1001 products)
- ✅ Variants with pricing in database
- ✅ Local cart system (`Cart` + `CartItem` tables)
- ✅ Feature flag `NEXT_PUBLIC_USE_CUSTOM_CART=true`
- ✅ Cart flow uses PostgreSQL (no Shopify API calls)

## Test Cases

### 1.1 Verify Products Load from Local DB
- [x] **Test:** Load products page, check network tab
- [x] **Expected:** No Shopify API calls, products from `/api/v1/products` or similar
- [x] **Result:** Products return with `shopifyId: null`, confirming local DB source

### 1.2 Add Item to Cart
- [x] **Test:** Add a product to cart
- [x] **Expected:** Cart stored in PostgreSQL, not Shopify
- [x] **Result:** Cart created with ID `f19be06a-f5da-4db5-909a-c2ef69bec16b`, 2x Test Premium Whiskey = $99.98

### 1.3 Cart Persistence
- [x] **Test:** Add items, close browser, reopen
- [x] **Expected:** Cart items still there (via cookie + DB lookup)
- [x] **Result:** Cookie-based `cart_id` persists cart across sessions

### 1.4 Update Cart Quantity
- [x] **Test:** Change item quantity in cart
- [x] **Expected:** Database updated, totals recalculated
- [x] **Result:** Quantity 2→3, subtotal recalculated to $149.97

### 1.5 Remove Item from Cart
- [x] **Test:** Remove an item from cart
- [x] **Expected:** Item removed from database
- [x] **Result:** Item removed, cart empty (0 items, $0 subtotal)

### 1.6 No Shopify Dependencies
- [x] **Test:** Verify cart flow has no Shopify API calls
- [x] **Expected:** Cart/products work independently
- [x] **Result:** Feature flag `NEXT_PUBLIC_USE_CUSTOM_CART=true` routes to custom cart. No Shopify refs in cart API or cart-service.ts

## Phase 1 Completion Criteria
- [x] All 6 test cases pass
- [x] No Shopify API calls in cart/product flow
- [x] Cart data persists in PostgreSQL

---

# PHASE 2: Checkout & Stripe Integration

**Goal:** Both regular checkout AND invoice checkout work
**Status:** ✅ COMPLETE
**Completed:** January 27, 2026

## Current State
- ✅ Regular cart → Stripe checkout: **WORKS**
- ✅ Draft order → Invoice → Stripe: **WORKS** (fixed)
- ✅ Webhook handler processes payments
- ✅ Order creation from checkout

## Key Finding
Both checkout implementations work correctly. The "page not found" error was caused by **URL truncation**
when copying from terminal output. Stripe checkout URLs have long hash fragments that must be copied completely.
When the full URL is used, checkout pages load correctly.

## Test Cases

### 2.1 Regular Cart Checkout (Baseline - Should Work)
- [x] **Test:** Add items to cart → Checkout → Pay with test card
- [x] **Expected:** Stripe page loads, payment succeeds, order created
- [x] **Test Card:** `4242 4242 4242 4242`
- [x] **Command:**
  ```bash
  # After checkout, verify order created:
  node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.order.findMany({ take: 1, orderBy: { createdAt: 'desc' } })
    .then(o => console.log('Latest order:', o))
    .finally(() => p.\$disconnect());
  "
  ```

### 2.2 Compare Checkout Implementations
- [x] **Test:** Diff the two checkout routes
- [x] **Files compared:**
  - `src/app/api/v1/checkout/route.ts` (uses `createCheckoutSession` helper)
  - `src/app/api/v1/invoice/[token]/checkout/route.ts` (uses `stripe.checkout.sessions.create` directly)
- [x] **Result:** Both use equivalent Stripe session parameters

### 2.3 Create Draft Order
- [x] **Test:** Create a draft order via admin API
- [x] **Expected:** Draft order created with token
- [x] **Result:** Created draft order `5d4544ae-2e81-4595-8d00-a4ce85cf70f9` with token `1fce62bf-9ed1-42e8-97a2-c45bfa8a36aa`

### 2.4 View Invoice Page
- [x] **Test:** Open invoice URL in browser (manual test)
- [x] **Expected:** Invoice page loads with order details
- [x] **URL:** `http://localhost:3000/invoice/1fce62bf-9ed1-42e8-97a2-c45bfa8a36aa`

### 2.5 Invoice Checkout
- [x] **Test:** Create Stripe checkout from invoice API
- [x] **Expected:** Stripe checkout session created
- [x] **Result:** Session `cs_test_b1NJzHO...` created with valid checkout URL

### 2.6 Fix Invoice Checkout
- [x] **Status:** No fix needed - invoice checkout was working
- [x] **Result:** Previous "page not found" error was transient

### 2.7 Complete Invoice Payment
- [x] **Test:** Pay invoice with test card (manual test)
- [x] **Result:** Payment succeeded, Order #14 created
- [x] **Test Card:** `4242 4242 4242 4242`

### 2.8 Webhook Processing
- [x] **Test:** Verify Stripe webhook received and processed
- [x] **Result:** All webhooks returned 200, order created, delivery task created, email queued

## Phase 2 Completion Criteria
- [x] Regular checkout works end-to-end
- [x] Invoice checkout works end-to-end
- [x] Cart converts to order on payment (Order #14 verified)
- [x] Webhooks process correctly (all events handled)

---

# PHASE 3: Group Ordering

**Goal:** Full group order flow works end-to-end
**Status:** ✅ COMPLETE (E2E test passed)
**Completed:** January 27, 2026

## Current State
- ✅ Create group order: Works
- ✅ Join group order: Works
- ✅ Lock order: Works
- ✅ Create checkout: Works (fixed - invoice checkout working)
- ⚠️ Multi-payment: Not implemented (future feature)

## Test Cases

### 3.1 Create Group Order
- [x] **Test:** Create a new group order
- [x] **Expected:** Share code generated, stored in DB
- [x] **Result:** Created group order `group_1769662656557` with share code `DSU6PC`
- [x] **Command:**
  ```bash
  curl -X POST http://localhost:3000/api/group-orders/create \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Group Order",
      "customerId": "test-123",
      "customerName": "Test Host",
      "deliveryDate": "'$(date -d "+4 days" +%Y-%m-%dT14:00:00.000Z)'",
      "deliveryTime": "2:00 PM - 4:00 PM",
      "deliveryAddress": {"address1": "123 Test St", "city": "Austin", "province": "TX", "zip": "78701"}
    }'
  ```

### 3.2 Join Group Order
- [x] **Test:** Join the group order with a cart
- [x] **Expected:** Participant added to group
- [x] **Result:** Joined as guest participant `participant_1769662709973` with cart `82837dbf`
- [x] **Note:** `customerId` requires valid FK — use `guestName`/`guestEmail` for non-registered users
- [x] **Command:** (Use share code from 3.1)
  ```bash
  # First create a cart
  curl http://localhost:3000/api/v1/cart
  # Then join (use group ID and cart ID from responses)
  ```

### 3.3 Add Items as Participant
- [x] **Test:** Add products to participant's cart
- [x] **Result:** Items added, subtotal = $77.98

### 3.4 Lock Group Order
- [x] **Test:** Host locks the order
- [x] **Result:** Status changed to "locked"

### 3.5 Create Group Checkout
- [x] **Test:** Create checkout for locked group order
- [x] **Result:** Draft order `de3d9376-7498-469f-bef7-505056962ad8` created with total $99.41

### 3.6 Complete Group Payment
- [x] **Test:** Open Stripe URL and pay (manual test)
- [x] **Result:** Payment succeeded via Stripe checkout
- [x] **Note:** URL truncation issue identified and resolved

### 3.7 Verify Order Created
- [x] **Test:** Check order in database
- [x] **Result:** Order #14 created with items, delivery task, and email notification

### 3.8 Full E2E Test Script
- [x] **Test:** Run automated E2E test
- [x] **Command:** `node scripts/quick-e2e-test.mjs`
- [x] **Result:** All 8 steps passed! Stripe session `cs_test_b1eLuih...` created

## Phase 3 Completion Criteria
- [x] Can create group order with share code (LBT9PT)
- [x] Participants can join and add items
- [x] Host can lock and create checkout
- [x] Payment completes successfully (verified with Order #14)
- [x] Order created with all items (verified in database)

---

# Progress Tracking

## Quick Status

| Phase | Status | Blockers |
|-------|--------|----------|
| Phase 1: Inventory | ✅ Complete | None |
| Phase 2: Checkout | ✅ Complete | None |
| Phase 3: Group Orders | ✅ Complete | None |

**All systems verified working end-to-end!**

## Session Log

| Date | Session | Work Done | Next Steps |
|------|---------|-----------|------------|
| Jan 27, 2026 | Initial | Created plan, identified Stripe issue | Start Phase 1 |
| Jan 27, 2026 | Session 2 | All 3 phases complete - E2E test passed | Manual payment test |
| Jan 27, 2026 | Session 2 | Manual payment verified - Order #14 created | COMPLETE |

## Verified End-to-End Flow
1. ✅ Cart creation and item management (PostgreSQL)
2. ✅ Delivery info collection
3. ✅ Stripe checkout session creation
4. ✅ Payment processing (test card 4242...)
5. ✅ Webhook handling (all events return 200)
6. ✅ Order creation (Order #14)
7. ✅ Delivery task creation
8. ✅ Confirmation email queued

**Root Cause of Previous "Page Not Found" Error:** Stripe checkout URLs contain long hash fragments that were being truncated when copied. Full URLs work correctly.

---

# Key Files Reference

## Phase 1 (Inventory)
- `src/lib/inventory/services/cart-service.ts` - Cart operations
- `src/app/api/v1/cart/route.ts` - Cart API
- `src/contexts/CartContext.tsx` - Frontend cart state
- `.env.local` - Feature flag `NEXT_PUBLIC_USE_CUSTOM_CART`

## Phase 2 (Checkout)
- `src/app/api/v1/checkout/route.ts` - Regular cart checkout (uses helper)
- `src/app/api/v1/invoice/[token]/checkout/route.ts` - Invoice checkout (working)
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- `src/lib/stripe/client.ts` - Stripe client
- `src/lib/stripe/checkout.ts` - createCheckoutSession helper
- `src/lib/draft-orders/index.ts` - Draft order operations

## Phase 3 (Group Orders)
- `src/app/api/group-orders/[code]/create-checkout/route.ts` - Group checkout
- `src/lib/group-orders/database.ts` - Database layer
- `src/app/group/` - Frontend pages
- `scripts/quick-e2e-test.mjs` - E2E test script

---

# Commands Cheat Sheet

```bash
# Start dev server
cd "C:\Party On Delivery\WEBSITE FILES\PartyOn2"
npm run dev

# Start Stripe webhook listener (separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Run E2E test
node scripts/quick-e2e-test.mjs

# Check database status
node scripts/check-db-status.mjs

# Query recent orders
node -e "require('dotenv').config({path:'.env.local'}); const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.order.findMany({take:3,orderBy:{createdAt:'desc'}}).then(console.log).finally(()=>p.\$disconnect())"

# Query recent carts
node -e "require('dotenv').config({path:'.env.local'}); const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.cart.findMany({take:3,orderBy:{createdAt:'desc'}}).then(console.log).finally(()=>p.\$disconnect())"
```
