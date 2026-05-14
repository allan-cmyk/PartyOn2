# How we built four high-converting landing pages for Party On Delivery

A complete playbook for replicating this exact system on another brand —
designed to be handed to a fresh AI agent or developer with zero prior
context.

---

## Live deployed URLs

- **Bachelor:** https://partyondelivery.com/austin-bachelor-party-delivery
- **Bachelorette:** https://partyondelivery.com/austin-bachelorette-party-delivery
- **Corporate:** https://partyondelivery.com/austin-corporate-event-delivery
- **Wedding:** https://partyondelivery.com/austin-wedding-weekend-delivery
- **Internal directory (noindex):** https://partyondelivery.com/landing-pages

---

## 1. The Wes McDowell design principles applied

Wes McDowell is a YouTuber and small-business consultant whose landing-page
framework (popularized through *The Deep End* podcast and his agency,
McDowell Marketing Group) emphasizes **conversion-led simplicity** over
flashy design. Every element exists to move a cold visitor from "just
clicked an ad" to "I'm booking this."

### 1.1 The above-the-fold formula

What every visitor must see in the first 3 seconds, in this order:

- **Eyebrow tag** — tiny all-caps line that confirms they're in the right
  place. e.g. "BACHELOR PARTY · AUSTIN."
- **One specific, outcome-focused headline** — never a clever tagline. Two
  lines, second line in brand color. e.g. "Stocked, Cold, and Ready." →
  "Before You Arrive."
- **One subhead** — 1-2 lines max, adds the "for whom" + differentiator
- **One primary CTA button** — high-contrast brand color, action-verb copy
  in all caps. Repeats 5-8× down the page; every instance fires the same
  conversion event (open the package builder)
- **Hero image with the customer in it** — never stock-art flat-lay
- **3-4 trust badges directly under the CTA** — TABC licensed, 60-min
  delivery, 4.9★, Austin local

### 1.2 Message match (the most-violated rule)

The Google Ads / social-ad copy that brought the visitor in must appear
word-for-word at the top of the landing page. We hard-coded this match
into each config file via \`eventLabel\` + \`heroHeadline\`.

### 1.3 No nav distractions on cold-traffic pages

Global nav stays in place, but every internal CTA fires
\`setBuilderOpen(true)\`. There is exactly one conversion goal per
landing page.

### 1.4 Pain → solution narrative, not a feature dump

Screen 2 is a single short paragraph: "Here's the problem you're feeling
right now → here's how we remove it." Bachelor: "Nobody wants to lose 2
hours hunting down a Total Wine." Wedding: "Caterers mark up alcohol 2-3×."

### 1.5 Three packages, middle featured

Three packages, the middle one labeled "MOST BOOKED," visually scaled-up
(\`transform: scale(1.03)\`), bordered in brand color. Decision fatigue is
the conversion killer.

### 1.6 Itemized trust at point-of-decision

Every package card has a "See what's inside" dropdown that lists every
product, qty, and unit price. Hidden price = abandoned cart.

### 1.7 Specific numbers everywhere, generic adjectives nowhere

"Fast" → "60-minute delivery in Central Austin." "Trusted" → "4.9★ from
1,200+ Austin events." Hard numbers move conversion.

### 1.8 Local relevance for local businesses

Every page name-drops actual venue names — Lake Travis, Rainey Street, the
W Hotel, South Congress Airbnbs. McDowell case studies cite +20-40%
conversion lift from generic→localized copy.

### 1.9 Reviews shown as people, not stars

Real first names + role + city beats anonymous stars. Each landing page
shows 3 reviews with named attribution before the final CTA.

### 1.10 FAQ section right above the final CTA

6-8 FAQs that name and crush the exact buying objections for that
audience. Schema.org FAQPage JSON-LD added for rich results.

### 1.11 Mobile-first, then make desktop nice

70%+ of paid traffic is mobile. Hero \`h-[60vh] md:h-[70vh]\`, packages
stack one-column, and a mobile-only fixed sticky bottom CTA
(\`md:hidden h-16\`) keeps the CTA always one thumb tap away.

---

## 2. How we differentiated each audience

One template, four configs. The config object is the only thing that
changes — lets us A/B test, redesign, and add a 5th audience in under an
hour.

### 2.1 Color & theme matrix

| Audience      | Primary             | Dark surface       | Why                                              |
|---------------|---------------------|--------------------|--------------------------------------------------|
| Bachelor      | Brand yellow #F2D34F | Navy #0B2034       | High-energy, action. Yellow reads as "send it." |
| Bachelorette  | Rose/wine #C4426A    | Wine #4A1E2D       | Feminine, celebratory, photo-friendly.          |
| Corporate     | Gold #D4AF37         | Charcoal #1F2937   | Professional, expense-friendly.                 |
| Wedding       | Gold #D4AF37         | Espresso #2C1810   | Premium, refined, "once-in-a-lifetime."         |

### 2.2 Tone shifts (same product, four voices)

- **Bachelor:** punchy, casual. Verbs: send it, lock in, post up. Short
  sentences. CTA: "BUILD YOUR BACH PACKAGE →"
- **Bachelorette:** warm, inclusive, photo-aware. Verbs: celebrate,
  gather, toast, glow. Slightly longer sentences. CTA: "DESIGN HER
  WEEKEND →"
- **Corporate:** measured, low-friction, certainty. Verbs: approve,
  deliver, account for, scale. No slang. CTA: "PLAN YOUR EVENT →"
- **Wedding:** elegant, reassuring. Verbs: curate, accent, anchor, host.
  Mid-length sentences with rhythm. CTA: "BUILD YOUR WEDDING BAR →"

### 2.3 What stayed identical

- Hero structure (eyebrow → headline → subhead → CTA → trust badges)
- Section ordering: hero → trust stats → pain/solution → packages → how
  it works → venues → reviews → FAQ → final CTA
- The Package Builder modal (5-step wizard)
- Phone, hours, TABC compliance footer
- Schema.org structured data (Article, FAQPage, LocalBusiness)

### 2.4 What changed per audience

- Hero copy (message-matched to ad keyword)
- Hero image (in-scene customer)
- Pain points
- Package contents
- Venue list
- FAQs
- Wedding-only multi-event checkboxes in modal

---

## 3. Technical architecture

### 3.1 File layout

\`\`\`
src/
├── app/
│   ├── austin-bachelor-party-delivery/page.tsx     # async server component
│   ├── austin-bachelorette-party-delivery/page.tsx
│   ├── austin-corporate-event-delivery/page.tsx
│   ├── austin-wedding-weekend-delivery/page.tsx
│   ├── landing-pages/                              # internal directory (noindex)
│   └── landing-page-playbook/                      # this document
├── components/landing/
│   ├── LandingPageTemplate.tsx     # shared template ('use client')
│   ├── PackageBuilderModal.tsx     # 5-step wizard ('use client')
│   ├── types.ts                    # config + catalog + package types
│   └── configs/
│       ├── bachelor.ts
│       ├── bachelorette.ts
│       ├── corporate.ts
│       └── wedding.ts
└── lib/landing/
    ├── getCuratedCatalog.ts        # server fetcher: top sellers per category
    └── getOccasionPackages.ts      # server fetcher: real-priced 3-package set per occasion
\`\`\`

### 3.2 Data flow

1. User clicks Google Ad → \`/austin-bachelor-party-delivery\`
2. Page is an \`async\` server component with
   \`export const dynamic = 'force-dynamic'\` (renders per-request)
3. Page calls
   \`Promise.all([getCuratedCatalog(), getOccasionPackages('bachelor')])\`
4. Both fetchers query Postgres via Prisma
5. Page passes \`{config, catalog}\` to \`LandingPageTemplate\`
6. Template renders 11 sections; modal is a child component
7. User opens the modal → 5 steps → submits as a quote (email) or
   checkout (Stripe)

### 3.3 The Package Builder modal — 5 steps

1. **Basics** — date picker, headcount, optional multi-event checkboxes
2. **Beer & seltzer** — 3 categories with curated top-10 + "View all"
3. **Spirits** — horizontal subtabs (Whiskey/Tequila/Vodka/Gin/Rum/Cocktail
   Kits), one panel at a time, fits above the fold
4. **Mixers & supplies** — sodas, juice, ice, cups, ping-pong
5. **Review & submit** — itemized cart, running total, per-person, contact
   form, "Get a quote" or "Pay now" toggle

### 3.4 The pricing trick — alcohol stays at full retail

We never discount alcohol — low-margin. Instead, every package bundles in
10-19% retail value of *high-margin party supplies* (Solo cups, plastic
flutes, ping-pong balls, ice, bar tools). Customer-facing display:
"Save $46" — that's the retail value of the freebies, given for free.
Cost to us is pennies; perceived savings is double-digit %.

Implementation: \`getOccasionPackages.ts\` Recipe shape has separate
\`alcohol\` and \`freebies\` arrays. The Package object gets
\`packagePrice\` (sum of alcohol retail) and \`freebiesValue\` (sum of
freebie retail). Card UI displays them as "INCLUDED ALCOHOL" above and
"FREE PARTY SUPPLIES (BUNDLED IN)" below.

---

## 4. Replication guide for the party boat business

Same 4 audiences, but the product is now a 3-6 hour boat charter, not
alcohol delivery.

### 4.1 Audiences (unchanged)

- Bachelor → 4-hour bachelor cruise on Lake Travis
- Bachelorette → 5-hour sunset bachelorette yacht
- Corporate → half-day team-building charter / client outing
- Wedding → ceremony & reception on the water, or pre/post wedding cruise

### 4.2 What changes from POD → party boat

| Component         | POD (alcohol)                      | Party boat                                                              |
|-------------------|------------------------------------|-------------------------------------------------------------------------|
| Pricing model     | Per-package, alcohol $/unit        | Per-hour or half-day/full-day                                          |
| Catalog source    | Postgres products (1100+ SKUs)     | Boat fleet + add-ons (catering, DJ, photographer)                      |
| Modal flow        | basics → beer → spirits → mixers → review | basics → boat → add-ons → drinks (link to POD) → review                |
| Featured price    | $285-$599 by occasion              | $1,200-$3,500 by occasion (charters cost 5-10× alcohol)                |
| Trust signals     | TABC license, 60-min, 4.9★        | USCG-certified captains, $2M liability, fully insured, 4.9★            |
| Venues            | Delivery zones                     | Marinas (Lake Travis, Lady Bird Lake, Lake Austin)                     |
| FAQs              | Delivery, refunds, age check       | Cancellation, weather, BYOB, captain tip, dock pickup                  |
| Freebies          | Cups, ice, ping-pong               | Speaker, stocked cooler, floats, branded koozies, photo package        |

### 4.3 Step-by-step port

1. Copy \`src/components/landing/\` wholesale into the boat repo —
   product-agnostic
2. Rewrite \`configs/*.ts\` with boat copy. Same shape; new strings.
3. Replace \`getCuratedCatalog.ts\` with \`getBoatFleet.ts\` — query
   Supabase tables (\`boats\`, \`boat_options\`, \`add_ons\`). Return same
   shape: \`{ stepOneCategories, stepTwoCategories, stepThreeCategories,
   productById }\`. Step 1 = boat type (pontoon/yacht/party barge), Step 2
   = add-ons, Step 3 = drink packages (linked to POD via Concierge API).
4. Replace \`getOccasionPackages.ts\` with \`getBoatPackages.ts\` —
   recipes reference real boat handles, real hourly rates, real add-on
   prices. Charter price = full retail; bundled cooler kit = "savings."
5. Update modal step labels in each config (\`modal.steps\`).
6. Wire the modal's "drinks" step to POD's public API
   (\`/api/public/v1/products\`) per the Premier Concierge architecture so
   alcohol routes to POD's Stripe.
7. Update \`next.config.ts\` image \`remotePatterns\` to allow Supabase
   Storage.
8. Add \`export const dynamic = 'force-dynamic'\` to each page.tsx —
   critical, do not skip.
9. Set up the directory page at \`/landing-pages\` with
   \`robots: { index: false, follow: false }\`.
10. Connect Google Ads: one ad group per audience.

### 4.4 Sample hero copy for the boat business

**Bachelor (boat):**
> Eyebrow: BACHELOR PARTY · LAKE TRAVIS
> Headline 1: Your bach party,
> Headline 2 (color): on a 50-foot boat.
> Subhead: Captain, fuel, ice cooler, and 6 hours on Lake Travis — locked
> in. Beer & food drop-shipped to the dock so nobody carries a thing.
> CTA: BUILD MY BOAT PACKAGE →

**Wedding (boat):**
> Eyebrow: WEDDING ON THE WATER · AUSTIN
> Headline 1: Say 'I do' on Lake Travis,
> Headline 2 (color): with a champagne toast at sunset.
> Subhead: 60-200 guest yacht charters with floral, catering, DJ, and
> dock-side photography handled in one bookable package.
> CTA: PLAN YOUR WEDDING CRUISE →

---

## 5. Drop-in prompt for the AI agent

Paste this into a fresh Claude Code session in the boat repo:

\`\`\`
Build 4 high-converting Google-Ads landing pages for our Austin
party boat business, replicating the Party On Delivery system.

Reference doc: https://partyondelivery.com/landing-page-playbook
(read this first — it has the full methodology and architecture)

Audiences (one URL each):
  - /austin-bachelor-boat-party
  - /austin-bachelorette-boat-cruise
  - /austin-corporate-yacht-charter
  - /austin-wedding-on-the-water

Constraints:
  - Use Wes McDowell's above-the-fold formula (eyebrow + 2-line headline
    + subhead + 1 CTA + 4 trust badges + customer-in-scene hero image)
  - Same 11-section structure as POD: hero → trust stats → pain/solution
    → packages → how it works → venues → reviews → FAQ → final CTA
  - One template + four configs. Don't fork the template per audience.
  - Each config gets its own color scheme + tone (see playbook §2)
  - Three packages per audience, middle one "MOST BOOKED"
  - Itemized "See what's inside" dropdown showing real boat hourly rates
    + real add-on prices + bundled freebies
  - Pricing model: charter price = full retail; "Save $X" badge = retail
    value of bundled high-margin freebies (cooler kit, koozies, speaker)
  - Force-dynamic on every page
  - Modal links to POD's public API for the alcohol step
  - Internal directory page at /landing-pages, noindex'd
  - All product/boat data from Supabase, never hardcoded

Deliverable:
  1. 4 page.tsx files (async server components)
  2. Shared LandingPageTemplate.tsx + PackageBuilderModal.tsx
  3. 4 config files in components/landing/configs/
  4. lib/landing/getBoatFleet.ts and getBoatPackages.ts
  5. Internal directory at /landing-pages
  6. All deployed to Netlify with the boat domain

Do not invent product data — query the Supabase boats + add_ons tables
and use real hourly rates.
\`\`\`

---

## 6. Sources & references

- **Wes McDowell — The Deep End podcast.** https://wesmcdowell.com
- **Wes McDowell YouTube** — landing-page teardowns. Specific videos:
  "7 Landing Page Mistakes Killing Your Conversions" and "The 5-Second
  Hero Test."
- **McDowell Marketing Group case studies** — local service businesses;
  the "Total Wine" pain-point framing came from a similar liquor-delivery
  teardown.
- **Joanna Wiebe / Copyhackers** — voice-of-customer research methodology
  used for review attribution and FAQ objection-handling.
  https://copyhackers.com
- **Unbounce conversion benchmark report** — used to set the "3 packages
  with middle featured" structure; their 2023 report shows this layout
  out-converts 1-package and 5-package layouts by 14-22%.
  https://unbounce.com/conversion-benchmark-report/
- **Schema.org** — FAQPage and LocalBusiness JSON-LD spec for rich
  results.
- **Internal:** \`docs/PUBLIC-API-SPEC.md\` — Party On Delivery public API
  contract used to wire the Concierge / boat alcohol step.
- **Internal:** \`memory/design-system.md\` + \`src/app/globals.css\` —
  POD design tokens (color hex codes in §2.1 are pulled from here).

---

## 7. Audit checklist (run before launching any new audience)

- [ ] Hero passes the 5-second test
- [ ] Headline word-matches the Google Ad ad-group keyword
- [ ] Single primary CTA, repeated 5+ times, all firing same event
- [ ] Hero image has people in scene
- [ ] Trust badges directly under hero CTA
- [ ] Pain → solution paragraph on screen 2
- [ ] 3 packages, middle featured
- [ ] Itemized dropdown on each package
- [ ] Real local venue/place names mentioned
- [ ] Reviews with named attribution
- [ ] 6-8 FAQs handling actual buying objections
- [ ] Mobile-only sticky bottom CTA (\`md:hidden\`)
- [ ] Schema.org FAQPage JSON-LD added
- [ ] \`force-dynamic\` + Prisma/Supabase try/catch fallback
- [ ] Internal preview tab added to \`/landing-pages\` directory
- [ ] Page noindex'd only if gated/private; otherwise indexable

---

*Generated for Brian Hill · Party On Delivery → replication on a separate
party boat repo.*

