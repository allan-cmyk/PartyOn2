# Inventory Management & Product Taxonomy

> Authoritative reference for how products are categorized in the PartyOn2 catalog.

## Canonical `productType` Values

Every product in the database has a `productType` field set to one of these 18 canonical values:

| productType | Description | Example Products |
|---|---|---|
| Light Beer | Domestic/mass-market beer (Bud, Miller, Coors, Michelob, Corona, Modelo, etc.) | Bud Light 12pk, Michelob Ultra, Corona Extra |
| Craft Beer | Independent/craft/import beer (IPAs, stouts, ales, lagers from small breweries) | Austin Beerworks, Shiner Bock, Blue Moon |
| Seltzer | Hard seltzers | White Claw, Truly, High Noon |
| RTD Cocktail | Ready-to-drink canned cocktails and flavored malt beverages | Ranch Water, Cutwater, NÜTRL |
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
| Formal Supply | Elegant/formal event supplies: candles, linens, glassware, wedding items | Candles, tablecloths, champagne flutes |
| Keg | Kegs and keg equipment | Bud Light Keg, Keg Tap Rental |

## Collection Taxonomy (Category Table)

Collections group products for browsing on the dashboard and storefront.

### Primary Collections

| Handle | Title | Parent | Maps to productType(s) |
|---|---|---|---|
| `light-beer` | Light Beer | -- | Light Beer |
| `craft-beer` | Craft Beer | -- | Craft Beer |
| `seltzers-rtds` | Seltzers & RTDs | -- | Seltzer, RTD Cocktail |
| `red-wine` | Red Wine | -- | Red Wine |
| `white-wine` | White Wine | -- | White Wine |
| `sparkling-wine` | Sparkling & Rose | -- | Sparkling Wine |
| `spirits` | Spirits | -- | (parent for spirit sub-collections) |
| `spirits-tequila` | Tequila | spirits | Tequila |
| `spirits-whiskey` | Whiskey & Bourbon | spirits | Whiskey |
| `spirits-vodka` | Vodka | spirits | Vodka |
| `spirits-rum` | Rum | spirits | Rum |
| `spirits-gin` | Gin | spirits | Gin |
| `spirits-liqueurs` | Liqueurs | spirits | Liqueur |
| `cocktail-kits` | Cocktail Kits | -- | Cocktail Kit |
| `mixers` | Mixers | -- | Mixer |
| `weekend-party-supplies` | Weekend Party Supplies | -- | Weekend Supply |
| `formal-event-supplies` | Formal Event Supplies | -- | Formal Supply |
| `kegs` | Kegs & Equipment | -- | Keg |

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

## Adding New Products

When adding a new product:

1. Set `productType` to one of the 18 canonical values above.
2. The product will automatically appear in the matching collection via the productType-to-collection mapping.
3. If the product should appear in a curated collection (favorites, bachelor, etc.), manually add it to that collection in the admin.

## Beer Classification: Light vs Craft

**Light Beer** brands (domestic/mass-market): Bud, Budweiser, Bud Light, Miller, Miller Lite, Coors, Coors Light, Michelob, Michelob Ultra, Corona, Modelo, Dos Equis, Heineken, Lone Star, Pabst, PBR, Natural Light, Natty, Busch, Keystone, Tecate, Pacifico, Victoria, Negra Modelo, Sol, Estrella.

**Craft Beer**: Everything else -- if the brand is not in the Light Beer list above, it's Craft Beer.

## Wine Classification: Red vs White vs Sparkling

**Red Wine** keywords (in title): Cabernet, Merlot, Pinot Noir, Malbec, Tempranillo, Shiraz, Syrah, Zinfandel, Red Blend, Sangiovese, Chianti, Bordeaux, Red.

**White Wine** keywords (in title): Chardonnay, Sauvignon Blanc, Pinot Grigio, Riesling, Moscato, Muscat, White Blend, Albarino, Viognier, Gewurztraminer, White.

**Sparkling Wine** keywords (in title): Champagne, Prosecco, Sparkling, Cava, Brut, Rose, Rosé, Mimosa, Bellini.

Wines not matching any keyword list default to White Wine (most common for ambiguous titles).

## Config Files That Reference Collections

| File | Purpose | What it controls |
|---|---|---|
| `src/lib/dashboard/categories.ts` | Dashboard browsing tabs | Tab labels + collection handles |
| `src/lib/products/categories.ts` | Storefront collection buttons + filters | SHOPIFY_COLLECTIONS, PRODUCT_CATEGORIES, FILTER_OPTIONS |
| `src/lib/product-categories.ts` | Admin /ops/products filter | Hierarchical filter sidebar |
| `src/lib/products/premier-collections.ts` | Boat/partner page tabs | Collection tabs on partner pages |
| `src/app/cocktail-kits/page.tsx` | Cocktail kits landing page | Prisma query uses productType |
