# Session Summary - January 26, 2026

## Issue Fixed: Add-to-Cart Not Working

### The Problem
Users reported "nothing happens" when clicking add-to-cart buttons on `/order` page.

### Root Cause
The Products API was loading products from **PostgreSQL database** instead of Shopify. The database stores **Prisma UUIDs** as variant IDs (e.g., `a5c99e1e-71b6-40ed-9051-abfc3880615c`), but Shopify cart requires **Shopify GIDs** (e.g., `gid://shopify/ProductVariant/47838492647716`).

Error message was:
```
Invalid global id 'a5c99e1e-71b6-40ed-9051-abfc3880615c'
```

### The Fix (Commit: df0e561)
**File:** `src/app/api/products/route.ts`

Added `forceShopify = true` to bypass database and fetch products directly from Shopify API:
```typescript
// TEMPORARY FIX: Always use Shopify directly until database variants have shopifyId populated
const forceShopify = true;
```

Also added fallback logic to use `shopifyId` field when available:
```typescript
id: v.shopifyId || v.id,  // Use Shopify GID if available
```

### Test Results
Full cart flow tested and working:
- Age verification ✓
- Add to cart ✓
- Quantity increment/decrement ✓
- Cart drawer ✓
- Cart totals ✓
- Checkout button ✓

---

## Important Discovery: Shopify-Independent System Exists

### Two Cart Modes Available

| Feature | `USE_CUSTOM_CART=false` (Current Production) | `USE_CUSTOM_CART=true` |
|---------|---------------------------------------------|------------------------|
| Cart Storage | Shopify Storefront API | PostgreSQL |
| Product IDs | Requires Shopify GIDs | Database UUIDs OK |
| Checkout | Shopify Checkout | **Stripe Checkout** |
| Products | From Shopify | From Database |

### Key Files for Custom Cart System
- `src/lib/cart/hooks/useCustomCart.ts` - Custom cart hook
- `src/app/api/v1/cart/route.ts` - Cart API (add, update, remove, clear)
- `src/app/api/v1/cart/delivery/route.ts` - Delivery info API
- `src/app/api/v1/cart/discount/route.ts` - Discount API
- `src/contexts/CartContext.tsx` - Toggle between Shopify/Custom (line 12)
- `src/app/checkout/page.tsx` - Checkout page (supports both Stripe and Shopify)

### Environment Variables
```env
# Local (.env.local) - Custom cart enabled
NEXT_PUBLIC_USE_CUSTOM_CART=true

# Stripe (already configured)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### To Enable Shopify Independence in Production
1. Add to Vercel: `NEXT_PUBLIC_USE_CUSTOM_CART=true`
2. Revert `forceShopify = true` in products API (change to `false`)
3. Ensure Stripe keys are in Vercel env vars

---

## Next Session: Update Checkout Flow

### Current Checkout Architecture
- `/checkout/page.tsx` - Main checkout page
- Detects `isCustomCart` from context
- Uses Stripe for custom cart, Shopify for Shopify cart
- Has delivery scheduler integration
- Has discount code support

### What Likely Needs Work
1. **Stripe checkout session creation** - Verify `/api/v1/checkout` exists and works
2. **Order creation** - After Stripe payment, create order in database
3. **Stripe webhooks** - Handle `checkout.session.completed` event
4. **Success page** - `/checkout/success` needs to work with Stripe
5. **Test full flow** - End-to-end with custom cart + Stripe

### Relevant Stripe Endpoints to Check
```
/api/v1/checkout - Create Stripe session
/api/webhooks/stripe - Handle Stripe events
```

---

## Files Modified This Session
- `src/app/api/products/route.ts` - Added forceShopify fix

## Test Files Created
- `test-order-add-cart.py`
- `test-order-add-cart-v2.py`
- `test-cart-fix.py`
- `test-full-cart-flow.py`
- `claude-chrome-debug-cart.md`

## Git Commits
- `df0e561` - fix: use Shopify API directly for products to ensure cart compatibility
- `b40f9b5` - debug: add more verbose logging and alerts for cart add debugging (can be cleaned up later)
