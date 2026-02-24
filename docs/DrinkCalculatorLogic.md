# Drink Calculator Logic

This document governs all drink recommendation calculations used by the quiz (`/order`) and the Get Recommendations modal on the dashboard. The code implementation lives in `src/lib/drinkPlannerLogic.ts`.

---

## Core Formula

```
totalDrinks = ceil(guests × hours × drinksPerHour)
```

Then adjusted by:
- **Reduction factor** (if cocktails/wine selected)
- **Premium multiplier** (1.25× if premium tier)

---

## Drinks Per Person Per Hour

Rates vary by event type and drinking vibe (light / social / party):

| Event Type     | Light | Social | Party |
|----------------|-------|--------|-------|
| Bachelor       | 1.50  | 2.00   | 2.50  |
| Bachelorette   | 1.25  | 1.75   | 2.00  |
| House Party    | 1.25  | 1.75   | 2.25  |
| Corporate      | 1.00  | 1.50   | 1.75  |
| Wedding        | 1.00  | 1.50   | 2.00  |
| Boat Day       | 1.50  | 2.00   | 2.50  |
| Weekend Trip   | 1.25  | 1.75   | 2.25  |
| Other          | 1.25  | 1.75   | 2.00  |

---

## Duration Mapping

| Duration   | Hours |
|------------|-------|
| 2h         | 2     |
| 3h         | 3     |
| 4h         | 4     |
| 5h         | 5     |
| 6h         | 6     |
| multi-day  | 16    |

---

## Reduction Factors

When guests select cocktails and/or wine, the total beer/seltzer drink count is reduced:

| Selection                  | Factor |
|----------------------------|--------|
| Cocktails AND Wine         | 0.65   |
| Cocktails only             | 0.75   |
| Wine only                  | 0.85   |
| Neither (beer/seltzers only) | 1.00 |

---

## Category Breakdown

After computing `adjustedDrinks` (totalDrinks × reductionFactor), drinks are split evenly among the selected "main" categories (beer and/or seltzers). Wine, champagne, cocktails, and ice use separate formulas.

### Beer

Split 50/50 between two brands, rounded up to 24-pack sizes:

| Product          | Share | Pack Size | Search Query       |
|------------------|-------|-----------|--------------------|
| Miller Lite 24pk | 50%   | 24-pack   | "Miller Lite 24"   |
| Modelo 24pk      | 50%   | 24-pack   | "Modelo Especial 24" |

### Seltzers

Split across three brands, rounded up to 12-pack sizes:

| Product            | Share | Pack Size | Search Query    |
|--------------------|-------|-----------|-----------------|
| High Noon Variety  | 40%   | 12-pack   | "High Noon"     |
| Ranch Water        | 30%   | 12-pack   | "Ranch Water"   |
| White Claw Variety | 30%   | 12-pack   | "White Claw"    |

### Wine

Formula: `servings = ceil(guests × 0.30 × premiumMultiplier)`, then `bottles = ceil(servings / 5)`

Split evenly between:

| Product                 | Search Query             |
|-------------------------|--------------------------|
| Dark Horse Pinot Grigio | "Dark Horse Pinot Grigio"|
| Jam Cellars Chardonnay  | "Jam Cellars"            |

### Champagne

Formula: `servings = ceil(guests × 0.25 × premiumMultiplier)`, then `bottles = ceil(servings / 5)`

Split evenly between:

| Product           | Search Query |
|-------------------|--------------|
| La Marca Prosecco | "La Marca"   |
| Wycliff Brut Rose | "Wycliff"    |

### Cocktail Kits

Formula: `kitsPerCocktail = max(1, ceil(guests / 15 × premiumMultiplier))`

If user selected specific cocktails, use those. Otherwise use defaults by event type:

| Event Type              | Default Cocktails                    |
|-------------------------|--------------------------------------|
| Bachelor / Boat Day     | Austin Rita, Old-Fashioned           |
| Bachelorette            | Aperol Spritz, Espresso Martini      |
| Wedding                 | Austin Rita, Aperol Spritz           |
| Corporate               | Old-Fashioned, Austin Rita           |
| All others              | Austin Rita, Tito's Lemonade         |

Available cocktail kits:

| ID               | Display Name                      | Search Query        |
|------------------|-----------------------------------|---------------------|
| austin-rita      | The Classic Austin Rita           | "Austin Rita"       |
| titos-lemonade   | Tito's Lemonade Kit               | "Tito's Lemonade"   |
| rum-punch        | Rum Punch Kit                     | "Rum Punch"         |
| old-fashioned    | The Hill Country Old-Fashioned    | "Old-Fashioned"     |
| aperol-spritz    | Aperol Spritz Kit                 | "Aperol Spritz"     |
| espresso-martini | Espresso Martini Kit              | "Espresso Martini"  |
| margarita        | Margarita Kit                     | "Margarita"         |

### Ice

Formula: `bags = ceil(guests / 4 × premiumMultiplier)`

### Extras — Water

If "NA/Water" extra selected: `packs = ceil(guests / 12)`

| Product                | Search Query          |
|------------------------|-----------------------|
| Topo Chico Mineral Water | "Topo Chico Mineral"|

---

## Pack Size Rounding

All beer/seltzer quantities are rounded UP to the nearest full pack:

```
roundToPackSize(qty, packSize) = max(packSize, ceil(qty / packSize) × packSize)
```

This ensures at least 1 full pack is always recommended.

---

## Estimated Prices (for cost display only)

| Product                      | Price   |
|------------------------------|---------|
| Miller Lite 24pk             | $29.99  |
| Modelo 24pk                  | $34.99  |
| Austin Beerworks             | $12.99  |
| High Noon Variety            | $24.99  |
| Ranch Water                  | $19.99  |
| White Claw Variety           | $19.99  |
| Dark Horse Pinot Grigio      | $12.99  |
| Jam Cellars Chardonnay       | $14.99  |
| La Marca Prosecco            | $16.99  |
| Wycliff Brut Rose            | $9.99   |
| Andre Brut                   | $8.99   |
| The Classic Austin Rita      | $49.99  |
| Tito's Lemonade Kit          | $44.99  |
| Rum Punch Kit                | $44.99  |
| The Hill Country Old-Fashioned | $54.99 |
| Aperol Spritz Kit            | $49.99  |
| Espresso Martini Kit         | $54.99  |
| Margarita Kit                | $44.99  |
| Ice Bags                     | $4.99   |
| Topo Chico Mineral Water     | $14.99  |
| Liquid Death                 | $14.99  |

---

## Guest Count Slider

Non-linear scale used in both the quiz and Get Recs modal:

- **5–20**: increments of 1
- **25–100**: increments of 5
- **110–200**: increments of 10

For boat-day and weekend-trip events, max is capped at **50**.

---

## Where This Logic Is Used

| Location | File |
|----------|------|
| Drink Planner Quiz | `src/components/drink-planner/DrinkPlannerQuiz.tsx` |
| Get Recs Modal (Dashboard) | `src/components/dashboard/GetRecsModal.tsx` |
| Recommendations API | `src/app/api/v2/group-orders/[code]/recommendations/route.ts` |
| Code implementation | `src/lib/drinkPlannerLogic.ts` |
| Type definitions | `src/lib/drinkPlannerTypes.ts` |
