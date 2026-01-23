# PartyOn Delivery - Claude Chrome E2E Test Script

## Overview
This is a comprehensive end-to-end test script for Claude Chrome to verify the PartyOn Delivery website functionality. The test covers the order page, cart functionality, checkout flow, and group orders.

**Base URL**: https://dev-partyondelivery.vercel.app (or localhost:3000 for local testing)

---

## Test 1: Homepage & Navigation

### Steps
1. Navigate to the homepage `/`
2. Verify the hero section is visible with "Your Bar, DELIVERED" text
3. Verify the navigation is present with logo and menu items
4. Verify the footer is visible at the bottom

### Expected Results
- Hero section displays correctly below the navigation
- Navigation contains: Order, Products, Weddings, About, Contact
- Gold accent color (#D4AF37) is used appropriately

---

## Test 2: Age Verification Flow

### Steps
1. Navigate to `/order`
2. Look for age verification modal (if first visit)
3. Click "Yes, I am 21+" button to verify age
4. Confirm the modal closes and products are visible

### Expected Results
- Age verification modal appears on first visit
- Clicking "Yes, I am 21+" stores verification in localStorage
- Products page loads after verification

---

## Test 3: Order Page - Product Display

### Steps
1. Navigate to `/order`
2. Complete age verification if prompted
3. Verify the hero section displays "Your Bar, DELIVERED"
4. Verify collection tabs are visible (Favorites, Wine, Beer, Spirits, etc.)
5. Click on different collection tabs and verify products change
6. Scroll down and verify product grid loads

### Expected Results
- Products load within the grid
- Each product shows: image, title, price, and add button
- Collection filtering works correctly
- Prices display in USD format (e.g., "$24.99")

---

## Test 4: Add to Cart Functionality (CRITICAL - Known Issue)

### Pre-requisites
- Age verification completed
- On `/order` page with products visible

### Steps
1. Find a product card with a gold "+" button
2. Check the browser console for any JavaScript errors
3. Click the gold "+" add button on a product
4. Watch for:
   - Button should show loading spinner
   - Console logs: "CartContext addToCart called with..."
   - Network request to `/api/v1/products/variant/[variantId]`
   - Network request to `/api/v1/cart` (POST)
5. After adding, verify:
   - Button changes to quantity stepper (-/number/+)
   - CartSummaryBar appears at the bottom of the screen
   - Cart icon shows item count

### Debug Steps (if add to cart fails)
1. Open browser DevTools > Network tab
2. Click add button
3. Look for:
   - Request to `/api/v1/products/variant/gid://...` - should return 200
   - Request to `/api/v1/cart` - should return 200
4. Check Console tab for errors:
   - "Could not find product for variant" = variant lookup failed
   - "Failed to add to cart" = cart API error
   - Network errors = API unreachable

### Expected Results
- Product adds to cart successfully
- CartSummaryBar appears with item count and total
- Quantity stepper shows "1"

### Common Issues
- **Variant lookup fails**: Product may not be synced to local database
- **Cart API fails**: Database connection or session cookie issue
- **Age verification blocks**: localStorage not set correctly

---

## Test 5: Cart Drawer

### Pre-requisites
- At least one item in cart
- CartSummaryBar visible at bottom

### Steps
1. Click the CartSummaryBar "View Cart" button
2. Verify cart drawer opens from the right
3. Verify cart contains:
   - Product image
   - Product title
   - Price
   - Quantity controls
   - Remove button
   - Subtotal
4. Test quantity controls:
   - Click "+" to increase quantity
   - Click "-" to decrease quantity
   - Verify totals update
5. Click "X" or outside drawer to close

### Expected Results
- Cart drawer opens smoothly
- All cart items display correctly
- Quantity changes reflect in totals
- Drawer closes properly

---

## Test 6: Checkout Flow

### Pre-requisites
- Cart has items totaling at least $100 (minimum order)

### Steps
1. From cart drawer, click "Checkout" or navigate to `/checkout`
2. Fill in delivery form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "512-555-0123"
   - Address: "123 Main St, Austin, TX 78701"
3. Select delivery date (must be 72+ hours out)
4. Select delivery time slot
5. Accept terms checkbox
6. Click "Proceed to Payment"
7. Verify redirect to Stripe checkout

### Expected Results
- Form validation works (required fields highlighted)
- Delivery date picker shows only valid dates (72+ hours out)
- Stripe checkout page loads with correct total

---

## Test 7: Product Search

### Steps
1. On `/order` page, find the search bar
2. Type "Tito" or "Wine" or a known product name
3. Verify search results appear
4. Click a search result
5. Verify product modal or navigation works

### Expected Results
- Search results appear as you type
- Results are relevant to search term
- Clicking result opens product details

---

## Test 8: Group Order Creation

### Steps
1. Navigate to `/group/create`
2. Fill in group order form:
   - Host Name: "Test Host"
   - Host Email: "host@example.com"
   - Host Phone: "512-555-0123"
   - Event Date: (future date)
   - Delivery Address: "456 Event St, Austin, TX 78702"
3. Submit form
4. Verify group order is created
5. Copy share link/code

### Expected Results
- Group order created successfully
- Share code and link generated
- QR code displays (if implemented)

---

## Test 9: Group Order Join Flow

### Pre-requisites
- Have a valid group order share code

### Steps
1. Navigate to `/group/[code]` (replace [code] with actual code)
2. Complete age verification if prompted
3. Fill in join form:
   - Name: "Test Participant"
   - Phone: "512-555-9999"
4. Click "Join Order"
5. Browse products and add to cart
6. Verify cart is associated with group order

### Expected Results
- Join form submits successfully
- Products can be added to cart
- Cart shows association with group order

---

## Test 10: Mobile Responsive Testing

### Steps
1. Resize browser to mobile width (375px)
2. Navigate to `/order`
3. Verify:
   - Navigation collapses to hamburger menu
   - Products display in 2-column grid
   - CartSummaryBar is visible and usable
   - Add to cart buttons are tappable
4. Open cart and verify mobile cart works

### Expected Results
- All elements are usable on mobile
- No horizontal scrolling
- Touch targets are adequate size (44x44px minimum)

---

## API Smoke Tests

Run these curl commands to verify APIs are working:

### Cart API
```bash
# Get cart (creates new if none exists)
curl -X GET https://dev-partyondelivery.vercel.app/api/v1/cart \
  -H "Cookie: cart_session_id=test-session-123"

# Expected: {"success":true,"data":{"cart":{...},...}}
```

### Variant Lookup API
```bash
# Replace with actual variant ID from products
curl -X GET https://dev-partyondelivery.vercel.app/api/v1/products/variant/gid://shopify/ProductVariant/12345

# Expected: {"variantId":"...","productId":"...","price":"..."}
# Or 404 if variant not in local database
```

### Draft Order API (Group Orders)
```bash
curl -X POST https://dev-partyondelivery.vercel.app/api/v1/admin/draft-orders \
  -H "Content-Type: application/json" \
  -d '{"lineItems":[{"variantId":"test","quantity":1,"price":10}],"customer":{"email":"test@example.com"}}'

# Expected: {"success":true,"data":{"draftOrder":{...},...}}
```

---

## Debugging Checklist

### If Add to Cart Fails:

1. **Check Environment Variable**
   - `NEXT_PUBLIC_USE_CUSTOM_CART` should be `true`
   - If `false`, Shopify cart is used instead

2. **Check Variant in Database**
   - Open Prisma Studio: `npx prisma studio`
   - Check `ProductVariant` table for the variant ID
   - If missing, run product sync

3. **Check Console Errors**
   - "Could not find product for variant" → Variant not in DB
   - "Failed to add to cart" → Cart service error
   - CORS errors → API configuration issue

4. **Check Network Requests**
   - `/api/v1/products/variant/[id]` → Should return 200 with product data
   - `/api/v1/cart` POST → Should return 200 with updated cart

5. **Check Cookies**
   - `cart_session_id` should be set
   - `cart_id` should be set after first cart operation

### If Cart Drawer Doesn't Open:

1. Check `age_verified` in localStorage
2. Check console for CartContext errors
3. Verify `CartProvider` wraps the app

### If Checkout Fails:

1. Check cart minimum ($100)
2. Verify Stripe environment variables
3. Check delivery date is 72+ hours out

---

## Test Summary Checklist

| Test | Status | Notes |
|------|--------|-------|
| Homepage loads | [ ] | |
| Age verification | [ ] | |
| Order page products | [ ] | |
| Add to cart | [ ] | KNOWN ISSUE |
| Cart drawer | [ ] | |
| Checkout flow | [ ] | |
| Product search | [ ] | |
| Group order create | [ ] | |
| Group order join | [ ] | |
| Mobile responsive | [ ] | |

---

## Quick Test Commands for Claude Chrome

### Navigate and Read Page
```
read_page - Get accessibility tree of current page
find("Add to cart button") - Locate add button
click(ref: "button-add-cart-123") - Click using ref
```

### Check for Elements
```
find("CartSummaryBar") - Check if cart bar is visible
find("product grid") - Check if products loaded
find("error") - Look for error messages
```

### Form Interactions
```
find("Name input")
type("Test User")
find("Submit button")
click(ref: "...")
```

---

## Notes

- Always complete age verification first
- Cart requires cookies to persist session
- Products must be synced from Shopify to local DB for custom cart
- Minimum order is $100 for checkout
- Delivery must be scheduled 72+ hours in advance
