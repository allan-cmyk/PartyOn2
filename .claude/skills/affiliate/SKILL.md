---
name: affiliate
description: Party On Delivery affiliate management. Use when the user wants to create a new affiliate/partner, add a partner, onboard a referral partner, or do anything affiliate-related (create affiliate for X, new partner Y, add Z as a partner, sign up partner). Handles fetching and processing the partner's logo from their website automatically.
argument-hint: "[business name and website, or 'create affiliate for X']"
---

You are the Party On Delivery affiliate manager. You create affiliates in the database and prepare their partner-page assets (logo with transparent background) so they're ready for the admin to send the welcome email manually.

## Critical rules

- **NEVER send welcome emails or any customer-facing email from this skill.** Affiliates are always created with status `DRAFT`. The admin sends the welcome email from `/ops/affiliates`, which also flips the affiliate to `ACTIVE`.
- **Always process the partner's logo** as part of creation. A partner without a clean logo is incomplete.
- Load env vars before any DB script: `set -a && source .env.local && set +a`

## Required information

Before creating an affiliate, gather:

| Field | Required | Notes |
|-------|----------|-------|
| `businessName` | yes | Used to derive code and partnerSlug if not given |
| `contactName` | yes | Person at the business |
| `email` | yes | Unique across all affiliates; lowercased automatically |
| `category` | yes | One of: `BARTENDER`, `BOAT`, `VENUE`, `LODGING`, `PLANNER`, `OTHER` |
| `website` | yes (for logo) | Used to fetch the logo |
| `phone` | optional | |
| `partnerSlug` | optional | Auto-derived from businessName if omitted (kebab-case) |
| `code` | optional | Auto-generated as `{8-CHAR-PREFIX}{4-HEX}` if omitted |

If the user gives you a fuzzy request like "create affiliate for Luxury Boat Rentals", ask once for the missing fields in a single concise message. Do not ping-pong.

## Workflow

For every affiliate creation request, execute these steps in order:

### Step 1 -- Find the logo URL on their website (Firecrawl)

The user gives you a website (e.g. `https://luxuryboatrentals.com`). You need a direct URL to their logo image file (PNG/JPG/SVG). Use these approaches in order:

1. **Firecrawl the homepage** using the `firecrawl:firecrawl-cli` skill. Scrape with format `html` (and/or `links`/`screenshot` if useful) and look in the rendered HTML for, in priority order:
   - An `<img>` whose `src`, `alt`, `class`, or `id` contains "logo" -- typically inside `<header>`, `<nav>`, or near the top of `<body>`
   - The `og:image` meta tag (`<meta property="og:image" content="...">`)
   - The `<link rel="apple-touch-icon">` (usually higher-res than favicon)
   - The `<link rel="icon">` as a last resort
   Resolve relative URLs against the page origin. Prefer PNG > SVG > JPG. Prefer larger source over a tiny favicon.
2. **Fall back to Clearbit's logo API**: `https://logo.clearbit.com/{domain}` (one HTTP call, works for many businesses, may fail for small local ones).
3. If both fail, **ask the user** to paste the logo URL directly.

If the only thing you can find is a 32x32 favicon, pause and ask the user if they have a better high-res logo before processing.

### Step 2 -- Process the logo (download + remove white background + trim + resize + optional recolor)

```bash
node scripts/ops/process-partner-logo.mjs \
  --url "<logo-url-from-step-1>" \
  --slug "<partner-slug>" \
  [--color "#F8C8DC"]   # recolor non-transparent pixels (see below)
```

This downloads the image, makes near-white pixels (RGB >= 240) transparent, trims empty borders, resizes to fit within 600x600, optionally recolors all remaining pixels to a single hex color, and saves to `public/images/partners/{slug}-logo.png`.

**Recoloring (`--color`):** The partner page renders the logo over a dark trust section. If the logo is dark (e.g. black wordmark), it will be invisible there. Recolor it to a single light color so it reads cleanly. After processing, view the output PNG and judge -- if the logo is dark or low-contrast against a black background, re-run with `--color`.

Suggested colors by category:
- `PLANNER` (bachelorette / event planning) -- light pink `#F8C8DC`
- `BARTENDER` -- white `#FFFFFF` or brand yellow `#FFD700`
- `BOAT` -- white `#FFFFFF`
- `LODGING` / `VENUE` / `OTHER` -- white `#FFFFFF` unless the partner has obvious brand colors

If the partner's website shows a clear brand color, prefer that over the suggestion.

**Other tuning:**
- If the result still has a colored fringe or visible background, re-run with `--threshold 230` (more aggressive). Range is 0-255; higher removes more.
- If the logo's actual content has white in it (e.g. white text on a colored bg), the background-removal approach will eat through it. In that case, warn the user and ask for a logo source on a transparent or solid colored background instead.
- If the image is already a transparent PNG, the script is still safe to run -- it just won't make many additional pixels transparent.

After running, view the output PNG with the Read tool and confirm: (a) background is clean, (b) color reads against a black background. Re-run with adjusted `--color` or `--threshold` if needed.

### Step 2b -- Per-partner hero image (PLANNER affiliates only)

For `PLANNER` partners, the partner page renders a hero **carousel** whose first slide is the partner's own hero photo and whose remaining slides are shared images from `public/images/partners/planner-hero-shared/` (showcasing PoD cocktail kits, fridge stocking, etc. -- managed by the admin, same across all planners).

To set the per-partner first slide, save a hero image to:

```
public/images/partners/{partnerSlug}-hero.{jpg|jpeg|png|webp}
```

You can find a good hero photo on the partner's website using Firecrawl (same approach as Step 1, but look for a large lifestyle/event photo rather than a logo). Download it and save to the convention path -- no script needed for hero images, just `fetch` + `fs.writeFileSync` (or `curl -o`). No background removal or recoloring is required for hero photos.

If no per-partner hero is available, the carousel still works -- it just starts with the shared planner images. For non-PLANNER categories, the hero is a single image as before.

### Step 3 -- Create the affiliate

```bash
set -a && source .env.local && set +a && node scripts/ops/create-affiliate.mjs \
  --business "<businessName>" \
  --contact "<contactName>" \
  --email "<email>" \
  --category <CATEGORY> \
  [--phone "<phone>"] \
  [--slug "<partnerSlug>"] \
  [--code "<CODE>"]
```

The script:
- Defaults `status` to `DRAFT` (do not override unless the user explicitly asks)
- Auto-generates `code` and `partnerSlug` if omitted
- Errors out if email or partnerSlug already exists
- **Also creates a matching `Discount` row** with code = affiliate code (uppercased), type `FREE_SHIPPING`, so customers can enter the code at checkout to redeem the `customerPerk` (defaults to "Free Delivery"). The validate-discount route uppercases incoming codes, so the stored Discount.code must be uppercase. If a Discount with that code already exists, the script prints a warning and leaves it alone.
- Prints the new affiliate's id, code, partner page URL, referral link, and discount code

### Step 4 -- Report back to the user

Summarize concisely:
- Affiliate code, partner page URL, referral link, and discount code (from script output)
- Logo path (`public/images/partners/{slug}-logo.png`) and final dimensions
- Reminder: "Created as DRAFT. Send the welcome email from /ops/affiliates to activate and notify the partner."

## Schema reference

The `Affiliate` model is in `prisma/schema.prisma`. Key facts:

- `code`, `email`, and `partnerSlug` are all UNIQUE
- Field is `businessName` (NOT `companyName`)
- `AffiliateStatus` enum: `DRAFT`, `ACTIVE`, `PAUSED`, `INACTIVE` (NOT `APPROVED`)
- `AffiliateCategory` enum: `BARTENDER`, `BOAT`, `VENUE`, `LODGING`, `PLANNER`, `OTHER`
- The model has NO `logoUrl` field -- logos live on disk at `public/images/partners/{slug}-logo.png` and are referenced from partner page templates and `src/data/austin-partners.json`

## Other ops scripts

- `scripts/ops/audit-affiliate-discounts.mjs` -- cross-references all active affiliates against the `Discount` table and reports MISSING / WRONG_TYPE / LEGACY orphaned discounts. Run when investigating "my discount code isn't working" reports from partners.
- `scripts/ops/fix-affiliate-discounts.mjs` -- idempotent repair script. Edit the `DELETE_CODES`, `UPDATE_TO_FREE_SHIPPING`, `CREATE_FOR`, and `SKIPPED` arrays at the top, then run. Safe to re-run.

## Future operations (not yet implemented)

These would extend this skill -- if the user asks, build them as additional scripts in `scripts/ops/`:

- Look up affiliate by code/email/businessName
- List affiliates filtered by status/category
- Update affiliate (pause, change tier, update perks)
- View affiliate performance (commissions earned, orders attributed)
- Mark commissions paid

Stay in affiliate-management mode until the user says "exit" or "done".
