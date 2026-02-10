# Design System Migration Plan

**Generated:** 2026-02-05
**Design System Version:** DESIGN-SYSTEM.md (downloaded)
**Current Branch:** dev

---

## Conflicts Identified

### Fonts (Layout + Config)
| Issue | Current State | Target State | Files Affected |
|-------|---------------|--------------|----------------|
| Cormorant Garamond | Loaded in layout.tsx, used as `font-serif` | DELETE - replace with `font-heading` (Barlow Condensed) | **113 files** |
| Playfair Display | Loaded in layout.tsx, used as `font-display`, `font-playfair` | DELETE - replace with `font-heading` | **30 files** |
| Abril Fatface | Loaded in layout.tsx, used as `font-abril` | DELETE - replace with `font-heading` | **30 files** (same as above) |
| Candal | Loaded in layout.tsx, used as `font-candal` | DELETE - replace with `font-heading` | **6 files** |
| Caveat | Loaded in layout.tsx, used as `font-caveat` | DELETE entirely | 0 files (but still loaded) |
| Barlow Condensed | NOT loaded | ADD as `font-heading` | layout.tsx |

### Colors (Tailwind Config)
| Issue | Current State | Target State | Files Affected |
|-------|---------------|--------------|----------------|
| `gold-*` scale (400, 500, 600, etc.) | Full scale defined twice (lines 52-63, 167-178) | DELETE scale, keep only `gold: #D4AF37` | **182 files** |
| `royal-*` palette | Full scale (lines 40-51) | DELETE entirely | **8 files** |
| `primary-*` (sunset orange) | Full scale (lines 101-112) | DELETE entirely | **14 files** |
| `secondary-*` (teal) | Full scale (lines 113-124) | DELETE entirely | **12 files** |
| `accent-*` (champagne) | Full scale (lines 125-136) | DELETE entirely | **14 files** |
| `ivory-*` | Full scale (lines 64-75) | DELETE entirely | **10 files** (partial overlap) |
| `emerald-*` | Full scale (lines 76-87) | DELETE entirely | **10 files** (partial overlap) |
| `dark-*` | Full scale (lines 137-148) | DELETE entirely | **0 files** (good) |
| `navy-*` | Full scale (lines 179-190) | DELETE entirely | **12 files** |
| `austin.*` | Custom colors (lines 191-196) | DELETE entirely | **10 files** |
| `neutral-*` | Custom scale (lines 198-210) | DELETE - use Tailwind gray | **11 files** |
| `v2-*` tokens | Group order tokens (lines 154-165) | DELETE entirely | **19 files** |
| `brand-blue`, `brand-yellow` | Exists but nested under `brand` | Keep, may need adjustment | **9 files** |
| Gradient utilities | `bg-gradient-gold`, `bg-gradient-navy`, etc. | DELETE all | **7 files** |

### Typography (Tracking/Letter-Spacing)
| Issue | Current State | Target State | Files Affected |
|-------|---------------|--------------|----------------|
| `tracking-[0.15em]+` | Wide letter spacing used | Max is `tracking-[0.1em]` | **74 files** |

### Navigation Components
| Issue | Current State | Target State |
|-------|---------------|--------------|
| Multiple navs | 9 navigation components | Consolidate to 1 `Navigation.tsx` |
| ~~SIGN IN / ORDER NOW buttons~~ | ~~In nav header~~ | **REMOVED** (Feb 9, 2026) — no SIGN IN or ORDER NOW buttons in nav. Account dropdown only shows when logged in. |

Current navigation files:
1. `Navigation.tsx`
2. `CleanNavigation.tsx`
3. `LuxuryNavigation.tsx`
4. `PolishedNavigation.tsx`
5. `PremiumNavigation.tsx`
6. `ProfessionalNavigation.tsx`
7. `SimplifiedNavigation.tsx`
8. `OldFashionedNavigation.tsx`
9. `MobileNavigation.tsx`

### Buttons
| Issue | Current State | Target State | Files Affected |
|-------|---------------|--------------|----------------|
| `rounded-full` on buttons | Pill-style buttons | `rounded-lg` only | **166 files** |
| Gradient buttons | Various gradient styles | Flat colors only | **7 files** |

### CSS (globals.css)
| Issue | Current State | Target State |
|-------|---------------|--------------|
| `font-serif` utility | Points to Cormorant Garamond | Point to Barlow Condensed |
| CSS variables | Legacy party colors | Remove unused |
| `.btn` base | Uses `rounded-full` | Use `rounded-lg` |
| `.text-gradient-*` | Gradient text utilities | DELETE |

---

## Phase 1: Foundation (Config + Fonts)

**Files to modify:**
- [ ] `tailwind.config.js` — Replace entire colors object with approved 12-color palette
- [ ] `src/app/layout.tsx` — Remove 5 fonts, add Barlow Condensed
- [ ] `src/app/globals.css` — Update font-serif utility, remove legacy CSS variables

**Breaking changes expected:** YES - build will fail after this phase until font classes are migrated

**Estimated breaking references:** ~200+ files will have undefined Tailwind classes

---

## Phase 2: Typography Migration

**Find-replace operations:**
- [ ] `font-serif` → `font-heading` (113 files)
- [ ] `font-display` → `font-heading` (30 files)
- [ ] `font-playfair` → `font-heading` (30 files)
- [ ] `font-abril` → `font-heading` (30 files)
- [ ] `font-candal` → `font-heading` (6 files)
- [ ] Remove any `font-caveat` references

**Files to modify:** ~113 unique files (with overlap)

---

## Phase 3: Color Migration

**Token mapping (old → new):**

### Gold scale → flat gold or brand-yellow
- `gold-50` through `gold-300` → `gray-100` or remove
- `gold-400` → `brand-yellow` (#F2D34F)
- `gold-500` → `gold` (#D4AF37) — only on dark backgrounds
- `gold-600` → `brand-yellow`
- `gold-700` through `gold-900` → `gray-700` or `gray-900`

### Royal scale → brand-blue or gray
- `royal-*` → `brand-blue` or `gray-900`

### Primary scale (sunset orange) → brand-blue
- `primary-500` → `brand-blue`
- `primary-600` → `blue-700` (hover)
- Other shades → appropriate gray

### Secondary scale (teal) → brand-blue or remove
- `secondary-*` → `brand-blue` or gray

### Accent scale → brand-yellow
- `accent-*` → `brand-yellow`

### Navy scale → gray-900 or black
- `navy-*` → `gray-900` or `black` (#191C1F)

### Neutral scale → Tailwind gray
- `neutral-*` → `gray-*`

### v2 tokens
- `v2-bg` → `white`
- `v2-bgSoft` → `gray-50`
- `v2-text` → `gray-900`
- `v2-muted` → `gray-500`
- `v2-border` → `gray-200`
- `v2-success` → `success`
- `v2-danger` → `error`

**Files to modify:** ~182 files (gold-* alone)

---

## Phase 4: Navigation Consolidation

**Files to modify/delete:**
- [ ] Keep & refactor: `Navigation.tsx` (make it the single source)
- [ ] DELETE: `CleanNavigation.tsx`
- [ ] DELETE: `LuxuryNavigation.tsx`
- [ ] DELETE: `PolishedNavigation.tsx`
- [ ] DELETE: `PremiumNavigation.tsx`
- [ ] DELETE: `ProfessionalNavigation.tsx`
- [ ] DELETE: `SimplifiedNavigation.tsx`
- [ ] EVALUATE: `OldFashionedNavigation.tsx` (partner pages may need it)
- [ ] EVALUATE: `MobileNavigation.tsx` (mobile-specific or merge)

**Update imports in:** All pages that use deleted nav components

---

## Phase 5: Button Standardization

**Files to modify:**
- [ ] `src/components/Button.tsx` — Rebuild with 4 variants only (primary, cart, secondary, ghost)
- [ ] All files using `rounded-full` on buttons → `rounded-lg`

**Files affected:** ~166 files with `rounded-full`

---

## Phase 6: Layout & Viewport Fixes

**Files to modify:**
- [ ] `src/app/globals.css` — Add `overflow-x-hidden` to html/body
- [ ] Audit all hero sections for proper spacing
- [ ] Fix any horizontal scroll issues

---

## Phase 7: Component-Specific Fixes

**Cart & Checkout:**
- [ ] Verify sticky cart bar implementation
- [ ] Verify date picker is modal (not inline)
- [ ] Verify quantity selector behavior (no silent delete at qty=1)

**Letter spacing:**
- [ ] `tracking-[0.15em]` → `tracking-[0.1em]` or less (74 files)
- [ ] `tracking-[0.2em]` → `tracking-[0.1em]` or less
- [ ] `tracking-[0.25em]` → `tracking-[0.1em]` or less

---

## Phase 8: Final Audit Checklist

- [ ] No deleted colors remain in codebase
- [ ] No deleted fonts remain in codebase
- [ ] All buttons use approved variants (primary, cart, secondary, ghost)
- [ ] No horizontal scroll at 320px, 375px, 390px, 428px
- [ ] Sticky nav visible/hidden on correct pages per design system rules
- [ ] All pages tested mobile + desktop
- [ ] Build passes with no TypeScript errors
- [ ] No console warnings about missing Tailwind classes

---

## Current Progress

- [ ] Phase 1: Foundation (Config + Fonts)
- [ ] Phase 2: Typography Migration
- [ ] Phase 3: Color Migration
- [ ] Phase 4: Navigation Consolidation
- [ ] Phase 5: Button Standardization
- [ ] Phase 6: Layout & Viewport Fixes
- [ ] Phase 7: Component-Specific Fixes
- [ ] Phase 8: Final Audit Checklist

---

## Questions for Approval

1. **Navigation consolidation scope:** The design system mentions 3 navs to merge, but codebase has 9. Should all 9 be consolidated, or keep `OldFashionedNavigation` for partner pages and `MobileNavigation` separately?

2. **Gold color usage:** Design system says gold (#D4AF37) is ONLY for dark backgrounds. Currently `gold-500` is used extensively on light backgrounds. Should these become `brand-yellow` (#F2D34F) instead?

3. **Gradients in non-button contexts:** Design system bans gradient buttons, but some hero overlays use gradients. Should hero overlays keep their gradients (they're not buttons)?

4. **Phase execution:** Do you want me to complete all phases in one session, or checkpoint after each phase for review?

---

## Risks

1. **Build will break after Phase 1** until Phase 2-3 complete the color/font migration
2. **Visual regressions** likely during migration — recommend local testing after each phase
3. **Partner pages** (Premier Party Cruises) may need special handling for branding
4. **182 files** need color updates — high risk of missed references

---

**Ready for your approval before proceeding.**
