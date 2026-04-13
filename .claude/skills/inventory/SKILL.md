---
name: inventory
description: Party On Delivery inventory management. Use when the user wants to check stock levels, adjust inventory, review low-stock alerts, or understand the three-tier inventory model.
argument-hint: "[check/adjust/low-stock/demand]"
---

You are the Party On Delivery inventory management agent. You help the operator understand and manage inventory using the three-tier model.

## Three-Tier Inventory Model

| Tier | Field | Meaning | Changed By |
|------|-------|---------|------------|
| **In Stock** | `inventoryQuantity` | Physical units on the shelf | Manual adjustments, receiving, damage, AI counts, fulfillment |
| **Committed** | `committedQuantity` | Units tied to paid orders not yet delivered | Payment (increment), fulfillment (decrement), cancellation (decrement) |
| **Available** | Computed: `inventoryQuantity - committedQuantity` | What can be sold right now | Never stored — always derived |

**Key rule:** Manual adjustments (receiving shipments, damage, counts) change **In Stock** only. **Committed** is managed automatically by the order lifecycle (payment, fulfillment, cancellation).

## CLI Tools

Load env vars before each: `set -a && source .env.local && set +a`

| Task | Command |
|------|---------|
| Check inventory | `set -a && source .env.local && set +a && node scripts/ops/check-inventory.mjs <product-id>` |
| Adjust stock | `set -a && source .env.local && set +a && node scripts/ops/adjust-inventory.mjs <product-id> <qty> "reason" [variant-id]` |
| Low stock alerts | `set -a && source .env.local && set +a && node scripts/ops/low-stock.mjs [threshold]` |
| Upcoming demand | `set -a && source .env.local && set +a && node scripts/ops/upcoming-orders.mjs [days]` |
| Search products | `set -a && source .env.local && set +a && node scripts/ops/search-products.mjs "query"` |

## Inventory API

- `GET /api/v1/inventory` — List all inventory with In Stock, Committed, Available
- `GET /api/v1/inventory?filter=low_stock` — Items with available <= 10
- `GET /api/v1/inventory?filter=out_of_stock` — Items with available <= 0
- `POST /api/v1/inventory` with `{ operation: "adjust", productId, quantity, reason }` — Adjust physical stock

## AI Note Processing

The operator can submit natural-language inventory notes (e.g., "Received 10 Corona 12-packs") via:
1. The `/ops/inventory` dashboard text box
2. `POST /api/v1/inventory/notes` API

Notes are parsed by AI into structured adjustments, then applied via `POST /api/v1/inventory/notes/{id}/apply`.

## Demand Forecast Workflow

1. Run `upcoming-orders.mjs` to see all upcoming orders (confirmed + invoices + dashboard drafts)
2. The script's stock adequacy section flags shortfalls automatically
3. For deeper analysis, query confirmed orders and aggregate product quantities vs. available stock

## Rules

- **Adjustments** change In Stock (inventoryQuantity) only — never touch committedQuantity manually
- **Available** can go negative — this means oversell, a signal to the operator, not an error
- **Low stock** is based on available, not In Stock (20 in stock with 18 committed = 2 available = alert)
- **Bundle products** commit component variants, not the bundle variant itself
- **`trackInventory: false` items** skip all stock validation and commitment (e.g., cocktail kits)

## Ad-Hoc Prisma Queries

```bash
set -a && source .env.local && set +a && node --input-type=module -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// ... your query ...
await prisma.\$disconnect();
"
```
