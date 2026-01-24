# Claude Chrome Test Script - Shopify Independence Fix

## Overview

This test script verifies the **Shopify Independence** fix deployed on Jan 24, 2026. The fix ensures:
1. Products API returns Shopify GIDs (not local UUIDs)
2. Add-to-cart works correctly with Shopify's cart system
3. Cart updates reflect in UI immediately

**Target URL:** https://partyondelivery.com/order (or your Vercel preview URL)

---

## Pre-Flight Check

Before running tests, navigate to the target URL and verify:

```
Navigate to the /order page
read_page

Look for:
- Hero section with "Your Bar" text
- Product grid with images and prices
- Gold "+" add buttons on products
```

---

## Test 1: Verify Products Return Shopify GIDs

**Purpose:** Confirm the products API returns Shopify GID format variant IDs (e.g., `gid://shopify/ProductVariant/123`) instead of local UUIDs.

### Steps

```
# Step 1: Open browser DevTools > Network tab
# Step 2: Navigate to /order
# Step 3: Look for request to /api/products

read_page
find("product") - Verify products are displaying
```

### Console Check

Open browser console and look for this log:
```
[Products API] Database not configured, using Shopify fallback
```

This confirms the Shopify fallback is active.

### API Verification

In DevTools Network tab, find the `/api/products` request and check response:

**PASS if:** Response contains variant IDs starting with `gid://shopify/ProductVariant/`
```json
{
  "products": {
    "edges": [{
      "node": {
        "variants": {
          "edges": [{
            "node": {
              "id": "gid://shopify/ProductVariant/43856291332262"  // CORRECT
            }
          }]
        }
      }
    }]
  }
}
```

**FAIL if:** Response contains UUID format IDs:
```json
"id": "550e8400-e29b-41d4-a716-446655440000"  // WRONG - Local UUID
```

### Expected Result
- Products API response contains Shopify GIDs
- Console shows Shopify fallback log

---

## Test 2: Age Verification

**Purpose:** Complete age verification before testing cart functionality.

### Steps

```
read_page
find("21")  # Age verification modal

# If modal found:
find("Yes, I am 21+")
click(ref: [button ref])

# Verify modal dismissed
read_page
# Should NOT find age modal anymore
```

### Alternative Bypass

If age modal keeps reappearing, set localStorage manually in DevTools console:
```javascript
localStorage.setItem('age_verified', 'true');
localStorage.setItem('ageVerified', 'true');
```

Then refresh the page.

### Expected Result
- Age verification completes successfully
- Products page loads without modal blocking

---

## Test 3: Add to Cart - Core Functionality

**Purpose:** Verify add-to-cart works with Shopify GIDs.

### Steps

```
# Step 1: Find an add button
read_page
find("Add")  # Or find button with aria-label containing "Add"

# Step 2: Note the product name

# Step 3: Click the add button
click(ref: [button ref])

# Step 4: Wait 2-3 seconds for cart API

# Step 5: Check for success indicators
read_page
find("View Cart")  # Cart summary bar at bottom
find("1")  # Quantity indicator on product
```

### Console Debug Logs to Verify

Open DevTools Console and look for these logs after clicking add:

1. **Product Card Log:**
```
[PRODUCT CARD] ProductName { productVariantId: "gid://shopify/ProductVariant/...", cartQuantity: 0, ... }
```

2. **Cart Context Log:**
```
[CART CONTEXT] addToCart called with: { variantId: "gid://shopify/ProductVariant/...", quantity: 1, ... }
```

3. **Cart Debug Log:**
```
[CART DEBUG] New cart created: { cartId: "gid://shopify/Cart/...", totalQuantity: 1, ... }
```

### Success Indicators

| Indicator | Location | Expected Value |
|-----------|----------|----------------|
| View Cart bar | Bottom of screen | Visible with total |
| Product quantity | On product card | Shows "1" |
| Cart icon badge | Navigation | Shows "1" |

### Expected Result
- Cart API returns success
- View Cart bar appears at bottom with correct total
- Product shows quantity stepper (- 1 +) instead of + button

---

## Test 4: Cart Drawer Verification

**Purpose:** Verify cart drawer shows correct items and totals.

### Steps

```
# Open cart drawer
find("View Cart")
click(ref: [ref])

# Wait for drawer animation
# (1 second)

# Verify cart contents
read_page
find("Checkout")  # Checkout button
find("$")  # Price display
find("Remove") or find("trash")  # Remove option
```

### Verify Cart Line Item

The cart drawer should show:
- Product image
- Product title
- Unit price
- Quantity controls (- number +)
- Line total
- Subtotal at bottom

### Expected Result
- Cart drawer opens from right side
- Shows the item you added with correct price
- Checkout button is visible

---

## Test 5: Quantity Update

**Purpose:** Verify quantity changes work correctly.

### Steps

```
# In the open cart drawer
find("+")  # Increment button
click(ref: [ref])

# Verify quantity increased
read_page
find("2")  # Quantity should now be 2

# Check subtotal updated
# Price should be 2x single item price
```

### Console Logs to Check

After clicking increment, look for:
```
[CART DEBUG] Shopify response: { totalQuantity: 2, ... }
```

### Expected Result
- Quantity increases to 2
- Subtotal doubles
- No errors in console

---

## Test 6: Item Removal

**Purpose:** Verify items can be removed from cart.

### Steps

```
# In the open cart drawer
find("Remove") or find("trash") or find("-")

# If quantity is 1, clicking - should remove
# Or click explicit remove button

click(ref: [ref])

# Verify cart is empty
read_page
find("empty") or find("no items")  # Empty cart message
```

### Expected Result
- Item is removed from cart
- Cart shows empty state or closes
- View Cart bar at bottom disappears

---

## Test 7: Multiple Products Test

**Purpose:** Verify adding multiple different products works.

### Steps

```
# Step 1: Add first product
read_page
find("Add")
click(ref: [first product's add button])

# Wait 2 seconds

# Step 2: Add a different product
read_page
find("Add")  # Find another product's add button
click(ref: [second product's add button])

# Wait 2 seconds

# Step 3: Verify cart has 2 items
find("View Cart")
click(ref: [ref])

read_page
# Should see both products listed
# Cart quantity should show 2
```

### Expected Result
- Both products appear in cart drawer
- Each has its own line item
- Total reflects both items' prices

---

## Test 8: Cart Persistence

**Purpose:** Verify cart persists across page navigation.

### Steps

```
# Step 1: Add item to cart (if empty)
# Step 2: Navigate away
Navigate to /about

# Step 3: Return to order page
Navigate to /order

# Step 4: Check cart still has items
read_page
find("View Cart")  # Should still be visible if cart had items
```

### Expected Result
- Cart persists when navigating between pages
- Returning to /order shows same cart state

---

## Test 9: Checkout Flow Entry

**Purpose:** Verify checkout redirect works.

### Steps

```
# Ensure cart has at least $100 worth of items
# (Add multiple items if needed)

# Open cart
find("View Cart")
click(ref: [ref])

# Click checkout
find("Checkout")
click(ref: [ref])

# Verify redirect
read_page
# Should be on Shopify checkout or /checkout page
```

### Expected Result
- Clicking checkout initiates redirect
- Shopify checkout URL loads with cart items
- Or internal checkout page loads

---

## Common Issues & Troubleshooting

### Issue: Products Don't Load

**Symptoms:** Loading skeleton stays forever, no products appear

**Debug:**
```
read_page
find("error")
find("loading")
```

**Check:** DevTools Network tab for `/api/products` request - is it failing?

---

### Issue: Add Button Does Nothing

**Symptoms:** Click + button, nothing happens

**Debug:**
```
# Check if button is disabled
read_page
find("Add")
# Look for "disabled" attribute
```

**Common causes:**
1. Age verification not completed
2. JavaScript error in console
3. Product out of stock

---

### Issue: Cart Updates But View Cart Bar Doesn't Appear

**Symptoms:** Console shows cart success but UI doesn't update

**Debug:**
```
# Check for View Cart with different text
find("Cart")
find("$")  # Look for price
find("Proceed")
```

**Check:** Console for `[PRODUCT CARD]` logs showing `match: false`

This means the cart variant IDs don't match the product variant IDs - indicates ID format mismatch.

---

### Issue: Cart Shows Wrong Quantity

**Symptoms:** Added 1 item but cart shows 0

**Debug:**
```
# Open DevTools Console
# Look for [PRODUCT CARD] logs
# Compare productVariantId vs cartVariantIds
```

If productVariantId is a UUID but cartVariantIds are GIDs (or vice versa), the fix didn't deploy correctly.

---

## Quick Verification Sequence

Run this complete sequence to verify the fix:

```
# 1. Navigate to order page
Navigate to /order

# 2. Complete age verification
find("Yes, I am 21+")
click if found

# 3. Wait for products to load
read_page
find("$")  # Prices indicate products loaded

# 4. Find and click add button
find("Add")
click(ref: [first result])

# 5. Wait 3 seconds

# 6. Check for success
read_page
find("View Cart")

# 7. Report result:
# SUCCESS: View Cart bar appeared with correct total
# FAILURE: No View Cart bar, check console for errors
```

---

## Report Template

After running tests, report:

```markdown
## Shopify Independence Test Results

**URL tested:** [URL]
**Date:** 2026-01-24
**Build:** [Vercel build ID if known]

### API Format Check
- [ ] Products API returns Shopify GIDs
- [ ] Console shows "using Shopify fallback" log

### Add to Cart
- [ ] Single item add works
- [ ] View Cart bar appears
- [ ] Quantity stepper shows on product
- [ ] Cart total is correct

### Cart Operations
- [ ] Cart drawer opens
- [ ] Quantity increment works
- [ ] Quantity decrement works
- [ ] Item removal works

### Cart Persistence
- [ ] Cart persists across navigation

### Checkout
- [ ] Checkout button redirects correctly

### Errors Found
[List any errors]

### Console Warnings/Errors
[Copy relevant console output]
```

---

## Success Criteria

**All tests pass if:**

1. Products API returns `gid://shopify/ProductVariant/...` format IDs
2. Add-to-cart shows View Cart bar with correct total
3. Cart drawer displays items correctly
4. Quantity changes work
5. Cart persists across page navigation
6. No JavaScript errors in console related to cart

**The Shopify Independence fix is verified working when items added to cart actually appear in the cart UI with correct quantities and totals.**
