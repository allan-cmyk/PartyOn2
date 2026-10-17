# Party On Delivery -- Business Rules Knowledge Base

This document defines the business rules for Party On Delivery, an alcohol and party supply delivery service in the Austin, TX area. Use these rules when answering questions about orders, pricing, delivery, and recommendations.


## Delivery Zones and Fees

Three delivery zones based on zip code, plus a catch-all for out-of-area orders.

### Central Austin
- Base fee: $25
- Minimum order: $100
- Free delivery threshold: $250
- Zip codes: 78701, 78702, 78703, 78704, 78705, 78751, 78752, 78756, 78757

### Greater Austin
- Base fee: $30
- Minimum order: $125
- Free delivery threshold: $300
- Zip codes: 78617, 78652, 78653, 78660, 78664, 78681, 78717, 78719, 78721, 78722, 78723, 78724, 78725, 78727, 78728, 78729, 78731, 78732, 78733, 78734, 78735, 78736, 78737, 78738, 78739, 78741, 78744, 78745, 78746, 78747, 78748, 78749, 78750, 78753, 78754, 78758, 78759

### Extended Austin
- Base fee: $40
- Minimum order: $150
- Free delivery threshold: $400
- Zip codes: 78613, 78620, 78626, 78628, 78633, 78641, 78642, 78665, 78669, 78676, 78726

### Outside Service Area
- Orders from zip codes not in any zone are accepted and handled manually (no zip restriction enforced).
- No automatic fee calculation for out-of-area orders.

### Free Delivery Rules
- Free delivery applies when subtotal >= zone threshold.
- Active affiliate codes also grant free delivery.

### Rush Orders
- There is no express delivery tier or express fee.
- Customer checkouts need at least 24 hours of notice before the delivery window. Anything sooner is operator-approved only, via a hand-created draft order/invoice (the operator can adjust its delivery fee).


## Sales Tax

- Rate: 8.25% (6.25% state + 2.00% local) for all Austin-area zip codes.
- All zip codes in the delivery area use the same 8.25% rate.
- Tax is applied AFTER discounts: `taxableAmount = max(0, subtotal - discountAmount)`
- Calculation: `taxAmount = taxableAmount * 0.0825`
- Rounding: `Math.round(taxAmount * 100) / 100`
- Texas does NOT have a separate alcohol sales tax for off-premise sales. The standard sales tax applies.


## Order Total Formula

For admin-created draft orders (invoices):
```
total = subtotal - discountAmount + taxAmount + deliveryFee
```

For participant checkout (group order dashboard):
```
total = subtotal + taxAmount - discountAmount + tipAmount
```
Delivery fee is invoiced separately to the host via a DeliveryInvoice, not included in participant checkout totals.


## Delivery Scheduling

- No Sunday deliveries. If a calculated date falls on Sunday, move to Monday.
- Order deadline: delivery time minus 4 hours. Orders/edits are locked after the deadline.
- Default delivery time window: "12:00 PM - 2:00 PM"
- Default delivery date: 7 days from order creation (skip Sundays).
- All delivery dates are normalized to noon UTC (`setUTCHours(12, 0, 0, 0)`) to avoid timezone boundary issues.
- Order expiration: 30 days from creation by default.


## Discount and Promo Codes

### Discount Types
- `PERCENTAGE` -- percentage off eligible items (e.g., 10% off)
- `FIXED_AMOUNT` -- flat dollar amount off (capped at eligible subtotal)
- `FREE_SHIPPING` -- waives delivery fee (discount amount = $0, handled separately)
- `BUY_X_GET_Y` -- buy X items, get Y free (cheapest items discounted)

### Combination Rules
- Maximum 3 discount codes per order.
- All combined codes must have `combinable: true` in the database.
- If any applied code is non-combinable, no additional codes can be added.

### Validation Checks
1. Code exists and `isActive` is true
2. Current date is between `startsAt` and `expiresAt`
3. Usage count has not reached `maxUsageCount`
4. Per-customer usage has not reached `usagePerCustomer`
5. Order subtotal meets `minOrderAmount`
6. Total item quantity meets `minQuantity` (if set)

### Automatic Discounts
- Triggered by cart conditions: cart total, product count, first order, or specific product presence.
- Applied automatically without a code.
- Higher-priority discounts apply first; non-stackable discounts block subsequent ones.

### Affiliate Codes
- Affiliate referral codes grant free delivery when active.
- Validated against the `Affiliate` table (field: `code`).
- Applied promos persist in localStorage keyed by the order's `shareCode`.


## Drink Recommendations

The website drink planner engine (src/lib/drinkPlannerLogic.ts) is the single source of truth for party quantities. It also powers Wayne's chat, the dashboard recommendations and the ops drink-plan script (scripts/ops/drink-plan.ts). These rules describe it; if they ever disagree with that file, the file wins.

### Total Drinks
- Boat day, bachelor, bachelorette, weekend trip: totalDrinks = ceil(guests * hours * 2)
- Everyone else (corporate, wedding, house party, other): totalDrinks = ceil(guests * (hours + 1)) -- the +1 covers the heavier first hour
- Durations: 2h to 6h are literal hours; multi-day = 16 hours

### Category Split
- Boat/bach track: an equal split across the selected categories (default: beer, seltzers, cocktail kits).
- Event track (default: beer, wine, spirits). Base weights: spirits 50%, beer 30%, wine 15%, seltzers 5%. With cocktail kits selected: cocktail kits 35%, spirits 15%, beer 30%, wine 15%, seltzers 5%.
- The weights are rescaled over the selected categories so they add to 100%. Seltzers are always added on the event track.
- If only one category is selected on the event track, it gets 70% and the other 30% is split across complementary categories.
- Example: 130 guests, 3 hours, beer + wine = 520 drinks -> 6 Miller Lite 24pk, 6 Modelo Especial 24pk cans, 6 Austin Beerworks Variety 12pk, 16 Dark Horse Pinot Grigio, 16 14 Hands Cabernet Sauvignon, plus a small seltzer share and 13 bags of ice. Drop the seltzers if the customer asked for beer and wine only.

### Product Mix and Servings
- Beer: Miller Lite 24pk 40%, Modelo Especial 24pk cans 40%, Austin Beerworks Variety 12pk 20% (1 can = 1 serving)
- Seltzers: High Noon Variety 12pk 40%, White Claw Variety 24pk 30%, Surfside Starter Pack 30%
- Wine: Dark Horse Pinot Grigio 50%, 14 Hands Cabernet Sauvignon 50% (750ml bottle = 5 glasses)
- Spirits: Espolon Tequila Blanco 40%, Tito's 1L 30%, Still Austin Bourbon 10%, Island Getaway White Rum 10%, Dripping Springs Artisan Gin 10% (750ml = 17 drinks, 1L = 22)
- Cocktail kits: Lady Bird Margarita, Barton Springs Mojito, Eastside Gin & Tonic, split evenly (16 drinks per kit, at least 1 of each)
- Every product quantity is rounded UP to whole units.
- Use these house brands. Only swap brands when the customer asks for something specific.

### Ice
- 1 bag per 10 guests (rounded up), always. Leave it off if a bar partner is bringing ice.

### Guest Count Ranges (website planner)
- Boat Day / Weekend Trip: 5 to 50 guests
- All other events: 5 to 200 guests


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

Each item in a DraftOrder's `items` JSON array:
```
{
  productId: string,    // UUID from Product table
  variantId: string,    // UUID from Variant table
  title: string,        // Product display name
  variantTitle: string,  // Variant label (e.g., "750ml", "12-Pack")
  quantity: number,
  price: number,        // Per-unit price as decimal (e.g., 29.99)
  imageUrl?: string     // URL to product image (from product.images[0].url)
}
```

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
