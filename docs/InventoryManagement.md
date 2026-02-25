# Inventory Management & Product Taxonomy

> Authoritative reference for how products are categorized in the PartyOn2 catalog.

## Canonical `productType` Values

Every product in the database has a `productType` field set to one of these 20 canonical values:

| productType | Description | Example Products |
|---|---|---|
| Light Beer | Domestic/mass-market beer (Bud, Miller, Coors, Michelob, Corona, Modelo, etc.) | Bud Light 12pk, Michelob Ultra, Corona Extra |
| Craft Beer | Independent/craft/import beer (IPAs, stouts, ales, lagers from small breweries) | Austin Beerworks, Shiner Bock, Blue Moon |
| Seltzer | Hard seltzers | White Claw, Truly, High Noon |
| RTD Cocktail | Ready-to-drink canned cocktails and flavored malt beverages | Ranch Water, Cutwater, NUTRL |
| Red Wine | Red wines (Cabernet, Merlot, Pinot Noir, Malbec, etc.) | Josh Cabernet, Apothic Red |
| White Wine | White wines (Chardonnay, Sauvignon Blanc, Pinot Grigio, Moscato, etc.) | Kendall-Jackson Chardonnay, Kim Crawford |
| Sparkling Wine | Champagne, Prosecco, sparkling wine, cava, rose | Veuve Clicquot, La Marca Prosecco |
| Tequila | All tequila products | Casamigos Blanco, Don Julio 1942 |
| Whiskey | Whiskey, bourbon, scotch, rye | Jack Daniel's, Maker's Mark, Bulleit |
| Vodka | All vodka products | Tito's, Grey Goose, Absolut |
| Rum | All rum products | Bacardi, Captain Morgan, Malibu |
| Gin | All gin products | Hendrick's, Tanqueray, Empress |
| Liqueur | Liqueurs, cordials, mezcal, cognac, absinthe, brandy | Kahlua, Baileys, Grand Marnier, Hennessy |
| Cocktail Kit | Pre-assembled cocktail kits with spirits + mixers + garnishes | Austin Rita Kit, Espresso Martini Kit |
| Mixer | Non-alcoholic mixers, sodas, juices, water, ice, bitters, syrups, garnishes | Topo Chico, OJ, Simple Syrup, Angostura |
| Weekend Supply | Casual party supplies: pool toys, games, cups, drinkware, decorations, hats, sunglasses, electronics, cocktail bars | Solo cups, pool floats, LED projectors |
| Keg | Kegs and keg equipment | Bud Light Keg, Keg Tap Rental |
| Chill Supply | THC drinks, edibles, nicotine, vapes, CBD products | DANKK THC Shots, Zyn, Cantrip Seltzer |
| Food | Prepared food, wraps, subs, salads, snacks, dips | Grilled Chicken Wrap, Chips and Salsa |
| Rental | Equipment rentals: chairs, tables, coolers, glassware, games | Outdoor Chair Rental, 120qt Cooler Rental |

## Collection Taxonomy (Category Table)

Collections group products for browsing on the dashboard and storefront.
Products within each collection are sorted by sales rank (position = 1 is best seller).
Dashboard displays up to 48 products per category; products ranked 49+ remain in DB but are hidden.

### Primary Collections (ordered by sales priority)

| # | Handle | Title | Parent | Maps to productType(s) |
|---|---|---|---|---|
| 1 | `seltzers-rtds` | Seltzers & RTDs | -- | Seltzer, RTD Cocktail |
| 2 | `light-beer` | Light Beer | -- | Light Beer |
| 3 | `craft-beer` | Craft Beer | -- | Craft Beer |
| 4 | `spirits-tequila` | Tequila | spirits | Tequila |
| 5 | `spirits-vodka` | Vodka | spirits | Vodka |
| 6 | `spirits-whiskey` | Whiskey & Bourbon | spirits | Whiskey |
| 7 | `spirits-rum` | Rum | spirits | Rum |
| 8 | `spirits-gin` | Gin | spirits | Gin |
| 9 | `spirits-liqueurs` | Liqueurs | spirits | Liqueur |
| 10 | `sparkling-wine` | Sparkling & Rose | -- | Sparkling Wine |
| 11 | `white-wine` | White Wine | -- | White Wine |
| 12 | `red-wine` | Red Wine | -- | Red Wine |
| 13 | `mixers` | Mixers | -- | Mixer |
| 14 | `cocktail-kits` | Cocktail Kits | -- | Cocktail Kit |
| 15 | `kegs` | Kegs & Equipment | -- | Keg |
| 16 | `weekend-party-supplies` | Weekend Party Supplies | -- | Weekend Supply |
| 17 | `chill-supplies` | Chill Supplies | -- | Chill Supply |
| 18 | `food` | Food | -- | Food |
| 19 | `rentals` | Rentals | -- | Rental |
| -- | `spirits` | Spirits | -- | (parent for spirit sub-collections) |

### Occasion/Curated Collections (Secondary)

| Handle | Title | Notes |
|---|---|---|
| `favorites-home-page` | Austin's Favorites | Hand-curated homepage feature |
| `bachelor-favorites` | Bachelor Favorites | Curated for bachelor parties |
| `bachelorette-booze` | Bachelorette Favorites | Curated for bachelorette parties |
| `welcome-to-austin-packages` | Welcome Packages | Welcome bags for visitors |
| `boat-essentials` | Boat Essentials | Curated for boat/lake parties |

## Assignment Rules

1. **Every product** must have a non-empty `productType` from the canonical list above.
2. **Every product** must belong to at least one primary collection via `product_categories`.
3. Spirit products (Tequila, Whiskey, Vodka, Rum, Gin, Liqueur) belong to BOTH `spirits` parent AND their specific sub-collection.
4. Products may additionally belong to secondary/occasion collections.
5. The `productType` field is the source of truth for classification. Collections are derived from it.
6. Products are sorted within each collection by `position` (sales rank). Position 1 = best seller.

## Adding New Products

When adding a new product:

1. Set `productType` to one of the 20 canonical values above.
2. The product will automatically appear in the matching collection via the productType-to-collection mapping.
3. If the product should appear in a curated collection (favorites, bachelor, etc.), manually add it to that collection in the admin.

## Beer Classification: Light vs Craft

**Light Beer** brands (domestic/mass-market): Bud, Budweiser, Bud Light, Miller, Miller Lite, Coors, Coors Light, Michelob, Michelob Ultra, Corona, Modelo, Dos Equis, Heineken, Lone Star, Pabst, PBR, Natural Light, Natty, Busch, Keystone, Tecate, Pacifico, Victoria, Negra Modelo, Sol, Estrella.

**Craft Beer**: Everything else -- if the brand is not in the Light Beer list above, it's Craft Beer.

## Wine Classification: Red vs White vs Sparkling

**Red Wine** keywords (in title): Cabernet, Merlot, Pinot Noir, Malbec, Tempranillo, Shiraz, Syrah, Zinfandel, Red Blend, Sangiovese, Chianti, Bordeaux, Red.

**White Wine** keywords (in title): Chardonnay, Sauvignon Blanc, Pinot Grigio, Riesling, Moscato, Muscat, White Blend, Albarino, Viognier, Gewurztraminer, White.

**Sparkling Wine** keywords (in title): Champagne, Prosecco, Sparkling, Cava, Brut, Rose, Rose, Mimosa, Bellini.

Wines not matching any keyword list default to White Wine (most common for ambiguous titles).

## Config Files That Reference Collections

| File | Purpose | What it controls |
|---|---|---|
| `src/lib/dashboard/categories.ts` | Dashboard browsing tabs | Tab labels + collection handles (sales priority order) |
| `src/lib/products/categories.ts` | Storefront collection buttons + filters | SHOPIFY_COLLECTIONS, PRODUCT_CATEGORIES, FILTER_OPTIONS |
| `src/lib/product-categories.ts` | Admin /ops/products filter | Hierarchical filter sidebar |
| `src/lib/products/premier-collections.ts` | Boat/partner page tabs | Collection tabs on partner pages |
| `src/app/cocktail-kits/page.tsx` | Cocktail kits landing page | Prisma query uses productType |

## Migration History

**25 Feb 2026 (session 23) -- Sales data reorganization:**
- Reorganized all 19 categories based on Shopify sales data (693 products, sorted by units sold)
- Created 3 new categories: Chill Supplies, Food, Rentals (3 new productType values)
- Products sorted within categories by sales rank (position = 1 is best seller)
- Dashboard display capped at 48 products per category (was 60)
- 543 products matched from sales data, 131 unmatched (discontinued/renamed)
- Removed `formal-event-supplies` (0 products) and `Formal Supply` productType

**25 Feb 2026 (session 20) -- Initial normalization:**
- 93 messy productType values normalized to 17 canonical types (0 nulls)
- 16 new primary collections created and populated (1,064 products, all assigned)
- 9 retired categories deleted
