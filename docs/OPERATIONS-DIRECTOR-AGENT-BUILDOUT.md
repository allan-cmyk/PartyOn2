# Operations Director Agent — Buildout Brief

**Drop this entire file into a new Claude Code session.** It is self-contained — the new session will have no memory of the conversation that produced it.

**Goal of the new session:** Build the Operations Director agent for Party On Delivery and ship it through Phase 1 (inventory-accuracy monitor + reconciliation workflow with inline actions).

---

## 1. Context — why this agent exists

Party On Delivery (premium alcohol + party coordination delivery, Austin TX) is being reorganized around an "agentic org structure" — director-level Claude agents that own a functional area, surface decisions to the operator (Allan), and execute routine work autonomously. The Marketing Director shipped first (`.claude/agents/marketing-director.md`) and proved the pattern: nightly snapshot → DB → triage queue UI → email briefing → 14-day measurement → Obsidian memory loop with ADRs. The Operations Director is the second director and reuses that pattern.

The original 6-director scope (Apr 18, 2026) listed three Operations sub-agents: order verification, inventory, fulfillment. **Phase 1 collapses these into a single Operations Director** — separate sub-agents will only get spun out if the prompt grows unwieldy. The full plan, the architectural reasoning behind making SEO a sibling rather than a Marketing sub-agent, and the broader org-chart vision live in [SEO-DIRECTOR-AGENT-BUILDOUT.md](./SEO-DIRECTOR-AGENT-BUILDOUT.md) §1 — read that first if you need org context.

---

## 2. The Phase-1 thesis

The inventory **system** is solid (three-tier model In Stock / Committed / Available, AI-parsed inventory notes, full receiving pipeline, pick-state tracking). The **data inside it drifts** because reality and the ledger update on different clocks.

**Phase 1 is a divergence detector + reconciliation workflow, not new inventory features.** The Director surfaces drift signals to the operator's triage queue. Each rec card has **inline action buttons** that perform the fix via existing API endpoints — the operator doesn't have to tab over to another screen to act.

Phase 1 scope deliberately excludes anything that requires data we don't yet collect (driver telemetry, customer complaints, vendor SLAs that haven't been formalized). Those land in Phase 2+.

---

## 3. Scope

### In scope (Phase 1 — own these outcomes)

- **Inventory drift detection** across all 9 signals listed in §6
- **Reconciliation workflow** — every flagged drift has an inline action that fixes it via existing endpoints
- **Cycle count discipline** — surface the top-N velocity SKUs that haven't been physically counted recently, route the operator to the existing "add note" modal pre-filled with the SKU
- **Pre-fulfillment shortage prevention** — extend the existing Monday purchase plan into a daily look-ahead that flags shortages on already-paid orders specifically
- **Daily ops snapshot** — `OperationsSnapshot` row capturing inventory accuracy %, drift events, urgent shortages, cost-coverage gap, receiving lag stats
- **Monday operator briefing email** — top drift events of the week, cycle-count list for this week, any dangling drafts
- **Cost-coverage push** — surface high-velocity variants missing `costPerUnit` so margin attribution can become trustworthy (currently ~4% per the saved memory note)
- **Draft order quality flags** — drafts where items are out of stock, delivery zone/date impossible, address fails validation, total below zone minimum, payer phone/email malformed (advisory only in Phase 1; don't block creation)

### Out of scope (Phase 1)

- Auto-applying AI-parsed inventory notes (still operator-confirmed)
- Auto-triggering physical counts (recommends, doesn't force)
- Vendor performance scoring (Phase 2 — collect data first)
- Driver/route fulfillment SLA (no driver telemetry yet)
- Customer complaints / refund reconciliation (Customer Success Director territory)
- Pricing/margin decisions (Finance Director territory)
- New product additions (`/products` skill stays operator-driven)

### Deliverables for the operator

Mirror the Marketing Director cadence so surfaces feel familiar:

- **Triage queue** at `/admin/operations/recommendations` (or merged with existing recs UI) — recs with severity, evidence, and **inline action buttons**
- **Daily 07:30 UTC ops-snapshot** + **hourly drift cron** for time-sensitive signals
- **Monday 13:30 UTC briefing email** (right after Marketing's 13:00) — top drift events, cycle-count list, dangling drafts, cost-coverage progress
- **`/admin/operations` dashboard page** — one-page health view (inventory accuracy %, urgent shortages, cost coverage %, drift events trend)

---

## 4. Available data sources — already piped in, DO NOT rebuild

Everything Phase 1 needs already exists. The Director consumes; it does not lay new pipe.

### Database models (`prisma/schema.prisma`)

| Model | Used for |
|---|---|
| `Product`, `ProductVariant` | Catalog. `costPerUnit` field is the cost-coverage target. |
| `InventoryItem` (line 571) | Per-location stock. `inventoryQuantity`, `committedQuantity`. |
| `InventoryMovement` (line 603) | Audit trail of every adjustment. |
| `InventoryLocation` (line 555) | Locations (warehouse, etc.). |
| `InventoryNote` (line 1983) | The "add note" modal payload. Status `pending → processed | dismissed`. |
| `ReceivingInvoice` (line 2001) + `ReceivingInvoiceLine` (line 2022) | The "receive shipment" modal payload. Status `PENDING_REVIEW → APPLIED | CANCELLED`. |
| `Order`, `OrderItem` | Paid orders + line items, including `unitCost` / `totalCost` / `Order.marginAmount`. |
| `OrderItemPickState` (added `86f58c77`) | Per-order pick/pack state (`inStock`, `packed`, `shortBy`). |
| `DraftOrder`, `DraftOrderItem` | Invoices before payment — Phase 1 quality flags target these. |
| `GroupOrderV2`, `SubOrder`, `DraftCartItem` | Universal dashboard orders — paid-order forecasts must include these. |
| `InventoryPrediction` (line 1165) | Existing predictions; check whether the Director should consume or replace. |

### Existing API endpoints (use these in inline actions)

- `GET /api/v1/inventory` (filters: `low_stock`, `out_of_stock`)
- `POST /api/v1/inventory` `{ operation: "adjust", productId, quantity, reason }` — physical-count-style adjustments
- `POST /api/v1/inventory/notes` — submit a note
- `POST /api/v1/inventory/notes/[id]/apply` — apply a parsed note
- `GET/POST /api/v1/inventory/receiving` — list / start receiving invoice
- `POST /api/v1/inventory/receiving/[id]/apply` — apply a receiving invoice (likely path; verify exact route)
- `GET/PUT /api/ops/orders/[id]/picks` — read/update pick state
- `PATCH /api/v1/inventory/variants/[id]` — variant edit (cost entry, etc.)

### Existing scripts to call or extend

- `scripts/ops/check-inventory.mjs` — query stock for a variant
- `scripts/ops/adjust-inventory.mjs` — apply manual adjustment with reason
- `scripts/ops/low-stock.mjs` — current low-stock list
- `scripts/ops/upcoming-orders.mjs` — paid demand window
- `scripts/ops/purchase-plan.mjs` — Monday weekly plan (already automated via Vercel cron)
- `scripts/ops/enter-cogs.mjs` — interactive cost entry (the cost-coverage rec links here)
- `scripts/ops/match-invoice-costs.mjs` — match receiving invoice lines to cost-per-unit

### Existing UI surfaces

- `/ops/inventory` — main inventory page (the "add note" + "receive shipment" modals live here)
- `/ops/inventory/count` — counting workflow page
- `/ops/inventory/receiving/[id]` — receiving invoice detail
- `/ops/inventory/receiving/new` — start a new receiving
- `/ops/inventory/predictions` — InventoryPrediction surface

The Director's inline actions should **deep-link into these existing pages with query-param prefills** rather than creating new ones.

### Existing skills

- `/inventory` skill (`.claude/skills/inventory/SKILL.md`) — operator-driven CLI for stock/adjust/plan
- `/ops` skill (`.claude/skills/ops/SKILL.md`) — orders, customers, dashboards
- `/weekly-summary` skill — printable Friday checklist

The Operations Director uses these surfaces but doesn't replace them — they remain operator-invoked tools.

---

## 5. Architectural calls

### a) Recommendation model — parallel, not unified

There is already a `MarketingRecommendation` model. **Add a parallel `OperationsRecommendation` model** rather than unifying into a single `Recommendation` table. Reasons:

- Ops recs need fields Marketing recs don't (`targetEntityType`, `targetEntityId`, `actionPayload`, `severity`)
- Forcing a unified schema bloats Marketing for fields it never uses
- Future directors (SEO, Finance, CS) follow the same pattern — own table, shared library

### b) Extract the shared layer to `src/lib/recommendations/`

- `src/lib/recommendations/lifecycle.ts` — status state machine (`open → approved → shipped → measured` + `rejected | invalidated`)
- `src/lib/recommendations/measurement.ts` — 14-day after-snapshot logic (refactor of `src/app/api/cron/measure-recommendations/route.ts`)
- `src/lib/recommendations/card-types.ts` — TS types for severity, evidence, action payloads
- `src/components/admin/RecommendationCard.tsx` — shared component, accepts `domain` prop and renders the right inline actions

Refactor the existing Marketing pipeline to consume these shared helpers (small refactor, no behavior change).

### c) Inline-action contract

Every Ops rec card has:

```ts
type OperationsRecommendation = {
  id: string;
  title: string;                  // plain-English issue
  severity: 'urgent' | 'high' | 'normal';
  evidence: {
    metricName: string;
    metricValue: string | number;
    sourceLinks: { label: string; href: string }[];   // links to source records
  }[];
  targetEntityType: 'productVariant' | 'order' | 'draftOrder' | 'inventoryNote' | 'receivingInvoice' | 'vendor';
  targetEntityId: string;
  suggestedAction: {
    label: string;                  // button text
    kind: 'navigate' | 'apiCall';
    payload:
      | { kind: 'navigate'; href: string }   // deep-link with prefill
      | { kind: 'apiCall'; method: string; path: string; body: Record<string, unknown> };
  };
  status: 'open' | 'approved' | 'shipped' | 'measured' | 'rejected' | 'invalidated' | 'snoozed';
  snoozeUntil: Date | null;
  dismissReason: string | null;
  // ... lifecycle dates, source, related entities
};
```

Inline `apiCall` actions hit existing endpoints; inline `navigate` actions deep-link to existing UI with query-param prefills (e.g. `/ops/inventory?openNoteFor=variantId&prefill=Counted+N+units`).

### d) Snooze + dismiss with reason feed back into heuristics

The drift detectors should read recent dismissals when scoring. If the operator dismisses "Repeated shorts on variant Z" three times in a row with reason "intentional buffer," the heuristic stops flagging that variant. This is built in from day one — not a Phase-2 addition — because noise tolerance is what makes or breaks a triage queue.

---

## 6. The 9 drift signals + inline actions

These are what the Phase-1 Director scans for. Thresholds are starting points; tune from operator feedback.

| # | Drift signal | Detection logic | Severity | Inline action |
|---|---|---|---|---|
| 1 | **Receiving lag** | `ReceivingInvoice.status = PENDING_REVIEW` AND `createdAt < now() - 24h` | high | "Open receiving" → `/ops/inventory/receiving/[id]` |
| 2 | **Pick-state ↔ inventory lag** | `OrderItemPickState.packed = true` for orders fulfilled ≥24h ago, but inventory `committedQuantity` hasn't decremented to match | high | "Reconcile pick → inventory for order Y" — apiCall that decrements committed and increments movements |
| 3 | **Repeated shorts on same SKU** | Same `productVariantId` shorted (`OrderItemPickState.shortBy > 0`) on ≥2 distinct orders in last 7d | high | "Mark for count" → opens `/ops/inventory?openNoteFor=variantId` |
| 4 | **Negative available** | `committedQuantity > inventoryQuantity` for any variant | urgent | "Adjust in-stock by N (after physical count)" — opens count modal |
| 5 | **Velocity anomaly** | Variant sold ≥N/week trailing-30d, then 0 sales for 14d, no `Product.status` change | normal | "Audit variant — possible mis-mapping" → opens variant edit page |
| 6 | **AI-note backlog** | `InventoryNote.status = pending` AND `createdAt < now() - 24h` | high | "Review and apply" → `/ops/inventory?openNote=noteId` |
| 7 | **Variant mismapping suspect** | Variant A has sales, sister variant B (same product, similar SKU pattern) has growing committed without sales | normal | "Audit variant binding" → opens variant comparison view |
| 8 | **Cost-coverage gap** | Variant has ≥5 units sold in 30d but `ProductVariant.costPerUnit IS NULL` | normal | "Enter cost" → opens cost-entry modal pre-filled with variantId |
| 9 | **Cycle count overdue** | Top-20-by-unit-volume variant **over the trailing 14 days** has no `InventoryNote` (type: count) AND no `InventoryMovement` with reason like 'count' in ≥7d | normal | "Mark counted" → opens "add note" modal pre-filled |

### Pre-fulfillment shortage signal (separate, runs hourly)

For every variant in any **PAID** upcoming order in the next 14 days: if `inventoryQuantity - committedQuantity < 0`, raise an **urgent** rec. Inline action: deep-link to the purchase plan filtered to that variant. (This complements the existing Monday plan by catching shortages between Monday runs.)

---

## 7. Phased build

### Phase 0 — Setup (Day 1)

- Create `.claude/agents/operations-director.md` mirroring `marketing-director.md` frontmatter.
- Create empty Obsidian memory shell at `Memory/Operations/` mirroring `Memory/Marketing/` (folders: `Briefings`, `Recommendations`, `Decisions`, `Channel-Performance`, `Open-Questions.md`, `README.md`).
- Read these reference files in order:
  1. `.claude/agents/marketing-director.md` — agent file template
  2. `~/Projects/Obsidian/Obsidian/PartyOn2/Programs/Marketing-Director.md` — program doc template
  3. `~/Projects/Obsidian/Obsidian/PartyOn2/Memory/Marketing/README.md` — memory conventions
  4. `src/app/api/cron/analytics-snapshot/route.ts` — daily snapshot pattern
  5. `src/app/api/cron/measure-recommendations/route.ts` — 14-day measurement
  6. `src/app/admin/analytics/recommendations/` — triage queue UI
  7. `src/lib/inventory/services/inventory-service.ts` — inventory mutations
  8. `prisma/schema.prisma` lines 555–620, 1165–1200, 1983–2080 — inventory + notes + receiving models

### Pre-Phase-1 — Pack-to-inventory wiring (Day 2, separate small PR)

**Why this is a prereq, not part of the Director:** The Director's value depends on inventory being roughly accurate at any given moment. Today, packing an order doesn't decrement stock. That gap is the single biggest source of drift. Close it before the Director ships, so the Director isn't fighting a constantly-growing backlog of "packed but not decremented" orders.

**What changes:**

- In `src/app/api/ops/orders/[id]/picks/route.ts` PUT handler: when `packed` flips from `false → true`, after the `OrderItemPickState` upsert, call `decrementOnFulfillment` (or equivalent) for that line item. Decrement amount is `(originalQty - shortBy)`. Wrap both writes in a Prisma transaction so a failure in either rolls back both.
- Reverse case: when `packed` flips from `true → false` (operator unpacks), increment back by the same amount. Same transaction pattern.
- Edge case: `shortBy` changes while `packed` is already true — adjust the delta accordingly. (Example: was packed with `shortBy: 0`, operator updates to `shortBy: 2`. Inventory needs to come back up by 2 because those units never actually left.)
- Audit trail: write an `InventoryMovement` row with `reason: 'pack'` and a reference to the order + item key. Reuses the existing audit table, no schema change.
- **No backfill** (operator-decided 2026-05-07). Wiring takes effect from the deploy date forward. Existing packed-but-not-decremented orders surface as recs after Phase 1B ships via signal #2; operator closes each via inline action. Reasons: (a) backfill scripts that touch inventory go wrong silently; (b) one-click reconciliation via the rec card doubles as the first real test of the inline-action workflow; (c) operator stays in the loop on every fix.

**Why a separate PR:** This is a real transactional state change with rollback semantics. It deserves its own review, its own test coverage, and its own deploy. Mixing it into the Director PRs muddies the diff and increases blast radius.

**Drift signal #2 stays in Phase 1B** — it becomes a safety net for orders that predate this wiring, for any future bugs, and for edge cases (e.g., dashboard group orders where the picker UI may differ).

### Phase 1A — Shared lib refactor (Days 2–3, small PR)

- Extract `src/lib/recommendations/{lifecycle,measurement,card-types}.ts`
- Extract `src/components/admin/RecommendationCard.tsx`
- Refactor existing Marketing pipeline to consume the shared helpers
- No behavior change — pure refactor. Verify Marketing's Monday email still sends and the existing triage queue still works.

### Phase 1B — Ops scaffolding (Days 4–6)

- Add `OperationsRecommendation` and `OperationsSnapshot` models to `prisma/schema.prisma`
- **Important:** per saved memory note "Prisma schema drift — avoid db push", use raw SQL `CREATE TABLE IF NOT EXISTS` for additive migrations on production. Confirm migration path with operator before pushing.
- Build `src/lib/operations/recommendations.ts` — heuristic generators (one function per signal)
- Build `src/app/api/cron/operations-snapshot/route.ts` — daily 07:30 UTC, runs all 9 detectors, writes `OperationsSnapshot`, upserts `OperationsRecommendation` rows
- Build `src/app/api/cron/operations-drift-hourly/route.ts` — hourly fast loop on signals 1, 2, 6 (time-sensitive) + pre-fulfillment shortage
- Wire crons in `vercel.json`

### Phase 1C — Triage queue UI (Days 7–9)

- Build `src/app/admin/operations/recommendations/page.tsx` (or extend `/admin/analytics/recommendations` with a domain filter)
- Build `src/app/api/admin/operations/recommendations/route.ts` (GET list, PATCH status, POST execute action)
- Inline-action handler: routes `apiCall` payloads through existing inventory/order endpoints, never directly mutates DB from this path
- "Snooze 7d" + "Dismiss with reason" controls feed `OperationsRecommendation.dismissReason` back into heuristic scoring

### Phase 1D — Briefing + dashboard (Days 10–11)

- Build `src/lib/email/templates/operations-briefing.ts` mirroring `marketing-briefing.ts`
- Build `src/lib/operations/briefing-payload.ts` — assembles top drift events, cycle-count list, dangling drafts, cost-coverage progress
- Build `src/app/api/cron/operations-briefing/route.ts` — Monday 13:30 UTC
- Build `src/app/admin/operations/page.tsx` — one-page health dashboard

### Phase 1E — Agent surface (Days 12–13)

- Build `.claude/agents/operations-director.md` properly — Sonnet, Read/Grep/Glob/Bash tools (mirror Marketing Director's tool list), prompt that instructs the agent to read the daily snapshot + active recs + active drift signals on every invocation
- Add Obsidian sync for `Memory/Operations/` mirroring the Marketing pattern (PR #20 / #22 from Marketing's history)
- Write `Programs/Operations-Director.md` in the Obsidian vault

**Exit criterion for Phase 1:** Operator reads the Monday Operations briefing for 2 consecutive weeks, acts on ≥3 inline actions per week, and inventory accuracy (measured by adjustment-volume-after-count) improves.

### Phase 2 — Auto-apply + draft validation (Quarter 2)

- High-confidence AI-parsed inventory notes auto-apply (with operator notification, undoable)
- Pre-creation draft order validation (block save with errors, warn on warnings)
- Vendor reliability scoring (after 90 days of receiving data)

### Phase 3 — Fulfillment intelligence (when driver telemetry exists)

- On-time delivery tracking
- Route suggestion
- Driver dispatch

---

## 8. Files this build will likely touch

```
.claude/agents/operations-director.md                     [NEW]
prisma/schema.prisma                                      [+OperationsRecommendation, +OperationsSnapshot]
src/lib/recommendations/lifecycle.ts                      [NEW — shared]
src/lib/recommendations/measurement.ts                    [NEW — shared, refactored from cron]
src/lib/recommendations/card-types.ts                     [NEW — shared types]
src/components/admin/RecommendationCard.tsx               [NEW — shared component]
src/lib/operations/recommendations.ts                     [NEW — 9 detectors + pre-fulfillment]
src/lib/operations/briefing-payload.ts                    [NEW]
src/lib/operations/heuristic-scoring.ts                   [NEW — reads dismiss history, suppresses noise]
src/lib/email/templates/operations-briefing.ts            [NEW]
src/app/api/cron/operations-snapshot/route.ts             [NEW]
src/app/api/cron/operations-drift-hourly/route.ts         [NEW]
src/app/api/cron/operations-briefing/route.ts             [NEW]
src/app/api/cron/measure-recommendations/route.ts         [REFACTOR — generic over domain]
src/app/api/admin/operations/recommendations/route.ts     [NEW]
src/app/api/admin/operations/snapshot/route.ts            [NEW]
src/app/admin/operations/page.tsx                         [NEW — health dashboard]
src/app/admin/operations/recommendations/page.tsx         [NEW]
src/app/admin/analytics/recommendations/                  [REFACTOR — uses shared component]
src/app/ops/inventory/page.tsx                            [+ query-param prefill handling for inline actions]
vercel.json                                               [+ 3 new cron schedules]

# Obsidian vault (manual creates, not in repo)
PartyOn2/Programs/Operations-Director.md
PartyOn2/Memory/Operations/README.md
PartyOn2/Memory/Operations/Open-Questions.md
PartyOn2/Memory/Operations/Briefings/
PartyOn2/Memory/Operations/Recommendations/
PartyOn2/Memory/Operations/Decisions/
PartyOn2/Memory/Operations/Channel-Performance/
```

---

## 9. First-session checklist (drop-into-new-session steps)

1. Read this entire doc.
2. Read the 8 reference files in §7 Phase 0 (especially the Marketing Director vault doc — it's the template).
3. Confirm the listed inventory APIs all exist and respond (`GET /api/v1/inventory`, `POST /api/v1/inventory/notes`, `GET /api/v1/inventory/receiving`, `GET/PUT /api/ops/orders/[id]/picks`).
4. **Open Phase 1A as its own PR first** — the shared-lib refactor. No new directors yet, no new models. Just: extract shared lifecycle/measurement/card-types/component from the existing Marketing pipeline, prove Marketing still works unchanged.
5. After Phase 1A merges, open Phase 1B as a second PR — schema + heuristic generators + crons. No UI yet.
6. After Phase 1B merges, open Phase 1C — UI + inline actions.
7. After Phase 1C merges, open Phase 1D — briefing email + dashboard.
8. After Phase 1D merges, open Phase 1E — agent file + Obsidian wiring + program doc.

Five small PRs, not one big one. Each merges independently, each is reviewable.

---

## 10. Hard rules (apply throughout)

- **Phase 1 never auto-mutates inventory.** Every action requires an operator click on a rec card. Inline buttons hit APIs the operator already uses today; the Director just routes them.
- **Receiving lag SLA is 24 hours**, not 4. Don't fire false positives on same-day-evening invoice processing.
- **Cycle counts use the existing "add note" modal** — do not build a parallel count workflow. Inline actions deep-link to `/ops/inventory` with query-param prefill.
- **Per saved memory: avoid `prisma db push`.** Use raw SQL `CREATE TABLE IF NOT EXISTS` for additive migrations on production. Confirm migration path with operator.
- **Group order manifest names** — when surfacing draft-quality issues for orders with `groupOrderV2Id`, always show the manifest name (`GroupOrderV2.name`), not just `Order.customerName`. Use `scripts/ops/_group-label.mjs:resolveGroupLabel()`. (Per saved memory.)
- **Demand source for shortage detection: PAID orders only**, mirroring the existing weekly purchase plan. No drafts, no dashboards. (Per saved memory.)
- **Variants ARE the case** — for any quantity logic, treat the variant as the unit. No split-case ordering. (Per saved memory.)
- **Snooze + dismiss-with-reason MUST feed back into heuristic scoring** from day one. Noise tolerance is what makes triage queues trustworthy.
- **No `any` type, files <500 lines, components <200 lines, functions <50 lines** (per project CLAUDE.md).
- **Use existing design system classes** for any admin UI (`.btn-primary`, `.card`, `.input-premium`, etc. — see project CLAUDE.md design-system section).

---

## 11. Resolved decisions (operator-confirmed 2026-05-07)

1. **Triage UI placement → ONE QUEUE WITH FILTER CHIPS.** Extend `/admin/analytics/recommendations` (or a renamed equivalent like `/admin/recommendations`) with filter chips at the top: `All | Marketing | Operations | SEO | …`. Shared `RecommendationCard` component renders each domain's card style. Scales to all future directors without proliferating URLs.
2. **Pick-state ↔ inventory closing → CURRENTLY DECOUPLED, GAP IS UNINTENTIONAL.** Confirmed in code: `src/app/api/ops/orders/[id]/picks/route.ts:84-99` only writes to `OrderItemPickState`, doesn't touch `inventoryQuantity` or `committedQuantity`. The `decrementOnFulfillment` function in `src/lib/inventory/services/order-service.ts:157` exists but isn't called from the picker. **Decision: wire packing → inventory decrement as a separate small PR BEFORE Phase 1B.** See "Pre-Phase-1: pack-to-inventory wiring" in §7. Drift signal #2 stays in scope as a backfill detector for orders that predate the wiring + edge cases.
3. **Cycle count velocity window → TRAILING 14 DAYS.** Counts are fast and the operator does them in the morning. Two-week window keeps the cycle-count list responsive to current movers (boat season, weekend bach demand spikes) without the noise of one-off party orders.
4. **Receiving-lag clock → `createdAt` (upload time), 24h SLA.** Reliable measure; doesn't depend on the operator filling `invoiceDate` correctly. Revisit if the broader pipeline needs visibility.
5. **Notification for urgent recs → EMAIL-ONLY for Phase 1.** Same channel as Marketing Director (Monday briefing surfaces them). Add SMS/Slack push in Phase 1.5 once the heuristic is tuned and "urgent" is reliably urgent.
6. **Action audit trail → LOG ON THE REC.** Add `OperationsRecommendation.actionLog` (JSON array). Each entry: `{ timestamp, actionLabel, result: 'success' | 'error', errorMessage?, relatedMovementId? }`. Reconstructs "Director recommended → operator clicked → outcome" in one place; powers the 14-day measurement loop and heuristic tuning.

---

## 12. Success metrics (set baselines in Phase 0, measure quarterly)

- **Inventory accuracy %** — proxy: `(adjustments_within_50_units_of_zero / total_count_adjustments)` for a rolling 30-day window. Counts that confirm the ledger was right ≈ accurate; counts that move stock by ±N units measure how wrong it was. Lower-is-better drift volume.
- **Drift-event volume** — count of `OperationsRecommendation` rows opened per week, by signal type. Should trend down as systemic issues get fixed.
- **Time-to-action on urgent recs** — median minutes from rec creation to inline-action click for `severity = urgent`. Target <60 min during business hours.
- **Cost coverage %** — `(variants_with_costPerUnit_set / variants_sold_in_30d) * 100`. Target Phase-1 exit: ≥30% (from ~4% baseline).
- **Receiving lag p50 / p90** — hours between distributor invoice date and `ReceivingInvoice.status = APPLIED`.
- **Pre-fulfillment shortage rate** — `(orders_with_short_at_pick_time / orders_fulfilled)` per week. Target: <2%.
- **Cycle counts completed per week** — directly measurable via `InventoryNote` rows tagged as counts in the 7-day window.

---

That's everything a fresh session needs. The Operations Director mirrors the Marketing Director's pattern, anchors Phase 1 on inventory accuracy (the operator's #1 pain), uses inline actions to make ops work transactional rather than advisory, and sets up the shared `src/lib/recommendations/` layer that all subsequent directors (Finance, CS, Product) will reuse.
