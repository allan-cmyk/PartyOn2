# PartyOn Delivery - Layout & Design Standards

---

## Color Contrast Rules (MANDATORY)

**Poor color contrast causes readability issues. Follow these rules strictly.**

| Background Color | Allowed Text Colors | Forbidden Text Colors |
|------------------|--------------------|-----------------------|
| **White** (`bg-white`, `bg-gray-50`) | Black, dark gray (`text-gray-900`, `text-gray-700`, `text-gray-600`) | ❌ Yellow, gold, white |
| **Yellow/Gold** (`bg-gold-*`, `bg-yellow-*`) | Black only (`text-gray-900`) | ❌ White, light colors |
| **Black/Dark** (`bg-gray-900`, `bg-black`) | White, yellow/gold (`text-white`, `text-gold-400`) | ❌ Black, dark gray |

### Correct Patterns
```tsx
{/* Dark background = light text */}
<div className="bg-gray-900 text-white">...</div>
<div className="bg-gray-900 text-gold-400">...</div>

{/* Light background = dark text */}
<div className="bg-white text-gray-900">...</div>
<button className="bg-gold-600 text-gray-900">...</button>
```

### Forbidden Patterns
```tsx
{/* ❌ NEVER: Gold/yellow text on white backgrounds */}
<div className="bg-white text-gold-400">UNREADABLE</div>

{/* ❌ NEVER: White text on gold/yellow backgrounds */}
<button className="bg-gold-600 text-white">UNREADABLE</button>
```

### Quick Reference
- **Hero overlays** (dark gradient): `text-white` or `text-gold-400`
- **Gold buttons**: Always `text-gray-900` (black text)
- **White sections**: `text-gray-900`, `text-gray-700`, or `text-gray-600`
- **Gold accent text**: ONLY on dark backgrounds

---

## Navigation Specification

```
Component: Navigation.tsx / OldFashionedNavigation.tsx
Position: fixed top-0 left-0 right-0 z-50
Height: h-24 (96px / 6rem)
Behavior:
  - At top: py-6 (transparent background)
  - Scrolled: py-4 (white background with shadow)
```

**CRITICAL: All page content MUST account for the 96px fixed navigation.**

---

## Navbar Background Rules (Safe Default: Opaque)

Navigation defaults to **opaque** (white bg, dark text) on all routes. Only routes explicitly
listed in `NAV_TRANSPARENT_ROUTES` (in `src/components/Navigation.tsx`) get transparent nav
with white text.

### How It Works
- `NAV_TRANSPARENT_ROUTES` is an allow-list of routes where the nav starts transparent
- All other routes immediately render with white background + dark text
- On transparent routes, the nav transitions to opaque after scrolling 50px

### When to Add a Route to `NAV_TRANSPARENT_ROUTES`
- The page has a **dark background that extends behind the fixed nav area**
- The page does **NOT** use `mt-24` on its hero section (hero starts at top of viewport)
- Examples: Homepage (`h-screen` dark hero), `/services` (dark gradient from top)

### When NOT to Add a Route
- The page uses `mt-24` on its hero (leaves white gap behind nav) → opaque is correct
- The page has a light/white background behind the nav area → opaque is correct
- Do nothing — opaque nav is the safe automatic default

### Rule
**NEVER use white/light text on a white/light nav background.** If a page has a light background
behind the nav area, it must NOT be in `NAV_TRANSPARENT_ROUTES`.

---

## Hero Section Implementation Rules

### THE GOLDEN RULE

**Use `mt-24` (margin-top: 96px) to push full-bleed hero sections below the fixed navigation.**

**NEVER combine viewport height (`h-[100vh]` or `h-screen`) with top padding (`pt-*`). This causes double-spacing bugs.**

---

## Approved Patterns

### Pattern A: Standard Full-Bleed Hero (Most Common)

```tsx
<section className="relative h-[50vh] md:h-[60vh] mt-24 flex items-center justify-center overflow-hidden">
  <Image src="..." alt="..." fill className="object-cover" priority />
  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/30 to-gray-900/50" />
  <div className="relative text-center text-white z-10 max-w-4xl mx-auto px-8">
    {/* Hero content */}
  </div>
</section>
```

### Pattern B: Tall Full-Bleed Hero

```tsx
<section className="relative h-[70vh] md:h-[80vh] mt-24 flex items-center justify-center overflow-hidden">
  {/* Same structure as Pattern A */}
</section>
```

### Pattern C: Full-Screen Hero (Rare)

```tsx
<section className="relative h-[calc(100vh-96px)] mt-24 flex items-center justify-center overflow-hidden">
  {/* Same structure as Pattern A */}
</section>
```

### Pattern D: Content Page (No Hero Image)

```tsx
<section className="pt-32 pb-16 px-8 bg-gray-50">
  {/* pt-32 = 128px = 96px nav + 32px breathing room */}
  <div className="max-w-4xl mx-auto">
    {/* Content */}
  </div>
</section>
```

---

## Forbidden Patterns

| Pattern | Code Example | Why Forbidden |
|---------|--------------|---------------|
| Height + Padding | `h-[100vh] pt-32` | Double-spacing causes content cutoff |
| Bare h-screen | `h-screen` without mt-24 | Content hidden behind nav |
| Mobile margin hacks | `mt-[120px] md:mt-0` | Indicates broken parent spacing |
| Inconsistent breakpoint padding | `pt-32 md:pt-24` | Unpredictable behavior |
| pt-24 alone | `pt-24` (no margin) | No visual separation from nav |

---

## Page Reference Table

| Page | Correct Classes | Height |
|------|-----------------|--------|
| Homepage | `h-[70vh] md:h-[80vh] mt-24` | Tall |
| About | `h-[50vh] md:h-[60vh] mt-24` | Standard |
| Contact | `h-[50vh] mt-24` | Standard |
| Weddings | `h-[60vh] md:h-[70vh] mt-24` | Tall |
| Boat Parties | `h-[60vh] md:h-[70vh] mt-24` | Tall |
| Bach Parties | `h-[60vh] md:h-[70vh] mt-24` | Tall |
| Order | `h-[35vh] md:h-[40vh] mt-24` | Short |
| Products | `h-[40vh] md:h-[50vh] mt-24` | Moderate |
| Terms/Privacy/FAQs | `pt-32` (no hero) | N/A |

---

## Pre-Commit Checklist for Hero Sections

Before any hero section changes are committed:

- [ ] Section uses `mt-24` for full-bleed heroes
- [ ] Height uses `h-[Xvh]` (NOT `h-screen` or `h-[100vh]`)
- [ ] NO `pt-*` padding on sections using `mt-24`
- [ ] NO mobile-specific margin hacks inside content
- [ ] Tested on mobile: content visible below nav
- [ ] Tested on desktop: proper spacing, no gaps
- [ ] Uses flexbox centering: `flex items-center justify-center`

---

## Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Hero behind nav | Missing `mt-24` | Add `mt-24` to section |
| Content cut off bottom | `h-[100vh]` + padding | Use `h-[60vh] mt-24` |
| Gap above hero | `pt-32` on full-bleed | Change to `mt-24` |
| Mobile/desktop mismatch | Inconsistent breakpoint padding | Use same `mt-24` everywhere |

---

## When to Reference This Document

1. Creating ANY new landing page
2. Modifying ANY existing hero section
3. Debugging layout issues on any page
4. Code review involving page layouts
5. Onboarding new developers to the project

**If a hero section doesn't match these patterns, FIX IT before adding more code on top.**
