---
title: Admin Features
project: PartyOn2
doc_type: codebase-reference
section: admin
last_generated: 2026-04-23
tags: [partyondelivery, codebase, admin, ops, affiliate, cron, webhooks]
---

# Admin Features

Three admin surfaces live in the app: `/admin/*` (business operator), `/ops/*` (warehouse/fulfilment), and `/affiliate/*` (partners). Each has its own auth model.

## Admin routes (UI)

### `/admin/*` — operator panel

| Route | File | Purpose |
|---|---|---|
| `/admin` | `src/app/admin/page.tsx` | Landing / login gate. |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | KPIs (via `/api/v1/admin/dashboard`). |
| `/admin/customers` | `.../customers/page.tsx` | Customer search. |
| `/admin/customers/[id]` | `.../[id]/page.tsx` | Customer detail. |
| `/admin/promotions` | `.../promotions/page.tsx` | Discount list. |
| `/admin/promotions/new` | `.../new/page.tsx` | Create discount. |
| `/admin/promotions/[id]` | `.../[id]/page.tsx` | Edit discount. |
| `/admin/reports` | `.../reports/page.tsx` | Report index. |
| `/admin/reports/sales` | `.../sales/page.tsx` | Sales report. |
| `/admin/reports/customers` | `.../customers/page.tsx` | Customer report. |
| `/admin/reports/inventory` | `.../inventory/page.tsx` | Inventory report. |
| `/admin/experiments` | `.../experiments/page.tsx` | A/B experiments. |
| `/admin/features` | `.../features/page.tsx` | Feature flags. |
| `/admin/emails` | `.../emails/page.tsx` | Email template editor + log. |
| `/admin/sync` | `.../sync/page.tsx` | Shopify sync trigger. |
| `/admin/settings` | `.../settings/page.tsx` | Global settings. |
| `/admin/ai-assistant` | `.../ai-assistant/page.tsx` | Agent console. |
| `/admin/affiliates` | `.../affiliates/page.tsx` | Affiliate list. |
| `/admin/affiliates/[id]` | `.../[id]/page.tsx` | Affiliate detail. |
| `/admin/affiliates/[id]/dashboard` | `.../[id]/dashboard/page.tsx` | Impersonated view. |
| `/admin/affiliates/commissions` | `.../commissions/page.tsx` | Commission ledger. |
| `/admin/affiliates/payouts` | `.../payouts/page.tsx` | Payouts. |
| `/admin/affiliates/embed-generator` | `.../embed-generator/page.tsx` | Embed snippet builder. |

### `/ops/*` — warehouse / fulfilment

| Route | File | Purpose |
|---|---|---|
| `/ops` | `src/app/ops/page.tsx` | Ops landing. |
| `/ops/orders` | `.../orders/page.tsx` | Order queue + picking. |
| `/ops/orders/[id]` | `.../orders/[id]/page.tsx` | Order detail (picking, fulfilment, shortages). |
| `/ops/orders/[id]/edit` | `.../edit/page.tsx` | Amend order. |
| `/ops/orders/create` | `.../orders/create/page.tsx` | Create `DraftOrder` / invoice. |
| `/ops/products` | `.../products/page.tsx` | Product catalog admin. |
| `/ops/products/[id]` | `.../[id]/page.tsx` | Product edit. |
| `/ops/products/create` | `.../products/create/page.tsx` | Add new product (supports retailer-URL scraping via ops skill). |
| `/ops/collections` | `.../collections/page.tsx` | Collection management. |
| `/ops/collections/[id]` | `.../[id]/page.tsx` | Collection detail. |
| `/ops/inventory` | `.../inventory/page.tsx` | Stock overview. |
| `/ops/inventory/count` | `.../count/page.tsx` | AI-assisted stock count. |
| `/ops/inventory/predictions` | `.../predictions/page.tsx` | Demand forecast. |
| `/ops/inventory/receiving/new` | `.../receiving/new/page.tsx` | Upload distributor invoice. |
| `/ops/inventory/receiving/[id]` | `.../receiving/[id]/page.tsx` | Review OCR lines, apply to stock. |
| `/ops/group-orders` | `.../group-orders/page.tsx` | GroupOrderV2 admin. |
| `/ops/group-orders/[id]` | `.../[id]/page.tsx` | Detail. |
| `/ops/boat-schedule` | `.../boat-schedule/page.tsx` | Boat schedule CRUD + order matching. |
| `/ops/agent` | `.../agent/page.tsx` | Agent console (proposals, conversations). |

### `/affiliate/*` — partners

| Route | File | Purpose |
|---|---|---|
| `/affiliate/login` | `src/app/affiliate/login/page.tsx` | Magic link / password. |
| `/affiliate/verify` | `.../verify/page.tsx` | Verify magic-link token. |
| `/affiliate/apply` | `.../apply/page.tsx` | New partner intake. |
| `/affiliate/dashboard` | `.../dashboard/page.tsx` | Overview, commissions, payouts. |
| `/affiliate/dashboard/create-dashboard` | `.../create-dashboard/page.tsx` | Spin up a GroupOrderV2 dashboard for a client. |
| `/affiliate/dashboard/create-order` | `.../create-order/page.tsx` | Create invoice for client. |
| `/affiliate/dashboard/orders` | `.../orders/page.tsx` | Affiliate's attributed orders. |

## Role / permission logic

| Surface | Auth mechanism | Where it lives |
|---|---|---|
| Public pages | None | — |
| Customer account | JWT (`jose`), `Customer.passwordHash`, email verification flag | `src/lib/auth/`, `/api/v1/auth/*`, `CustomerContext` |
| Age verification | Session attestation | `/api/v1/auth/age-verify` + `AgeVerificationModal.tsx` |
| `/admin` | Admin password / API key gate | `/api/admin/verify`, `/api/admin/*` + `/api/v1/admin/*` guarded by `ADMIN_API_KEY` env var (see "Admin API namespaces" below) |
| `/ops` | Ops session cookie | `/api/ops/session`, `/api/ops/logout`, `src/lib/auth/ops-session*` |
| `/affiliate/dashboard` | `affiliate_session` cookie + JWT | Gated at middleware (`src/middleware.ts`) → `/affiliate/login`; issued by `/api/v1/affiliate/{login,verify,magic-link}` |
| OAuth / MCP | OAuth 2.0 PKCE client creds | `src/app/oauth/*`, `/.well-known/oauth-*`, `src/lib/oauth/` |
| Invoice pages | Single-use token in URL | `/invoice/[token]` + `/api/v1/invoice/[token]/*` |

## Admin API namespaces — `/api/admin/*` vs `/api/v1/admin/*`

These are **parallel namespaces, not a migration** — neither supersedes the other.

- **`/api/admin/*`** is admin-UI-facing and is guarded by `ADMIN_API_KEY` / admin session. Covers: `affiliates`, `analytics`, `experiments`, `orders`, `sync`, `verify`.
- **`/api/v1/admin/*`** is ops-panel-facing. Covers: `collections`, `customers`, `dashboard`, `discounts`, `draft-orders`, `features`, `orders`, `products`, `reports`, `shortage-list`, `sync`, `unpaid-carts`. (Loyalty admin page and APIs were removed 2026-04-23.)
- Overlap is only `orders` and `sync`; each namespace's `orders` / `sync` endpoints serve a different consumer. Do not treat either as deprecated.

## Admin capabilities by domain

### Orders
- List, search, detail, edit, amend, cancel, refund (Stripe refund via `/api/v1/admin/orders/[id]/refund`), RMA.
- Bulk fulfilment (`bulk-fulfill`).
- Resend receipt / amendment emails.
- Trigger review-request emails.
- `/ops/orders` picking workflow with per-line shortage tracking ("Short By" column per recent commit).
- Generate shortage list + "Email to Allan" (`/api/v1/admin/shortage-list/email`).

### Draft orders / invoices
- Create at `/ops/orders/create` → `POST /api/v1/admin/draft-orders`.
- Preview + send email at `.../draft-orders/[id]/{preview,send}`.
- Email events streamed via Resend webhook → `/api/v1/admin/draft-orders/[id]/email-events`.
- Customer pays at `/invoice/[token]`.

### Products & catalog
- Product CRUD at `/ops/products/*` and `/api/v1/admin/products*`.
- Image upload, reorder, delete.
- Variant CRUD.
- Collections: `/ops/collections`, `/api/v1/admin/collections*`.
- Shopify sync: `/admin/sync`, `/api/v1/admin/sync` (ops-panel), `/api/admin/sync` (admin UI) — both write `ShopifySync` / `SyncLog`.

### Inventory
- `/ops/inventory` — stock levels, low-stock alerts.
- `/ops/inventory/count` — AI session via `/api/v1/ai/inventory/count` (photo-based count).
- `/ops/inventory/receiving/*` — distributor invoice OCR → `ReceivingInvoice` → `ReceivingInvoiceLine` → `DistributorSkuMap` → apply.
- `/ops/inventory/predictions` — `InventoryPrediction` forecasts.
- Manual adjustments via `InventoryNote` (`/api/v1/inventory/notes/*`).

### Customers
- `/admin/customers*` — search, detail.
- Email verification state, age-verification state visible.

### Group orders
- `/ops/group-orders*` and `/api/v1/admin/group-orders*` — admin view of every GroupOrderV2.
- Transfer host, force-lock, cancel, manual payment reconcile.

### Promotions / discounts
- `/admin/promotions*` — `Discount`, `AutomaticDiscount`, `ReferralCode`.
- Discount validate endpoint shared with cart: `/api/v1/admin/discounts/validate`.

### Reporting
- `/admin/reports/{sales,customers,inventory}` backed by `/api/v1/admin/reports/*`.
- Daily `AnalyticsSnapshot` rollup; raw event ingest at `/api/analytics-ingest` into `VercelAnalyticsEvent`.
- GA4 Data API queries via `@google-analytics/data` from `src/lib/analytics/`.

### Experiments
- `/admin/experiments` + `/api/admin/experiments*` + client assign/track at `/api/experiments/{assign,track}`.
- Client hook: `useExperimentVariant`.

### Feature flags
- `/admin/features` + `FeatureFlag` model + `/api/v1/features`.

### Affiliates (full lifecycle)
- Apply (`PartnerApplication`) → admin approve (`/api/admin/affiliates/applications/[id]/{approve,reject}`).
- `Affiliate` row created + welcome email (`send-welcome`, `create-and-send`).
- Attribution: 30-day `ref_code` cookie set by `src/middleware.ts`, recorded at `/api/v1/affiliate/attribution`.
- Commissions: `AffiliateCommission` accrued by `/api/cron/affiliate-commissions` (daily 06:00 UTC).
- Payouts: `/api/cron/affiliate-payouts` (monthly, 1st 14:00 UTC) → `AffiliatePayout` + `PayoutLineItem`.
- Impersonation: `/api/admin/affiliates/[id]/impersonate` + `/stop-impersonating`.
- Embed generator: `/admin/affiliates/embed-generator` produces iframe snippets (works with `/partners/*` relaxed CSP).

### Email / comms
- `/admin/emails` + `EmailTemplateContent` + `EmailLog`.
- Ops-only previewing: `/api/ops/email-preview` + `/api/ops/email-preview/send`.
- Delivery events streamed back via `/api/webhooks/resend` and verified with `svix`.

### AI agent
- `/ops/agent` and `/admin/ai-assistant` back onto `/api/v1/agent/*`.
- Proposals queue (`AgentProposal`) — mutations require explicit approve/reject.
- MCP server exposed at `/api/mcp` (logged in `McpRequestLog`).

### Boat schedule
- `/ops/boat-schedule` + `/api/ops/boat-schedule*` with sync to match orders (`ScheduleOrderMatch`).
- Public read: `/api/public/boat-schedule*` + `/premier-boat-schedule`.

## Background jobs (Vercel cron — `vercel.json`)

| Schedule (UTC) | Endpoint | Purpose |
|---|---|---|
| `0 14 * * *` (daily 14:00) | `/api/cron/generate-blog` | AI-generated MDX blog post → `content/blog/posts/`. Requires `CRON_SECRET`. |
| `*/15 * * * *` | `/api/cron/reconcile-orders` | Compare Stripe sessions to `Order` rows; heal missed webhooks. |
| `0 6 * * *` | `/api/cron/affiliate-commissions` | Accrue `AffiliateCommission` rows from eligible orders. |
| `0 14 1 * *` (monthly 1st 14:00) | `/api/cron/affiliate-payouts` | Close commissions into `AffiliatePayout` + `PayoutLineItem`. |
| `0 7 * * *` (daily 07:00) | `/api/cron/analytics-snapshot` | Daily GA4/GSC rollup → `AnalyticsSnapshot`. |
| `0 13 * * 1` (Mon 13:00) | `/api/cron/weekly-briefing` | Weekly operator briefing email. |
| `0 13 * * 1` (Mon 13:00) | `/api/cron/weekly-purchase-plan` | Weekly distributor purchase plan (PAID orders, 14-day window). |
| `0 */2 * * *` (every 2h) | `/api/cron/group-orders-v2` | Locks expired `SubOrder` tabs (`OPEN` → `LOCKED` when `orderDeadline` has passed) and closes expired `GroupOrderV2` (`ACTIVE` → `CLOSED` when `expiresAt` has passed). Added to `vercel.json` 2026-04-23. |

### Blog automation (GitHub Actions)

`.github/workflows/generate-daily-blog.yml` runs on cron `0 14 * * *` (daily 14:00 UTC / 9 AM EST). The workflow checks out `dev`, runs `npm run generate-blog` with `OPENROUTER_API_KEY` in the environment, commits the generated MDX post to `dev`, and opens a pull request into `main`. Runs in parallel to the Vercel `/api/cron/generate-blog` cron (same schedule) — both target blog generation but GitHub Actions is the PR-producing path.

## Webhooks

| Endpoint | Purpose |
|---|---|
| `/api/webhooks/stripe` | Primary order creation path. Verifies signature via `STRIPE_WEBHOOK_SECRET`; idempotent via `WebhookEvent`. |
| `/api/webhooks/shopify` | Shopify product / catalog events. HMAC-verified with `SHOPIFY_WEBHOOK_SECRET`. |
| `/api/webhooks/shopify/list` | Inspect registered webhooks. |
| `/api/webhooks/resend` | Resend email-delivery events → `EmailLog`. Signature verified with `svix`. |
| `/api/webhooks/create-dashboard` | Inbound trigger to provision a GroupOrderV2 dashboard (partner integrations). |

## Integrations

| Integration | Direction | Notes |
|---|---|---|
| Stripe | out + webhooks in | Live keys. Test cards forbidden. |
| Shopify Admin API | pull (catalog sync) + webhooks in | Admin-only; NO Storefront/checkout per CLAUDE.md. |
| Resend | out + webhooks in | Transactional email + template webhooks. |
| GoHighLevel (GHL) | out webhook | SMS dispatch (`src/lib/webhooks/ghl.ts`). |
| Zapier | out webhook | Partner inquiry + corporate leads. |
| Vercel Analytics Drain | in | `/api/analytics-ingest`, signature verified with `VERCEL_DRAIN_SECRET`. |
| Google (GA4 + GSC) | pull | GA4 Data API via `@google-analytics/data`; GSC via `googleapis`. |
| Anthropic Claude | out | Agent, blog generation, inventory AI. |
| Google Gemini | out | Blog image generation. |
| OpenRouter | out | Claude routing for daily blog cron. |
| Supabase | aux | Auxiliary storage (`src/lib/supabase/`). |
| Vercel Blob / KV | aux | Blob uploads + KV cache. |
| IndexNow / Bing / Google ping | out | `scripts/indexnow-*.mjs`, `sitemap:ping` script. |

## Gaps / TODOs

`TODO`/`FIXME` comments found in 9 files (23 occurrences total):

| File | Count |
|---|---|
| `src/app/api/webhooks/shopify/route.ts` | 11 |
| `src/app/partners/mobile-bartenders/page.tsx` | 4 |
| `src/app/holiday-runner-up/page.tsx` | 2 |
| `src/app/account/page.tsx` | 1 |
| `src/app/account/orders/page.tsx` | 1 |
| `src/app/page.tsx` | 1 |
| `src/components/account/AccountLayout.tsx` | 1 |
| `src/components/AIConcierge.tsx` | 1 |
| `src/components/partners/OrderTypeSelector.tsx` | 1 |

Notable gaps identified during this review:
- `/design-example` is an internal design-system showcase — intentional, keep.
- `/api/admin/*` and `/api/v1/admin/*` are parallel namespaces serving different consumers (see "Admin API namespaces" above). Not a migration.
- v1 group-order endpoints (`/api/group-orders/*`) and v2 (`/api/v2/group-orders/*`) coexist intentionally; v1 is still called by several account/group-order components. Not deprecated.

## See also

- [[INDEX]]
- [[01-overview]]
- [[02-tech-stack-and-architecture]]
- [[03-routes-and-pages]]
- [[04-customer-journey]]
- [[05-data-model]]
