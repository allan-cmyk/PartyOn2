# Universal Order Dashboard -- Full Spec

## Overview

Replace the current multi-flow ordering system with a single universal "order dashboard" experience. Every order -- whether from a direct customer, a partner referral, or a group -- follows the same path:

1. Create a personalized, shareable dashboard page
2. Browse and add products
3. Checkout or share

The core architecture principle: **a solo order is a group order with everything collapsed.** One data model, one set of APIs, one UI that progressively reveals features (tabs, participants, per-person checkout) only when they become relevant.

---

## What This Replaces

| Current Flow | Entry Point | What Happens |
|---|---|---|
| Quiz-first ordering | `/order` | 11-step quiz before products visible, or skip to browse |
| Partner referral | `/partners/[slug]` -> `/order?ref=CODE` | Same quiz/browse, affiliate cookie set |
| Group ordering (V2) | `/group-v2/create` | Separate system with tabs, participants, per-person checkout |
| Invoice payment | `/invoice/[token]` | Ops-created draft orders |

After this project, all ordering (except ops-created invoices) goes through the universal dashboard.

---

## Entry Points

### Direct Customer (partyondelivery.com)

- Homepage, nav, any CTA: "Start My Order" button
- Clicking it creates a new `GroupOrderV2` record with 1 SubOrder and 1 participant (the creator)
- Redirects to `/dashboard/[shareCode]`

### Partner Page (`/partners/[slug]`)

- "Start My Order" button on partner landing page
- Creates `GroupOrderV2` with:
  - `affiliateId` set from partner record
  - `source = PARTNER_PAGE`
  - `deliveryContextType` pre-set if partner has a default (e.g., boat partners -> `BOAT`)
  - `partyType` pre-set if partner has a default
- Redirects to `/dashboard/[shareCode]`

### URL with Query Params

- `/order?a=AFFILIATE_ID&d=boat&p=bachelor&name=Jake%27s+Lake+Party`
- Creates `GroupOrderV2` pre-filled from params, redirects to `/dashboard/[shareCode]`
- Supported params:
  - `a` -- affiliate ID (sets `affiliateId` + `source = PARTNER_PAGE`)
  - `d` -- delivery context type (maps to `deliveryContextType` on first SubOrder)
  - `p` -- party type (maps to `partyType`)
  - `name` -- order name (maps to `GroupOrderV2.name`)

### Shared Dashboard Link

- Someone receives a link: `partyondelivery.com/dashboard/[shareCode]`
- Opens the join flow (enter name, verify 21+)
- Joins as a participant on the existing order
- Affiliate attribution is NOT changed when someone joins via share link

---

## Onboarding Popup

Once the dashboard page loads, a popup appears over it. The dashboard is visible behind the popup, motivating completion.

### Step 1 -- Party Type

- Headline: "Let's Get This Party Started"
- Question: "What kind of party is this?"
- Options: Bachelor/ette, Wedding, Corporate, House Party, Other
- Selection sets `partyType` on `GroupOrderV2`

### Step 2 -- Name Your Page

- "What should we name your party page?"
- Placeholder: "Bob's Bachelor Party"
- Updates `GroupOrderV2.name` (default: "New Party Order")
- Can skip

### Step 3 -- Delivery Type

- "Where are we delivering?"
- Options: House/BnB/Hotel, Boat/Marina, Business/Venue, Apartment, or Skip
- Selection sets `deliveryContextType` on the first `SubOrder`
- Note below options: "You'll enter the exact delivery address, date & time at checkout"

### Skip Behavior

- User can click outside the popup at any point to dismiss
- Dashboard works with or without completing any questions
- All fields have sensible defaults (`partyType = null`, `name = "New Party Order"`, `deliveryContextType = HOUSE`)

### Pre-filled from Entry Point

- If the dashboard was created from a partner page or URL params that already set party type / delivery context / name, skip the corresponding popup step(s)
- If all fields are pre-filled, skip the popup entirely

---

## The Dashboard

### Layout

```
Desktop:
+--------------------------------------------------+
| [Logo]        Bob's Bachelor Party       [Share]  |
|                                                   |
| [Delivery: House/BnB]  (tab bar if 2+ tabs)      |
|                                                   |
| [Get Recs]                                        |
|                                                   |
| -- Beer ------------------------------------      |
| [prod] [prod] [prod] [prod] [prod] [prod]        |
|                              [See More]           |
|                                                   |
| -- Seltzers --------------------------------      |
| [prod] [prod] [prod] [prod] [prod] [prod]        |
|                              [See More]           |
|                                                   |
| ... more categories ...                           |
|                                                   |
+--------------------------------------------------+
| [View Cart (4)]            [Checkout - $89.46]    |  <- sticky bottom bar
+--------------------------------------------------+

Mobile:
+------------------------+
| [Logo]    Bob's Bach.. |
|           [Share]      |
|                        |
| [Get Recs]             |
|                        |
| -- Beer -------------- |
| [prod] [prod] [prod]  |
| [prod] [prod] [prod]  |
|         [See More]     |
|                        |
| -- Seltzers ---------- |
| [prod] [prod] [prod]  |
| [prod] [prod] [prod]  |
|         [See More]     |
|                        |
+------------------------+
| Cart (4)  [Checkout]   |  <- sticky bottom bar
+------------------------+
```

### Dashboard Header

- Order name as heading ("Bob's Bachelor Party" or "New Party Order")
- Delivery context shown as label if set (e.g., "Boat/Marina")
- Participant names shown when 2+ participants (e.g., "You + DJ Mike")
- Share button (always visible)

### Tab Bar (Progressive Disclosure)

- **1 delivery (default):** No tab bar. Delivery context shown in header.
- **2+ deliveries:** Tab bar appears with tab names + `[+]` button to add more.
- Tabs are added via "Add Another Delivery" link in the delivery details section (unobtrusive placement).

### Product Browsing

**Category sections, in this order:**
1. Beer
2. Seltzers
3. Cocktail Kits (with descriptions of contents)
4. Wine / Champagne
5. Liquor
6. Mixers / Non-Alcoholic
7. Supplies (cups, ice, etc.)

**Layout per category:**
- Desktop: 1 row, 5-6 products across
- Mobile: 2 rows of 3 products (6 visible)
- "See More" button expands to 4 rows
- "See All" button after that shows full collection

**Product cards:** Image, name, size/variant, price, "Add" button. Once added, shows quantity stepper (+/-).

**Category ordering by party type:** Deferred. Same order for all party types at launch. Future enhancement: reorder categories based on `partyType` (e.g., bachelor -> beer first, bachelorette -> seltzers/cocktails first). No schema changes needed -- purely a frontend sort.

### Sticky Bottom Bar

- Always visible at bottom of viewport
- Shows cart item count + total
- "Checkout" button
- One bar. Not duplicated at top. Standard mobile pattern.

---

## Get Recs (Drink Calculator)

### Placement

"Get Recs" button positioned above the product grid, inside the dashboard. Not a separate page or flow.

### Flow

1. Click "Get Recs" -- modal opens
2. Three questions:
   - How many people?
   - How long? (2h / 3h / 4h / 5h / 6h / all day)
   - What do they drink? (beer, seltzers, cocktails, wine, spirits -- multi-select)
3. Click "Get My Recommendations"
4. Modal closes. A "Recommended for You" section appears at the top of the product grid
5. Section shows recommended products with quantities (e.g., "3 x Modelo 24pk") and "Add" buttons
6. "Add All Recommendations" button at the top of the section

### Implementation

- Reuse calculation logic from `src/lib/drinkPlannerLogic.ts`
- Feed it fewer inputs (guest count + duration + drink types is sufficient)
- Drop: vibe, extras, cocktail pick, bartender, event details (from the current 11-step quiz)
- Recommendations are display-only UI -- NOT created as `DraftCartItem` records
- User clicks "Add" to explicitly add items to their cart

### Delivery-Context-Aware Recommendations (Deferred)

- Future: if `deliveryContextType = BOAT`, bias toward cans, deprioritize glass bottles, upsell ice/water/cups
- Requires product-level packaging metadata (not yet in schema)
- Not Phase 1

---

## Cart (Progressive Disclosure)

### Solo (1 participant)

```
Cart (4 items)

  Modelo 24pk             $32.99
  Ranch Water 12pk        $24.99
  Lime 4pcs                $2.49
  Solo Cups 25pk           $4.99

  Subtotal                $65.46

  [ Checkout - $65.46 ]
```

No ownership labels. No participant sections. Just a shopping cart.

### Multi-Participant (2+ participants)

```
Cart (6 items)

YOUR ITEMS
  Topo Chico 12pk         $12.99
  Solo Cups 25pk           $4.99
  [ Checkout My Items - $17.98 ]

DJ MIKE'S ITEMS
  Modelo 24pk             $32.99
  Ranch Water 12pk        $24.99
  Lime 4pcs                $2.49
  Ice 20lbs                $5.99

  Order Total             $84.44
  [ Pay for Everything - $84.44 ]
```

- Items grouped by participant with section headers
- You can edit quantities on YOUR items only. Other people's items are view-only.
- "Checkout My Items" appears under your section
- "Pay for Everything" appears at the bottom

### After Partial Checkout

If one or more participants have already checked out their items:

```
Cart (3 remaining items)

YOUR ITEMS
  Topo Chico 12pk         $12.99
  Solo Cups 25pk           $4.99
  [ Checkout My Items - $17.98 ]

DJ MIKE'S ITEMS (Paid)
  Modelo 24pk             $32.99  [checkmark]
  Ranch Water 12pk        $24.99  [checkmark]

TOMMY'S ITEMS
  Bud Light 24pk          $26.99
  Ping Pong Balls          $3.99

  Remaining Total         $48.96
  [ Pay for Remaining - $48.96 ]
```

- Purchased items shown with checkmark, grayed out, not editable
- Button changes from "Pay for Everything" to "Pay for Remaining"
- "Pay for Remaining" charges for ALL unpurchased draft items regardless of who added them
- If only your items remain unpurchased, button just says "Checkout My Items"

### Payment Safety

- When creating a Stripe session for "Pay for Remaining," snapshot the specific `DraftCartItem` IDs
- On webhook completion, verify those items are still drafts before converting to `PurchasedItem`
- If any items were purchased by someone else in the meantime, handle gracefully (partial fulfillment or refund delta)
- Use idempotency keys on Stripe sessions

---

## Sharing & Lead Capture

### Share Button

Always visible in the dashboard header. Clicking it opens the share modal.

### Share Modal

```
+----------------------------------+
|  Share Your Order                |
|                                  |
|  [partyondelivery.com/dashb...]  |  <- copyable link, shown immediately
|  [Copy Link]                     |
|                                  |
|  -- or send it to yourself --    |
|                                  |
|  Email: [________________]      |
|  Phone: [________________]      |
|                                  |
|  [Send Me This Link]            |
+----------------------------------+
```

- The shareable link is shown IMMEDIATELY -- no gating behind contact info
- Email/phone entry is optional, positioned as "send it to yourself"
- Clicking "Send Me This Link" sends the dashboard URL via email (Resend) and/or SMS (GHL webhook)
- Contact info is saved on the participant's `GroupParticipantV2` record (`guestEmail`, `guestPhone`)

### Lead Capture for Partners

When a customer enters their contact info on a partner-attributed order (`affiliateId` is set):
- The partner can see this order and the customer's contact info in their affiliate dashboard
- No separate "lead" table -- the `GroupOrderV2` record with its participant data IS the lead
- Partner follow-up happens through their own channels (text, call, in-person)

---

## Partner (Bartender) Workflow

### Creating an Order for a Client

1. Bartender visits their partner page (`/partners/[slug]`) or uses a bookmarked URL with their params
2. Clicks "Start My Order"
3. Dashboard created with their `affiliateId` and `source = PARTNER_PAGE`
4. Bartender fills out onboarding popup (or skips) -- names the order, sets party type/delivery context
5. Bartender browses products and builds the cart
6. Bartender clicks "Share" and sends the dashboard link to their client

### Client Receives the Link

1. Client opens `/dashboard/[shareCode]`
2. Enters name, verifies 21+, joins as participant
3. Sees the pre-built cart under the bartender's name
4. Can browse and add their own items
5. Can click "Pay for Everything" to cover the whole order, or "Checkout My Items" for just their additions

### What the Partner Sees

In their affiliate dashboard (`/affiliate/dashboard`), a "Shared Orders" section shows:
- Order name
- Created date
- Item count + estimated total
- Status: Draft / Partial / Completed
- Customer contact info (if provided)
- View-only -- partners cannot modify orders from the dashboard

---

## Joining an Order

When someone opens a shared dashboard link (`/dashboard/[shareCode]`):

### If Not Yet a Participant

Show a join overlay:
- "You've been invited to [Order Name]"
- Fields: Name, Email (optional), Phone (optional)
- Checkbox: "I confirm I'm 21 or older"
- Button: "Join"
- On submit: creates `GroupParticipantV2` record, reloads dashboard as authenticated participant

### If Already a Participant

- Identify by email match or localStorage token
- Load dashboard directly, no join overlay

### Participant Capabilities

- Browse products and add items (owned by them)
- Edit quantity / remove their own items
- View (but not edit) other participants' items
- Checkout their own items via "Checkout My Items"
- Checkout everything via "Pay for Everything" / "Pay for Remaining"

---

## Delivery Details

Delivery address, date, and time are NOT collected during onboarding. They are collected at checkout or in a delivery details section on the dashboard.

### On the Dashboard

Each SubOrder (tab/delivery) has a collapsible delivery details section:
- Address (street, city, state, zip)
- Date picker
- Time window selector
- Notes field (placeholder text changes based on `deliveryContextType`:
  - `HOUSE`: "Gate code, parking instructions, etc."
  - `BOAT`: "Marina name, slip/dock number, etc."
  - `VENUE`: "Venue name, loading dock instructions, etc."
  - `HOTEL`: "Hotel name, room number or lobby instructions, etc.")
- Contact phone

These can be filled in at any time. They must be complete before checkout.

### Adding Another Delivery

- "Add Another Delivery" link in the delivery details section
- Opens a modal: name, delivery context type, address, date/time
- Creates a new `SubOrder` on the `GroupOrderV2`
- Tab bar appears in the dashboard (now that there are 2+ tabs)

---

## Real-Time Updates

### Polling

- SWR polling at 5-second intervals when tab is focused (existing group-v2 behavior)
- Reduce to 30 seconds or pause when tab is backgrounded
- Use existing `useGroupOrderV2` hook from `src/lib/group-orders-v2/hooks.ts`

### Optimistic UI

- When a user adds/removes/updates their own items, update the UI immediately
- Don't wait for the server round-trip for your own actions
- Poll picks up other participants' changes

---

## Schema Changes

### New Fields on GroupOrderV2

```prisma
model GroupOrderV2 {
  // ... existing fields ...

  partyType    PartyType?            @map("party_type")
  affiliateId  String?               @map("affiliate_id")
  source       OrderSource           @default(DIRECT)

  affiliate    Affiliate?            @relation(fields: [affiliateId], references: [id], onDelete: SetNull)
}

enum PartyType {
  BACHELOR
  BACHELORETTE
  WEDDING
  CORPORATE
  HOUSE_PARTY
  OTHER
}

enum OrderSource {
  DIRECT
  PARTNER_PAGE
  INTERNAL
}
```

### New Field on SubOrder

```prisma
model SubOrder {
  // ... existing fields ...

  deliveryContextType  DeliveryContextType  @default(HOUSE) @map("delivery_context_type")
}

enum DeliveryContextType {
  HOUSE
  BOAT
  VENUE
  HOTEL
  OTHER
}
```

### New Field on GroupParticipantV2

```prisma
model GroupParticipantV2 {
  // ... existing fields ...

  guestPhone   String?   @map("guest_phone")
}
```

### Attribution Rules

- `affiliateId` is set ONLY at `GroupOrderV2` creation time
- It is immutable -- sharing the dashboard link does not change attribution
- When a participant checks out, the resulting `Order` record inherits `affiliateId` from the `GroupOrderV2`
- Commission tracking flows through existing affiliate commission system

---

## Persistence Strategy

### When to Create the DB Record

Do NOT create the `GroupOrderV2` on page load. Create it when:
- The user completes (or skips) the onboarding popup, OR
- The user adds their first item to the cart, OR
- The user clicks "Share"

Whichever comes first.

Before persistence, use localStorage to hold any onboarding answers. Once the record is created, the URL updates to `/dashboard/[shareCode]` and all state is server-side.

### Why Not Persist Immediately

- Prevents thousands of orphaned empty records from bounced visitors
- Reduces DB load and operational noise in partner dashboards
- The dashboard UI can render a "preview" state from localStorage before the record exists

---

## Pages & Routes

### New Pages

| Route | Purpose |
|---|---|
| `/dashboard/[code]` | The universal order dashboard |
| `/dashboard/[code]/checkout` | Checkout flow (delivery details + Stripe) |
| `/dashboard/[code]/checkout/success` | Post-payment confirmation |

### Modified Pages

| Route | Change |
|---|---|
| `/order` | Becomes thin redirect: accepts query params, creates GroupOrderV2, redirects to `/dashboard/[code]` |
| `/partners/[slug]` | "Start My Order" CTA creates GroupOrderV2 with affiliate attribution, redirects to `/dashboard/[code]` |
| `/affiliate/dashboard` | Add "Shared Orders" section showing partner-attributed GroupOrderV2 records |

### Unchanged Pages

| Route | Why |
|---|---|
| `/invoice/[token]` | Ops-created invoices are a separate system (admin sends, customer pays) |
| `/checkout` | Remains for any legacy cart-based flows during transition; eventually deprecated |
| `/group-v2/*` | Deprecated once universal dashboard is live; redirect to `/dashboard/*` |

### API Routes

Most group-v2 API routes (`/api/v2/group-orders/...`) are reused as-is. New/modified routes:

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/v2/group-orders` | Modified: accept `partyType`, `source`, `affiliateId`, `deliveryContextType` |
| POST | `/api/v2/group-orders/[code]/tabs/[tabId]/checkout-all` | NEW: "Pay for Everything / Remaining" checkout |
| POST | `/api/v2/group-orders/[code]/share` | NEW: send dashboard link via email/SMS, save contact info |
| GET | `/api/v2/group-orders/[code]/recommendations` | NEW: drink calculator results based on guest count, duration, drink types |

---

## Phase Plan

### Phase 1 -- Core Dashboard

**Goal:** Replace `/order` with the universal dashboard for direct customers.

**Schema:**
- Add `partyType`, `affiliateId`, `source` to `GroupOrderV2`
- Add `deliveryContextType` to `SubOrder`
- Add `guestPhone` to `GroupParticipantV2`
- Add enums: `PartyType`, `OrderSource`, `DeliveryContextType`
- Run migration

**Frontend:**
- New `/dashboard/[code]` page
  - Onboarding popup (3 steps, all skippable)
  - Product browsing by category with See More / See All expansion
  - Progressive cart (flat when solo, grouped by person when multi-participant)
  - Sticky bottom bar (cart count + checkout)
  - "Get Recs" modal (3 questions, results as display-only section with Add buttons)
  - Tab bar (hidden when 1 delivery, visible when 2+)
  - Participant indicator (hidden when solo, shows names when 2+)
- Modify `/order` to create GroupOrderV2 and redirect to `/dashboard/[code]`
- Per-participant checkout (existing)
- "Pay for Everything / Remaining" checkout (new)

**Backend:**
- Modify group-v2 creation endpoint to accept new fields
- New "checkout all remaining" endpoint
- New recommendations endpoint (wraps drinkPlannerLogic.ts)
- Persistence strategy: defer DB write until first meaningful action

**What this does NOT include:**
- Sharing / lead capture (Phase 2)
- Partner attribution flow (Phase 2)
- Partner dashboard changes (Phase 2)

### Phase 2 -- Sharing, Attribution & Partners

**Goal:** Enable partner workflow (create order, share with client) and lead capture.

**Frontend:**
- Share modal with copyable link + optional email/phone
- Join overlay for shared links (name, age verification)
- Modify `/partners/[slug]` to create attributed GroupOrderV2 and redirect
- Support `/order?a=...&d=...&p=...&name=...` query params
- "Shared Orders" section in affiliate dashboard

**Backend:**
- Share endpoint (send link via Resend email + GHL SMS webhook)
- Save contact info on participant record
- Affiliate dashboard API: query GroupOrderV2 where affiliateId matches
- Ensure `affiliateId` propagates from GroupOrderV2 to Order on checkout

### Phase 3 -- Polish & Future (Build Only If Demand Exists)

- Category ordering by party type
- Delivery-context-aware recommendations (cans for boats, etc.)
- Automated reminders for abandoned draft orders
- Partner-initiated follow-up messaging
- "Suggest items" feature (partner adds recommendations that client sees as suggestions, not in cart)
- QR code generation for share links
- WhatsApp share integration

---

## Migration Plan

### Transition Period

- `/order` redirects to dashboard creation flow
- `/group-v2/[code]` redirects to `/dashboard/[code]` (same share codes work)
- Existing group-v2 orders continue to function -- the dashboard page reads from the same data model
- `/checkout` remains functional for any in-progress legacy carts (localStorage-based)

### Deprecation

After transition period (2-4 weeks of dashboard being live):
- Remove old `/order` page components (quiz, collections bar, product grid)
- Remove `/group-v2/*` pages (redirects remain)
- Remove V1 group order system entirely (`/group/*`, `src/lib/group-orders/`)
- Clean up unused components

---

## Key Decisions Documented

1. **Solo order = group order with 1 tab, 1 participant, UI collapsed.** One system, not two.
2. **Tabs are called "deliveries" in the UI.** Tab bar only appears when 2+ deliveries exist.
3. **Participant sections only appear when 2+ people are on the order.**
4. **`partyType` and `deliveryContextType` are separate concerns.** A bachelor party on a boat has `partyType = BACHELOR` and `deliveryContextType = BOAT`.
5. **`affiliateId` is immutable after creation.** Sharing the link does not change attribution.
6. **Recommendations are display-only.** Not persisted as DraftCartItems. User explicitly adds them.
7. **No DB record until first meaningful action.** Onboarding state in localStorage until cart add, share, or popup completion.
8. **Delivery address/date/time collected at checkout, not onboarding.** Reduces friction to get products on screen.
9. **"Pay for Everything" becomes "Pay for Remaining" after partial checkout.** Charges only unpurchased draft items.
10. **Partner draft visibility is view-only.** Partners see orders in their dashboard but cannot modify them.
