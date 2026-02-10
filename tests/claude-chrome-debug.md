# Claude Chrome Debug Script for PartyOn Delivery

Copy and paste these instructions into Claude Chrome to debug the /order page.

---

## Quick Start

```
Navigate to https://partyondelivery.com/order (or http://localhost:3000/order for local testing)
```

---

## Test 1: Page Load Verification

**Instructions for Claude Chrome:**

1. Navigate to the /order page
2. Use `read_page` to get the accessibility tree
3. Look for these elements:
   - Hero section with "Your Bar" text
   - Collection filter buttons (AUSTIN'S FAVORITES, COCKTAIL KITS, etc.)
   - Product cards with images and prices
   - Add buttons (gold circular + buttons)

**What to check:**
```
read_page

Then find:
- find("Your Bar") - Hero text
- find("AUSTIN'S FAVORITES") - Collection button
- find("Add") - Add to cart buttons
- find("View Cart") - Cart summary bar (only visible if items in cart)
```

**Expected:** Products should load within 5 seconds. If you see "No products found" or loading skeleton for more than 10 seconds, there's an issue.

---

## Test 2: Age Verification Check

**Instructions:**

1. Look for age verification modal
2. If present, click "Yes, I am 21+" button

```
read_page
find("21") - Look for age verification
find("Yes") - Find the yes button
click(ref: [use the ref from find])
```

**If age modal keeps appearing:**
- The localStorage isn't persisting
- Try: `find("Yes, I am 21+")` and click it

---

## Test 3: Add to Cart (CRITICAL TEST)

**Instructions:**

1. Find a product's add button
2. Click it
3. Watch for changes

```
read_page

# Find an add button (look for button with "Add" in aria-label)
find("Add to cart")

# Click it using the ref
click(ref: [button ref])

# Wait 3 seconds then check results
read_page

# Look for:
find("View Cart") - Should appear at bottom
find("1") - Quantity should show on the product
```

**Expected behavior:**
1. Button shows loading spinner briefly
2. Button changes to quantity stepper (- 1 +)
3. Gold "View Cart" bar appears at bottom with total

**If it doesn't work:**
- Check browser console for errors
- Look for error messages on the page
- The variant lookup API may be failing

---

## Test 4: Cart Operations

**If add-to-cart worked:**

```
# Click View Cart button
find("View Cart")
click(ref: [ref])

# Cart drawer should open
read_page

# Look for:
find("Checkout") - Checkout button
find("Remove") or find("trash") - Remove item option
find("+") - Increment quantity
find("-") - Decrement quantity
```

**Test quantity change:**
```
find("+")  # Increment button
click(ref: [ref])
# Quantity should increase, total should update
```

---

## Test 5: Debug Information Collection

**Run these to collect debug info:**

```
# 1. Check page URL
read_page
# Note the current URL

# 2. Look for error messages
find("error")
find("failed")
find("Error")

# 3. Check if products loaded
find("$") - Prices indicate products loaded

# 4. Check for loading states
find("loading")
find("skeleton")

# 5. Check navigation
find("ORDER")
find("SERVICES")
find("CONTACT")
```

---

## Test 6: Full Purchase Flow

**Complete flow test:**

```
# Step 1: Navigate to order page
navigate to /order

# Step 2: Age verification (if needed)
find("Yes, I am 21+")
click if found

# Step 3: Add product
find("Add to cart")
click(ref: [first one])

# Step 4: Open cart
find("View Cart")
click(ref: [ref])

# Step 5: Go to checkout
find("Checkout")
click(ref: [ref])

# Step 6: Verify checkout page loaded
read_page
find("Delivery") - Should see delivery form
find("Payment") - Should see payment section
```

---

## Common Issues & Solutions

### Issue: Products don't load
**Symptoms:** Skeleton loaders forever, "No products found"
**Debug:**
```
read_page
find("error")
find("retry")
```
**Cause:** API failure or network issue

### Issue: Add button doesn't respond
**Symptoms:** Click does nothing, no loading spinner
**Debug:**
```
find("Add")
# Check if button is disabled
# Look for "disabled" in attributes
```
**Cause:** Age verification not set, or JavaScript error

### Issue: Cart doesn't update
**Symptoms:** Click works but cart total stays at 0
**Debug:**
```
find("View Cart")
# If not visible, cart API failed
```
**Cause:** Cart API error, check network requests

### Issue: Age modal keeps reappearing
**Symptoms:** Every action triggers age verification
**Debug:**
```
# After clicking Yes, check if modal is gone
read_page
find("21")  # Should not find age modal
```
**Cause:** localStorage not persisting, try incognito

---

## API Health Check (Manual)

If you have access to browser DevTools or can make requests:

```
# Products API
GET /api/products?limit=1
Expected: JSON with products array

# Cart API
GET /api/v1/cart
Expected: JSON with cart object (localhost only)

# Variant lookup
GET /api/v1/products/variant/[id]
Expected: JSON with product/variant info (localhost only)
```

---

## Quick Diagnostic Script

**Run this sequence to get a full diagnostic:**

```
# 1. Load page
navigate to /order

# 2. Read initial state
read_page

# 3. Report findings:
# - Can you see "Your Bar" hero text?
# - Can you see product cards with prices?
# - Can you see add buttons?
# - Is there an age verification modal?
# - Are there any error messages?

# 4. Try adding to cart
find("Add to cart")
click(ref: [first result])

# 5. Wait 3 seconds

# 6. Check result
read_page
find("View Cart")  # Success if found
find("error")  # Failure if found

# 7. Report:
# - Did View Cart bar appear?
# - Did product show quantity?
# - Any error messages?
```

---

## Environment Comparison

**Localhost (dev):**
- URL: http://localhost:3000/order
- Cart: Custom cart (local database)
- Products: Local database (UUID format IDs)

**Production:**
- URL: https://partyondelivery.com/order
- Cart: Shopify cart
- Products: Shopify API (GID format IDs)

**The custom cart features only work on localhost until dev branch is merged to main.**

---

## Report Template

After running tests, report:

```
## Test Results

**URL tested:** [localhost:3000 or partyondelivery.com]
**Date:** [date]

### Page Load
- [ ] Hero section visible
- [ ] Products loaded
- [ ] Add buttons visible
- [ ] No error messages

### Age Verification
- [ ] Modal appeared (yes/no)
- [ ] Successfully dismissed

### Add to Cart
- [ ] Button clicked
- [ ] Loading state shown
- [ ] Quantity updated
- [ ] Cart bar appeared
- [ ] Total correct

### Cart Drawer
- [ ] Opens correctly
- [ ] Shows items
- [ ] Quantity controls work
- [ ] Checkout button visible

### Errors Found
[List any errors seen]

### Screenshots
[Attach if possible]
```
