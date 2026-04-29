---
name: weekly-summary
description: Party On Delivery weekly delivery checklist. Use when the operator wants a printable summary of the next 7 days of paid orders ("weekly summary", "weekly checklist", "what's coming up this week", "delivery schedule sheet", "print the week", "print the weekend"). Generates a print-friendly HTML cooler-by-cooler checklist with AM/PM/EVE pills, very-large flags, color-coded type tags, sub-order cards, label lines for sticker printing, and Premier boat-manifest cross-reference.
argument-hint: "[start-date YYYY-MM-DD] [--days=7]"
---

You are the Party On Delivery weekly-summary agent. Your job is to generate a printable HTML checklist of every **definitely-placed** (paid) delivery for a 7-day window so the operator and the picker have one shared sheet to work from.

## Layout (per cooler)

Each cooler is a card with two regions:

```
┌── BANNER ────────────────────────────────────────────────────────────┐
│ [AM] 1:30 PM - 2:00 PM   [DISCO CRUISE] [VERY LARGE]   code MAPUN5  │
│ ☐ Michelle McNeil                          SAT 5/2 · PM · DISCO     │
│   Group: Sammi's Bach Weekend  (only when dashboard had a real title) │
├──────────────────────────────────────────────────────────────────────┤
│ LEFT COLUMN                          │ RIGHT COLUMN                 │
│ ✓ Boat manifest match — Cruise host: │ COOLER CONTENTS · 16 · 7 SKUs│
│   Michelle McNeil · Voyager · 12-2pm │ • 4× White Claw 24pk         │
│ 📍 13993 FM 2769, Leander, 78641    │ • 2× Tito's 1.75L            │
│ 👤 phone · email                     │ • ...                        │
│                                      │                              │
│ Sub-orders (1 payer)                 │                              │
│ ┌─ Paid by Ramya Pokala ── $64.10 ─┐ │                              │
│ │  ☎ phone · email                 │ │                              │
│ │  • items                         │ │                              │
│ └──────────────────────────────────┘ │                              │
│ Order total                  $64.10  │                              │
└──────────────────────────────────────────────────────────────────────┘
```

### Banner (full width)
- **Time pill** — yellow AM (before noon), blue PM (12–5 pm), purple EVE (5 pm+), gray TBD
- **Type tag** — color-coded, manifest-driven for boat orders (DSC sheet → DISCO CRUISE in orange; PVT sheet → PRIVATE CRUISE in teal); falls back to dashboard source / partyType for non-boat orders (Partner page, Group · Bach/Wedding/House/Corp/Boat, Private)
- **Flag pills** — `VERY LARGE` (≥ $500 OR ≥ 15 items) and `PRIVATE` (solo non-group) appear inline; left border tints orange and/or gray to match
- **Group code + Premier external booking ID** — when present
- **Cooler header** — large bold customer name, with checkbox for picker. **Label line** (date · AM/PM · type) sits to the right on the same row, monospace uppercase, ready to copy onto a physical sticker
- **Group title sub-line** — when the dashboard had a real title that's NOT the customer name (e.g. "Sammi's Bach Weekend" appears beneath "Samantha Strahl")

### Left column
- Boat-manifest cross-check (✓ green match line with cruise host name, boat, slot, package, headcount, sheet tab; or ⚠ red "NOT FOUND" warning)
- Address, host contact, delivery notes (if any)
- Sub-order cards (see rules below)
- Order total (was "Cooler total")

### Right column
- One aggregated SKU list — what the picker pulls from the warehouse for this cooler

## Customer name / order header rules

**Boat orders** (manifest match exists, OR `source = WEBHOOK`, OR `partyType = BOAT`, OR address contains marina/FM 2769/Premier) — header is the **cruise booker on the boat manifest**:
1. `BoatSchedule.clientName` from the matched manifest entry, when available
2. Otherwise the stripped `GroupOrderV2.name` if it looks like a real person

This means Michelle McNeil's cooler is headed "Michelle McNeil" (the cruise booker on the Premier manifest), and Ramya Pokala — the payer — appears as a sub-order card beneath.

**Non-boat orders** — header is the **actual paying customer**:
1. If the dashboard host name matches one of the payers (host paid for their own group), use the host name with `+N more` for additional sub-payers
2. Otherwise use the first payer's name + `+N more`
3. Dashboard titles like "Sammi's Bach Weekend", "Phillips and Spruell Wedding", "Keynes Offsite" are detected as titles (not person names) by `looksLikeTitle` and skipped — they appear as the "Group:" sub-line beneath the header instead of as the header

**Placeholder names** ("Host", "Party Host", "Unknown", "Guest", etc.) always fall back to the payer.

## Sub-order rendering rule

Each cooler shows a sub-order card section when:
- Multiple payers exist (`Brittney Mosbrucker +5 more` → 6 cards), OR
- Single payer whose name differs from the cooler header (Michelle McNeil's cooler, paid by Ramya Pokala → 1 card)

Single-payer coolers where header == payer (e.g. Sherie Tester, Samantha Strahl) skip the sub-order section and just show a contact line — the cooler contents already represent the whole order.

Sub-order cards show: payer name with "Paid by" prefix · the payer's total in blue · contact · the items they specifically paid for.

## What's filtered OUT

- Unpaid dashboard drafts (`SubOrder` with `DraftCartItem`s but no payment) — they're chase candidates, not delivery work
- Pending invoices (`DraftOrder.status = PENDING / VIEWED`) — not paid yet
- Converted invoices (`DraftOrder.status = CONVERTED`) — the corresponding paid `Order` already appears in the list, so including both would double-count

If the operator wants a separate "to-chase" sheet, run `node scripts/ops/upcoming-orders.mjs 7` and curate from there.

## Cooler grouping rule

`GroupOrderV2.shareCode` + `deliveryDate` + `deliveryTime` ⇒ ONE cooler card with all sub-payments merged. Items are aggregated across sub-payers in the right column; the per-payer breakdown is rendered as visible cards in the left column. Solo (non-group) orders become single-payer coolers.

So Brittney Mosbrucker's 6 sub-payers landing at the same Premier slot render as a single cooler with 6 sub-order cards — not 6 separate rows the picker has to mentally fuse.

## Type tag classification

Priority order:
1. **Manifest sheet tab** — if the cooler has a `BoatSchedule` match, the `sheetTab` value wins:
   - `DSC*` → `DISCO CRUISE` (orange)
   - `PVT*` → `PRIVATE CRUISE` (teal)
2. **Dashboard source** (`GroupOrderV2.source`):
   - `WEBHOOK` → `Disco · Premier` (orange)
   - `PARTNER_PAGE` → `Partner page` (blue)
3. **Party type** (`GroupOrderV2.partyType`):
   - `BOAT` → `Group · Boat` (cyan)
   - `BACH` / `BACHELOR` / `BACHELORETTE` → `Group · Bach`
   - `WEDDING` / `HOUSE_PARTY` / `CORPORATE` → `Group · Wedding/House/Corp`
4. **Solo** — non-group orders → `Private` (dark gray with gold text)

The label line at the top of each cooler shortens these to one word: `DISCO`, `PRIVATE`, `BACH`, `WEDDING`, `HOUSE`, `CORP`, `BOAT`, `GROUP`.

## Print behavior

- Days do NOT force page breaks — pages fill completely; days flow continuously
- Cooler cards have `break-inside: avoid` so no order is split across pages
- Sub-order cards have `break-inside: avoid` so no sub-order is split
- Day headers have `break-after: avoid` so a header never dangles alone at the bottom

## CLI

Load env vars first: `set -a && source .env.local && set +a`

| Action | Command |
|---|---|
| Default 7-day window from today | `node scripts/ops/weekly-summary.mjs` |
| From a specific date | `node scripts/ops/weekly-summary.mjs 2026-05-04` |
| Custom span | `node scripts/ops/weekly-summary.mjs 2026-05-04 --days=10` |
| Custom output path | `node scripts/ops/weekly-summary.mjs --out=/tmp/may.html` |

The script writes the HTML and prints the path on stdout. Stderr carries summary stats: cooler count, sub-payments, revenue, disco/group/private counts, very-large count, manifest matched/missing.

## Workflow

When the operator asks for a "weekly summary", "weekly checklist", "print the week", "delivery sheet for next week", or anything semantically equivalent:

1. Run `weekly-summary.mjs` with whatever start-date the operator gave (default today, America/Chicago).
2. After the file is written, `open` it in the default browser so they can preview before printing.
3. Surface the stderr stats in chat: total coolers, revenue, count of disco/group/private, count of boat-manifest mismatches.
4. **Always** call out any `Missing on manifest` count explicitly — those are boat-ish orders that don't match an entry in `BoatSchedule` and need verification before the boat departs.
5. Ask whether they want to tweak the window or regenerate after they make any draft-payment chases.

## Manifest cross-reference details

- Source of truth: `BoatSchedule` Prisma model (synced nightly from the Premier Google Sheet via the boat-schedule cron).
- Authoritative date field: `cruiseDate`. Authoritative name field: `normalizedName` (with fallback to a normalize of `clientName`). Phone fallback: `normalizedPhone`.
- Match priority: name match (exact, includes either way) → phone match.
- `sheetTab` distinguishes `DSC*` (Disco shuttle) from `PVT*` (private cruise) and other tabs — this drives the cruise type tag.
- The public boat schedule UI lives at `/premier-boat-schedule` (auth-gated). The script bypasses HTTP and reads Prisma directly — no API key needed.

## Things to keep in mind

- The script uses `resolveGroupLabel` from `_group-label.mjs` for initial manifest-name resolution — never hand-roll `customerName` parsing.
- Sundays do appear in the window even though `order-logic.md` says "no Sunday deliveries" — this is because boat / wedding partners have exceptions. Don't filter Sundays out programmatically; the operator decides per-order.
- The aggregated item titles preserve whatever was stored on `OrderItem.title` at order creation. If a product was renamed in the catalog after the order was placed, the cooler will still show the old name (correct — that's what the customer ordered).
- `weekly-summary.html` is gitignored — it's a per-run artifact.

## When NOT to use this skill

- For unpaid drafts / chase work → use `/ops` and `upcoming-orders.mjs` instead
- For aggregated shopping/pick lists by SKU (what to buy from distributors) → use `/inventory plan` (purchase plan) or the existing `order-list.mjs`
- For inventory adjustments → use `/inventory`
