/**
 * Business rules knowledge base for the ops agent.
 * Inlined as a string constant so it works on Vercel serverless
 * (readFileSync cannot access src/ files at runtime).
 */
export const ORDER_LOGIC = `# Party On Delivery -- Business Rules Knowledge Base

This document defines the business rules for Party On Delivery, an alcohol and party supply delivery service in the Austin, TX area. Use these rules when answering questions about orders, pricing, delivery, and recommendations.


## Delivery Zones and Fees

Three delivery zones based on zip code, plus a catch-all for out-of-area orders.

### Central Austin
- Base fee: $25
- Express fee: $40
- Minimum order: $100
- Free delivery threshold: $250
- Zip codes: 78701, 78702, 78703, 78704, 78705, 78751, 78752, 78756, 78757

### Greater Austin
- Base fee: $30
- Express fee: $50
- Minimum order: $125
- Free delivery threshold: $300
- Zip codes: 78617, 78652, 78653, 78660, 78664, 78681, 78717, 78719, 78721, 78722, 78723, 78724, 78725, 78727, 78728, 78729, 78731, 78732, 78733, 78734, 78735, 78736, 78737, 78738, 78739, 78741, 78744, 78745, 78746, 78747, 78748, 78749, 78750, 78753, 78754, 78758, 78759

### Extended Austin
- Base fee: $40
- Express fee: $65
- Minimum order: $150
- Free delivery threshold: $400
- Zip codes: 78613, 78620, 78626, 78628, 78633, 78641, 78642, 78665, 78669, 78676, 78726

### Outside Service Area
- Orders from zip codes not in any zone are accepted and handled manually (no zip restriction enforced).
- No automatic fee calculation for out-of-area orders.

### Free Delivery Rules
- Free delivery applies when subtotal >= zone threshold AND delivery is NOT express.
- Express deliveries always pay the express fee regardless of subtotal.
- Active affiliate codes also grant free delivery.


## Sales Tax

- Rate: 8.25% (6.25% state + 2.00% local) for all Austin-area zip codes.
- All zip codes in the delivery area use the same 8.25% rate.
- Tax is applied AFTER discounts: taxableAmount = max(0, subtotal - discountAmount)
- Calculation: taxAmount = taxableAmount * 0.0825
- Rounding: Math.round(taxAmount * 100) / 100
- Texas does NOT have a separate alcohol sales tax for off-premise sales. The standard sales tax applies.


## Order Total Formula

For admin-created draft orders (invoices):
total = subtotal - discountAmount + taxAmount + deliveryFee

For participant checkout (group order dashboard):
total = subtotal + taxAmount - discountAmount + tipAmount
Delivery fee is invoiced separately to the host via a DeliveryInvoice, not included in participant checkout totals.


## Delivery Scheduling

- No Sunday deliveries. If a calculated date falls on Sunday, move to Monday.
- Order deadline: delivery time minus 4 hours. Orders/edits are locked after the deadline.
- Default delivery time window: "12:00 PM - 2:00 PM"
- Default delivery date: 7 days from order creation (skip Sundays).
- All delivery dates are normalized to noon UTC (setUTCHours(12, 0, 0, 0)) to avoid timezone boundary issues.
- Order expiration: 30 days from creation by default.


## Discount and Promo Codes

### Discount Types
- PERCENTAGE -- percentage off eligible items (e.g., 10% off)
- FIXED_AMOUNT -- flat dollar amount off (capped at eligible subtotal)
- FREE_SHIPPING -- waives delivery fee (discount amount = $0, handled separately)
- BUY_X_GET_Y -- buy X items, get Y free (cheapest items discounted)

### Combination Rules
- Maximum 3 discount codes per order.
- All combined codes must have combinable: true in the database.
- If any applied code is non-combinable, no additional codes can be added.

### Validation Checks
1. Code exists and isActive is true
2. Current date is between startsAt and expiresAt
3. Usage count has not reached maxUsageCount
4. Per-customer usage has not reached usagePerCustomer
5. Order subtotal meets minOrderAmount
6. Total item quantity meets minQuantity (if set)

### Automatic Discounts
- Triggered by cart conditions: cart total, product count, first order, or specific product presence.
- Applied automatically without a code.
- Higher-priority discounts apply first; non-stackable discounts block subsequent ones.

### Affiliate Codes
- Affiliate referral codes grant free delivery when active.
- Validated against the Affiliate table (field: code).
- Applied promos persist in localStorage keyed by the order's shareCode.


## Drink Recommendations

### Drinks Per Person Per Hour

Base rates by event type and vibe level (light / social / party):

| Event Type    | Light | Social | Party |
|---------------|-------|--------|-------|
| Bachelor      | 1.5   | 2.0    | 2.5   |
| Bachelorette  | 1.25  | 1.75   | 2.0   |
| House Party   | 1.25  | 1.75   | 2.25  |
| Corporate     | 1.0   | 1.5    | 1.75  |
| Wedding       | 1.0   | 1.5    | 2.0   |
| Boat Day      | 1.5   | 2.0    | 2.5   |
| Weekend Trip  | 1.25  | 1.75   | 2.25  |
| Other         | 1.25  | 1.75   | 2.0   |

### Duration Options
- 2h, 3h, 4h, 5h, 6h = literal hours
- multi-day = 16 hours

### Formula
totalDrinks = ceil(guests * hours * rate)

### Adjustments
- If cocktail kits AND wine/champagne selected: multiply by 0.65
- If cocktail kits only: multiply by 0.75
- If wine/champagne only: multiply by 0.85
- Premium tier: multiply quantities by 1.25

### Ice
- 1 bag per 4 guests (rounded up), multiplied by premium factor if applicable.

### Guest Count Ranges
- Boat Day / Weekend Trip: 5 to 50 guests
- All other events: 5 to 200 guests

### Default Cocktail Kits by Event Type
- Bachelor / Boat Day: Austin Rita, Old-Fashioned
- Bachelorette: Aperol Spritz, Espresso Martini
- Wedding: Austin Rita, Aperol Spritz
- Corporate: Old-Fashioned, Austin Rita
- All others: Austin Rita, Tito's Lemonade


## Party Type to Product Categories

Each party type shows a curated set of product category tabs on the order dashboard.

### BOAT
boatEssentials, seltzers, lightBeer, cocktailKits, spirits, craftBeer, sparkling, whiteWine, mixers, partySupplies

### BACH / BACHELOR / BACHELORETTE
bacheloretteFavs, bachelorFavs, seltzers, lightBeer, cocktailKits, craftBeer, spirits, sparkling, whiteWine, redWine, mixers, partySupplies, chillSupplies

### HOUSE_PARTY / OTHER (default)
seltzers, lightBeer, craftBeer, cocktailKits, sparkling, whiteWine, redWine, tequila, vodka, whiskey, rum, gin, liqueurs, mixers, kegs, partySupplies, chillSupplies, rentals

### CORPORATE / WEDDING
lightBeer, craftBeer, redWine, whiteWine, sparkling, seltzers, eventSupplies, mixers, tequila, vodka, whiskey, rum, gin, liqueurs, kegs

Note: Batched Cocktails category exists but is NOT shown in any party type (not ready to sell).


## Draft Order Item Structure

Each item in a DraftOrder's items JSON array:
{
  productId: string,    // UUID from Product table
  variantId: string,    // UUID from Variant table
  title: string,        // Product display name
  variantTitle: string,  // Variant label (e.g., "750ml", "12-Pack")
  quantity: number,
  price: number,        // Per-unit price as decimal (e.g., 29.99)
  imageUrl?: string     // URL to product image (from product.images[0].url)
}

## Customer Info Required for Draft Order

| Field           | Required | Default | Notes                                |
|-----------------|----------|---------|--------------------------------------|
| customerEmail   | Yes      | --      | Receives invoice/payment link        |
| customerName    | Yes      | --      | Displayed on invoice                 |
| customerPhone   | No       | null    | Optional contact number              |
| deliveryAddress | Yes      | --      | Street address                       |
| deliveryCity    | Yes      | --      | City name                            |
| deliveryState   | No       | "TX"    | State abbreviation                   |
| deliveryZip     | Yes      | --      | 5-digit zip code                     |
| deliveryDate    | Yes      | --      | DateTime, normalized to noon UTC     |
| deliveryTime    | Yes      | --      | String, e.g., "12:00 PM - 2:00 PM"  |
| deliveryNotes   | No       | null    | Special instructions (text field)    |

### Financial Fields on DraftOrder
| Field               | Type         | Notes                                    |
|---------------------|--------------|------------------------------------------|
| subtotal            | Decimal(10,2)| Sum of (price * quantity) for all items   |
| taxAmount           | Decimal(10,2)| Calculated at 8.25% of taxable amount    |
| deliveryFee         | Decimal(10,2)| Based on zip code zone                   |
| originalDeliveryFee | Decimal(10,2)| Original fee before discounts (nullable) |
| discountAmount      | Decimal(10,2)| Total discount applied (default 0)       |
| discountCode        | String       | Applied promo code (nullable)            |
| total               | Decimal(10,2)| subtotal - discountAmount + taxAmount + deliveryFee |
`;
