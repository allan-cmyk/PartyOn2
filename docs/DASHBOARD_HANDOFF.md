# Universal Order Dashboard -- Handoff Notes

## What's Done (Phase 1 -- all complete, TypeScript clean)

### 1a: Schema + Service Layer
- **Schema**: 3 new enums (`PartyType`, `DashboardSource`, `DeliveryContextType`) + new fields on `GroupOrderV2` (partyType, affiliateId, source), `SubOrder` (deliveryContextType), `GroupParticipantV2` (guestPhone), `Affiliate` (groupOrdersV2 relation)
- **DB pushed**: `npx prisma db push` ran successfully, Prisma client regenerated
- **types.ts**: New types added, `GroupOrderV2Full` and `SubOrderFull` updated, `ParticipantSummary` includes `phone`, new `CreateDashboardInput` interface
- **service.ts**: `createDashboardOrder()`, `moveAllDraftsToPurchased()`, `updateGroupOrderFields()` added. Serializers updated for new fields.
- **validation.ts**: `CreateDashboardSchema` (relaxed, no delivery required), `UpdateGroupOrderSchema` accepts `partyType`, `UpdateTabSchema` accepts `deliveryContextType`
- **api-client.ts**: `createDashboardOrderV2()` added, `updateGroupOrderV2()` accepts `partyType`
- **API route**: `POST /api/v2/group-orders/dashboard/route.ts` (NEW)

### 1b: Dashboard Page + Onboarding
- **`/dashboard/[code]/page.tsx`**: Main client component. Uses `useGroupOrderV2(code)` SWR hook. Stores participantId in localStorage. Renders header, onboarding popup, product browse, bottom bar, cart drawer, checkout modal, get recs modal.
- **`DashboardHeader.tsx`**: Logo, inline-editable order name, delivery context label, participant names, share button
- **`OnboardingPopup.tsx`**: 3 steps (party type tiles -> name input -> delivery context tiles). Each step PATCHes immediately. Click outside to dismiss. Steps skip if already set.

### 1c: Product Browsing
- **`src/lib/dashboard/categories.ts`**: 7 categories mapping to existing `localCollection` handles
- **`CategorySection.tsx`**: Fetches products via `/api/products?localCollection=X&first=60`. Expansion: initial(6) -> more(24) -> all. Shows loading skeletons.
- **`DashboardProductCard.tsx`**: Image, title, variant, price. "Add" button or qty stepper when in cart. Uses `addDraftItemV2`, `updateDraftItemV2`, `removeDraftItemV2`.
- **`ProductBrowse.tsx`**: Container mapping categories -> CategorySection. Search bar with 300ms debounce replaces categories with flat search results.

### 1d: Cart + Checkout
- **`DashboardCart.tsx`**: Progressive - flat when solo, grouped ("YOUR ITEMS" / "OTHERS' ITEMS") when 2+. Purchased items shown grayed with checkmarks. Edit own items, view-only for others.
- **`DashboardBottomBar.tsx`**: Fixed bottom bar with cart count + checkout CTA. Hidden when cart empty.
- **`CartDrawer.tsx`**: Fixed right-side drawer with backdrop. Contains DashboardCart.
- **`DashboardCheckoutModal.tsx`**: Two modes (mine/all). Shows items, discount code input, delivery details form (if not yet filled), context-aware placeholder text. Saves delivery via PATCH before Stripe redirect.
- **`checkout-all/route.ts`**: `POST /api/v2/group-orders/[code]/tabs/[tabId]/checkout-all` - gets ALL draft items, creates Stripe session with `checkoutType: 'all'` metadata
- **`group-v2-payments.ts`**: Updated `createGroupV2CheckoutSession` to accept `checkoutType`. `handleGroupV2PaymentCompleted` checks `checkoutType === 'all'` and calls `moveAllDraftsToPurchased()` instead of single-participant move.

### 1e: Get Recs
- **`GetRecsModal.tsx`**: 3-step modal (guest count presets + custom, duration buttons, drink type multi-select). Calls recommendations API.
- **`/api/v2/group-orders/[code]/recommendations/route.ts`**: GET with query params. Uses `calculateQuizResults()` from drinkPlannerLogic.ts. Matches recs to real products in DB via `SEARCH_OVERRIDES`.
- **`RecommendationsSection.tsx`**: Yellow-bg section above categories. "Add All" button. Per-item "Add" with recommended qty. Dismissible.

### 1f: /order Redirect + Success
- **`/order/page.tsx`**: Replaced with redirect. Creates GroupOrderV2 via `createDashboardOrderV2()`, stores participant ID, redirects to `/dashboard/[code]`. Supports `?ref=`, `?a=`, `?d=`, `?p=`, `?name=` params.
- **Old order page**: Backed up to `src/app/order/page-legacy.tsx`
- **`/dashboard/[code]/success/page.tsx`**: Green checkmark, "Payment Confirmed", link back to dashboard
- **Checkout URLs**: Updated existing `checkout/route.ts` success/cancel URLs to `/dashboard/` paths

## Build Status
- `tsc --noEmit` passes cleanly (0 errors)
- `next build` was started but killed due to context window constraints -- needs to be verified
- No unused import issues detected

## What's NOT Done Yet

### Phase 2: Sharing & Partners
- [ ] **ShareModal** component (copyable link + optional email/phone send)
- [ ] **Share API** route (`POST /api/v2/group-orders/[code]/share`)
- [ ] **JoinOverlay** component (shown for non-participants visiting a shared link)
- [ ] Partner page CTA creates attributed GroupOrderV2 + redirect (`src/app/partners/[slug]/page.tsx`)
- [ ] Support `/order?a=...&d=...&p=...&name=...` URL params (partially done in /order redirect)
- [ ] Affiliate group orders API (`GET /api/v1/affiliate/group-orders`)
- [ ] "Shared Orders" section in affiliate dashboard
- [ ] Email template for share link
- [ ] GHL webhook for SMS share

### Phase 3: Polish & Migration
- [ ] `/group-v2/*` redirects to `/dashboard/*`
- [ ] Remove old `/order` components (quiz, collections bar) -- currently backed up
- [ ] Mobile responsive testing (iOS Safari, Android Chrome)
- [ ] Concurrent checkout handling (race condition safety)
- [ ] Expired order handling

## Key Files Created/Modified

### New Files (19)
```
src/app/api/v2/group-orders/dashboard/route.ts
src/app/api/v2/group-orders/[code]/tabs/[tabId]/checkout-all/route.ts
src/app/api/v2/group-orders/[code]/recommendations/route.ts
src/app/dashboard/[code]/page.tsx
src/app/dashboard/[code]/success/page.tsx
src/lib/dashboard/categories.ts
src/components/dashboard/DashboardHeader.tsx
src/components/dashboard/OnboardingPopup.tsx
src/components/dashboard/CategorySection.tsx
src/components/dashboard/DashboardProductCard.tsx
src/components/dashboard/ProductBrowse.tsx
src/components/dashboard/DashboardCart.tsx
src/components/dashboard/DashboardBottomBar.tsx
src/components/dashboard/CartDrawer.tsx
src/components/dashboard/DashboardCheckoutModal.tsx
src/components/dashboard/GetRecsModal.tsx
src/components/dashboard/RecommendationsSection.tsx
src/app/order/page-legacy.tsx (backup)
```

### Modified Files (8)
```
prisma/schema.prisma (3 enums + 5 fields + 1 relation)
src/lib/group-orders-v2/types.ts (new types, extended interfaces)
src/lib/group-orders-v2/service.ts (3 new functions, updated serializers)
src/lib/group-orders-v2/validation.ts (CreateDashboardSchema, extended UpdateTab/UpdateGroup)
src/lib/group-orders-v2/api-client.ts (createDashboardOrderV2, extended updateGroupOrderV2)
src/lib/stripe/group-v2-payments.ts (checkoutType support in create + webhook)
src/app/api/v2/group-orders/[code]/route.ts (uses updateGroupOrderFields)
src/app/api/v2/group-orders/[code]/tabs/[tabId]/route.ts (unchanged, deliveryContextType flows through UpdateTabSchema)
src/app/api/v2/group-orders/[code]/tabs/[tabId]/checkout/route.ts (updated success/cancel URLs)
src/app/order/page.tsx (replaced with redirect)
```

## Testing Checklist (from spec)
1. Click "Start My Order" from homepage -> redirects to `/dashboard/[code]`
2. Onboarding popup appears, complete all 3 steps -> header updates
3. Skip popup -> dashboard works with defaults
4. Browse Beer category -> products load, See More expands
5. Add item -> appears in cart, bottom bar updates
6. Increment/decrement qty -> updates correctly
7. Search for "Modelo" -> results appear
8. Get Recs -> modal, answer 3 questions -> recommendations appear
9. Add All Recommendations -> items in cart
10. Cart drawer -> all items with totals
11. Checkout -> delivery form (if empty), Stripe redirect
12. Complete Stripe payment -> success page, items purchased
13. Verify partyType, deliveryContextType, source in DB

## Known Considerations
- The old `/order` page is backed up but the route now redirects. If issues arise, rename `page-legacy.tsx` back to `page.tsx`.
- Checkout-all stores `checkoutType: 'all'` in Stripe session metadata -- the webhook handler reads this.
- Dashboard page auto-detects host participant from SWR data if no localStorage participant found.
- Recommendations API does sequential DB queries (one per recommendation) -- could be optimized with a single query if performance is an issue.
- The `/order` redirect creates a new GroupOrderV2 every time -- no dedup. If bounce rates are concerning, add localStorage buffering later.
