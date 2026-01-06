# Vendor Duplication Strategy

> **STATUS**: Saved for later implementation
> **Created**: January 3, 2026
> **Related Session Summary**: `.claude/session-summary-quick-order.md`

---

# Multi-Vendor Quick-Order Page

## Overview
Make the quick-order page reusable for different vendors, each with their own branding and featured collections.

## Requirements (from user)
- **Same Shopify store** - All vendors pull from the same store, just different collections
- **Path-based URLs** - `/quick-order/[vendor-name]` pattern
- **Collections + branding** - Customize collections, hero image, title, and color scheme per vendor

## Current Implementation Reference
The following values are currently hardcoded in `src/app/quick-order/page.tsx` and need to be extracted into vendor configs:

### Hero Section (lines 104-125)
```typescript
// Image
src="/images/products/premium-spirits-wall.webp"
alt="Premium Spirits Collection"

// Title & Subtitle
<h1>Premium Spirits & Party Essentials</h1>
<p>For whatever you're planning<br/>Find something everyone will enjoy</p>
```

### Default Collection (line 22)
```typescript
const [activeCollection, setActiveCollection] = useState('favorites-home-page');
```

### Collections Source (line 15)
```typescript
import { SHOPIFY_COLLECTIONS } from '@/lib/shopify/categories';
// Currently uses shared SHOPIFY_COLLECTIONS - vendors would need their own subset
```

### Theme Colors (currently hardcoded throughout)
- Primary: `green-600`, `green-700` (buttons, add-to-cart)
- Gold accent: `gold-400`, `gold-600` (dividers, links)
- Background: `gray-50` (collections bar)

### Files That Need Theme Props
1. `CartSummaryBar.tsx` - currently uses `bg-green-600` hardcoded
2. `QuickProductCard.tsx` - uses `bg-green-500` for add button
3. `QuantityStepper.tsx` - neutral colors (may not need changes)

---

## Architecture

### URL Structure
```
/quick-order/                    → Redirect to /quick-order/party-on (default)
/quick-order/party-on/           → PartyOn default experience
/quick-order/acme-liquors/       → Partner vendor experience
```

### File Structure
```
src/
├── app/quick-order/
│   ├── page.tsx                 → Redirect to default vendor
│   └── [vendor]/
│       └── page.tsx             → Dynamic vendor page (server component)
├── components/quick-order/
│   ├── QuickOrderClient.tsx     → Main client component (refactored from page.tsx)
│   └── ... (existing components unchanged)
└── lib/vendor-config/
    ├── types.ts                 → VendorConfig TypeScript interface
    ├── schema.ts                → Zod validation schema
    ├── index.ts                 → getVendorConfig() loader function
    └── vendors/
        ├── party-on.ts          → Default PartyOn config
        └── [partner].ts         → Additional vendor configs
```

## Vendor Config Schema

```typescript
// src/lib/vendor-config/types.ts
export interface VendorConfig {
  vendorId: string;
  vendorName: string;

  // Hero section
  hero: {
    image: string;
    title: string;
    subtitle: string;
  };

  // Collections to display
  collections: Array<{
    handle: string;           // Shopify collection handle
    label: string;            // Display label
    colors: {
      bg: string;
      bgActive: string;
      text: string;
      textActive: string;
      border: string;
      borderActive: string;
    };
  }>;

  defaultCollection: string;  // Default active collection handle

  // Branding colors (Tailwind classes)
  theme: {
    primaryColor: string;     // e.g., 'green-600'
    primaryHover: string;     // e.g., 'green-700'
    accentColor: string;      // e.g., 'gold-400'
  };
}
```

## Files to Create

### 1. `src/lib/vendor-config/types.ts`
TypeScript interface for VendorConfig (as shown above)

### 2. `src/lib/vendor-config/schema.ts`
Zod schema for validation

### 3. `src/lib/vendor-config/index.ts`
```typescript
export function getVendorConfig(vendorId: string): VendorConfig | null
export function getAllVendorIds(): string[]
```

### 4. `src/lib/vendor-config/vendors/party-on.ts`
Extract current hardcoded values from quick-order page:
- Hero image: `/images/products/premium-spirits-wall.webp`
- Title: "Premium Spirits & Party Essentials"
- Subtitle: "For whatever you're planning..."
- Collections: Copy from `SHOPIFY_COLLECTIONS` in `src/lib/shopify/categories.ts`
- Default collection: `favorites-home-page`
- Theme: green-600/green-700, gold-400

### 5. `src/app/quick-order/page.tsx` (modify)
Simple redirect to `/quick-order/party-on`

### 6. `src/app/quick-order/[vendor]/page.tsx`
Server component that:
- Loads vendor config
- Returns 404 if vendor not found
- Passes config to QuickOrderClient

### 7. `src/components/quick-order/QuickOrderClient.tsx`
Refactor current `page.tsx` logic into client component that accepts `config: VendorConfig` prop

## Files to Modify

### `src/components/quick-order/CartSummaryBar.tsx`
- Accept optional theme colors from config
- Default to current green if not provided

### `src/components/ClientLayoutWrapper.tsx`
- Currently: `HIDE_MOBILE_NAV_PATHS = ['/quick-order']` (exact match)
- Update to pattern matching: `pathname.startsWith('/quick-order')` to support `/quick-order/[vendor]`

## Implementation Steps

1. **Create vendor config types and schema**
   - `src/lib/vendor-config/types.ts`
   - `src/lib/vendor-config/schema.ts`

2. **Create vendor config loader**
   - `src/lib/vendor-config/index.ts`

3. **Create PartyOn default config**
   - `src/lib/vendor-config/vendors/party-on.ts`
   - Extract all hardcoded values from current page

4. **Refactor quick-order page**
   - Move logic from `page.tsx` to `QuickOrderClient.tsx`
   - Make `page.tsx` a redirect to default vendor
   - Create `[vendor]/page.tsx` dynamic route

5. **Update components to accept config**
   - Pass theme colors to CartSummaryBar
   - Use `config.collections` instead of `SHOPIFY_COLLECTIONS`

6. **Update mobile nav hiding**
   - Change path check to support `/quick-order/*` pattern

7. **Test with PartyOn config**
   - Verify existing functionality works unchanged

8. **Add sample partner config**
   - Create example vendor config for testing

## Example: Adding a New Vendor

```typescript
// src/lib/vendor-config/vendors/acme-liquors.ts
import { VendorConfig } from '../types';

const config: VendorConfig = {
  vendorId: 'acme-liquors',
  vendorName: 'Acme Liquors',

  hero: {
    image: '/images/vendors/acme-hero.webp',
    title: 'Acme Liquors Express',
    subtitle: 'Fast delivery to your door',
  },

  collections: [
    {
      handle: 'spirits',
      label: 'Spirits',
      colors: { bg: 'bg-blue-50', bgActive: 'bg-blue-600', ... }
    },
    // ... more collections
  ],

  defaultCollection: 'spirits',

  theme: {
    primaryColor: 'blue-600',
    primaryHover: 'blue-700',
    accentColor: 'yellow-400',
  },
};

export default config;
```

Then access at: `/quick-order/acme-liquors`

## Migration Notes
- Current `/quick-order` URL continues to work (redirects to `/quick-order/party-on`)
- No changes to Shopify integration - same store, same API
- All existing quick-order components remain compatible

---

## Features Already Implemented (Jan 3, 2026)

These features work today and will carry over to the multi-vendor system:

| Feature | Status | Notes |
|---------|--------|-------|
| 3-column mobile grid | ✅ | Compact cards, responsive sizing |
| Nav hide/show on scroll | ✅ | Uses IntersectionObserver + scroll direction |
| Sticky category bar | ✅ | Becomes sticky when scrolling past hero |
| Sticky search button | ✅ | Appears left of categories when sticky |
| Search overlay | ✅ | Full-screen search with quick-add |
| Remove from cart | ✅ | Minus at qty 1 removes item |
| Hidden mobile nav | ✅ | Bottom nav hidden on /quick-order |
| Cart summary bar | ✅ | Fixed bottom with item count + total |
| Optimistic updates | ✅ | Instant UI feedback on cart actions |

### Key Technical Patterns to Preserve
- IntersectionObserver for sticky detection (line 39-54 in page.tsx)
- requestAnimationFrame for scroll direction (line 58-85)
- SWR caching in useQuickOrderProducts hook
- Optimistic quantity updates in QuickProductCard

### Components Ready for Theming
These components use hardcoded colors and would need theme prop support:
1. `QuickProductCard.tsx` - green add button
2. `CartSummaryBar.tsx` - green background
3. `QuickOrderSearch.tsx` - green focus ring, green add button

### Components Already Themeable
These components use neutral colors and should work as-is:
1. `QuantityStepper.tsx` - gray/white colors
2. `QuickOrderGrid.tsx` - no colors, just layout
