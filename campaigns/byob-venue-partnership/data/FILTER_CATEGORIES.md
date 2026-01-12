# BYOB Venues Page - Filter Categories Specification

**Purpose:** Define all filterable categories for the Austin BYOB Venues page
**Goal:** Help users quickly find venues that match their event needs

---

## Primary Filters (Always Visible)

### 1. Event Type
**Question:** What type of event are you planning?

| Value | Display Label | Description |
|-------|---------------|-------------|
| `wedding` | Weddings | Ceremonies, receptions, rehearsal dinners |
| `corporate` | Corporate Events | Company parties, team building, conferences |
| `party` | Parties & Celebrations | Birthdays, anniversaries, graduations |
| `bachelor` | Bachelor/Bachelorette | Bachelor/ette parties, group outings |
| `social` | Social Gatherings | Reunions, holiday parties, casual events |

### 2. Guest Count
**Question:** How many guests are you expecting?

| Value | Display Label | Range |
|-------|---------------|-------|
| `intimate` | Intimate (Under 50) | 1-49 guests |
| `small` | Small (50-100) | 50-100 guests |
| `medium` | Medium (100-200) | 100-200 guests |
| `large` | Large (200-300) | 200-300 guests |
| `xlarge` | Extra Large (300+) | 300+ guests |

### 3. Venue Type
**Question:** What style of venue are you looking for?

| Value | Display Label | Includes |
|-------|---------------|----------|
| `barn-ranch` | Barns & Ranches | Rustic venues, farms, ranches |
| `garden-outdoor` | Gardens & Outdoor | Botanical gardens, parks, outdoor spaces |
| `historic` | Historic & Cultural | Museums, historic homes, cultural centers |
| `modern-industrial` | Modern & Industrial | Warehouses, lofts, contemporary spaces |
| `waterfront` | Waterfront & Boats | Lake venues, party boats, cruises |
| `unique` | Unique Experiences | Art studios, theaters, unconventional |

### 4. Setting
**Question:** Indoor, outdoor, or both?

| Value | Display Label |
|-------|---------------|
| `indoor` | Indoor Only |
| `outdoor` | Outdoor Only |
| `both` | Indoor & Outdoor |

---

## Secondary Filters (Collapsible/Advanced)

### 5. Price Range
**Question:** What's your venue budget?

| Value | Display Label | Typical Range |
|-------|---------------|---------------|
| `$` | Budget-Friendly | Under $2,000 |
| `$$` | Moderate | $2,000 - $5,000 |
| `$$$` | Premium | $5,000 - $10,000 |
| `$$$$` | Luxury | $10,000+ |

*Note: Display as dollar signs, hover shows range*

### 6. Location/Area
**Question:** What area of Austin?

| Value | Display Label |
|-------|---------------|
| `downtown` | Downtown Austin |
| `central` | Central Austin |
| `east` | East Austin |
| `south` | South Austin |
| `north` | North Austin |
| `west` | West Austin / Lake |
| `lake-travis` | Lake Travis |
| `dripping-springs` | Dripping Springs |
| `hill-country` | Hill Country |
| `other` | Other Areas |

### 7. Special Features
**Question:** Any must-have features?

| Value | Display Label |
|-------|---------------|
| `free-delivery` | Free Delivery Available ⭐ |
| `partner` | PartyOn Partner Venue |
| `scenic-views` | Scenic Views |
| `on-site-lodging` | On-Site Lodging |
| `catering-included` | Catering Options |
| `pet-friendly` | Pet Friendly |

---

## Partner Status Badges

### Visual Badges (Displayed on Venue Cards)

| Status | Badge | Color | Description |
|--------|-------|-------|-------------|
| Premier Partner | "FREE DELIVERY + Featured" | Gold (#D4AF37) | Top-tier partners |
| Featured Partner | "FREE DELIVERY" | Gold (#D4AF37) | Featured partners |
| Listed Partner | "Partner Venue" | Silver (#C0C0C0) | Basic partners |
| Not Partner | (no badge) | - | Listed but not partnered |

### Sort Priority
Partners always appear before non-partners within their category, sorted by tier:
1. Premier Partners (top)
2. Featured Partners
3. Listed Partners
4. Non-Partners

---

## Search Functionality

### Free Text Search
- Search venue names
- Search descriptions
- Search location/area names

### Search Examples:
- "lake travis" → Shows all Lake Travis venues
- "barn" → Shows barn venues
- "downtown" → Shows downtown venues

---

## Sort Options

| Value | Display Label | Default |
|-------|---------------|---------|
| `recommended` | Recommended | ✓ (partners first, then alphabetical) |
| `price-low` | Price: Low to High | |
| `price-high` | Price: High to Low | |
| `capacity-low` | Capacity: Small to Large | |
| `capacity-high` | Capacity: Large to Small | |
| `alphabetical` | A to Z | |

---

## Mobile Filter UX

### Mobile-Specific Behavior:
1. Filters collapsed by default
2. "Filter" button opens full-screen filter panel
3. Applied filters shown as chips below search
4. "X results" counter updates in real-time
5. "Clear All" button to reset filters

### Filter Panel Layout (Mobile):
```
[X] Close

Event Type
[ ] Weddings  [ ] Corporate  [ ] Parties
[ ] Bachelor  [ ] Social

Guest Count
[========|====] 50 - 200 guests

Venue Type
[ ] Barns & Ranches
[ ] Gardens & Outdoor
[ ] Historic & Cultural
[...more...]

Setting
( ) Indoor  ( ) Outdoor  (•) Both

[Show X Results]  [Clear All]
```

---

## Filter Logic

### AND vs OR Logic:
- **Within same category:** OR (selecting "Weddings" AND "Corporate" shows venues that support EITHER)
- **Between categories:** AND (selecting "Weddings" AND "100-200 guests" shows venues that support BOTH)

### Example Query:
```
Event Type: Wedding OR Corporate
AND Guest Count: 100-200
AND Setting: Outdoor
AND Price: $$ OR $$$
```

---

## URL Parameters

Filters should update URL for shareability:

```
/austin-byob-venues?
  type=wedding,corporate
  &guests=100-200
  &venue=barn-ranch,garden
  &setting=outdoor
  &price=2,3
  &area=south,dripping-springs
  &features=free-delivery
  &sort=recommended
```

---

## Default View

When page loads with no filters:
1. Show all venues
2. Sort by "Recommended" (partners first)
3. Display Partner venues prominently at top
4. Show total count: "73 BYOB Venues in Austin"

---

## Data Requirements for Each Venue

To support all filters, each venue in the database needs:

```typescript
interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string;

  // Categorization
  venueType: VenueType;
  eventTypes: EventType[];
  setting: 'indoor' | 'outdoor' | 'both';

  // Capacity & Pricing
  capacityMin: number;
  capacityMax: number;
  priceRange: 1 | 2 | 3 | 4; // $ to $$$$

  // Location
  area: LocationArea;
  address: string;
  coordinates?: { lat: number; lng: number };

  // Partnership
  partnerStatus: 'premier' | 'featured' | 'listed' | 'none';
  freeDelivery: boolean;

  // Content
  images: string[];
  website: string;
  byobPolicy: string;

  // Features
  features: Feature[];
}
```

---

## SEO Considerations

### URL Structure for Filtered Views:
- `/austin-byob-venues` - Main page
- `/austin-byob-wedding-venues` - Pre-filtered for weddings
- `/austin-byob-venues/barns-ranches` - Category page
- `/austin-byob-venues/lake-travis` - Location page

### Meta Titles by Filter:
- Default: "73 BYOB Venues in Austin, TX | Party On Delivery"
- Wedding: "Austin BYOB Wedding Venues | Bring Your Own Alcohol"
- Lake: "Lake Travis BYOB Venues & Party Boats | Austin TX"

---

## Implementation Notes

1. **Server-side filtering** for initial load (SEO)
2. **Client-side filtering** for interactive updates
3. **Debounce** search input (300ms)
4. **Persist filters** in URL for back button support
5. **Analytics** - Track which filters are most used
