# Create Draft Order

Create a draft order (invoice) for a customer or event. Use when the user asks to create an order, draft order, invoice, or quote.

## CRITICAL RULES

1. **NEVER truncate UUIDs.** Always query the DB and copy the exact `id` field from results. Never shorten, guess, or reconstruct a UUID.
2. **ALWAYS include imageUrl** from `product.images[0].url` via the Prisma include.
3. **ALWAYS validate products exist** -- if `findMany` returns empty, tell the user instead of guessing.
4. **NEVER send invoices or emails.** Only create/update the draft order in the DB. The admin sends invoices manually from `/ops/orders`.
5. **Output product query results as JSON** -- use `JSON.stringify()` to avoid console table truncation.

## Workflow

### Step 1: Gather Requirements

Collect from the user (ask for anything missing):

- **Customer**: name, email, phone (or "placeholder" if unknown)
- **Delivery address**: street, city, zip (or "placeholder")
- **Delivery date and time**: e.g. "2026-02-22 at 2:00 PM"
- **Delivery fee**: default $25 unless specified
- **Discount**: amount and/or code if applicable (default $0)
- **Admin notes**: any special instructions
- **Products**: descriptions and quantities (e.g. "3 cases of Modelo, 2 cases of White Claw, 1 bag of ice")

For placeholder customer info, use:
- Email: `placeholder@partyondelivery.com`
- Name: `TBD - <event description>`
- Phone: leave null

### Step 2: Product Lookup

For each requested product, run a Prisma query via the project's Node.js/Prisma setup:

```bash
cd /home/allan/projects/PartyOn2 && set -a && source .env.local && set +a && npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      title: { contains: '<SEARCH_TERM>', mode: 'insensitive' }
    },
    include: {
      variants: true,
      images: { take: 1, orderBy: { position: 'asc' } }
    }
  });
  console.log(JSON.stringify(products.map(p => ({
    id: p.id,
    title: p.title,
    variants: p.variants.map(v => ({
      id: v.id,
      title: v.title,
      price: Number(v.price),
      sku: v.sku
    })),
    imageUrl: p.images[0]?.url || null
  })), null, 2));
  await prisma.\$disconnect();
})();
"
```

**Rules for product lookup:**
- Search broadly first (e.g. "modelo" not "modelo especial 24 pack")
- If multiple matches, present them to the user and ask which one
- If no match, tell the user and ask for clarification
- Store the **complete** `id`, `variant.id`, `variant.price`, and `images[0].url` from results
- NEVER modify or truncate any UUID

**Default product picks** (use these when no specific brand is requested):
- **White wine**: Dark Horse Pinot Grigio 750ml ($11.99)
- **Red wine**: 14 Hands Cabernet Sauvignon 750ml ($13.99)

### Step 3: Build Items Array

For each confirmed product, construct an item object:

```json
{
  "productId": "<full product UUID from DB query>",
  "variantId": "<full variant UUID from DB query>",
  "title": "<product title -- clean up bullet chars>",
  "variantTitle": "<variant title or size info>",
  "quantity": <number>,
  "price": <number from variant.price>,
  "imageUrl": "<full image URL from product.images[0].url>"
}
```

### Step 4: Calculate Totals

Use the same formula as `calculateDraftOrderAmounts` in `src/lib/draft-orders/service.ts`:

```
subtotal     = sum of (price * quantity) for all items
taxableAmount = max(0, subtotal - discountAmount)
taxAmount    = round(taxableAmount * taxRate * 100) / 100
                 (default taxRate = 0.0825 for Austin; use getTaxRateForZip if zip is known)
total        = subtotal - discountAmount + taxAmount + deliveryFee
```

### Step 5: Present Summary

Before creating, show the user a formatted summary:

```
DRAFT ORDER SUMMARY
====================
Customer: <name> (<email>)
Delivery: <address>, <city>, TX <zip>
Date/Time: <date> at <time>

ITEMS:
| # | Product                    | Qty | Unit Price | Line Total | Image |
|---|----------------------------|-----|------------|------------|-------|
| 1 | Modelo Especial - 24 Pack  |   3 |     $29.99 |     $89.97 |  Yes  |
| 2 | White Claw Variety - 12 Pk |   2 |     $19.99 |     $39.98 |  Yes  |

Subtotal:     $129.95
Discount:       $0.00
Tax (8.25%):   $10.72
Delivery Fee:  $25.00
TOTAL:        $165.67

Notes: <admin notes>
```

Ask: "Create this draft order? (or tell me what to change)"

### Step 6: Create Draft Order

After user confirms, insert via Prisma:

```bash
cd /home/allan/projects/PartyOn2 && set -a && source .env.local && set +a && npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const order = await prisma.draftOrder.create({
    data: {
      customerEmail: '<email>',
      customerName: '<name>',
      customerPhone: '<phone or null>',
      deliveryAddress: '<address>',
      deliveryCity: '<city>',
      deliveryState: 'TX',
      deliveryZip: '<zip>',
      deliveryDate: new Date('<ISO date>'),
      deliveryTime: '<time string>',
      deliveryNotes: '<notes or null>',
      items: <JSON items array>,
      subtotal: <number>,
      taxAmount: <number>,
      deliveryFee: <number>,
      discountAmount: <number>,
      discountCode: '<code or null>',
      total: <number>,
      createdBy: 'admin',
      adminNotes: '<notes or null>',
      status: 'PENDING'
    }
  });
  console.log(JSON.stringify({
    id: order.id,
    token: order.token,
    total: Number(order.total),
    invoiceUrl: 'https://partyondelivery.com/invoice/' + order.token
  }, null, 2));
  await prisma.\$disconnect();
})();
"
```

After creation, report:
- Draft order ID
- Invoice URL: `https://partyondelivery.com/invoice/<token>`
- Remind: "Review and send the invoice from /ops/orders when ready."

### Step 7: Modifications

If the user wants to change the order after creation:

- **Swap/add products**: Re-query the DB for new products (full UUID lookup, same as Step 2)
- **Change quantities**: Update the items array
- **Adjust fees/discount**: Update the relevant amounts
- Recalculate all totals using the Step 4 formula
- Update via `prisma.draftOrder.update({ where: { id: '<order id>' }, data: { ... } })`
- Show the updated summary
