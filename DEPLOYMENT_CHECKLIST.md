# SEO Metadata Fix - Deployment Checklist

**Date Created:** 2025-10-29
**Root Cause:** Oct 21st indexation drop (225 → 0 pages) due to client-side metadata manipulation

---

## 📊 Audit Summary

| Priority | Count | Status |
|----------|-------|--------|
| ✅ PASSED | 5 | No action needed |
| 🔴 P0 - CRITICAL | 9 | Fix immediately |
| 🟠 P1 - HIGH | 10 | Fix next |
| 🟡 P2 - MEDIUM | 24 | Fix later |
| ⚪ P3 - LOW | 8 | Low priority |

**Total Client Pages:** 56

---

## 🎯 Batch 1: Critical Pages (Deploy ASAP)

### Status: Ready to Fix

| Route | File Path | Issue |
|-------|-----------|-------|
| ✅ /corporate | corporate/page.tsx | FIXED - Layout created |
| ❌ /bach-parties | bach-parties/page.tsx | Missing layout.tsx |
| ❌ /bach-parties/packages/:tier | bach-parties/packages/[tier]/page.tsx | Missing layout.tsx |
| ❌ /bach-parties/products | bach-parties/products/page.tsx | Missing layout.tsx |
| ❌ /boat-parties/packages/:tier | boat-parties/packages/[tier]/page.tsx | Missing layout.tsx |
| ❌ /boat-parties/products | boat-parties/products/page.tsx | Missing layout.tsx |
| ❌ /corporate/products | corporate/products/page.tsx | Missing layout.tsx |
| ❌ /weddings/packages/:tier | weddings/packages/[tier]/page.tsx | Missing layout.tsx |
| ❌ /weddings/products | weddings/products/page.tsx | Missing layout.tsx |
| ❌ /products-test | products-test/page.tsx | Missing layout.tsx |

**Action Items:**
- [ ] Create `layout.tsx` for each missing page
- [ ] Test locally: `npm run build`
- [ ] Commit to dev branch
- [ ] Deploy to production
- [ ] Request re-indexing via Google Search Console

---

## 🟠 Batch 2: High Priority Pages (Deploy Next)

### Status: Pending

| Route | File Path |
|-------|-----------|
| /about | about/page.tsx |
| /contact | contact/page.tsx |
| /order | order/page.tsx |
| /services | services/page.tsx |
| /partners | partners/page.tsx |
| /partners/hotels-resorts | partners/hotels-resorts/page.tsx |
| /partners/lynns-lodging | partners/lynns-lodging/page.tsx |
| /partners/mobile-bartenders | partners/mobile-bartenders/page.tsx |
| /partners/property-management | partners/property-management/page.tsx |
| /partners/vacation-rentals | partners/vacation-rentals/page.tsx |

**Action Items:**
- [ ] Create `layout.tsx` for each page
- [ ] Test locally: `npm run build`
- [ ] Commit to dev branch
- [ ] Deploy to production

---

## 🟡 Batch 3: Medium Priority (Deploy Week 2)

**Total:** 24 pages

Pages include:
- Checkout flow (`/checkout`, `/checkout/success`)
- Collections (`/collections`, `/collections/:handle`)
- Delivery areas, FAQs, Terms, Privacy
- Test/demo pages (`/shopify-test`, `/old-fashioned`, `/negroni`, etc.)

**Action Items:**
- [ ] Prioritize based on traffic data
- [ ] Create layouts for public-facing pages first
- [ ] Skip test/demo pages if not in production use

---

## ⚪ Batch 4: Low Priority (Deploy Week 3+)

**Total:** 8 pages

Pages include:
- Account pages (`/account/*`)
- Group order pages (`/group/*`)
- Test pages (`/test-videos`)

**Action Items:**
- [ ] These are authenticated or internal tools
- [ ] Lower SEO impact
- [ ] Fix as time permits

---

## ✅ Already Passing (No Action Needed)

| Route | File Path | Metadata Source |
|-------|-----------|----------------|
| ✅ /boat-parties | boat-parties/page.tsx | boat-parties/layout.tsx |
| ✅ /corporate | corporate/page.tsx | corporate/layout.tsx |
| ✅ /faqs | faqs/page.tsx | faqs/layout.tsx |
| ✅ /products | products/page.tsx | products/layout.tsx |
| ✅ /weddings | weddings/page.tsx | weddings/layout.tsx |

---

## 📋 Fix Template

For each page needing a layout, create `[page-directory]/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: '[Page Title] | Party On Delivery Austin',
  description: '[Compelling description under 155 characters]',
  keywords: '[relevant, keywords, here]',
  openGraph: {
    title: '[Page Title]',
    description: '[Description]',
    type: 'website',
    url: 'https://partyondelivery.com/[route]',
  },
  alternates: {
    canonical: '/[route]',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Optional: Add JSON-LD structured data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': '[Schema Type]',
  // ... schema properties
};

export default function [Page]Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {structuredData && (
        <Script
          id="[page]-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {children}
    </>
  );
}
```

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Run `npm run build` (should complete without errors)
- [ ] Check build output for metadata warnings
- [ ] Verify no TypeScript errors

### Production Testing
- [ ] Deploy to production
- [ ] Test server HTML: `curl -s https://partyondelivery.com/[route] | grep -E "<title>|meta name="`
- [ ] Verify title and description are in HTML (not empty/generic)
- [ ] Run Lighthouse SEO audit (target: 90+)

### Google Search Console
- [ ] URL Inspection for each fixed page
- [ ] Click "Request Indexing"
- [ ] Submit sitemap: https://partyondelivery.com/sitemap.xml
- [ ] Monitor "Pages" → "Indexed" count daily

---

## 📈 Success Metrics

| Metric | Current | Week 1 Target | Week 2 Target | Week 4 Target |
|--------|---------|--------------|--------------|--------------|
| Indexed Pages | ~0 | 50+ | 100+ | 225+ |
| P0 Pages Fixed | 1/9 | 9/9 | 9/9 | 9/9 |
| P1 Pages Fixed | 0/10 | 0/10 | 10/10 | 10/10 |
| SEO Score (Lighthouse) | Unknown | 90+ | 95+ | 95+ |
| Organic Impressions | Baseline | +20% | +50% | +100% |

---

## 📅 Timeline

### Week 1 (Oct 29 - Nov 4)
- [x] Deploy /corporate fix (DONE)
- [ ] Fix remaining 8 P0 pages
- [ ] Deploy Batch 1 to production
- [ ] Request re-indexing for P0 pages

### Week 2 (Nov 5 - Nov 11)
- [ ] Fix 10 P1 pages
- [ ] Deploy Batch 2 to production
- [ ] Monitor Search Console for indexation recovery
- [ ] Begin P2 pages if time permits

### Week 3-4 (Nov 12 - Nov 25)
- [ ] Complete P2 pages
- [ ] Address P3 pages if needed
- [ ] Final validation and monitoring
- [ ] Document lessons learned

---

## 🚨 Rollback Plan

If issues arise after deployment:

1. **Immediate Rollback:**
   ```bash
   git revert [commit-hash]
   git push origin main
   ```

2. **Verify Rollback:**
   - Check production site loads correctly
   - Verify no 500 errors in logs
   - Test key user flows (order, products, contact)

3. **Debug:**
   - Review build logs
   - Check TypeScript errors
   - Verify metadata export syntax
   - Test locally with production build

---

## 📝 Notes

- **Root Cause:** Corporate page deployed Oct 21st with client-side metadata manipulation
- **Impact:** Search engines couldn't see proper titles/descriptions → de-indexed site
- **Solution:** Create server-side `layout.tsx` files with proper `Metadata` exports
- **Validation:** All metadata must be in initial HTML before JavaScript runs

---

## ✅ Completion Criteria

Batch 1 is complete when:
- [ ] All 9 P0 pages have `layout.tsx` files
- [ ] `npm run build` succeeds
- [ ] Production curl tests show proper `<title>` tags
- [ ] Committed to dev branch
- [ ] Deployed to production
- [ ] Re-indexing requested in Search Console

---

**Last Updated:** 2025-10-29
**Owner:** SEO Recovery Team
**Priority:** CRITICAL
