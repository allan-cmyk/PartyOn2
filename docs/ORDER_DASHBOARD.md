# Order Dashboard

The Order Dashboard is the primary ordering experience on partyondelivery.com. Every order flows through it -- solo customers, group orders, partner referrals, any party type.

**URL**: `/dashboard/[code]`
**Entry point**: `/order` (creates a GroupOrderV2, redirects to dashboard)

---

## Architecture

A solo order is a group order with one participant. One data model (`GroupOrderV2`), one set of APIs, one UI that progressively reveals group features only when relevant.

### Data Model

- **GroupOrderV2** -- the order container. Has a `shareCode`, `partyType`, `hostName`, `affiliateId`, `source`.
- **SubOrder** (tabs) -- each delivery within the order. Has delivery date/time/address, draft items, purchased items. Most orders have 1 tab; multi-delivery orders have 2+.
- **GroupParticipantV2** -- people on the order. Host + optional guests who join via share link.
- **DraftCartItem** -- items added to a tab but not yet paid for. Tied to a participant.
- **PurchasedItem** -- items that have been checked out via Stripe.

### Key Files

| Area | Files |
|------|-------|
| **Page** | `src/app/dashboard/[code]/page.tsx` |
| **Components** | `src/components/dashboard/*` (18 files) |
| **Types** | `src/lib/group-orders-v2/types.ts` |
| **API client** | `src/lib/group-orders-v2/api-client.ts` |
| **Service layer** | `src/lib/group-orders-v2/service.ts` |
| **Validation** | `src/lib/group-orders-v2/validation.ts` |
| **Hooks** | `src/lib/group-orders-v2/hooks.ts` |
| **API routes** | `src/app/api/v2/group-orders/*` |
| **Categories** | `src/lib/dashboard/categories.ts` |
| **Entry point** | `src/app/order/page.tsx` |
| **Success page** | `src/app/dashboard/[code]/success/page.tsx` |

---

## User Flow

### 1. Entry

User clicks "Start an Order" anywhere on the site. This goes to `/order` which:
- Creates a `GroupOrderV2` with 1 SubOrder and 1 participant (the host)
- Supports query params: `?ref=CODE` (affiliate), `?p=bach` (party type), `?d=boat` (delivery context), `?name=Jake`, `?a=affiliateId`
- Stores participant ID in localStorage
- Redirects to `/dashboard/[code]`

### 2. Onboarding (1 step)

If no `partyType` is set, the **OnboardingPopup** shows:
- 6 party type tiles: Boat, Bach, Wedding, Corporate, Private, Other
- "START ORDER" button
- Saves partyType via PATCH, then closes

### 3. Dashboard Layout

```
DashboardHeader          (logo, order name, participants, share button)
DeliveryHeroSection      (frosted glass: order name, delivery details, tab pills)
  main:
    InlineCart            (expandable cart at top of content)
    Get Recs button       (opens GetRecsModal)
    ProductBrowse         (search bar + category sections)
DashboardBottomBar       (scroll-aware: only shows when cart is offscreen)
```

### 4. DeliveryHeroSection

- **Order name**: large text, editable by host (click to edit, auto-focuses for new orders)
- **Delivery summary**: date | time | address (or "Add delivery details" button)
- **Tab pills**: horizontal row of delivery tabs, active tab highlighted, "+" button for host to add more
- Clicking delivery summary opens **DeliveryDetailsModal**

### 5. Delivery Details

**DeliveryDetailsModal** collects:
- Delivery date (no Sundays, 72+ hours out)
- Delivery time (30-minute windows from 8 AM to 8:30 PM)
- Address (line 1, line 2, city, zip -- province defaults to TX)
- Delivery notes

### 6. Product Browsing

- Search bar with 300ms debounce
- 7 category sections from `DASHBOARD_CATEGORIES` (in `src/lib/dashboard/categories.ts`)
- Each category shows 6 products initially, expandable to 24, then all
- Product cards: image, title, variant, price, ADD TO CART / qty stepper

### 7. Cart

**InlineCart** (replaces old CartDrawer):
- Shows at top of main content area
- Expand/collapse toggle with item count + total
- Full item management: +/- quantity, delete
- Checkout buttons: "Checkout" (solo) or "Checkout My Items" / "Pay for Everything" (group)

**DashboardBottomBar**:
- Uses IntersectionObserver on cart ref
- Only appears when user scrolls past the inline cart
- Shows "Back to Cart" (scrolls up) + "Checkout" button

### 8. Checkout

**DashboardCheckoutModal** handles:
- Two modes: `mine` (my items only) or `all` (everything on the tab)
- Discount code validation
- Delivery details form (if not yet filled)
- Creates Stripe checkout session, redirects to Stripe
- On success: redirects to `/dashboard/[code]/success`

### 9. Group Features

- **Share**: ShareModal shows link + copy button
- **Join**: JoinOverlay for guests visiting a shared link (name, email, age verification)
- **Participants**: ParticipantPanel dropdown from header (host can remove + lock/unlock)
- **Lock**: When locked, hides add/qty controls, shows "Order Locked" in bottom bar

### 10. Recommendations

- "Get Drink Recommendations" button opens GetRecsModal
- 3 questions (guest count, event type, preferences)
- Uses `calculateQuizResults()` from drinkPlannerLogic.ts
- Results shown in RecommendationsSection above categories

---

## PartyType Values

`BACHELOR` | `BACHELORETTE` | `WEDDING` | `CORPORATE` | `HOUSE_PARTY` | `OTHER` | `BOAT` | `BACH`

---

## Multi-Delivery

- Host can add delivery tabs via "+" button in DeliveryHeroSection
- Each tab is a separate SubOrder with its own delivery details, items, and checkout
- Tab pills allow switching between deliveries
- NewDeliveryModal asks party type (for UX feel) then creates a new SubOrder

---

## Design System Alignment

- Logo: `/images/pod-logo-2025.svg`
- Primary buttons: `bg-brand-blue` with `tracking-[0.08em]`
- Cart/add buttons: `bg-brand-yellow`
- Modals: `rounded-2xl`, `backdrop-blur-sm`
- Inputs: `border-2 border-gray-200 focus:border-brand-blue focus:ring-0`
- Headings: `font-heading font-bold tracking-[0.08em]`
- Minimum font: `text-sm` (14px), form labels/inputs `text-base` (16px)
- Category headings: `text-xl md:text-2xl text-center md:text-left`
- Hero section: `bg-white/70 backdrop-blur-md rounded-2xl`
- See `/design-example` page for live reference

---

## Component Reference

| Component | File | Purpose |
|-----------|------|---------|
| DashboardHeader | `DashboardHeader.tsx` | Sticky top bar: logo, name (editable), participants, share |
| DeliveryHeroSection | `DeliveryHeroSection.tsx` | Frosted hero: order name, delivery summary, tab pills |
| DeliveryDetailsModal | `DeliveryDetailsModal.tsx` | Date/time/address form for delivery |
| NewDeliveryModal | `NewDeliveryModal.tsx` | Party type tiles to create new delivery tab |
| OnboardingPopup | `OnboardingPopup.tsx` | Single-step party type selection |
| InlineCart | `InlineCart.tsx` | Expandable cart at top of content (forwardRef) |
| DashboardBottomBar | `DashboardBottomBar.tsx` | Scroll-aware bottom bar with cart summary |
| ProductBrowse | `ProductBrowse.tsx` | Search + category sections container |
| CategorySection | `CategorySection.tsx` | Single category: fetch, display, expand |
| DashboardProductCard | `DashboardProductCard.tsx` | Product card with add/qty controls |
| DashboardCart | `DashboardCart.tsx` | Cart item list with edit controls (used by InlineCart internals) |
| CartDrawer | `CartDrawer.tsx` | Right-side drawer (currently unused, kept for reference) |
| DashboardCheckoutModal | `DashboardCheckoutModal.tsx` | Checkout flow with discount + delivery |
| GetRecsModal | `GetRecsModal.tsx` | Drink recommendation quiz |
| RecommendationsSection | `RecommendationsSection.tsx` | Displays recommendation results |
| ShareModal | `ShareModal.tsx` | Share link + copy |
| JoinOverlay | `JoinOverlay.tsx` | Guest join screen |
| ParticipantPanel | `ParticipantPanel.tsx` | Host controls: remove participant, lock/unlock |

---

## Known Issues / TODO

- [ ] CartDrawer.tsx is unused -- can be deleted when confident InlineCart covers all cases
- [ ] Multi-delivery tab switching not fully tested with real data
- [ ] Per-tab party types not stored (currently group-level only)
- [ ] DashboardCheckoutModal has its own delivery details form -- should it use DeliveryDetailsModal instead?
- [ ] Partner page CTAs need to route through `/order?ref=CODE` to hit the Order Dashboard
- [ ] Mobile testing needed across all new components
- [ ] Accessibility: keyboard navigation, screen reader support for modals
- [ ] Timer/countdown feature (exists in data model but not surfaced in UI)
