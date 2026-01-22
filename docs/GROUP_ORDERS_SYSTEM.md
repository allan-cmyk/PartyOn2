# PartyOn Delivery - Group Orders System Documentation

## Overview

Group ordering allows multiple people to collaborate on a single delivery. A host creates the group order, shares it with participants via a unique link, and everyone checks out individually with **FREE DELIVERY**. All orders are delivered together at the scheduled time.

---

## Complete User Journey

### PHASE 1: Host Creates Group Order

**Page:** `/group/create`

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATE GROUP ORDER                        │
├─────────────────────────────────────────────────────────────┤
│  Event Name: "BACH-SARAH-2026"                              │
│  Your Name: "Sarah"                                         │
│  Delivery Date: [72+ hours in advance, no Sundays]          │
│  Delivery Time: [1-hour window, 9am-8pm]                    │
│  Delivery Address: [Manual or Partner Location]             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ FREE DELIVERY for all participants!               │   │
│  │   Share the link with your group.                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│           [ CREATE GROUP ORDER ]                            │
└─────────────────────────────────────────────────────────────┘
```

**API Call:** `POST /api/group-orders/create`
```typescript
{
  name: "BACH-SARAH-2026",
  deliveryDate: "2026-02-15",
  deliveryTime: "12:00 PM - 1:00 PM",
  deliveryAddress: { address1, city, province, zip, country },
  customerId: "guest_123...",
  customerName: "Sarah"
}
```

**Response:**
```typescript
{
  id: "group_1769053371264",
  shareCode: "M852RW",
  shareUrl: "https://partyondelivery.com/group/M852RW",
  // ... order details
}
```

**After Creation:**
- Host is redirected to `/group/dashboard`
- `localStorage.setItem('hostOf_M852RW', 'true')` marks them as host
- `GroupOrderContext` stores the share code

---

### PHASE 2: Host Shares with Participants

**Page:** `/group/dashboard` (Share Modal)

The host can share via:
1. **Copy Link** - `https://partyondelivery.com/group/M852RW`
2. **QR Code** - Scannable code for in-person sharing
3. **Text/WhatsApp** - Pre-formatted message with link

---

### PHASE 3: Participant Joins Group Order

**Page:** `/group/[code]` (Landing Page)

```
┌─────────────────────────────────────────────────────────────┐
│            🎉 You're Invited to Join                        │
│               "BACH-SARAH-2026"                              │
├─────────────────────────────────────────────────────────────┤
│  Hosted by: Sarah                                           │
│  📅 Delivery: Feb 15, 2026 • 12:00 PM - 1:00 PM            │
│  📍 13993 FM 2769, Leander, TX 78641                       │
│                                                             │
│  ──────────────────────────────────────────────────────────│
│  👥 Current Participants (3)                                │
│     • Sarah (Host) - $45.00                                │
│     • Mike - $32.00                                        │
│     • Jessica - Shopping...                                │
│                                                             │
│  ──────────────────────────────────────────────────────────│
│                                                             │
│  Your Name: [_______________]                               │
│  Your Email: [_______________]                              │
│                                                             │
│  ⚠️ You'll need to verify you're 21+ to continue           │
│                                                             │
│           [ JOIN & START SHOPPING ]                         │
└─────────────────────────────────────────────────────────────┘
```

**Join Flow (with cart):**
1. User fills name + email
2. Clicks "JOIN & START SHOPPING"
3. Age verification modal appears
4. User confirms 21+
5. API: `POST /api/group-orders/id/{id}/join`
6. Redirected to `/order` to shop

**Join Flow (without cart) - NEW:**
1. User fills name + email
2. Clicks "JOIN & START SHOPPING"
3. Age verification modal appears
4. User confirms 21+
5. `pendingGroupOrderJoin` saved to localStorage:
   ```json
   {
     "groupOrderId": "group_123...",
     "shareCode": "M852RW",
     "guestName": "Mike",
     "guestEmail": "mike@example.com"
   }
   ```
6. Redirected to `/order?joinGroup=M852RW`
7. When user adds first item to cart → `completePendingGroupOrderJoin()` called automatically
8. User is joined to the group order with their new cart

---

### PHASE 4: Participants Shop

**Page:** `/order` (with group context active)

When in a group order:
- Cart shows group order badge
- FREE DELIVERY is applied automatically via cart attributes
- Cart updates sync to group order dashboard in real-time

**Cart Sync API:** `POST /api/group-orders/[code]/update-cart`
```typescript
{
  cartId: "gid://shopify/Cart/123...",
  cartTotal: 45.00,
  itemCount: 3
}
```

---

### PHASE 5: Participants Checkout Individually

Each participant completes their own checkout through Shopify:
1. Click "Checkout" in cart
2. Shopify checkout with pre-filled address from group order
3. Payment processed individually
4. Order confirmed

**Cart attributes set during join:**
- `_group_order_code`: Share code
- `_group_order_name`: Event name
- `_delivery_date`: Scheduled date
- `_delivery_time`: Scheduled time

---

### PHASE 6: Host Monitors Progress

**Page:** `/group/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│               GROUP ORDER DASHBOARD                          │
│                 "BACH-SARAH-2026"                            │
├─────────────────────────────────────────────────────────────┤
│  Status: ACTIVE    Share Code: M852RW                       │
│  📅 Feb 15, 2026 • 12:00 PM - 1:00 PM                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PARTICIPANTS (4)                        Total: $156 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  👑 Sarah (You/Host)  $45.00  ✓ Checked out        │   │
│  │     Mike              $32.00  ✓ Checked out        │   │
│  │     Jessica           $47.00  🛒 Shopping          │   │
│  │     Tom               $32.00  🛒 Shopping          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ SHARE LINK ]  [ VIEW ALL ITEMS ]  [ CLOSE GROUP ]       │
└─────────────────────────────────────────────────────────────┘
```

**Host Actions:**
- **Share Link** - Opens share modal
- **View All Items** - See aggregated items from all carts
- **Remove Participant** - `POST /api/group-orders/[code]/remove-participant`
- **Close Group** - `POST /api/group-orders/[code]/lock-order`

---

### PHASE 7: Group Order Completion

When host clicks "Close Group":
1. Order status changes to `locked`
2. No new participants can join
3. Existing participants can still checkout
4. Host can create consolidated checkout if needed

**Alternative: Multi-Payment Mode** (optional)
- Host enables multi-payment
- Each participant gets individual checkout link
- System tracks who has paid
- Host decides how to proceed with partial payments

---

## Technical Architecture

### File Structure

```
src/
├── app/
│   ├── group/
│   │   ├── create/page.tsx          # Create group order form
│   │   ├── dashboard/page.tsx       # Host dashboard
│   │   ├── join/page.tsx            # Join redirect handler
│   │   ├── [code]/page.tsx          # Public landing page
│   │   ├── checkout/[code]/page.tsx # Group checkout
│   │   ├── pay/[code]/page.tsx      # Individual payment
│   │   └── payment-success/page.tsx # Payment confirmation
│   │
│   └── api/group-orders/
│       ├── create/route.ts          # Create order
│       ├── [code]/route.ts          # Get order by code
│       ├── [code]/lock-order/route.ts
│       ├── [code]/create-checkout/route.ts
│       ├── [code]/remove-participant/route.ts
│       ├── [code]/update-cart/route.ts
│       ├── [code]/items/route.ts
│       ├── [code]/payment-status/route.ts
│       ├── [code]/enable-multi-payment/route.ts
│       ├── [code]/host-decision/route.ts
│       ├── [code]/participant-checkout/route.ts
│       └── id/[id]/join/route.ts    # Join by ID
│
├── lib/group-orders/
│   ├── types.ts                     # TypeScript interfaces
│   ├── api.ts                       # Client-side API wrapper
│   ├── hooks.ts                     # React hooks + helpers
│   ├── store.ts                     # In-memory store
│   ├── database.ts                  # Database abstraction
│   ├── database-vercel.ts           # Vercel KV implementation
│   └── free-delivery.ts             # Cart discount logic
│
├── contexts/
│   ├── GroupOrderContext.tsx        # Group order state
│   └── CartContext.tsx              # Cart + auto-join logic
│
└── components/group-orders/
    ├── ShareGroupOrder.tsx          # Share modal
    ├── GroupOrderItems.tsx          # Aggregated items view
    ├── EnableMultiPaymentModal.tsx
    ├── PaymentStatusSection.tsx
    └── HostDecisionModal.tsx
```

### Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Browser    │───▶│   Next.js    │───▶│   Database   │
│  (React)     │◀───│   API Routes │◀───│ (Memory/KV)  │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                    │
       │                   ▼                    │
       │            ┌──────────────┐            │
       │            │   Shopify    │            │
       │            │  Storefront  │            │
       │            │     API      │            │
       │            └──────────────┘            │
       │                   │                    │
       │                   ▼                    │
       │            ┌──────────────┐            │
       └───────────▶│   Shopify    │◀───────────┘
                    │  Admin API   │
                    │ (Draft Order)│
                    └──────────────┘
```

### Key Interfaces

```typescript
interface GroupOrder {
  id: string
  name: string
  hostCustomerId: string | null
  hostName?: string
  shareCode: string  // 6-char unique code
  status: 'active' | 'locked' | 'closed' | 'completed' | 'cancelled'
  deliveryDate: string
  deliveryTime: string
  deliveryAddress: Address
  minimumOrderAmount: number
  expiresAt: string
  multiPaymentEnabled?: boolean
}

interface GroupParticipant {
  id: string
  groupOrderId: string
  guestName?: string
  guestEmail?: string
  cartId: string
  ageVerified: boolean
  status: 'active' | 'removed' | 'checked_out'
  cartTotal?: number
  itemCount?: number
  checkedOutAt?: string
  shopifyOrderId?: string
}
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/group-orders/create` | POST | Create new group order |
| `/api/group-orders/[code]` | GET | Get order by share code |
| `/api/group-orders/id/[id]/join` | POST | Join order by ID |
| `/api/group-orders/[code]/lock-order` | POST | Close group (host) |
| `/api/group-orders/[code]/create-checkout` | POST | Create draft order |
| `/api/group-orders/[code]/remove-participant` | POST | Remove participant |
| `/api/group-orders/[code]/update-cart` | POST | Sync cart totals |
| `/api/group-orders/[code]/items` | GET | Get aggregated items |

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `customerId` | User's unique ID (guest or Shopify) |
| `groupOrderCode` | Current active group order code |
| `hostOf_[code]` | Marks user as host of specific order |
| `pendingGroupOrderJoin` | Join data for users without cart |
| `shopify-cart-id` | Shopify cart ID |

---

## Recent Updates

### January 2026: Join Without Cart Fix
- Users without a cart can now join group orders
- Pending join data saved to localStorage
- Auto-join triggered when first item added to cart
- Redirects updated to use `/order` instead of `/products`

---

## Testing

### Manual Test Flow
1. Go to `/group/create`
2. Fill form and create group order
3. Copy share link
4. Open in incognito (simulates participant)
5. Join the group order
6. Add items to cart
7. Verify participant appears in dashboard
8. Test checkout flow

### API Test
```bash
# Get group order
curl http://localhost:3000/api/group-orders/M852RW

# Join group order
curl -X POST http://localhost:3000/api/group-orders/id/group_123/join \
  -H "Content-Type: application/json" \
  -d '{"cartId":"test-123","guestName":"Test User","guestEmail":"test@example.com"}'
```
