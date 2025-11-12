# Broken Images Fix Guide

**Issue**: 59 images returning HTTP 400 errors via Next.js Image Optimization
**Date**: January 11, 2025

---

## Problem Summary

The following image URLs are returning HTTP 400 errors through Next.js Image Optimization API:

```
/_next/image?url=/images/[path]&w=3840&q=75
```

**Total Broken Images**: 29 unique image paths

---

## Broken Image List

### Product Images (26 images)
1. `/images/boat-parties/boat-party-bar-setup.webp`
2. `/images/hero/wine-glasses.webp`
3. `/images/products/aperol-kit.webp`
4. `/images/products/beer-corona.webp`
5. `/images/products/beer-craft.webp`
6. `/images/products/bourbon-collection.webp`
7. `/images/products/champagne-dom.webp`
8. `/images/products/champagne-rose.webp`
9. `/images/products/cooler-package.webp`
10. `/images/products/package-bachelor.webp`
11. `/images/products/package-bachelorette.webp`
12. `/images/products/package-pontoon.webp`
13. `/images/products/package-pool-party.webp`
14. `/images/products/package-pregame.webp`
15. `/images/products/package-sunset.webp`
16. `/images/products/package-yacht.webp`
17. `/images/products/pink-whitney.webp`
18. `/images/products/ranch-water.webp`
19. `/images/products/seltzer-whiteclaw.webp`
20. `/images/products/tequila-clase-azul.webp`
21. `/images/products/tequila-mezcal.webp`
22. `/images/products/vodka-belvedere.webp`
23. `/images/products/whiskey-blue-label.webp`
24. `/images/products/whiskey-flight.webp`
25. `/images/products/wine-rose.webp`
26. `/images/products/wine-variety.webp`

### Service Images (3 images)
27. `/images/services/bach-parties/party-setup.webp`
28. `/images/services/boat-parties/yacht-bar-setup.webp`
29. `/images/weddings/wedding-bar-setup-golden.webp`

---

## Root Causes

### 1. Missing Image Files
**Most Likely**: These image files don't exist in the `/public/images/` directory.

**Check**:
```bash
# Verify if files exist
ls -la "public/images/products/"
ls -la "public/images/services/"
ls -la "public/images/weddings/"
ls -la "public/images/boat-parties/"
ls -la "public/images/hero/"
```

### 2. Incorrect File Paths
The images might exist but with different:
- File names (typos, different naming)
- Directory structure
- File extensions (.webp vs .jpg vs .png)

### 3. Next.js Image Optimization Config Issue
Less likely, but possible issue in `next.config.ts` image configuration.

---

## How to Fix

### Step 1: Audit Image Directory
```bash
cd "public/images"

# List all product images
ls products/

# List all service images
ls services/bach-parties/
ls services/boat-parties/
ls services/weddings/

# List hero images
ls hero/

# List wedding images
ls weddings/
```

### Step 2: Find Mismatched Names

For each broken image, search for similar filenames:

```bash
# Example: Find "aperol" images
find public/images -iname "*aperol*"

# Find all package images
find public/images -iname "*package*"

# Find all webp images in products
find public/images/products -name "*.webp"
```

### Step 3: Fix Missing Images

**Option A: Add Missing Images**
1. Source the missing images from:
   - Your original design files
   - Shopify product images
   - Stock photo libraries
   - Previous backups

2. Save them in the correct location with correct names

**Option B: Update Component References**
1. Find where images are referenced in code
2. Update to correct file names

```bash
# Search for image references
grep -r "aperol-kit.webp" src/
grep -r "package-bachelor.webp" src/
```

### Step 4: Verify Next.js Config

Check `next.config.ts` image configuration:

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  // Ensure this is not interfering
  dangerouslyAllowSVG: true,
}
```

### Step 5: Test Images

After adding/fixing images:

```bash
# Restart dev server
npm run dev

# Visit pages with these images:
# - /products (product images)
# - /collections (product images)
# - /bach-parties (service images)
# - /boat-parties (service images)
# - /weddings (wedding images)
```

---

## Quick Fix Script

Create a script to find all missing images:

```bash
#!/bin/bash
# check-missing-images.sh

IMAGES=(
  "images/boat-parties/boat-party-bar-setup.webp"
  "images/hero/wine-glasses.webp"
  "images/products/aperol-kit.webp"
  # ... add all 29 images
)

echo "Checking for missing images..."
for img in "${IMAGES[@]}"; do
  if [ ! -f "public/$img" ]; then
    echo "❌ MISSING: $img"
  else
    echo "✓ EXISTS: $img"
  fi
done
```

---

## Common Issues & Solutions

### Issue: Image exists but still 400 error
**Solution**:
- Check file permissions
- Restart Next.js dev server
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `npm run build`

### Issue: Image has wrong extension
**Solution**:
- Convert image to .webp: `cwebp input.jpg -o output.webp`
- Or update code to reference correct extension

### Issue: Image file too large
**Solution**:
- Compress images before adding to `/public`
- Recommended max size: 500KB per image
- Use tools: TinyPNG, ImageOptim, cwebp

---

## External Broken Links (Cannot Fix with Redirects)

These external sites are returning 403/404 errors. Review and remove/update:

1. `https://austinbeerworks.com/`
2. `https://austincharterservice.com/`
3. `https://casinoknightsusa.com/`
4. `https://parksideprojects.com/private-events`
5. `https://rockrosehall.com/`
6. `https://rrlimobus.com/`
7. `https://selmersmusic.com/`
8. `https://www.capitalcomedyaustin.com/`
9. `https://www.centralmarket.com/`
10. `https://www.laketraviszip.com/`
11. `https://www.longhorn-charter.com/`
12. `https://www.tcofaustin.com/`
13. `https://www.thelinehotel.com/austin`

**Action**: Review each link, verify if site is down or blocking bots, replace with working alternatives or remove.

---

## Verification Checklist

After fixing images:

- [ ] All 29 image files exist in `/public/images/`
- [ ] File names match exactly (case-sensitive)
- [ ] All images are in .webp format (or update references)
- [ ] Images display correctly on:
  - [ ] Products page
  - [ ] Collections page
  - [ ] Bach parties page
  - [ ] Boat parties page
  - [ ] Weddings page
- [ ] No 400 errors in browser DevTools Network tab
- [ ] Next.js dev server restarted after changes

---

## Impact

**Before Fix**: 59 broken image requests (400 errors)
**After Fix**: 0 broken image requests
**SEO Impact**: Improves Lighthouse scores, reduces crawl errors

---

## Notes

- The `/llms.txt` URL was also listed as broken, but we just created this file, so it should now work
- Most broken URLs were blog truncations (now fixed with redirects)
- External links need manual review - cannot be fixed with 301 redirects

**Priority**: HIGH - Fix within 1-2 days for best SEO results
