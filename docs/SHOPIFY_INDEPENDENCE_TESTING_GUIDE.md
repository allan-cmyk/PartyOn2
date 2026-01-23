# Shopify Independence Testing Guide

**Date:** January 23, 2026
**Version:** Phase C Complete (Group Order Independence + Delivery Rate Engine)

---

## Prerequisites

### 1. Environment Setup

Ensure your `.env.local` has these variables set:

```bash
# Enable custom cart system (REQUIRED for local checkout)
NEXT_PUBLIC_USE_CUSTOM_CART=true

# Database (should already be configured)
DATABASE_URL=your_neon_database_url

# Stripe (for payment processing)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (for invoice delivery)
RESEND_API_KEY=re_...

# App URL (for invoice links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Start Development Server

```bash
cd "C:\Party On Delivery\WEBSITE FILES\PartyOn2"
npm run dev
```

Note the port number (likely 3000, but may be 3007/3008 if 3000 is in use).

### 3. Open Browser Tools

- Open Chrome DevTools (F12)
- Go to **Network** tab to monitor API calls
- Go to **Console** tab to watch for errors

---

## Test 1: Draft Orders API (Admin)

### 1.1 Create a Draft Order via API

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/v1/admin/draft-orders \
  -H "Content-Type: application/json" \
  -d "{
    \"customerEmail\": \"yourtestemail@gmail.com\",
    \"customerName\": \"Test Customer\",
    \"customerPhone\": \"512-555-1234\",
    \"deliveryAddress\": \"123 Congress Ave\",
    \"deliveryCity\": \"Austin\",
    \"deliveryState\": \"TX\",
    \"deliveryZip\": \"78701\",
    \"deliveryDate\": \"2026-01-26T14:00:00.000Z\",
    \"deliveryTime\": \"2:00 PM - 4:00 PM\",
    \"items\": [
      {
        \"productId\": \"test-product-1\",
        \"variantId\": \"test-variant-1\",
        \"title\": \"Tito's Vodka 750ml\",
        \"quantity\": 2,
        \"price\": 24.99
      },
      {
        \"productId\": \"test-product-2\",
        \"variantId\": \"test-variant-2\",
        \"title\": \"Modelo Especial 12-Pack\",
        \"quantity\": 1,
        \"price\": 18.99
      }
    ],
    \"deliveryFee\": 15
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "token": "uuid-token-here",
    "invoiceUrl": "http://localhost:3000/invoice/uuid-token-here",
    "status": "PENDING",
    "total": 79.93
  }
}
```

**Save the `token` value for the next tests!**

### 1.2 Verify Draft Order in Database

You can check the Neon dashboard or run:

```bash
curl http://localhost:3000/api/v1/admin/draft-orders
```

---

## Test 2: Invoice Page (Customer View)

### 2.1 Open Invoice Page

Using the token from Test 1, open in browser:

```
http://localhost:3000/invoice/YOUR_TOKEN_HERE
```

### 2.2 Verify Invoice Page Elements

**Check these items are displayed:**

- [ ] **Header**: "PARTYÓN DELIVERY" with "Premium Alcohol Delivery in Austin"
- [ ] **Customer greeting**: "Hi Test Customer,"
- [ ] **Delivery details section**:
  - [ ] Date: Shows formatted date (e.g., "Sunday, January 26, 2026")
  - [ ] Time: "2:00 PM - 4:00 PM"
  - [ ] Address: "123 Congress Ave, Austin, TX 78701"
- [ ] **Order items section**:
  - [ ] Tito's Vodka 750ml - Qty: 2 - $49.98
  - [ ] Modelo Especial 12-Pack - Qty: 1 - $18.99
- [ ] **Totals section**:
  - [ ] Subtotal: $68.97
  - [ ] Sales Tax: ~$5.69 (8.25%)
  - [ ] Delivery Fee: $15.00
  - [ ] Total: ~$89.66
- [ ] **Pay button**: Gold "Pay $XX.XX" button at bottom
- [ ] **Footer**: Contact email and copyright

### 2.3 Test Pay Button (Stripe Checkout)

1. Click the **"Pay $XX.XX"** button
2. Should redirect to Stripe Checkout page
3. **DO NOT complete payment** (unless testing with Stripe test cards)
4. Verify the Stripe page shows correct total

**Stripe Test Card (if you want to complete payment):**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/28`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `78701`)

---

## Test 3: Invoice API

### 3.1 Fetch Invoice Data

```bash
curl http://localhost:3000/api/v1/invoice/YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "token": "...",
    "status": "PENDING",
    "customerName": "Test Customer",
    "customerEmail": "yourtestemail@gmail.com",
    "deliveryAddress": "123 Congress Ave",
    "deliveryCity": "Austin",
    "deliveryState": "TX",
    "deliveryZip": "78701",
    "items": [...],
    "subtotal": 68.97,
    "taxAmount": 5.69,
    "deliveryFee": 15,
    "total": 89.66
  }
}
```

### 3.2 Test Invalid Token

```bash
curl http://localhost:3000/api/v1/invoice/invalid-token-12345
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invoice not found"
}
```

---

## Test 4: Delivery Rate Engine

### 4.1 Test Central Austin (78701)

Create draft order with zip 78701:

```bash
curl -X POST http://localhost:3000/api/v1/admin/draft-orders \
  -H "Content-Type: application/json" \
  -d "{
    \"customerEmail\": \"test@example.com\",
    \"customerName\": \"Central Austin Test\",
    \"deliveryAddress\": \"100 Congress Ave\",
    \"deliveryCity\": \"Austin\",
    \"deliveryState\": \"TX\",
    \"deliveryZip\": \"78701\",
    \"deliveryDate\": \"2026-01-26T14:00:00.000Z\",
    \"deliveryTime\": \"2:00 PM - 4:00 PM\",
    \"items\": [{\"productId\": \"p1\", \"variantId\": \"v1\", \"title\": \"Test Item\", \"quantity\": 1, \"price\": 100}],
    \"deliveryFee\": 15
  }"
```

**Expected:** Delivery fee = $15 (Central Austin base rate)

### 4.2 Test Greater Austin (78745 - South Austin)

```bash
curl -X POST http://localhost:3000/api/v1/admin/draft-orders \
  -H "Content-Type: application/json" \
  -d "{
    \"customerEmail\": \"test@example.com\",
    \"customerName\": \"South Austin Test\",
    \"deliveryAddress\": \"5000 S Congress Ave\",
    \"deliveryCity\": \"Austin\",
    \"deliveryState\": \"TX\",
    \"deliveryZip\": \"78745\",
    \"deliveryDate\": \"2026-01-26T14:00:00.000Z\",
    \"deliveryTime\": \"2:00 PM - 4:00 PM\",
    \"items\": [{\"productId\": \"p1\", \"variantId\": \"v1\", \"title\": \"Test Item\", \"quantity\": 1, \"price\": 100}],
    \"deliveryFee\": 20
  }"
```

**Expected:** Delivery fee = $20 (Greater Austin base rate)

### 4.3 Test Extended Austin (78613 - Cedar Park)

```bash
curl -X POST http://localhost:3000/api/v1/admin/draft-orders \
  -H "Content-Type: application/json" \
  -d "{
    \"customerEmail\": \"test@example.com\",
    \"customerName\": \"Cedar Park Test\",
    \"deliveryAddress\": \"100 E Whitestone Blvd\",
    \"deliveryCity\": \"Cedar Park\",
    \"deliveryState\": \"TX\",
    \"deliveryZip\": \"78613\",
    \"deliveryDate\": \"2026-01-26T14:00:00.000Z\",
    \"deliveryTime\": \"2:00 PM - 4:00 PM\",
    \"items\": [{\"productId\": \"p1\", \"variantId\": \"v1\", \"title\": \"Test Item\", \"quantity\": 1, \"price\": 100}],
    \"deliveryFee\": 30
  }"
```

**Expected:** Delivery fee = $30 (Extended Austin base rate)

### Delivery Zone Reference

| Zone | Base Rate | Express | Min Order | Free Above | Example Zips |
|------|-----------|---------|-----------|------------|--------------|
| Central Austin | $15 | $25 | $100 | $250 | 78701, 78702, 78703, 78704, 78705 |
| Greater Austin | $20 | $35 | $125 | $300 | 78745, 78748, 78749, 78750, 78758 |
| Extended Austin | $30 | $50 | $150 | $400 | 78613, 78660, 78681, 78664 |

---

## Test 5: Group Order Flow (Full E2E)

This is the main test for Shopify Independence.

### 5.1 Create a Group Order

1. Go to: `http://localhost:3000/group/create` (or homepage → "Start Group Order")
2. Fill in:
   - **Group Name**: "Test Party Jan 2026"
   - **Delivery Address**: "500 E 6th St, Austin, TX 78701"
   - **Delivery Date**: Pick a date 3+ days out
   - **Delivery Time**: Select a time slot
3. Click **"Create Group Order"**
4. **Copy the share code** (e.g., `ABC123`)

### 5.2 Add Items as Host

1. On the group order page, click **"Add Items"**
2. Browse products and add a few to your cart
3. Note your cart total
4. Return to the group order dashboard

### 5.3 Join as a Participant (Incognito Window)

1. Open an **incognito/private browser window**
2. Go to: `http://localhost:3000/group/join/YOUR_SHARE_CODE`
3. Complete age verification
4. Enter guest name: "Test Guest 1"
5. Add some items to cart
6. Note the cart total updates on the dashboard

### 5.4 Check Group Dashboard

Back in your original window:
1. Go to: `http://localhost:3000/group/dashboard`
2. Verify:
   - [ ] Host cart total is shown
   - [ ] Guest cart total is shown
   - [ ] Combined total is calculated
   - [ ] Progress bar shows progress toward minimum

### 5.5 Lock the Order (Host)

1. Once total exceeds minimum ($100 for Central Austin):
2. Click **"Lock Order"**
3. Confirm the lock

### 5.6 Create Checkout (THE KEY TEST)

1. After locking, click **"Checkout"** or **"Create Invoice"**
2. Enter host email (use a real email to receive the invoice)
3. Click **"Create Checkout"**

**Watch the Network tab for:**
```
POST /api/group-orders/[code]/create-checkout
```

**Expected Response (with NEXT_PUBLIC_USE_CUSTOM_CART=true):**
```json
{
  "success": true,
  "draftOrder": {
    "id": "uuid",
    "token": "uuid-token",
    "invoiceUrl": "http://localhost:3000/invoice/uuid-token",
    "totalPrice": "XXX.XX"
  },
  "checkoutUrl": "http://localhost:3000/invoice/uuid-token"
}
```

**Key Indicators of Local System:**
- `invoiceUrl` points to `/invoice/[token]` (NOT Shopify)
- Console shows: `[Group Checkout] Using local Draft Order system`
- No calls to Shopify Admin API

### 5.7 Check Invoice Email

1. Check your email inbox
2. Look for email from PartyOn Delivery
3. Verify email contains:
   - [ ] Group order name
   - [ ] Participant list with contributions
   - [ ] Delivery details
   - [ ] Subtotal, tax, delivery, total
   - [ ] "Pay Now" button

### 5.8 Complete Payment (Optional)

1. Click "Pay Now" in email OR go to invoice URL
2. Click the Pay button
3. Complete Stripe checkout with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/28`
   - CVC: `123`
4. Verify redirect to success page

---

## Test 6: Edge Cases

### 6.1 Expired Invoice

1. Create a draft order with short expiry (would need to modify API)
2. Wait for expiry
3. Try to access invoice page
4. Should show "Invoice Expired" banner

### 6.2 Cancelled Invoice

```bash
curl -X PATCH http://localhost:3000/api/v1/admin/draft-orders/YOUR_ID \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"CANCELLED\"}"
```

Then access invoice page - should show "Invoice Cancelled" banner.

### 6.3 Outside Service Area

Try creating with zip code `90210` (Beverly Hills):

```bash
curl -X POST http://localhost:3000/api/v1/admin/draft-orders \
  -H "Content-Type: application/json" \
  -d "{
    \"customerEmail\": \"test@example.com\",
    \"customerName\": \"Outside Area Test\",
    \"deliveryZip\": \"90210\",
    ...
  }"
```

Should still work but won't have zone-based pricing.

---

## Test 7: Verify Shopify Fallback

### 7.1 Disable Custom Cart

In `.env.local`, change:
```bash
NEXT_PUBLIC_USE_CUSTOM_CART=false
```

Restart the dev server.

### 7.2 Create Group Order Checkout

Repeat Test 5.6 with custom cart disabled.

**Expected:**
- Console shows: `[Group Checkout] Using Shopify Draft Orders (legacy)`
- Response includes Shopify invoice URL (myshopify.com domain)
- Uses Shopify Admin API

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Invoice not found" | Check token is correct, draft order exists in DB |
| Stripe redirect fails | Verify STRIPE_SECRET_KEY is set |
| Email not received | Check RESEND_API_KEY, check spam folder |
| Wrong delivery fee | Verify zip code is in DELIVERY_ZONES |
| Group checkout fails | Ensure NEXT_PUBLIC_USE_CUSTOM_CART=true |
| 500 errors | Check terminal for stack trace |

### Check Server Logs

The terminal running `npm run dev` shows:
- API route calls with status codes
- Error stack traces
- Feature flag decisions (`[Group Checkout] Using local Draft Order system`)

### Database Check

Use Neon dashboard or Prisma Studio:
```bash
npx prisma studio
```

Then browse the `DraftOrder` table to see created orders.

---

## Success Criteria

All tests pass when:

- [ ] Draft orders create successfully via API
- [ ] Invoice page displays all order details correctly
- [ ] Pay button redirects to Stripe Checkout
- [ ] Delivery fees match zone expectations
- [ ] Tax calculates at 8.25%
- [ ] Group order checkout uses LOCAL system (not Shopify)
- [ ] Invoice emails are sent and received
- [ ] Payment completes via Stripe test cards
- [ ] Server logs show `Using local Draft Order system`

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Create draft order
curl -X POST http://localhost:3000/api/v1/admin/draft-orders -H "Content-Type: application/json" -d '{"customerEmail":"test@example.com",...}'

# Get draft order
curl http://localhost:3000/api/v1/admin/draft-orders/ID

# Get invoice
curl http://localhost:3000/api/v1/invoice/TOKEN

# Run automated tests
node test-modules.mjs
python test-shopify-independence.py
```

---

**Document Version:** 1.0
**Last Updated:** January 23, 2026
