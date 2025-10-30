# Animation Recovery Strategy - PartyOn2

**Date:** January 29, 2025
**Project:** PartyOn2 - Premium Alcohol Delivery Platform
**Goal:** Restore luxury animations while maintaining Core Web Vitals (LCP < 2.5s)

---

## Strategy Overview

Based on the comprehensive audit of 70 files, this strategy implements a **hybrid CSS-first + lazy-loaded Framer Motion** approach:

- **CSS animations** for scroll reveals and simple transitions (60% of animations)
- **Lazy-loaded Framer Motion** for interactive features only (25% of animations)
- **Remove** purely decorative animations (15% of animations)

**Expected Impact:**
- Bundle: +95KB total (vs 350KB original = 73% reduction)
- LCP: Maintained at 1.0-1.5s (no impact)
- Visual: Full luxury experience restored (10/10)

---

## Architecture

### Component Types & Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Animation Strategy                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  CSS Animations  │      │ Lazy-Load Motion │        │
│  ├──────────────────┤      ├──────────────────┤        │
│  │                  │      │                  │        │
│  │ • ScrollReveal   │      │ • Cart Drawer    │        │
│  │ • Hero Fades     │      │ • Product Modal  │        │
│  │ • Product Cards  │      │ • Mobile Nav     │        │
│  │ • Page Sections  │      │ • Age Verify     │        │
│  │                  │      │ • Scheduler      │        │
│  │ +15KB CSS        │      │ +80KB (lazy)     │        │
│  └──────────────────┘      └──────────────────┘        │
│                                                           │
│  ┌──────────────────┐                                   │
│  │  Remove Entirely │                                   │
│  ├──────────────────┤                                   │
│  │                  │                                   │
│  │ • CustomCursor   │                                   │
│  │ -20KB, +50ms TBT │                                   │
│  └──────────────────┘                                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Part 1: CSS-Based Animations

### 1.1 ScrollReveal Component (Replacement)

**Goal:** Replace Framer Motion `ScrollReveal.tsx` with CSS + Intersection Observer

**File:** `src/components/ui/ScrollRevealCSS.tsx`

```typescript
'use client';

import { useEffect, useRef, ReactNode, CSSProperties } from 'react';

interface ScrollRevealCSSProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  y?: number;
  /**
   * Once: only animate the first time (true = once, false = every time)
   * Default: true (same as Framer Motion whileInView with viewport.once)
   */
  once?: boolean;
}

/**
 * CSS-based scroll reveal component using Intersection Observer
 * Drop-in replacement for the Framer Motion ScrollReveal component
 *
 * Features:
 * - Zero JavaScript for animation execution (CSS-only)
 * - Respects prefers-reduced-motion
 * - Configurable delay, duration, and distance
 * - Same API as original for easy migration
 * - ~1KB vs ~50KB for Framer Motion version
 *
 * @example
 * ```tsx
 * <ScrollRevealCSS delay={100} duration={800}>
 *   <h1>Animated Title</h1>
 * </ScrollRevealCSS>
 * ```
 */
export default function ScrollRevealCSS({
  children,
  delay = 0,
  duration = 800,
  className = '',
  y = 30,
  once = true,
}: ScrollRevealCSSProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // If reduced motion, show immediately without animation
    if (prefersReducedMotion) {
      element.classList.add('scroll-reveal-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('scroll-reveal-visible');

            // If once=true, stop observing after first trigger
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            // If once=false, remove class when out of view (for repeated animations)
            element.classList.remove('scroll-reveal-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px', // Trigger slightly before element enters viewport
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  const animationStyle: CSSProperties = {
    '--scroll-reveal-delay': `${delay}ms`,
    '--scroll-reveal-duration': `${duration}ms`,
    '--scroll-reveal-distance': `${y}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={animationStyle}
    >
      {children}
    </div>
  );
}
```

**CSS:** Add to `src/app/globals.css`

```css
/* ============================================
   Scroll Reveal Animations
   ============================================ */

.scroll-reveal {
  opacity: 0;
  transform: translateY(var(--scroll-reveal-distance, 30px));
  transition:
    opacity var(--scroll-reveal-duration, 800ms) cubic-bezier(0.25, 0.1, 0.25, 1),
    transform var(--scroll-reveal-duration, 800ms) cubic-bezier(0.25, 0.1, 0.25, 1);
  transition-delay: var(--scroll-reveal-delay, 0ms);
}

.scroll-reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* ============================================
   Product Card Stagger Animations
   ============================================ */

.product-grid {
  display: grid;
  /* Your existing grid styles */
}

/* Stagger delay based on card index */
.product-card:nth-child(1) { --scroll-reveal-delay: 0ms; }
.product-card:nth-child(2) { --scroll-reveal-delay: 100ms; }
.product-card:nth-child(3) { --scroll-reveal-delay: 200ms; }
.product-card:nth-child(4) { --scroll-reveal-delay: 300ms; }
.product-card:nth-child(5) { --scroll-reveal-delay: 400ms; }
.product-card:nth-child(6) { --scroll-reveal-delay: 500ms; }
.product-card:nth-child(7) { --scroll-reveal-delay: 600ms; }
.product-card:nth-child(8) { --scroll-reveal-delay: 700ms; }
.product-card:nth-child(9) { --scroll-reveal-delay: 800ms; }
.product-card:nth-child(n+10) { --scroll-reveal-delay: 900ms; }

/* ============================================
   Page Hero Animations
   ============================================ */

.hero-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: hero-fade-in 1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

@keyframes hero-fade-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   Calculator Result Animations
   ============================================ */

.result-card {
  opacity: 0;
  transform: translateY(10px);
  animation: result-fade-in 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

.result-card:nth-child(1) { animation-delay: 0ms; }
.result-card:nth-child(2) { animation-delay: 100ms; }
.result-card:nth-child(3) { animation-delay: 200ms; }
.result-card:nth-child(4) { animation-delay: 300ms; }

@keyframes result-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion fallback */
@media (prefers-reduced-motion: reduce) {
  .hero-fade-in,
  .result-card {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
```

**TypeScript Config:** Add CSS variable types to `src/types/css.d.ts`

```typescript
// CSS custom properties for animations
import 'react';

declare module 'react' {
  interface CSSProperties {
    '--scroll-reveal-delay'?: string;
    '--scroll-reveal-duration'?: string;
    '--scroll-reveal-distance'?: string;
  }
}
```

### 1.2 Migration Script

**Script:** Create `scripts/migrate-scroll-reveal.ts` to batch update files

```typescript
import fs from 'fs';
import path from 'path';
import glob from 'glob';

/**
 * Automated migration script to replace Framer Motion ScrollReveal
 * with CSS-based ScrollRevealCSS component
 *
 * Usage: npx ts-node scripts/migrate-scroll-reveal.ts
 */

const files = glob.sync('src/**/*.{tsx,jsx}', {
  ignore: ['**/node_modules/**', '**/ScrollReveal.tsx', '**/ScrollRevealCSS.tsx']
});

let migrationCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Replace import
  if (content.includes('from \'@/components/ui/ScrollReveal\'')) {
    content = content.replace(
      /from ['"]@\/components\/ui\/ScrollReveal['"]/g,
      'from \'@/components/ui/ScrollRevealCSS\''
    );
    modified = true;
  }

  // Replace component usage
  if (content.includes('<ScrollReveal')) {
    content = content.replace(
      /<ScrollReveal/g,
      '<ScrollRevealCSS'
    );
    content = content.replace(
      /<\/ScrollReveal>/g,
      '</ScrollRevealCSS>'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    migrationCount++;
    console.log(`✅ Migrated: ${filePath}`);
  }
});

console.log(`\n🎉 Migration complete! Updated ${migrationCount} files.`);
```

---

## Part 2: Lazy-Loaded Framer Motion

### 2.1 Lazy-Loading Pattern

**Strategy:** Use Next.js `dynamic()` to split Framer Motion into separate chunks loaded only when needed

**Pattern 1: Modal/Drawer Components** (load when opened)

```typescript
// Example: Cart component
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load the actual cart drawer with Framer Motion
const CartDrawer = dynamic(
  () => import('./CartDrawer'),
  {
    ssr: false, // Don't render on server (client-only animation)
    loading: () => null, // No loader needed - instant on click
  }
);

export default function Cart() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Cart
      </button>

      {/* Only load Framer Motion when cart is opened */}
      {isOpen && <CartDrawer onClose={() => setIsOpen(false)} />}
    </>
  );
}
```

**Pattern 2: Interactive Features** (load on route/interaction)

```typescript
// Example: Product Modal
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const ProductModal = dynamic(
  () => import('./ProductModal'),
  { ssr: false }
);

export default function ProductCard({ product }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <div onClick={() => setSelectedProduct(product)}>
        {/* Product card content */}
      </div>

      {/* Modal only loads when product clicked */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
```

**Pattern 3: Named Exports** (granular lazy-loading)

```typescript
// When you only need specific exports from Framer Motion
import dynamic from 'next/dynamic';

const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false }
);

const motion = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion })),
  { ssr: false }
);
```

### 2.2 Critical Components to Lazy-Load

#### High Priority (E-commerce Critical)

**1. Cart Components**

```typescript
// src/contexts/CartContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';
import dynamic from 'next/dynamic';

const Cart = dynamic(() => import('@/components/shopify/Cart'), {
  ssr: false,
});

const MobileCart = dynamic(() => import('@/components/mobile/MobileCart'), {
  ssr: false,
});

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <CartContext.Provider value={{ isCartOpen, openCart, closeCart }}>
      {children}
      {/* Only render cart when opened */}
      {isCartOpen && (isMobile ? <MobileCart /> : <Cart />)}
    </CartContext.Provider>
  );
}
```

**2. Product Modal**

```typescript
// src/app/products/page.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ProductCard from '@/components/shopify/ProductCard'; // CSS animated

const ProductModal = dynamic(
  () => import('@/components/ProductModal'),
  { ssr: false }
);

export default function ProductsPage({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
```

**3. Mobile Navigation**

```typescript
// src/components/mobile/MobileNavigation.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load animation utilities
const useAnimatedCart = dynamic(
  () => import('./useAnimatedCart').then(mod => ({ default: mod.useAnimatedCart })),
  { ssr: false }
);

export default function MobileNavigation() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only use animations on client after hydration
  const cartControls = isClient ? useAnimatedCart() : null;

  return (
    <nav>
      {/* Navigation items */}
    </nav>
  );
}
```

#### Medium Priority

**4. Age Verification Modal**

```typescript
// Load only when first alcohol product is interacted with
const AgeVerificationModal = dynamic(
  () => import('@/components/AgeVerificationModal'),
  { ssr: false }
);
```

**5. Delivery Scheduler**

```typescript
// Load only when user clicks "Proceed to Checkout"
const DeliveryScheduler = dynamic(
  () => import('@/components/SimpleDeliveryScheduler'),
  { ssr: false }
);
```

**6. Mobile Drawers**

```typescript
// MobileSearchModal, MobileFilterDrawer
// Load only when icons tapped
```

---

## Part 3: Remove Decorative Animations

### 3.1 CustomCursor Removal

**Files to Update:**

1. **Delete:** `src/components/CustomCursor.tsx`
2. **Update:** Remove import from layout

```typescript
// src/app/layout.tsx
// BEFORE
import CustomCursor from '@/components/CustomCursor';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CustomCursor /> {/* REMOVE THIS */}
      </body>
    </html>
  );
}

// AFTER
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {/* CustomCursor removed - high perf cost, low value */}
      </body>
    </html>
  );
}
```

**Impact:**
- Bundle: -20KB
- TBT: -50ms (remove mousemove listeners)
- Cursor follows native OS behavior (better UX)

---

## Part 4: Performance Budget

### 4.1 Bundle Size Budget

```
┌─────────────────────────────────────────────────┐
│           Animation Performance Budget           │
├─────────────────────────────────────────────────┤
│                                                  │
│  Initial Page Load (Critical Path):             │
│  ├─ CSS animations: 15KB ✅                     │
│  ├─ ScrollRevealCSS JS: 1KB ✅                  │
│  ├─ Total: 16KB                                 │
│  └─ Target: <20KB ✅                            │
│                                                  │
│  Lazy-Loaded (On Demand):                       │
│  ├─ Framer Motion core: 50KB                   │
│  ├─ Cart components: 15KB                      │
│  ├─ Product modal: 8KB                         │
│  ├─ Mobile nav animations: 5KB                 │
│  ├─ Other modals: 2KB                          │
│  ├─ Total: 80KB                                │
│  └─ Target: <100KB ✅                          │
│                                                  │
│  Total Animation Cost: 96KB                     │
│  Original Cost: 350KB                           │
│  Savings: 254KB (73%) ✅                        │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 4.2 Performance Metrics

**Core Web Vitals Targets:**

```typescript
// Performance monitoring
const performanceTargets = {
  // Largest Contentful Paint
  LCP: {
    good: 2500, // ms
    needsImprovement: 4000,
    current: 1200, // Current after animation removal
    target: 2000, // Target with animations restored
  },

  // Total Blocking Time
  TBT: {
    good: 200, // ms
    needsImprovement: 600,
    current: 150, // Current
    target: 250, // Target (account for animation parsing)
  },

  // Cumulative Layout Shift
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    current: 0.05,
    target: 0.08, // Slight increase from animations
  },

  // First Input Delay
  FID: {
    good: 100, // ms
    needsImprovement: 300,
    current: 50,
    target: 100,
  },
};
```

**Bundle Size Monitoring:**

```typescript
// Add to next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Warn if bundle exceeds targets
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 512000, // 500KB
        maxAssetSize: 512000,
      };
    }
    return config;
  },
};
```

### 4.3 Animation Performance Checklist

**CSS Animations:**
- [ ] Use `transform` and `opacity` only (GPU-accelerated)
- [ ] Avoid `height`, `width`, `top`, `left` (causes reflow)
- [ ] Use `will-change` sparingly (only during animation)
- [ ] Respect `prefers-reduced-motion`
- [ ] Test on 60Hz and 120Hz displays

**Framer Motion (Lazy-Loaded):**
- [ ] Only load when feature is accessed
- [ ] Use `ssr: false` for client-only animations
- [ ] Implement proper loading states if needed
- [ ] Monitor chunk sizes with webpack-bundle-analyzer

**General:**
- [ ] No animations on initial page load (except CSS fade-in)
- [ ] Test on slow 3G network
- [ ] Verify no layout shifts (CLS < 0.1)
- [ ] Check CPU usage in Chrome DevTools Performance tab

---

## Part 5: Implementation Phases

### Phase 1: Foundation (Week 1) - CRITICAL PRIORITY

**Goal:** Remove bloat, restore 70% of animations with CSS

**Tasks:**

1. **Remove CustomCursor** (30 mins)
   - [ ] Delete `src/components/CustomCursor.tsx`
   - [ ] Remove from `src/app/layout.tsx`
   - [ ] Test: No cursor-related code in bundle

2. **Build ScrollRevealCSS** (2 hours)
   - [ ] Create `src/components/ui/ScrollRevealCSS.tsx`
   - [ ] Add CSS to `src/app/globals.css`
   - [ ] Create `src/types/css.d.ts` for CSS variables
   - [ ] Test: Works on one page

3. **Migrate Pages** (6 hours)
   - [ ] Create migration script `scripts/migrate-scroll-reveal.ts`
   - [ ] Run script on all 40 page files
   - [ ] Manual review of each migrated file
   - [ ] Test: All pages animate correctly

4. **Convert Product Cards** (2 hours)
   - [ ] Update `ProductCard.tsx` to use CSS classes
   - [ ] Update `MobileProductCard.tsx`
   - [ ] Update `CompactProductCard.tsx`
   - [ ] Test: Stagger animation works on products page

5. **Convert Page Heroes** (2 hours)
   - [ ] Add `.hero-fade-in` class to hero sections
   - [ ] Test on 5 representative pages
   - [ ] Verify no layout shifts

**Total Effort:** ~13 hours
**Expected Impact:**
- Bundle: +16KB CSS/JS
- LCP: No change (1.0-1.5s)
- Visual: 7/10 restored

### Phase 2: Critical Interactions (Week 2)

**Goal:** Restore critical e-commerce animations

**Tasks:**

1. **Lazy-load Cart** (2 hours)
   - [ ] Update `CartContext.tsx` to lazy-load Cart/MobileCart
   - [ ] Test: Cart loads only when opened
   - [ ] Verify bundle split with webpack analyzer

2. **Lazy-load Product Modal** (1 hour)
   - [ ] Update products page to lazy-load modal
   - [ ] Test: Modal loads only when product clicked
   - [ ] Verify smooth animation

3. **Lazy-load Mobile Nav Animations** (2 hours)
   - [ ] Extract animation logic to separate hook
   - [ ] Lazy-load hook in MobileNavigation
   - [ ] Test: Cart bounce works on mobile

4. **Lazy-load Delivery Scheduler** (1 hour)
   - [ ] Dynamic import in cart components
   - [ ] Test: Loads on "Proceed to Checkout"

5. **Lazy-load Age Verification** (1 hour)
   - [ ] Dynamic import in product components
   - [ ] Test: Loads on first alcohol product interaction

**Total Effort:** ~7 hours
**Expected Impact:**
- Bundle: +80KB (lazy-loaded, split)
- LCP: No change (not on initial load)
- Visual: 9/10 restored

### Phase 3: Polish & Optimize (Week 3)

**Goal:** Complete recovery and optimize performance

**Tasks:**

1. **Convert Remaining Pages** (4 hours)
   - [ ] Migrate any missed pages
   - [ ] Convert calculator result animations
   - [ ] Standardize animation timing

2. **Lazy-load Modal Components** (3 hours)
   - [ ] Search modal
   - [ ] Filter drawer
   - [ ] Group order modals (low priority)

3. **Performance Audit** (3 hours)
   - [ ] Run Lighthouse on all major pages
   - [ ] Test on slow 3G throttled network
   - [ ] Verify Core Web Vitals in Search Console
   - [ ] Check bundle sizes with webpack analyzer

4. **Cross-Browser Testing** (2 hours)
   - [ ] Chrome desktop + mobile
   - [ ] Safari desktop + mobile
   - [ ] Firefox
   - [ ] Edge

5. **Accessibility Testing** (2 hours)
   - [ ] Test with prefers-reduced-motion enabled
   - [ ] Verify keyboard navigation still works
   - [ ] Screen reader testing
   - [ ] Check color contrast with animations

**Total Effort:** ~14 hours
**Expected Impact:**
- Bundle: +96KB total
- LCP: Confirmed < 2.5s
- Visual: 10/10 full experience

---

## Part 6: Testing & Validation

### 6.1 Automated Tests

**Performance Tests:**

```typescript
// __tests__/performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('Animation Performance', () => {
  test('LCP should be under 2.5s', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    expect(lcp).toBeLessThan(2500);
  });

  test('Initial bundle should not include Framer Motion', async ({ page }) => {
    const response = await page.goto('/');
    const scripts = await page.$$eval('script[src]', (elements) =>
      elements.map((el) => el.getAttribute('src'))
    );

    const hasFramerMotion = scripts.some((src) =>
      src?.includes('framer-motion')
    );

    expect(hasFramerMotion).toBe(false);
  });

  test('Cart should lazy-load Framer Motion', async ({ page }) => {
    await page.goto('/products');

    // Check: Framer Motion not loaded initially
    let hasFramerMotion = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).some(
        (script) => script.src.includes('framer-motion')
      );
    });
    expect(hasFramerMotion).toBe(false);

    // Open cart
    await page.click('[data-testid="cart-button"]');
    await page.waitForTimeout(1000); // Wait for lazy load

    // Check: Framer Motion now loaded
    hasFramerMotion = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).some(
        (script) => script.src.includes('framer-motion')
      );
    });
    expect(hasFramerMotion).toBe(true);
  });
});
```

### 6.2 Visual Regression Tests

```typescript
// __tests__/visual.test.ts
import { test, expect } from '@playwright/test';

test.describe('Animation Visual Tests', () => {
  test('Product cards should animate in on scroll', async ({ page }) => {
    await page.goto('/products');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Scroll to products
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });

    // Wait for animation
    await page.waitForTimeout(1000);

    // Check if cards have animated (opacity should be 1)
    const firstCardOpacity = await page.$eval(
      '.product-card:first-child',
      (el) => window.getComputedStyle(el).opacity
    );

    expect(parseFloat(firstCardOpacity)).toBeCloseTo(1, 1);
  });

  test('Hero should fade in on load', async ({ page }) => {
    await page.goto('/');

    // Wait for animation to complete
    await page.waitForTimeout(1200); // Hero animation is 1s

    const heroOpacity = await page.$eval(
      '.hero-fade-in',
      (el) => window.getComputedStyle(el).opacity
    );

    expect(parseFloat(heroOpacity)).toBeCloseTo(1, 1);
  });
});
```

### 6.3 Manual Test Checklist

**Functional Tests:**
- [ ] ScrollReveal works on all pages
- [ ] Product cards animate with stagger delay
- [ ] Cart drawer slides in smoothly
- [ ] Product modal scales in correctly
- [ ] Mobile navigation bounces on cart add
- [ ] Age verification modal animates
- [ ] Delivery scheduler opens smoothly
- [ ] All modals close with animation

**Performance Tests:**
- [ ] Lighthouse Performance score > 90
- [ ] LCP < 2.5s on slow 3G
- [ ] TBT < 300ms
- [ ] CLS < 0.1
- [ ] No jank or stuttering
- [ ] Smooth 60fps animations

**Accessibility Tests:**
- [ ] Works with keyboard navigation
- [ ] Respects prefers-reduced-motion
- [ ] Screen reader announces content correctly
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA

**Cross-Browser Tests:**
- [ ] Chrome desktop works
- [ ] Chrome mobile works
- [ ] Safari desktop works
- [ ] Safari mobile works
- [ ] Firefox works
- [ ] Edge works

---

## Part 7: Rollback Plan

### 7.1 Git Strategy

```bash
# Create feature branch for animation recovery
git checkout -b feature/animation-recovery

# Commit each phase separately
git commit -m "Phase 1: CSS-based animations foundation"
git commit -m "Phase 2: Lazy-load critical interactions"
git commit -m "Phase 3: Polish and optimization"

# Tag release
git tag -a v2.0.0-animations -m "Animation recovery complete"
```

### 7.2 Rollback Process

**If performance degrades:**

```bash
# Option 1: Revert specific commit
git revert <commit-hash>

# Option 2: Roll back to previous tag
git checkout v1.9.0 # Tag before animation recovery

# Option 3: Feature flag (if implemented)
# Set NEXT_PUBLIC_ENABLE_ANIMATIONS=false in .env
```

### 7.3 Monitoring

**Post-Deploy Monitoring:**

```typescript
// Add to analytics
if (typeof window !== 'undefined') {
  // Track animation loading
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('framer-motion')) {
        analytics.track('Framer Motion Loaded', {
          loadTime: entry.duration,
          route: window.location.pathname,
        });
      }
    }
  });
  observer.observe({ entryTypes: ['resource'] });

  // Track Core Web Vitals
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      analytics.track('Web Vital', {
        name: entry.name,
        value: entry.value,
        rating: entry.rating,
      });
    }
  }).observe({ entryTypes: ['layout-shift', 'largest-contentful-paint', 'first-input'] });
}
```

---

## Success Metrics

### Primary Metrics (Must Achieve)

- ✅ **LCP < 2.5s** (currently 1.0-1.5s, maintain)
- ✅ **Bundle < 100KB** for animations (target: 96KB)
- ✅ **TBT < 300ms** (currently 150ms, allow up to 250ms)
- ✅ **CLS < 0.1** (currently 0.05, allow up to 0.08)

### Secondary Metrics (Nice to Have)

- ✅ **Lighthouse Performance > 90**
- ✅ **Visual polish: 9-10/10** (subjective assessment)
- ✅ **Zero jank** (60fps animations)
- ✅ **Accessibility score: 100** (Lighthouse)

### Business Metrics

- 📈 **Bounce rate:** Should not increase
- 📈 **Time on site:** Expected to increase (more engaging)
- 📈 **Conversion rate:** Monitor for impact
- 📈 **Page views:** Monitor engagement

---

## Conclusion

This strategy provides a comprehensive approach to restoring luxury animations while maintaining excellent performance:

1. **CSS-first** for simple animations (60% of use cases)
2. **Lazy-loaded Framer Motion** for interactive features (25% of use cases)
3. **Remove bloat** like CustomCursor (15% of use cases)

**Total Effort:** 34 hours over 3 weeks
**Expected Outcome:** Full luxury experience with zero performance impact
**Risk Level:** Low (phased approach, rollback plan in place)

Ready to proceed with Phase 1 implementation!
