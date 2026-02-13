# Premier Partners Landing Page Redesign — 10feb2026

**Goal:** Restructure the `/partners/premier-party-cruises` page into a high-conversion funnel that maximizes group orders (split payments) and drives "House Tab" upsell for higher AOV.

**Design tone:** Clean + premium with playful touches (7/10). POD palette: white + light gray backgrounds, navy/blue text, bright yellow for primary CTAs. Subtle hover animations.

**Primary conversion:** Start Group Order (split payments)
**Secondary conversion:** Build cart via Drink Calculator
**Upsell conversion:** Add a "House Tab" (Airbnb stock) + incentive

---

## Design System Conformance Rules

Every section MUST follow these standards. Reference this before implementing any section.

### Colors (from globals.css + tailwind.config.js)
| Token | Value | Usage |
|-------|-------|-------|
| `brand-blue` | `#0B74B8` | Primary buttons, links, step icons, focus rings |
| `brand-yellow` | `#F2D34F` | "Cart" variant CTAs ("Start Group Order", "Build my cart") |
| `gold` | `#D4AF37` | Accent text — **ONLY on dark backgrounds** (`bg-gray-900`) |
| `black` | `#191C1F` | Darkest background option |
| `gray-900` | Tailwind default | Text on light backgrounds, dark section backgrounds |
| `gray-50` | Tailwind default | Alternating section backgrounds |
| `white` | `#ffffff` | Primary background, text on dark backgrounds |

### Color Contrast Rules (from layout-standards.md)
- **White/light backgrounds:** Text must be `text-gray-900`, `text-gray-700`, or `text-gray-600`. Never yellow/gold text.
- **Yellow/gold backgrounds:** Text must be `text-gray-900` (black). Never white text.
- **Dark backgrounds (`bg-gray-900`):** Text must be `text-white` or `text-gold-400`/`text-brand-yellow`. Never dark text.
- **Gold buttons (`bg-brand-yellow`):** Always `text-gray-900`.

### Typography
- **Headings:** `font-heading` (Barlow Condensed) — applied globally via `h1-h6` in globals.css
- **Body:** `font-sans` (Inter)
- **Letter spacing:** Max `tracking-[0.1em]` (never `tracking-[0.15em]` or wider)
- **Eyebrow text:** `text-sm font-heading uppercase tracking-[0.08em]`

### Buttons (from `src/components/Button.tsx`)
Use the `<Button>` component with these variants:
| Variant | Classes | When to Use |
|---------|---------|-------------|
| `cart` | `bg-brand-yellow text-gray-900` | Primary CTAs: "Start Group Order", "Build my cart" |
| `primary` | `bg-brand-blue text-white` | Secondary prominent CTAs |
| `secondary` | `bg-white text-brand-blue border-2 border-brand-blue` | Outline/alternative CTAs |
| `ghost` | `bg-transparent text-gray-700` | Tertiary links, "Skip" actions |

All buttons: `rounded-lg` (never `rounded-full`), `font-sans font-semibold tracking-[0.08em]`

### Layout (from layout-standards.md)
- **Hero:** `mt-24` (96px below fixed nav) + `h-[60vh] md:h-[70vh]`
- **Section spacing:** Use CSS var `var(--section-spacing)` or `py-16 md:py-24`
- **Container:** `max-w-7xl mx-auto px-6 md:px-8`
- **Never:** `h-screen` or `h-[100vh]` with padding, `pt-24` alone, `rounded-full` on buttons

### Navigation
- Main `Navigation.tsx` is hidden on this page (existing behavior, keep it)
- Sticky collections bar handles product browsing navigation
- Mobile sticky bottom CTA bar for conversion

---

## Progress Tracker

Execute one section at a time. Mark status as you go.

| # | Section | Phase | Status | Notes |
|---|---------|-------|--------|-------|
| 1 | Hero | P1 | ⬜ Not started | Rewrite PremierHero.tsx |
| 2 | Every Order Includes | P1 | ⬜ Not started | New inline section |
| 3 | How It Works | P1 | ⬜ Not started | New inline section |
| 4 | Drink Calculator | P1 | ⬜ Not started | Move up, update wrapper copy |
| 5 | Shop (Collections + Grid) | P1 | ⬜ Not started | Reorder, keep existing components |
| 6 | House Tab Upsell | P2 | ⬜ Not started | New HouseTabUpsell.tsx |
| 7 | Experience Proof (Video) | P1 | ⬜ Not started | Refactor existing video section |
| 8 | Reviews | P1 | ⬜ Not started | Add outcome tags |
| 9 | FAQ | P1 | ⬜ Not started | Update questions (House FAQs in P2) |
| 10 | About / Trust | P1 | ⬜ Not started | Update copy |
| 11 | Final CTA | P1 | ⬜ Not started | Update copy + contrast fix |
| 12 | Footer | — | ✅ No changes | Existing Footer.tsx |
| — | Mobile Sticky CTA | P1 | ⬜ Not started | Update button labels |
| — | Post-Click Modals | P2 | ⬜ Not started | Group creation + success + join |
| — | Bundles | P3 | ⬜ Not started | Deferred |
| — | Animations / Polish | P3 | ⬜ Not started | Hover lift, animated icons |

---

## Phasing Strategy

### Phase 1: Page Structure + Copy + Existing Components
Rewrite page layout with new section order, updated copy, and re-wired existing components. No new features — just rearrange, update text, and clean up.

### Phase 2: New Features (House Tab Upsell, Enhanced Modals)
Add the House Tab upsell module, updated group order creation flow with delivery type selector, and post-creation success screen.

### Phase 3: Polish + Bundles + Motion
Add starter bundles, subtle animations (hover lift, animated check icons), inline join module, and mobile UX refinements.

---

## Current File Map

| File | Lines | Role |
|------|-------|------|
| `src/app/partners/premier-party-cruises/page.tsx` | 632 | Main page |
| `src/app/partners/premier-party-cruises/layout.tsx` | 31 | SEO metadata |
| `src/components/partners/PremierHero.tsx` | 202 | Hero section |
| `src/components/partners/PremierHeroStickyCTA.tsx` | 41 | Mobile sticky CTA |
| `src/components/partners/JoinOrderModal.tsx` | 184 | Join group modal |
| `src/components/partners/DrinkCalculator.tsx` | 930 | Drink calculator |
| `src/components/partners/WelcomePackageCard.tsx` | 170 | Welcome package card |
| `src/components/partners/WelcomePackageGrid.tsx` | 104 | Welcome packages grid |
| `src/components/partners/OrderTypeSelector.tsx` | 286 | Order type selector |
| `src/components/partners/PartnerFAQ.tsx` | 120 | FAQ accordion |
| `src/components/quick-order/QuickOrderGrid.tsx` | 102 | Product grid |
| `src/components/quick-order/QuickOrderSearch.tsx` | 225 | Search bar |
| `src/components/quick-order/CartSummaryBar.tsx` | 67 | Cart bottom bar |

---

## NEW Section Order (Phase 1)

### Section 1: HERO

**Component:** Rewrite `PremierHero.tsx`

**Layout:** Full-width with background image, dark gradient overlay, centered content.

**Copy:**

> **H1:** Your boat drinks are iced & waiting when you board.
>
> **Subhead:** Delivered to the marina before you arrive — with ice, cups, and an easy way for the whole crew to pay separately.

**Trust chips** (horizontal row below subhead):
- ✅ Free marina delivery
- ✅ TABC Licensed
- ⭐⭐⭐⭐⭐ 5-star guests

**CTAs (stacked, centered):**
- **Primary (yellow, large):** Start a Group Order (split payments)
- **Secondary (outline/navy):** Build my cart (Drink Calculator)

**Tertiary links (small, below CTAs):**
- "Shopping solo? Start an individual order"
- "Already have a group? Enter code"

**Microcopy (below all CTAs):**
> Everyone adds items and pays their portion at checkout. No Venmo chasing.

**Design system classes:**
- Section: `relative h-[60vh] md:h-[70vh] mt-24 flex items-center justify-center overflow-hidden`
- Overlay: `absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/60`
- All text: `text-white` (on dark overlay)
- H1: `font-heading text-4xl md:text-6xl font-bold tracking-[0.02em]`
- Subhead: `font-sans text-lg md:text-xl text-white/90`
- Primary CTA: `<Button variant="cart" size="lg">` — yellow, `text-gray-900`
- Secondary CTA: `<Button variant="secondary">` — outline, but use white border variant for dark bg
- Trust chips: `bg-white/10 backdrop-blur text-white text-sm rounded-lg px-3 py-1`
- Tertiary links: `text-white/70 hover:text-white text-sm underline`
- Microcopy: `text-white/60 text-sm`

---

### Section 2: EVERY ORDER INCLUDES (Value Stack)

**Component:** New section in `page.tsx` (inline, no separate component needed)

**Background:** White or light gray (`bg-gray-50`)

**Copy:**

> **Eyebrow:** Boat Day = Handled
>
> **Title:** Every Order Includes

**Checklist items (icon + text + value badge):**
- ✅ **FREE delivery to Premier Party Cruises marina** — normally $50
- ✅ **Cooler stocked with ice** — normally $25
- ✅ **Group ordering with split payments** — FREE
- ✅ **Private reserved cooler on Disco Cruise** — FREE

**Footer line:**
> Premier guest perks: **$75+ value included**

**CTA (small but prominent):**
> Start a Group Order →

**Design system classes:**
- Section: `bg-gray-50 py-16 md:py-24`
- Container: `max-w-4xl mx-auto px-6 md:px-8`
- Eyebrow: `text-sm font-heading uppercase tracking-[0.08em] text-brand-blue`
- Title: `font-heading text-3xl md:text-4xl text-gray-900`
- Check icons: `text-brand-blue` (blue checkmarks, not green — stay on-brand)
- Item text: `text-gray-900 font-semibold`
- Value badges: `text-gray-500 line-through text-sm` for strikethrough, `text-brand-blue font-bold` for "FREE"
- Footer line: `text-gray-700 font-sans`
- CTA: `<Button variant="cart" size="md">Start a Group Order →</Button>`

---

### Section 3: HOW IT WORKS (Group Ordering Explained)

**Component:** New section in `page.tsx`

**Background:** White

**Copy:**

> **Title:** How group ordering works

**Step cards (3 columns on desktop, stacked on mobile):**

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 📱 | **Start the group** | Get a share link + code |
| 2 | 👥 | **Friends add what they want** | Each person checks out separately |
| 3 | 🧊 | **We deliver one combined order** | Iced and ready at the marina |

**Callout box (highlight, below steps):**
> **Hosts love this:** everyone pays their portion. No collecting money.

**Inline join module (right side on desktop, below on mobile):**
- Label: "Have a code?"
- `[ Enter code ______ ]` `[ Join ]`

**Design system classes:**
- Section: `bg-white py-16 md:py-24`
- Container: `max-w-5xl mx-auto px-6 md:px-8`
- Title: `font-heading text-3xl md:text-4xl text-gray-900 text-center`
- Step number circles: `w-10 h-10 rounded-lg bg-brand-blue text-white font-heading font-bold flex items-center justify-center`
- Step cards: `bg-white border border-gray-200 rounded-lg p-6 shadow-sm`
- Step title: `font-heading text-lg text-gray-900 font-bold`
- Step desc: `font-sans text-gray-600 text-sm`
- Callout box: `bg-brand-yellow/10 border-l-4 border-brand-yellow rounded-lg p-4`
- Callout text: `text-gray-900 font-semibold` (light bg, so dark text)
- Join input: `border border-gray-300 rounded-lg px-4 py-2 font-sans`
- Join button: `<Button variant="primary" size="sm">Join</Button>`

---

### Section 4: DRINK CALCULATOR

**Component:** Existing `DrinkCalculator.tsx` (move UP from current position)

**Background:** Light gray (`bg-gray-50`)

**Copy:**

> **Title:** Drink Calculator + Personalized Recs
>
> **Subhead:** Answer 4 quick questions and we'll build your cart.

**Button label (yellow):** Build my cart

**Microcopy:** "You can edit anything before checkout."

**Design system classes:**
- Section: `bg-gray-50 py-16 md:py-24`
- Container: `max-w-4xl mx-auto px-6 md:px-8`
- Title: `font-heading text-3xl md:text-4xl text-gray-900 text-center`
- Subhead: `font-sans text-gray-600 text-center mt-2`
- CTA button: `<Button variant="cart" size="lg">Build my cart</Button>`
- Microcopy: `text-gray-500 text-sm text-center`
- Keep existing DrinkCalculator internals unchanged
- Scroll target: `id="drink-calculator"`

---

### Section 5: SHOP SECTION (Collections + Product Grid)

**Component:** Existing `QuickOrderSearch` + collection pills + `QuickOrderGrid`

**Background:** White

**Copy:**

> **Title:** Shop drinks

**Sticky collections bar** (becomes sticky when scrolled into view — keep existing behavior):
- Category pills: Boat Favorites, Cocktail Kits, Beer, Seltzers, Wine & Champagne, Spirits, Mixers + NA
- When sticky: show compact search + "Start Group Order" button

**Search bar:** Below sticky bar (existing component)

**Product grid:** Existing QuickOrderGrid

**Design system classes:**
- Section: `bg-white py-16 md:py-24`
- Title: `font-heading text-2xl md:text-3xl text-gray-900` (modest, not oversized)
- Category pills: `rounded-lg px-4 py-2 text-sm font-sans font-medium` (never `rounded-full`)
  - Active: `bg-brand-blue text-white`
  - Inactive: `bg-gray-100 text-gray-700 hover:bg-gray-200`
- Sticky bar CTA: `<Button variant="cart" size="sm">Start Group Order</Button>`
- Keep current IntersectionObserver behavior
- Pills scrollable horizontally on mobile (`overflow-x-auto flex gap-2`)
- Do not let "Shop drinks" outshine group ordering — keep section title modest

---

### Section 6: UPSELL MODULE — House Tab (Phase 2)

**Component:** NEW `HouseTabUpsell.tsx` (build in Phase 2)

**Background:** Dark (`bg-gray-900`) with subtle texture or gradient

**Copy:**

> **Title:** Bonus: Stock the Airbnb / house too (most groups do).
>
> **Subhead:** Boat drinks are handled — now make sure the house is stocked when you arrive. Add a House Order tab so everyone can add items and pay separately.

**Value bullets:**
- ✅ Bigger shared order (snacks, mixers, champagne, breakfast mimosas, etc.)
- ✅ Same group link, same split payments
- ✅ Delivered to the house (and fridge stocked when possible)

**Incentive headline:**
> **Premier guest perk:** Spend $250+ on the House Tab → choose a FREE Welcome Package ($50 value).

**CTA (yellow):** Add a House Tab (recommended)

**Secondary link:** "Skip — boat order only"

**Note/microcopy:**
> Tabs are separate carts inside the same group.

**Design system classes:**
- Section: `bg-gray-900 py-16 md:py-24` (dark bg)
- Container: `max-w-5xl mx-auto px-6 md:px-8`
- Title: `font-heading text-3xl md:text-4xl text-white`
- Subhead: `font-sans text-white/80`
- Check icons: `text-brand-yellow` (yellow on dark bg — per contrast rules)
- Bullet text: `text-white`
- Incentive headline: `text-brand-yellow font-heading font-bold`
- CTA: `<Button variant="cart" size="lg">Add a House Tab (recommended)</Button>` — yellow, `text-gray-900`
- Skip link: `text-white/60 hover:text-white text-sm underline` (ghost style)
- Microcopy: `text-white/50 text-sm`
- Welcome package thumbnails: use existing `WelcomePackageGrid`
- Phase 2 implementation — placeholder section in Phase 1

---

### Section 7: EXPERIENCE PROOF (Video)

**Component:** Existing video section from current page (refactored)

**Background:** White

**Layout:** Two columns — video left, recap right

**Copy:**

> **Title:** What a boat day looks like

**Left:** YouTube embed (keep current video)

**Right:** "Every Order Includes" short recap + CTA

**CTA (yellow):** Start a Group Order

**Design system classes:**
- Section: `bg-white py-16 md:py-24`
- Container: `max-w-6xl mx-auto px-6 md:px-8`
- Layout: `grid grid-cols-1 md:grid-cols-5 gap-8` (3:2 split)
- Title: `font-heading text-3xl md:text-4xl text-gray-900`
- Video: existing YouTube embed (left column, `md:col-span-3`)
- Right panel: `md:col-span-2` with bullet recap
- Bullet text: `text-gray-700 font-sans`
- Check icons: `text-brand-blue`
- CTA: `<Button variant="cart" size="lg">Start a Group Order</Button>`

---

### Section 8: REVIEWS (Social Proof)

**Component:** Existing testimonials section (refactored)

**Background:** Light gray (`bg-gray-50`)

**Copy:**

> **Eyebrow:** Real Reviews
>
> **Title:** What Premier guests say

**Review cards (4-6):** Keep existing TESTIMONIALS data + add outcome tags at top of each card:
- "Drinks were iced + ready"
- "Didn't carry anything"
- "50-person party handled"
- "Cooler labeled with our name"

**Mid-section CTA:**
> Start a Group Order (split payments)

**Design system classes:**
- Section: `bg-gray-50 py-16 md:py-24`
- Container: `max-w-5xl mx-auto px-6 md:px-8`
- Eyebrow: `text-sm font-heading uppercase tracking-[0.08em] text-brand-blue text-center`
- Title: `font-heading text-3xl md:text-4xl text-gray-900 text-center`
- Card grid: `grid grid-cols-1 md:grid-cols-2 gap-6`
- Cards: `bg-white rounded-lg p-6 border border-gray-200 shadow-sm`
- Outcome tag: `inline-block bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-lg px-2 py-1 mb-3`
- Reviewer name: `font-heading text-gray-900 font-bold`
- Review text: `font-sans text-gray-600 text-sm`
- Star icons: `text-brand-yellow` (yellow stars on light bg is for icons, not text — acceptable)
- CTA: `<Button variant="cart" size="lg">Start a Group Order (split payments)</Button>`

---

### Section 9: FAQ

**Component:** Existing `PartnerFAQ.tsx` with updated questions

**Background:** White

**Copy:**

> **Title:** FAQs

**Boat FAQs:**
- When do you deliver to the marina?
- What's the ordering deadline?
- What do you need from me (boat name / captain / time)?
- ID requirements?
- Do you include ice/cups?
- What if something is out of stock?

**House FAQs:**
- How does the House Tab work?
- Can people pay separately on the House Tab too?
- Can you fridge stock?
- Can we schedule delivery time?

**Design system classes:**
- Section: `bg-white py-16 md:py-24`
- Container: `max-w-4xl mx-auto px-6 md:px-8`
- Title: `font-heading text-3xl md:text-4xl text-gray-900 text-center`
- Column layout: `grid grid-cols-1 md:grid-cols-2 gap-8` (Boat left, House right)
- Column headers: `font-heading text-xl text-gray-900 font-bold mb-4`
- Accordion trigger: `font-sans text-gray-900 font-medium`
- Accordion content: `font-sans text-gray-600 text-sm`
- Accordion border: `border-b border-gray-200`
- Reuse existing `PartnerFAQ.tsx` accordion behavior
- House FAQs added in Phase 2

---

### Section 10: ABOUT / TRUST

**Component:** Existing trust section (refactored copy)

**Background:** Dark (`bg-gray-900`)

**Layout:** Two columns — video left, about right

**Copy:**

> **Title:** Austin-Born. Fully Licensed. Always On Time.

**Short paragraph:**
> Howdy! We're Allan and Brian, owners of Party On Delivery. Austin natives with 15+ years in events and hospitality, we built this business around one thing: taking care of people.

**Proof bullets:**
- TABC licensed + compliant ID checks
- Local team, fast communication
- Thousands of successful deliveries

**Optional CTA:**
> Text us your details → we'll help you build the cart

**Design system classes:**
- Section: `bg-gray-900 py-16 md:py-24` (dark bg)
- Container: `max-w-6xl mx-auto px-6 md:px-8`
- Layout: `grid grid-cols-1 md:grid-cols-2 gap-8`
- Title: `font-heading text-3xl md:text-4xl text-white`
- Body text: `font-sans text-white/80`
- Proof bullet icons: `text-brand-yellow` (yellow checkmarks on dark — per contrast rules)
- Proof bullet text: `text-white`
- CTA: `text-brand-yellow hover:text-yellow-300 underline font-sans text-sm` (link style)
- Video: existing autoplay loop, `rounded-lg overflow-hidden`

---

### Section 11: FINAL CTA (Strong Close)

**Component:** Existing final CTA section (updated copy)

**Background:** Brand yellow or light yellow gradient

**Copy:**

> **Title:** Ready for the lake?
>
> **Subhead:** Free marina delivery. Easy group ordering. Zero hassle.

**Primary CTA (yellow on white, or navy on yellow bg):** Start a Group Order

**Secondary links:**
- "Start an individual order"
- "Join with code"

**Support line:**
> Questions? Text us: 737-371-9700

**Design system classes:**
- Section: `bg-brand-yellow py-16 md:py-24` (yellow bg)
- Container: `max-w-3xl mx-auto px-6 md:px-8 text-center`
- Title: `font-heading text-3xl md:text-5xl text-gray-900` (black text on yellow — per contrast rules)
- Subhead: `font-sans text-gray-900/80`
- Primary CTA: `<Button variant="primary" size="lg">Start a Group Order</Button>` — use brand-blue on yellow bg (inverted from normal)
- Secondary links: `text-gray-900/70 hover:text-gray-900 text-sm underline font-sans`
- Support line: `text-gray-900/60 text-sm font-sans`
- **Never** white text on yellow background

---

### Section 12: FOOTER

**Component:** Existing `Footer.tsx`

No changes needed.

---

## Sticky / Fixed Elements

### Mobile Sticky Bottom Bar
**Component:** Update `PremierHeroStickyCTA.tsx`

- **Primary:** Start Group Order (yellow)
- **Secondary:** Join with code

Keep existing behavior — visible on mobile only, fixed bottom.

### Cart Summary Bar
**Component:** Existing `CartSummaryBar.tsx`

Keep — shows when items in cart.

### Collections Sticky Bar
Keep existing IntersectionObserver behavior that makes the collections nav sticky when the shop section is in view.

---

## Post-Click Modals (Phase 2)

### A) Start Group Order Modal
Update existing `CreateGroupOrderModal.tsx` or `OrderTypeSelector.tsx`:

**Title:** Create your group

**Fields:**
- Group name (e.g., "Sarah's Bach Weekend")
- Date/time (optional but recommended)
- Delivery type selector: `[Boat]` `[House]` `[Both]` (default: Both)

**Primary button:** Create Group

**Microcopy:**
> You'll get a share link. Everyone pays separately.

### B) Group Created Success Screen
New component or modal state:

**Title:** Your group is live 🎉

**Show:**
- Copy invite link button
- Share code (large): CODE: ABC123
- Buttons: Invite friends / Start shopping (Boat Tab)

**Upsell block:**
> **Add a House Tab (recommended)**
> Most groups spend more at the house than on the boat.
> Spend $250+ on House Tab → FREE Welcome Package ($50 value).
> **[Add House Tab]**

### C) Join with Code
Existing `JoinOrderModal.tsx` — keep as-is or minor copy updates.

---

## Phase 1: Section-by-Section Implementation

Execute each section one at a time. After each section, verify it renders correctly before moving to the next.

### Step 1.0: Scaffold page.tsx
- [ ] Back up current page structure
- [ ] Create the new section order skeleton in `page.tsx` with placeholder comments
- [ ] Verify page still loads (even if sections are empty/commented)
- **File:** `src/app/partners/premier-party-cruises/page.tsx`

### Step 1.1: Hero (Section 1)
- [ ] Rewrite `PremierHero.tsx` with new layout and copy
- [ ] Use `<Button variant="cart">` for primary CTA, `<Button variant="secondary">` for secondary
- [ ] Add trust chips row
- [ ] Add tertiary links and microcopy
- [ ] Verify: hero renders, CTAs clickable, responsive on mobile
- **File:** `src/components/partners/PremierHero.tsx`

### Step 1.2: Every Order Includes (Section 2)
- [ ] Add new inline section in `page.tsx`
- [ ] Checklist with blue checkmarks, strikethrough values
- [ ] Footer line with `$75+ value` callout
- [ ] Small CTA button
- [ ] Verify: section visible, correct colors, readable text
- **File:** `src/app/partners/premier-party-cruises/page.tsx` (inline)

### Step 1.3: How It Works (Section 3)
- [ ] Add 3-step card layout in `page.tsx`
- [ ] Numbered circles in brand-blue
- [ ] Callout box with yellow left border
- [ ] Inline join module (input + button)
- [ ] Verify: cards responsive (3-col → stacked), join input functional
- **File:** `src/app/partners/premier-party-cruises/page.tsx` (inline)

### Step 1.4: Drink Calculator (Section 4)
- [ ] Move DrinkCalculator section above Shop section in page order
- [ ] Update wrapper title/subhead copy
- [ ] Add `id="drink-calculator"` scroll target
- [ ] Verify: calculator still works, scroll link from hero lands correctly
- **Files:** `src/app/partners/premier-party-cruises/page.tsx`

### Step 1.5: Shop Section (Section 5)
- [ ] Keep existing collections + grid + search components
- [ ] Update category pill styling to `rounded-lg` (not `rounded-full`)
- [ ] Ensure sticky bar has "Start Group Order" CTA
- [ ] Verify: products load, categories filter, sticky behavior works
- **File:** `src/app/partners/premier-party-cruises/page.tsx`

### Step 1.6: Experience Proof / Video (Section 7)
- [ ] Refactor existing video section into 2-column layout
- [ ] Left: YouTube embed, Right: condensed value stack + CTA
- [ ] Verify: video plays, responsive layout
- **File:** `src/app/partners/premier-party-cruises/page.tsx`

### Step 1.7: Reviews (Section 8)
- [ ] Refactor testimonials with outcome tags
- [ ] Add colored pills at top of each card
- [ ] Add mid-section CTA
- [ ] Verify: cards display, tags visible, CTA styled correctly
- **File:** `src/app/partners/premier-party-cruises/page.tsx`

### Step 1.8: FAQ (Section 9)
- [ ] Update FAQ questions for boat-specific content
- [ ] Pass new Q&A data to `PartnerFAQ` component
- [ ] Verify: accordion expands/collapses, questions readable
- **File:** `src/app/partners/premier-party-cruises/page.tsx`

### Step 1.9: About / Trust (Section 10)
- [ ] Update copy to shortened version
- [ ] Add proof bullets with yellow checkmarks on dark bg
- [ ] Verify: contrast correct (white/yellow text on `bg-gray-900`)
- **File:** `src/app/partners/premier-party-cruises/page.tsx`

### Step 1.10: Final CTA (Section 11)
- [ ] Update to yellow background with dark text
- [ ] Use `<Button variant="primary">` (brand-blue) on yellow bg
- [ ] Add secondary links and support line
- [ ] Verify: no white-on-yellow violations, CTA stands out
- **File:** `src/app/partners/premier-party-cruises/page.tsx`

### Step 1.11: Mobile Sticky CTA
- [ ] Update `PremierHeroStickyCTA.tsx` button labels
- [ ] Primary: "Start Group Order" (cart variant)
- [ ] Secondary: "Join with code"
- [ ] Verify: visible on mobile only, buttons functional
- **File:** `src/components/partners/PremierHeroStickyCTA.tsx`

### Step 1.12: Final Phase 1 Audit
- [ ] All sections render in correct order
- [ ] No `rounded-full` on any buttons
- [ ] No `tracking-[0.15em]` or wider
- [ ] No gold/yellow text on white backgrounds
- [ ] No white text on yellow backgrounds
- [ ] All headings use `font-heading` (Barlow Condensed)
- [ ] All body text uses `font-sans` (Inter)
- [ ] `<Button>` component used for all CTAs (not raw `<button>`)
- [ ] Mobile responsive — test at 375px and 768px breakpoints
- [ ] `npm run build` passes

---

## Phase 2: New Features

### Step 2.1: House Tab Upsell (Section 6)
- [ ] Create `src/components/partners/HouseTabUpsell.tsx`
- [ ] Dark bg section with value bullets + incentive + CTA
- [ ] Wire WelcomePackageGrid for thumbnail previews
- [ ] Add "Skip" link

### Step 2.2: FAQ House Section
- [ ] Add House FAQs column to FAQ section
- [ ] Two-column layout on desktop

### Step 2.3: Group Order Creation Modal
- [ ] Update modal with delivery type selector [Boat] [House] [Both]
- [ ] Default to "Both"

### Step 2.4: Group Created Success Screen
- [ ] Build success state with share code + invite link
- [ ] Add House Tab upsell block in success screen

### Step 2.5: Phase 2 Audit
- [ ] All new sections follow design system
- [ ] Modals accessible and responsive
- [ ] `npm run build` passes

---

## Phase 3: Polish + Bundles

### Step 3.1: Starter Bundles
- [ ] Design bundle cards (once Shopify products ready)
- [ ] "Add bundle" adds multiple items to cart

### Step 3.2: Animations
- [ ] Hover lift on cards (`hover:-translate-y-1 transition-transform`)
- [ ] Animated check icons (framer-motion)
- [ ] Progress indicators for steps

### Step 3.3: Final Audit
- [ ] Full design system compliance check
- [ ] Performance audit (Lighthouse)
- [ ] Mobile UX testing at 320px, 375px, 390px, 428px
- [ ] No horizontal scroll at any breakpoint

---

## Files Unchanged (Across All Phases)
- `DrinkCalculator.tsx` — internals untouched, just re-positioned
- `QuickOrderGrid.tsx` — keep as-is
- `QuickOrderSearch.tsx` — keep as-is
- `CartSummaryBar.tsx` — keep as-is
- `Footer.tsx` — keep as-is
