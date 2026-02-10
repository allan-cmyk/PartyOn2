# Group Ordering V2 - Complete Product Spec + Implementation Plan

> **Last Updated:** January 30, 2026
> **Status:** ✅ IMPLEMENTATION COMPLETE — All 7 phases done, E2E tests passing, build clean
> **Progress Tracker:** See `GROUP_ORDERING_V2_PROGRESS.md`

---

## One-Sentence Summary

Build a tab-based Group Ordering system where a host creates an event group with multiple sub-orders (tabs), participants join via code/link, add items to a shared draft cart per tab with item ownership, then each participant checks out their own items via Stripe. Host pays delivery fees via invoice.

---

## Key Decisions (Confirmed)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Infrastructure | Local system only: PostgreSQL + Stripe. **No Shopify dependencies.** |
| 2 | Migration strategy | Replace safely: Git branch backup of v1, clean rebuild under `/api/v2/` and `/group-v2/` |
| 3 | Cart model | Shared draft cart per tab with item ownership (NOT individual carts per participant) |
| 4 | Checkout | Individual Stripe checkout per participant per tab |
| 5 | Product browsing | Embedded product catalog in dashboard |
| 6 | Real-time | SWR polling at 5-second interval |
| 7 | Order deadline | Auto-calculated: delivery time - 72 hours |
| 8 | Countdown timer | Earliest of: first tab deadline or first delivery date |
| 9 | Delivery fees | Per-tab based on zip zone. Host pays ALL via invoice at end. Discount codes can waive. |
| 10 | Tab access | Participants can add items to ANY open tab |
| 11 | Post-checkout | Items move from draft cart to purchased items (clean separation) |

---

## Design Requirements

### A) Page Hierarchy + Layout Rules

**Container:**
- Max width: `max-w-6xl` (1152px) centered with `mx-auto`
- Generous whitespace: `px-4 md:px-8` horizontal, `py-6 md:py-8` between sections
- Background: `bg-gray-50` page background, `bg-white` for content cards with `rounded-xl shadow-sm border border-gray-100`

**Sticky Header Behavior:**
- **Desktop:** Group header (name + timers + share button) stays fixed at top on scroll, below main nav. Uses `sticky top-24 z-40 bg-white/95 backdrop-blur-sm border-b`
- **Mobile:** Header collapses to slim bar on scroll: just group name (truncated) + countdown timer + share icon. Full header shows when scrolled to top.
- Tab bar is sticky directly below the header: `sticky top-[calc(6rem+header-height)] z-30`

**Sticky Action Bar (Mobile):**
- Bottom-fixed bar on mobile: `fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4`
- Shows: "My Items (N) - $Total" + "Checkout My Items" primary CTA
- Only visible when participant has draft items in active tab
- Desktop: same bar is inline within DraftCartSection (not fixed)

**Navigation:**
- Main site nav remains at top (`h-24`, fixed)
- Dashboard uses `mt-24` to clear nav (standard pattern)
- No hero section - content starts immediately

### B) Visual Language (Brand + Fun)

**Color Palette (from existing brand):**
- Primary CTA buttons: `bg-gold-600 text-gray-900 hover:bg-gold-500` (yellow/gold)
- Secondary buttons: `bg-white text-gray-900 border border-gray-300 hover:bg-gray-50`
- Destructive: `bg-red-50 text-red-700 hover:bg-red-100`

**Status Chips:**
| Status | Colors | Icon |
|--------|--------|------|
| Open | `bg-green-100 text-green-800` | Circle check |
| Locked | `bg-gray-100 text-gray-600` | Lock icon |
| Deadline Passed | `bg-amber-100 text-amber-800` | Clock icon |
| Cancelled | `bg-red-100 text-red-700` | X circle |
| Fulfilled | `bg-blue-100 text-blue-800` | Truck icon |
| Purchased | `bg-green-50 text-green-700` | Check badge |

**Ownership Indicator:**
- Avatar/initial badge: 32px circle with first letter of name, background color from a rotating palette (6 colors)
- Colors: slate, rose, amber, emerald, sky, violet (mapped by participant index)
- Format: `[Avatar] Name` next to each draft item
- Host gets a small crown/star badge on their avatar

**Fun Touches (Microcopy, Not Visual Clutter):**
- Empty states with personality (see section C)
- Success toast after checkout: brief confetti animation (CSS only, `framer-motion`) + "You're all set! Your items are locked in."
- Timer urgency: when deadline < 2 hours, timer turns amber. When < 30 min, turns red with subtle pulse.
- Share modal: "Share this link and let the party planning begin"

**Typography:**
- Headings: Cormorant Garamond (existing brand serif)
- Body/UI: Inter (existing brand sans)
- Timer: monospace `font-mono` for countdown digits
- Prices: `font-medium tabular-nums` for alignment

### C) State Definitions (Every Tab State)

#### Tab: OPEN + Empty (no items yet)
- **Visible:** Tab delivery info, empty draft cart area, product catalog CTA
- **Disabled:** "Checkout My Items" button (grayed out)
- **Message:** Card with illustration: "No items yet. Share the link and start adding drinks!"
- **CTA:** "Browse Products" button (gold, prominent) + "Share Group" button

#### Tab: OPEN + Has Items
- **Visible:** Draft cart with items grouped by participant, checkout bar, purchased section (if any)
- **Disabled:** Nothing - full interactivity
- **Message:** None (content speaks for itself)
- **CTA:** "Checkout My Items (N) - $Total" (gold button, sticky on mobile)

#### Tab: LOCKED (host manually locked)
- **Visible:** Draft cart (read-only), purchased section, delivery info
- **Disabled:** Add item buttons, quantity controls, remove buttons
- **Message:** Banner at top of tab: "This tab is locked by the host. You can still checkout your existing items."
- **CTA:** "Checkout My Items" still active (if participant has items)

#### Tab: DEADLINE_PASSED (auto-locked at orderDeadline)
- **Visible:** Same as LOCKED
- **Disabled:** Same as LOCKED
- **Message:** Banner: "The ordering deadline for this delivery has passed. You can still checkout your existing items."
- **CTA:** "Checkout My Items" still active for 24h grace period. After grace: "Ordering window closed."

#### Tab: CANCELLED
- **Visible:** Purchased section (if any), delivery info (struck through)
- **Disabled:** Everything - fully read-only
- **Message:** Banner: "This delivery was cancelled by the host."
- **CTA:** None

#### Tab: FULFILLED
- **Visible:** Purchased section, delivery info with "Delivered" badge
- **Disabled:** Everything - fully read-only
- **Message:** Banner: "This delivery is complete! Cheers!"
- **CTA:** None

### D) Information Design Patterns

**Draft Cart - Grouped by Participant:**
```
Draft Cart (7 items)                    [Filter: All ▾ | Mine]
┌─────────────────────────────────────────────────────────────┐
│ 🟠 Mike (3 items - $89.97)                            [▼]  │
│   Tito's Vodka 750ml        x2   $49.98       [- 2 +] [X] │
│   Ranch Water 6pk           x1   $12.99       [- 1 +] [X] │
│   Lone Star 12pk            x1   $26.99       [- 1 +] [X] │ (only Mike sees controls)
│                                                             │
│ 🟢 Sarah (2 items - $47.98)                           [▼]  │
│   Deep Eddy Lemon 750ml     x1   $22.99                    │
│   Topo Chico 12pk           x1   $24.99                    │ (Sarah sees controls, others don't)
│                                                             │
│ 🔵 Lisa (2 items - $35.98)                            [▼]  │
│   Aperol 750ml              x1   $22.99                    │
│   Prosecco                  x1   $12.99                    │
└─────────────────────────────────────────────────────────────┘
│ Your Items: 3 items | $89.97        [CHECKOUT MY ITEMS →]  │ (sticky on mobile)
└─────────────────────────────────────────────────────────────┘
```

- Accordion: each participant section expandable/collapsible
- Default: all expanded (few participants). Collapse when 5+ participants.
- Filter toggle: "All Items" (default) | "My Items" (shows only current user's items)
- Quantity controls: only visible on items where `addedBy === currentParticipant`
- Host exception: host sees remove (X) on ALL items

**Purchased Section:**
```
Purchased (4 items)                                      [▼]
┌─────────────────────────────────────────────────────────────┐
│ Sarah — purchased at 3:14 PM                                │
│   Deep Eddy Lemon 750ml     x1   $22.99   ✓ Paid          │
│   Topo Chico 12pk           x1   $24.99   ✓ Paid          │
│                                                             │
│ Mike — purchased at 4:02 PM                                 │
│   Tito's Vodka 750ml        x2   $49.98   ✓ Paid          │
│   Lone Star 12pk            x1   $26.99   ✓ Paid          │
└─────────────────────────────────────────────────────────────┘
```

- Collapsed by default (accordion)
- Grouped by purchaser with timestamp
- Green check badge + "Paid" indicator
- Read-only - no controls for anyone

### E) Mobile-First Details

**Tab Bar (Mobile):**
- Horizontally scrollable chips: `overflow-x-auto flex gap-2 snap-x`
- Each tab: pill shape `rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap`
- Active tab: `bg-gray-900 text-white`
- Inactive: `bg-white text-gray-700 border border-gray-200`
- Status dot on each chip (green/gray/amber circle)
- "+ Add Tab" chip at end (host only, dashed border)

**Cart Rows (Mobile):**
- Single-line compact view: `[image-40px] [title truncated] [qty] [$price]`
- Tap to expand: shows variant, owner badge, notes, quantity controls
- Swipe-to-delete (optional Phase 7 polish)

**Product Catalog (Embedded):**
- Must NOT feel like a separate app. Seamless integration:
- Same category tabs as existing `/order` page (horizontal scrollable chips)
- Same sticky category filter bar
- Product grid: 2 columns on mobile, 3 on tablet, 4 on desktop
- Product card: image + title + price + "Add to Tab" button
- "Add to Tab" shows current tab name: "Add to Airbnb Delivery"
- No separate page navigation - catalog section is within the dashboard, toggled by "Browse Products" button
- When catalog is open: draft cart collapses to summary bar at top
- Back button returns to full cart view

**Responsive Breakpoints:**
- Mobile: < 768px (single column, sticky bottom bar, scrollable tabs)
- Tablet: 768-1024px (two column layout for cart + participants)
- Desktop: > 1024px (full layout with sidebar for participants)

---

## 1. Entity Definitions

### GroupOrderV2 (Top-Level Event)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string | Event name, e.g., "Jason's Bach Party 2026" |
| hostCustomerId | UUID? | FK to Customer (nullable for guests) |
| hostName | string | Display name |
| hostEmail | string? | Contact email |
| hostPhone | string? | Contact phone |
| shareCode | string | Unique 6-char code (case-insensitive) |
| status | enum | ACTIVE, CLOSED, COMPLETED, CANCELLED |
| expiresAt | DateTime | Hard expiry (30 days from creation) |
| createdAt / updatedAt | DateTime | Timestamps |

**Relations:** `tabs[]` (SubOrder), `participants[]` (GroupParticipantV2)

### SubOrder (Tab)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| groupOrderId | UUID | FK to GroupOrderV2 |
| name | string | Tab label: "Boat", "Airbnb", "Lake House" |
| position | int | Sort order for tab bar |
| deliveryDate | DateTime | When to deliver |
| deliveryTime | string | Time window, e.g., "2-4 PM" |
| deliveryAddress | JSON | { address1, address2?, city, province, zip, country } |
| deliveryPhone | string? | Contact for delivery |
| deliveryNotes | string? | Special instructions |
| orderDeadline | DateTime | Auto: deliveryDate - 72 hours (stored for queries) |
| deliveryFee | Decimal | Calculated from zip zone |
| deliveryFeeWaived | boolean | True if discount code applied |
| status | enum | OPEN, LOCKED, FULFILLED, CANCELLED |

**Relations:** `draftItems[]`, `purchasedItems[]`, `deliveryInvoice?`

### GroupParticipantV2 (Person in Group)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| groupOrderId | UUID | FK to GroupOrderV2 |
| customerId | UUID? | FK to Customer (null for guests) |
| guestName | string? | For non-authenticated participants |
| guestEmail | string? | For non-authenticated participants |
| ageVerified | boolean | Required true before adding items |
| isHost | boolean | True for the group creator |
| status | enum | ACTIVE, REMOVED |
| joinedAt | DateTime | When they joined |

**Unique constraints:** `[groupOrderId, customerId]`, `[groupOrderId, guestEmail]`
**Relations:** `draftItems[]`, `purchasedItems[]`, `payments[]`

### DraftCartItem (Shared per Tab, Owned)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| subOrderId | UUID | FK to SubOrder (which tab) |
| addedByParticipantId | UUID | FK to GroupParticipantV2 (who added it) |
| productId | UUID | FK to Product |
| variantId | UUID | FK to ProductVariant |
| title | string | Product title snapshot |
| variantTitle | string? | Variant title snapshot |
| price | Decimal | Price snapshot at time of adding |
| imageUrl | string? | Image URL snapshot |
| quantity | int | Quantity (incremented on re-add) |

**Unique constraint:** `[subOrderId, addedByParticipantId, variantId]` (enables upsert)

### PurchasedItem (Visible to All)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| subOrderId | UUID | FK to SubOrder |
| participantId | UUID | FK to GroupParticipantV2 (who bought it) |
| paymentId | UUID | FK to ParticipantPayment |
| productId, variantId | UUID | Product references |
| title, variantTitle, price, imageUrl, quantity | various | Snapshots |
| createdAt | DateTime | When purchased |

### ParticipantPayment (Individual Stripe Checkout)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| subOrderId | UUID | Which tab |
| participantId | UUID | Who paid |
| stripeCheckoutSessionId | string? | Stripe session ID |
| stripePaymentIntentId | string? | Stripe payment intent |
| subtotal | Decimal | Item subtotal |
| taxAmount | Decimal | Tax |
| discountCode | string? | Applied discount |
| discountAmount | Decimal | Discount value |
| total | Decimal | Final amount charged |
| status | enum | PENDING, PAID, FAILED, EXPIRED |
| paidAt | DateTime? | When payment completed |
| orderId | string? | FK to Order (created on payment success) |

### GroupDeliveryInvoice (Host Pays Delivery)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| subOrderId | UUID | Unique FK to SubOrder (1 invoice per tab) |
| hostParticipantId | UUID | The host paying |
| deliveryFee | Decimal | Base delivery fee |
| discountCode | string? | Applied discount |
| discountAmount | Decimal | Discount value |
| total | Decimal | Amount charged |
| stripeCheckoutSessionId | string? | Stripe session |
| status | enum | PENDING, PAID |
| paidAt | DateTime? | When paid |

---

## 2. User Roles + Permissions

### All Participants (including host)
- View: group header, timers, all tabs, shared draft cart, purchased items
- Add items to any OPEN tab (after age verification)
- Edit/remove ONLY items they added
- Checkout: "Checkout My Items" = only their draft items in that tab

### Host-Only
- Create/edit/delete sub-orders (tabs)
- Edit delivery details and deadline per tab
- Lock tabs manually
- Remove participants (deletes their draft items, NOT purchased items)
- Close group (read-only for new joins, existing can still checkout)
- Pay delivery fees via invoice
- Remove ANY draft item (not just their own)

---

## 3. API Route Architecture

All routes under `src/app/api/v2/group-orders/`

### Group Management
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/` | Create group order + initial tab(s) |
| GET | `/[code]` | Get full group (tabs, items, participants, timers) |
| PATCH | `/[code]` | Update group (name, status) |
| DELETE | `/[code]` | Cancel group (host only) |
| GET | `/my-orders` | List current user's group orders |

### Participants
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/[code]/join` | Join group (name, email, age verify) |
| DELETE | `/[code]/participants/[pid]` | Remove participant (host only) |

### Tabs (Sub-Orders)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/[code]/tabs` | Create tab (host only) |
| PATCH | `/[code]/tabs/[tabId]` | Update tab details (host only) |
| DELETE | `/[code]/tabs/[tabId]` | Delete/cancel tab (host only) |

### Draft Cart Items
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/[code]/tabs/[tabId]/items` | Add item to draft cart |
| PATCH | `/[code]/tabs/[tabId]/items/[itemId]` | Update quantity (owner/host) |
| DELETE | `/[code]/tabs/[tabId]/items/[itemId]` | Remove item (owner/host) |

### Checkout + Payments
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/[code]/tabs/[tabId]/checkout` | Create Stripe checkout for my items |
| GET | `/[code]/tabs/[tabId]/payments` | Get payment status for tab |
| POST | `/[code]/tabs/[tabId]/delivery-invoice` | Create host delivery fee invoice |

### GET `/[code]` Response Shape
```json
{
  "id": "uuid",
  "name": "Jason's Bach Party 2026",
  "shareCode": "ABC123",
  "status": "ACTIVE",
  "host": { "id": "...", "name": "Jason", "isHost": true },
  "tabs": [
    {
      "id": "uuid",
      "name": "Airbnb Delivery",
      "position": 0,
      "status": "OPEN",
      "deliveryDate": "2026-02-15T00:00:00Z",
      "deliveryTime": "2-4 PM",
      "deliveryAddress": { "address1": "123 Main St", "city": "Austin", "zip": "78701" },
      "orderDeadline": "2026-02-12T00:00:00Z",
      "deliveryFee": 15.00,
      "deliveryFeeWaived": false,
      "draftItems": [
        {
          "id": "uuid",
          "title": "Tito's Vodka 750ml",
          "variantTitle": null,
          "price": 24.99,
          "quantity": 2,
          "imageUrl": "...",
          "addedBy": { "id": "uuid", "name": "Mike" }
        }
      ],
      "purchasedItems": [
        {
          "id": "uuid",
          "title": "Deep Eddy Lemon",
          "price": 22.99,
          "quantity": 1,
          "purchaser": { "id": "uuid", "name": "Sarah" },
          "paidAt": "2026-02-10T15:30:00Z"
        }
      ],
      "deliveryInvoice": null,
      "totals": {
        "draftSubtotal": 49.98,
        "purchasedSubtotal": 22.99,
        "deliveryFee": 15.00
      }
    }
  ],
  "participants": [
    { "id": "uuid", "name": "Jason", "email": "jason@...", "isHost": true, "ageVerified": true, "status": "ACTIVE" },
    { "id": "uuid", "name": "Mike", "email": "mike@...", "isHost": false, "ageVerified": true, "status": "ACTIVE" }
  ],
  "timer": {
    "earliestDeadline": "2026-02-12T00:00:00Z",
    "earliestDelivery": "2026-02-15T00:00:00Z",
    "countdownTarget": "2026-02-12T00:00:00Z"
  },
  "expiresAt": "2026-02-28T00:00:00Z"
}
```

---

## 4. Stripe Integration

### Flow A: Participant Item Checkout
```
1. Participant clicks "Checkout My Items" on Tab X
2. POST /api/v2/group-orders/[code]/tabs/[tabId]/checkout
   Body: { participantId, discountCode? }
3. Server:
   a. Fetch participant's DraftCartItems for this tab
   b. Verify tab is OPEN (not locked/cancelled)
   c. Calculate: subtotal = sum(price * qty)
   d. Calculate: tax via existing tax calculation
   e. Validate + apply discount if provided
   f. total = subtotal - discount + tax (NO delivery fee)
   g. Create Stripe Checkout Session
      - line_items: each draft item as line item
      - metadata: { type: "group_v2", groupOrderId, subOrderId, participantId }
      - success_url: /group-v2/checkout/success?session_id={ID}&code={shareCode}
      - cancel_url: /group-v2/{code}/dashboard
   h. Create ParticipantPayment record (PENDING)
4. Return { checkoutUrl } -> redirect participant to Stripe

5. Stripe webhook: checkout.session.completed
   If metadata.type === "group_v2":
   a. Update ParticipantPayment -> PAID
   b. moveDraftToPurchased(subOrderId, participantId, paymentId)
      - Copy each DraftCartItem -> PurchasedItem
      - Delete DraftCartItems for this participant+tab
   c. Create Order record with items + delivery info from tab
   d. Link ParticipantPayment.orderId = order.id
```

### Flow B: Host Delivery Fee Invoice
```
1. Host clicks "Pay Delivery Fee" on Tab X
2. POST /api/v2/group-orders/[code]/tabs/[tabId]/delivery-invoice
   Body: { hostParticipantId, discountCode? }
3. Server:
   a. Calculate delivery fee from tab's zip code (reuse rates.ts)
   b. Validate + apply discount (FREE_SHIPPING type waives fee)
   c. Create Stripe Checkout Session for delivery fee amount
      - metadata: { type: "group_v2_delivery", subOrderId, invoiceId }
   d. Create GroupDeliveryInvoice record
4. Return { checkoutUrl, total }

5. Webhook: If metadata.type === "group_v2_delivery":
   a. Update GroupDeliveryInvoice -> PAID
   b. Mark tab deliveryFeeWaived if applicable
```

### Webhook Router Update
In `src/lib/stripe/index.ts` or equivalent, add branches:
```typescript
if (session.metadata?.type === 'group_v2') {
  await handleGroupV2PaymentCompleted(session);
}
if (session.metadata?.type === 'group_v2_delivery') {
  await handleDeliveryFeePaymentCompleted(session);
}
```

---

## 5. Frontend Architecture

### Pages
```
/app/group-v2/
  create/page.tsx                   -- Create group order form
  [code]/page.tsx                   -- Join/landing page
  [code]/dashboard/page.tsx         -- Main dashboard (everyone)
  checkout/success/page.tsx         -- Post-checkout confirmation
```

### Component Tree (~22 components)
```
/components/group-v2/
  // Layout + Header
  GroupDashboardLayout.tsx          -- Main layout wrapper
  GroupHeader.tsx                   -- Name, share code, countdown, status chip
  CountdownTimer.tsx                -- HH:MM:SS countdown (reusable)

  // Tab Navigation
  TabBar.tsx                        -- Horizontal tabs + status chips + "+ Add Tab"
  TabContent.tsx                    -- Active tab content area
  TabDeliveryInfo.tsx               -- Delivery address/date/time display
  CreateTabModal.tsx                -- Form to add new tab
  EditTabModal.tsx                  -- Form to edit tab details

  // Draft Cart
  DraftCartSection.tsx              -- All draft items grouped by participant
  DraftCartItemRow.tsx              -- Single item: name, qty, price, owner badge, controls

  // Purchased Items
  PurchasedSection.tsx              -- Accordion: purchased items grouped by purchaser
  PurchasedItemRow.tsx              -- Single purchased item

  // Product Catalog (Embedded)
  GroupProductCatalog.tsx           -- Product grid with category filters
  GroupProductCard.tsx              -- Card with "Add to Tab" button
  TabPicker.tsx                     -- Select which tab to add to

  // Participants
  ParticipantList.tsx               -- All participants with status/item counts
  ParticipantRow.tsx                -- Single participant row

  // Checkout
  ParticipantCheckoutButton.tsx     -- "Checkout My Items" button
  CheckoutSummaryModal.tsx          -- Pre-checkout summary (subtotal, tax, total)

  // Host Controls
  DeliveryFeeInvoice.tsx            -- Host delivery fee section + pay button
  HostControlBar.tsx                -- Close group, manage tabs
  ShareGroupModal.tsx               -- Share code + link + QR
```

### State Management
```typescript
// GroupOrderV2Context provides:
{
  groupOrder: FullResponse | null,   // From SWR (5s polling)
  isLoading: boolean,
  currentParticipantId: string | null,
  isHost: boolean,
  activeTabId: string | null,
  setActiveTabId: (id) => void,
  refresh: () => void,
  earliestDeadline: Date | null,
  countdownTarget: Date | null,
}
```

### Dashboard Layout
```
+---------------------------------------------------------------+
| GroupHeader: "Jason's Bach Party" | ACTIVE | Share | Timer     |
+---------------------------------------------------------------+
| TabBar: [Airbnb ✓] [Lake House ⏳] [+ Add Tab]               |
+---------------------------------------------------------------+
| TabDeliveryInfo: Feb 15, 2-4 PM | 123 Main St | Deadline: Feb 12 |
+---------------------------------------------------------------+
| DraftCartSection: "Draft Cart (5 items)"                       |
| ┌──────────────────────────────────────────────────────────┐  |
| │ Tito's Vodka 750ml   x2  $49.98  [Mike]    [-][+] [X]  │  |
| │ Lone Star 12pk       x1  $14.99  [Sarah]               │  |
| │ Ranch Water 6pk      x3  $35.97  [Mike]    [-][+] [X]  │  |
| ├──────────────────────────────────────────────────────────┤  |
| │ Your Items: 5 items | $85.95     [CHECKOUT MY ITEMS]    │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                |
| PurchasedSection: "Purchased (2 items)" [expand]               |
| ┌──────────────────────────────────────────────────────────┐  |
| │ Deep Eddy Vodka  x1  $24.99  [Sarah] Paid 3:14 PM      │  |
| └──────────────────────────────────────────────────────────┘  |
|                                                                |
| [BROWSE PRODUCTS] -> opens embedded catalog                    |
|                                                                |
| HOST ONLY: Delivery Fee: $15.00 (Central Austin) [PAY]        |
| HOST ONLY: Participants (3) [manage]                           |
+---------------------------------------------------------------+
```

---

## 6. Behavioral Rules

### Adding Items
- Add product -> create DraftCartItem owned by participant in active tab
- If same participant adds same variant to same tab -> increment quantity (upsert)
- Participant must have `ageVerified = true` to add items
- Tab must be OPEN (not LOCKED, not CANCELLED)

### Locking + Deadlines
- Tab auto-locks when `now() >= orderDeadline` (72h before delivery)
- Locked tabs: **cannot** add/edit/remove draft items
- Locked tabs: **CAN** still checkout existing items (grace period)
- Host can manually lock/unlock tabs
- Frontend checks deadline on every render + API enforces on every mutation

### Checkout Rules
- "Checkout My Items" only includes items where `addedByParticipantId == me` in current tab
- No delivery fee in participant checkout (host pays separately)
- Tax calculated based on tab's delivery zip code
- Discount codes apply per checkout session
- On successful Stripe payment: draft items -> purchased items (atomically)

### Participant Removal (Host Action)
1. Set participant status = REMOVED
2. Delete ALL their draft items across ALL tabs
3. Do NOT delete their purchased items (already paid, visible forever)
4. If they had pending Stripe checkout sessions, those will expire naturally

### Closing Group
- Host sets group status = CLOSED
- No new participants can join
- Existing participants can still shop and checkout in OPEN tabs
- All tabs continue their individual lifecycle (deadline -> lock)

### Discount Codes
- Reuse existing `Discount` table + validation logic
- PERCENTAGE / FIXED_AMOUNT: applied to participant's item subtotal
- FREE_SHIPPING: applied to host's delivery fee invoice -> waives fee
- Each checkout = 1 usage count

---

## 7. Implementation Phases

### Phase 1: Database Schema + Migration
**Build:**
- Add 7 new Prisma models to `prisma/schema.prisma`
- Add relation fields to Customer, Product, ProductVariant
- Run migration

**Files:**
- Modify: `prisma/schema.prisma`
- Generated: `prisma/migrations/YYYYMMDD_group_orders_v2/`

**Test Cases:**
- [ ] Migration runs cleanly, existing tables unaffected
- [ ] All new tables created with correct columns + indexes
- [ ] Unique constraints enforced
- [ ] Cascade deletes work (group -> tabs -> items)

---

### Phase 2: Service Layer + Business Logic
**Build:**
- TypeScript interfaces and Zod validation schemas
- Core CRUD operations for all entities
- Deadline computation, share code generation
- Delivery fee calculation per tab

**Files to Create:**
- `src/lib/group-orders-v2/types.ts`
- `src/lib/group-orders-v2/validation.ts`
- `src/lib/group-orders-v2/service.ts`
- `src/lib/group-orders-v2/utils.ts`

**Reuse:**
- `src/lib/delivery/rates.ts` (delivery fee by zip zone)
- Discount validation from existing code

**Test Cases:**
- [ ] Create group with 1 tab, 3 tabs succeeds
- [ ] Delivery date < 72h rejected
- [ ] Sunday delivery rejected
- [ ] Zip code outside service area rejected
- [ ] orderDeadline = deliveryDate - 72h correctly computed
- [ ] Draft item upsert: same variant increments qty
- [ ] Only owner can edit/delete their items
- [ ] Host can remove any item
- [ ] moveDraftToPurchased creates PurchasedItems + deletes DraftCartItems
- [ ] removeParticipant deletes drafts but NOT purchased items

---

### Phase 3: API Routes
**Build:**
- All 16 API routes under `/api/v2/group-orders/`
- Frontend API client class
- SWR hooks with 5-second polling

**Files to Create:**
- 12 route files (see API section above)
- `src/lib/group-orders-v2/api-client.ts`
- `src/lib/group-orders-v2/hooks.ts`

**Test Cases:**
- [ ] POST create returns 201 with shareCode
- [ ] GET by code returns full nested response
- [ ] POST join is idempotent (same email returns same participant)
- [ ] POST add item to LOCKED tab returns 403
- [ ] DELETE item by non-owner (non-host) returns 403
- [ ] POST checkout with 0 items returns 400
- [ ] PATCH tab recomputes orderDeadline

---

### Phase 4: Stripe Integration
**Build:**
- Participant checkout session creation
- Delivery fee invoice session creation
- Webhook handlers for `group_v2` and `group_v2_delivery`
- Draft-to-purchased migration on payment success
- Order creation from successful checkout

**Files to Create:**
- `src/lib/stripe/group-v2-payments.ts`

**Files to Modify:**
- `src/lib/stripe/index.ts` (add webhook routing)

**Test Cases:**
- [ ] Checkout session has correct line items + amounts
- [ ] Webhook moves draft -> purchased atomically
- [ ] Draft items deleted after successful move
- [ ] Order record created with correct amounts
- [ ] Duplicate webhook is idempotent
- [ ] Failed payment does NOT move items
- [ ] Delivery invoice creates correct Stripe session
- [ ] FREE_SHIPPING discount waives delivery fee

---

### Phase 5: Frontend - Create + Join
**Build:**
- GroupOrderV2 Context provider
- Create group order page (multi-tab form)
- Join/landing page
- Share modal, countdown timer

**Files to Create:**
- `src/contexts/GroupOrderV2Context.tsx`
- `src/app/group-v2/create/page.tsx`
- `src/app/group-v2/[code]/page.tsx`
- `src/components/group-v2/JoinGroupForm.tsx`
- `src/components/group-v2/ShareGroupModal.tsx`
- `src/components/group-v2/CountdownTimer.tsx`

**Test Cases:**
- [ ] Create form requires min 1 tab
- [ ] Add Tab button adds new tab section
- [ ] Validation blocks Sunday dates + < 72h dates
- [ ] Share code displayed after creation
- [ ] Join requires name + email + age verification
- [ ] Already-joined user sees appropriate message

---

### Phase 6: Frontend - Dashboard + Catalog + Checkout
**Build:**
- Main dashboard with tab navigation
- Draft cart display per tab (grouped by participant)
- Purchased items display
- Embedded product catalog
- Participant checkout flow
- Host controls (close group, manage tabs, delivery invoice)

**Files to Create:** ~20 components (see Frontend Architecture section)
- `src/app/group-v2/[code]/dashboard/page.tsx`
- `src/app/group-v2/checkout/success/page.tsx`
- All components listed in Component Tree

**Test Cases:**
- [ ] Tab bar shows all tabs, switching updates content
- [ ] Draft items show owner badge
- [ ] Only owner sees qty controls + delete
- [ ] Host sees delete on all items
- [ ] "Checkout My Items" disabled when 0 items
- [ ] Checkout redirects to Stripe, success returns to dashboard
- [ ] Items move from draft to purchased after payment
- [ ] Countdown timer updates every second
- [ ] Locked tab disables add/edit
- [ ] 5-second polling reflects other participants' changes
- [ ] Product catalog works within dashboard
- [ ] Host sees delivery fee section

---

### Phase 7: Polish + Edge Cases + Testing
**Build:**
- Tab auto-locking (deadline enforcement)
- Mobile responsive layouts
- Loading skeletons, error boundaries
- Empty states with helpful microcopy
- E2E test scenarios

**Files to Create:**
- `src/app/api/cron/group-orders-v2/route.ts` (optional cron)
- Skeleton components
- `scripts/e2e-group-v2-test.mjs`

**Full E2E Test Scenarios:**
1. Happy path: create -> 2 tabs -> 2 participants -> add items -> checkout -> purchased -> host pays delivery
2. Participant removal: drafts deleted, purchased preserved
3. Deadline: auto-lock, add/edit disabled, checkout still works
4. Group close: no new joins, existing can checkout
5. Discount codes: percentage on items, free shipping on delivery
6. Idempotent join: same email returns same participant
7. Concurrent adds: both succeed

---

## 8. Existing Infrastructure to Reuse

| System | Location | Usage in V2 |
|--------|----------|-------------|
| Products | `Product`, `ProductVariant`, `ProductImage` tables | Embedded catalog, draft item references |
| Delivery Rates | `src/lib/delivery/rates.ts` | Per-tab delivery fee calculation |
| Stripe Checkout | `src/lib/stripe/checkout.ts` | Participant + delivery fee sessions |
| Stripe Webhooks | `src/app/api/webhooks/stripe/route.ts` | Route `group_v2` events |
| Order Creation | `Order`, `OrderItem` tables | Create order on successful payment |
| Discounts | `Discount` table + validation | Apply to checkout + delivery invoice |
| Tax Calculation | Existing tax logic | Per-checkout tax based on zip |
| Email | `src/lib/email` | Confirmation emails |

---

## 9. Pre-Implementation Checklist

- [x] Git branch backup: `git checkout -b backup/group-orders-v1` *(skipped — dev branch used)*
- [x] Verify `NEXT_PUBLIC_USE_CUSTOM_CART=true` is set
- [x] Verify PostgreSQL products exist (1001 synced) — confirmed Session 3
- [x] Verify Stripe test keys configured — checkout sessions created successfully
- [x] Verify delivery rates engine works — $15 fee for 78701 confirmed
- [x] Verify discount validation works — 3 test codes seeded and verified (Session 6)

## 10. Verification Strategy

| Phase | How to Verify | Result |
|-------|---------------|--------|
| 1 | `npx prisma db push` succeeds, tables visible in DB | ✅ All 7 tables deployed to Neon |
| 2 | API integration tests via curl | ✅ Full CRUD verified (Session 3) |
| 3 | API routes tested via curl — 12+ endpoints | ✅ All pass (Sessions 3-4) |
| 4 | `stripe listen` + test checkout + webhook E2E | ✅ Webhooks routed, draft→purchased verified (Session 6) |
| 5 | Manual browser: create group, get share code, join | ✅ Pages compile, 200 status |
| 6 | Manual browser: full dashboard flow | ✅ Pages compile, 200 status |
| 7 | E2E script: `node scripts/e2e-webhook-test.mjs` | ✅ ALL ASSERTIONS PASS (Session 6) |
