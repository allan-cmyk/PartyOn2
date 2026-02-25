# PartyOn Delivery - Claude Code Rules

## Project Overview
Premium alcohol delivery service in Austin, TX. Next.js 15.4 + TypeScript + Tailwind CSS 3 + Prisma 6 (Neon Postgres). Deployed on Vercel.

- **Domain**: partyondelivery.com
- **Database**: Neon Postgres via Prisma (`prisma/schema.prisma`)
- **Payments**: Stripe (live keys — do NOT test with real cards)
- **Email**: Resend (`info@partyondelivery.com`)
- **SMS**: GoHighLevel webhook (`src/lib/webhooks/ghl.ts`)
- **Path alias**: `@/*` maps to `./src/*`
- **Shopify**: Admin API only — used for product sync and webhooks, NOT for storefront/checkout

### Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (Turbopack, port 3000) |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run lint` | ESLint |
| `npm run test` / `test:run` | Vitest |
| `npm run db:push` | Push schema to Neon (needs `.env.local` sourced) |
| `npm run db:studio` | Prisma Studio |
| `npm run generate-blog` | AI blog generation (Claude via OpenRouter) |
| `npm run deploy` | Deploy to Vercel + ping sitemaps |

---

## DESIGN SYSTEM — MANDATORY

**Before creating or modifying ANY page/component, read these files:**
1. `memory/design-system.md` — Full token reference (colors, typography, buttons, inputs, cards, modals, spacing)
2. `src/app/globals.css` — All CSS utility classes
3. `src/app/design-example/page.tsx` — Live interactive showcase at `/design-example`

**Use existing design system classes. Do NOT create ad-hoc styles that duplicate what already exists.**

### Colors (3 brand colors only)
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-blue` | #0B74B8 | Primary CTAs, focus rings, links |
| `brand-yellow` | #F2D34F | Cart/add buttons, highlights, accents |
| `gold` | #D4AF37 | Premium accent — **dark backgrounds ONLY** |

### Typography
- **Headings**: `font-heading` (Barlow Condensed) with `tracking-[0.1em]`
- **Body**: Inter (default `font-sans`)
- **Buttons**: `font-semibold tracking-[0.08em]`
- H1: `text-4xl md:text-5xl lg:text-6xl`, H2: `text-3xl md:text-4xl`, H3: `text-2xl`, H4: `text-lg font-bold tracking-[0.08em]`

### Minimum Text Sizes — NEVER violate
| Context | Minimum | Forbidden |
|---------|---------|-----------|
| All user-readable content | `text-sm` (14px) | `text-xs` for body text |
| Form labels, input text | `text-base` (16px) | anything smaller |
| Badges/tags (only exception) | `text-xs` (12px) | `text-[10px]` or smaller |

### Button Classes (use these, don't reinvent)
- `.btn-primary` — `bg-brand-blue text-white` (main CTAs)
- `.btn-cart` — `bg-brand-yellow text-gray-900` (add to cart, purchase actions)
- `.btn-secondary` — outlined `bg-white text-brand-blue border-2 border-brand-blue`
- `.btn-ghost` — minimal `text-gray-700 text-sm`
- **ALL buttons**: `rounded-lg` — NEVER `rounded-full`

### Other Design System Classes (use these)
- `.input-premium` — form inputs (includes focus states, hover, placeholder styling)
- `.card` — `bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md`
- `.container-custom` — `container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl`
- `.section-padding` — `py-8 md:py-12 lg:py-16`
- `.hero-overlay` — gradient overlay for hero images

### Color Contrast Rules — MANDATORY

| Background | Allowed Text | FORBIDDEN Text |
|------------|-------------|----------------|
| White / light (`bg-white`, `bg-gray-50`) | `text-gray-900`, `text-gray-700` | yellow, gold, white |
| Yellow / gold (`bg-gold-*`, `bg-yellow-*`) | `text-gray-900` (black) | white, light colors |
| Black / dark (`bg-gray-900`, `bg-black`) | `text-white`, `text-gold-400` | black, dark gray |

**Quick rule**: Gold/yellow accent text is ONLY allowed on dark backgrounds. Gold buttons always get black text.

---

## HERO SECTIONS — #1 RECURRING BUG SOURCE

### The Rule
Nav is fixed, `h-24` (96px), `z-50`. ALL hero sections must account for it.

**Use `mt-24` to push below nav. NEVER combine `h-[100vh]` with `pt-32`.**

### Correct Patterns

**Standard full-bleed hero** (most pages):
```tsx
<section className="relative h-[50vh] md:h-[60vh] mt-24 flex items-center justify-center overflow-hidden">
  <Image src="..." alt="..." fill className="object-cover" priority />
  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/30 to-gray-900/50" />
  <div className="relative text-center text-white z-10 max-w-4xl mx-auto px-8">
    {/* Hero content */}
  </div>
</section>
```

**Tall hero** (homepage, landing pages): Same pattern but `h-[70vh] md:h-[80vh] mt-24`

**Content page** (no hero image — terms, privacy, FAQs): `pt-32 pb-16 px-8` (128px = 96px nav + 32px breathing room)

### Page Height Reference
| Page | Height |
|------|--------|
| Homepage | `h-[70vh] md:h-[80vh] mt-24` |
| Service pages (weddings, boat, bach) | `h-[60vh] md:h-[70vh] mt-24` |
| About, Contact | `h-[50vh] md:h-[60vh] mt-24` |
| Products | `h-[40vh] md:h-[50vh] mt-24` |
| Order | `h-[35vh] md:h-[40vh] mt-24` |
| Terms, Privacy, Blog | `pt-32` (no hero) |

### FORBIDDEN — never do these
- `h-[100vh] pt-32` — double-spacing bug, content overflows
- `h-screen` without adjustment — goes behind fixed nav
- Mobile-specific margin hacks (`mt-[120px] md:mt-0`) — fix the parent section instead
- `pt-24` alone — no breathing room below nav

---

## Navbar Background Rules

Nav defaults to OPAQUE (white bg, dark text). Only routes in `NAV_TRANSPARENT_ROUTES` (in Navigation.tsx) get transparent nav.

- Page WITH dark bg extending behind nav (no `mt-24`) → Add route to `NAV_TRANSPARENT_ROUTES`
- Page with `mt-24` hero or light bg → Do nothing, opaque nav is automatic

---

## Technical Architecture

### Key Directories
```
src/
├── app/                       # Next.js App Router pages + API routes
│   ├── api/v1/                # Primary API (auth, products, orders, cart, inventory, admin)
│   ├── api/v2/group-orders/   # GroupOrderV2 API (universal dashboard)
│   ├── api/webhooks/          # Stripe, Shopify, Resend webhooks
│   ├── dashboard/[code]/      # Universal Order Dashboard (main order flow)
│   ├── ops/                   # Internal operations panel
│   ├── admin/                 # Admin panel (affiliates, reports, experiments)
│   └── affiliate/             # Affiliate program pages
├── components/
│   ├── dashboard/             # Order Dashboard components (19 files)
│   ├── ops/                   # Operations admin components
│   ├── ui/                    # Reusable UI primitives
│   ├── drink-planner/         # Drink recommendation quiz
│   └── products/              # Product display components
├── lib/
│   ├── stripe/                # Stripe checkout, webhooks, payments
│   ├── inventory/services/    # Order creation, inventory, product services
│   ├── group-orders-v2/       # GroupOrderV2 service, validation, API client
│   ├── draft-orders/          # Draft order (invoice) service
│   ├── affiliates/            # Affiliate service, commission engine, payouts
│   ├── email/templates/       # Resend email templates (invoice, confirmation, etc.)
│   ├── products/              # Product transform, categories
│   ├── shopify/               # Shopify Admin API (sync only — NOT storefront)
│   ├── auth/                  # JWT auth, ops session
│   ├── delivery/              # Delivery fee rates
│   ├── tax/                   # Sales tax calculator
│   └── database/client.ts     # Prisma client singleton
├── contexts/                  # CartContext, CustomerContext, GroupOrderContext
└── styles/                    # animations.css, mobile.css
```

### Data Flow
- **Products**: Synced from Shopify Admin API → Neon Postgres (via `src/lib/sync/`). Served from DB.
- **Orders**: Created via Stripe checkout webhook → `order-service.ts` → Postgres
- **Draft Orders / Invoices**: Created in admin (`/ops/orders/create`) → customer pays via `/invoice/[token]` → Stripe
- **Cart**: React Context + localStorage persistence
- **Auth**: JWT tokens (`jose`) for customer + ops sessions; affiliate uses magic links

### Middleware (`src/middleware.ts`)
- Canonical domain enforcement (www → non-www 301)
- Affiliate attribution via `?ref=` query param (sets 30-day `ref_code` cookie)
- Partner page attribution (`/partners/[code]`)
- Affiliate dashboard auth check (redirects to `/affiliate/login`)

### Key Database Models (Prisma)
| Model | Purpose |
|-------|---------|
| `Product` / `ProductVariant` | Product catalog with variants, pricing, inventory |
| `Order` / `OrderItem` | Completed orders |
| `DraftOrder` / `DraftOrderItem` | Invoices before payment |
| `GroupOrderV2` / `SubOrder` / `DraftCartItem` | Universal dashboard orders |
| `Affiliate` / `AffiliateCommission` / `AffiliatePayout` | Affiliate program |
| `Customer` | Customer accounts |
| `Discount` | Promo codes and discounts |
| `InventoryLevel` / `InventoryNote` | Stock tracking |
| `BlogPost` | Blog content |

---

## Blog System

MDX-based blog stored in `content/blog/posts/` (134 posts). NOT database-backed.

- **Generation**: `npm run generate-blog` — Claude 3 Haiku via OpenRouter API
- **Cron route**: `GET /api/cron/generate-blog` — Claude 3.5 Sonnet via OpenRouter (requires `CRON_SECRET`)
- **Topics**: `scripts/topics.json` — all 107 topics currently published
- **Legacy posts**: Shopify-migrated posts in `src/data/blog-posts/posts.json` (merged at serve time)
- **Rendering**: `MDXContentRSC` component, gray-matter for frontmatter parsing
- **Images**: Optional AI generation via local `image-generator-tool` (saved as WebP to `/public/images/blog/`)
- **SEO**: Schema.org JSON-LD (Article + FAQPage + LocalBusiness), topical clustering via `pillarSlug`
- **Automation**: GitHub Actions daily at 9 AM EST, commits to `dev`, creates PR to `main`

---

## Code Standards

- Files < 500 lines, components < 200 lines, functions < 50 lines
- No `any` type — use proper TypeScript types
- Use `ReactElement` not `JSX.Element`
- Zod validation for all external data
- JSDoc on all exports
- Images from `/public/images/` (existing assets)
- Cart persists in localStorage
- All icons are SVG — no emojis in UI

---

## Special Business Rules

- **Age verification**: Required modal for alcohol purchases
- **Delivery zones**: Austin area only (zip code validation)
- **Order minimums**: $100-150 depending on zone
- **Meta Pixel**: Tracks PageView, AddToCart, ViewContent, Purchase events (`NEXT_PUBLIC_META_PIXEL_ID`)
- **Google Analytics**: GA4 event tracking (`src/lib/analytics/`)
- **Affiliate program**: Intake, approval, attribution, commission tracking, payout generation
- **Draft orders**: Admin creates invoice → customer receives link → pays via Stripe → order created via webhook
