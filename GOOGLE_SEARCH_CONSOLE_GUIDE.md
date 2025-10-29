# Google Search Console - Re-Indexing Guide

**Date:** 2025-10-29
**Issue:** Indexed pages dropped from ~225 to nearly 0 on Oct 21st, 2025
**Root Cause:** Client-side metadata manipulation on /corporate page
**Fix Deployed:** 2025-10-29 (Corporate page now has server-side metadata)

---

## ✅ Production Deployment Status

**Git Commits:**
- `063d2d7` - Corporate page SEO fix (server-side metadata)
- `55e93a2` - SEO audit system and deployment plan
- `0852c96` - Merged to main branch

**Files Deployed:**
- `src/app/corporate/layout.tsx` - Server-side metadata export ✅
- `src/app/corporate/page.tsx` - Client-side DOM manipulation removed ✅
- `scripts/seo-audit.ts` - Audit tool for finding similar issues ✅
- `SEO_AUDIT_REPORT.md` - Complete audit findings ✅
- `DEPLOYMENT_CHECKLIST.md` - Batch deployment plan ✅

**Vercel Deployment:**
- Status: Automatically triggered on push to main
- URL: https://partyondelivery.com
- Expected completion: 2-3 minutes after push

---

## 🔍 Step 1: Verify the Fix is Live

### Check Corporate Page Metadata

**Test 1: curl Command** (from terminal/command prompt)
```bash
curl -s "https://partyondelivery.com/corporate" | grep -E "<title>|meta name=\"description\""
```

**What to look for:**
```html
✅ GOOD: <title>Corporate Event Alcohol Delivery – Party On Delivery Austin</title>
✅ GOOD: <meta name="description" content="Simplify your next Austin company event..."/>

❌ BAD:  <title>Party On Delivery - Austin's Premier Alcohol Delivery Service</title>
❌ BAD:  <meta name="description" content="Premium alcohol delivery for weddings..."/>
```

**If you see the generic (BAD) title:**
- Wait 2-3 more minutes for Vercel deployment
- Check Vercel dashboard for deployment status
- Try clearing CDN cache (Vercel → Settings → Edge Caching)
- Try in incognito/private browser window

**Test 2: Browser DevTools**
1. Open https://partyondelivery.com/corporate in Chrome/Edge
2. Right-click → Inspect
3. Click "Elements" tab
4. Look at `<head>` section
5. Find `<title>` and `<meta name="description">` tags
6. Should see "Corporate Event Alcohol Delivery" not generic title

**Test 3: View Page Source**
1. Visit https://partyondelivery.com/corporate
2. Press Ctrl+U (Windows) or Cmd+U (Mac)
3. Search for "Corporate Event Alcohol" in source
4. Should appear in both title and description

---

## 📊 Step 2: Request Re-Indexing in Google Search Console

### Navigate to Search Console

1. Go to: https://search.google.com/search-console
2. Select property: **partyondelivery.com** (or whichever property you're using)

### Request Indexing for Corporate Page

1. In left sidebar, click **URL Inspection**
2. Enter URL: `https://partyondelivery.com/corporate`
3. Click **Request Indexing** button
4. Wait for confirmation (can take 10-30 seconds)

**Screenshot Location:** URL Inspection → Enter URL → Request Indexing

---

## 📄 Step 3: Submit Sitemap (If Not Already Done)

1. In left sidebar, click **Sitemaps**
2. Check if `sitemap.xml` is already submitted
3. If not, enter: `sitemap.xml` and click **Submit**
4. Verify it shows as "Success"

**Your Sitemap URL:** https://partyondelivery.com/sitemap.xml

---

## 🔄 Step 4: Request Indexing for Priority Pages

Request re-indexing for these high-priority pages:

### Batch 1: Already Fixed (Request Now)
- [ ] https://partyondelivery.com/ (homepage)
- [ ] https://partyondelivery.com/corporate (fixed today)
- [ ] https://partyondelivery.com/products
- [ ] https://partyondelivery.com/weddings
- [ ] https://partyondelivery.com/boat-parties
- [ ] https://partyondelivery.com/bach-parties

### Batch 2: Request Tomorrow (spread out requests)
- [ ] https://partyondelivery.com/about
- [ ] https://partyondelivery.com/contact
- [ ] https://partyondelivery.com/services
- [ ] https://partyondelivery.com/faqs
- [ ] https://partyondelivery.com/delivery-areas

**Note:** Google limits URL inspection requests. If you hit the limit, wait 24 hours and continue.

---

## 📈 Step 5: Monitor Re-Indexation Progress

### Daily Checks (Days 1-7)

1. **Check Indexed Pages Count:**
   - Search Console → Pages → Indexed
   - Look for upward trend from ~0 toward 225

2. **Check Coverage Report:**
   - Search Console → Pages → Coverage
   - Monitor "Valid" pages (should increase)
   - Check for new errors (should stay low)

3. **Check Performance:**
   - Search Console → Performance
   - Monitor impressions and clicks
   - Look for recovery in organic traffic

### Tracking Spreadsheet

| Date | Indexed Pages | Valid Pages | Errors | 7-Day Impressions | Notes |
|------|---------------|-------------|--------|-------------------|-------|
| 2025-10-29 | ~0 | ? | ? | Baseline | Fix deployed |
| 2025-10-30 | ? | ? | ? | ? | Re-index requested |
| 2025-10-31 | ? | ? | ? | ? | |
| 2025-11-01 | ? | ? | ? | ? | |
| 2025-11-05 | Target: 50+ | ? | ? | ? | Week 1 goal |
| 2025-11-12 | Target: 100+ | ? | ? | ? | Week 2 goal |
| 2025-11-26 | Target: 225+ | ? | ? | ? | Full recovery |

---

## ⏱️ Expected Timeline

### Week 1 (Oct 29 - Nov 4)
- **Day 1-2:** Google starts crawling fixed pages
- **Day 3-4:** First pages start getting re-indexed
- **Day 5-7:** Indexed count shows upward trend
- **Target:** 50+ pages indexed

### Week 2 (Nov 5 - Nov 11)
- Continued re-indexation
- Organic impressions start recovering
- **Target:** 100+ pages indexed

### Weeks 3-4 (Nov 12 - Nov 25)
- Most pages re-indexed
- Traffic approaching pre-Oct 21 levels
- **Target:** 225+ pages indexed (full recovery)

---

## 🚨 Troubleshooting

### If Pages Aren't Re-Indexing After 7 Days

**1. Check for Other Issues:**
- Run SEO audit: `npx tsx scripts/seo-audit.ts`
- Verify no noindex tags in production HTML
- Check robots.txt allows Googlebot
- Verify sitemap.xml is accessible

**2. Check Coverage Report:**
- Search Console → Pages → Coverage
- Look for specific error messages
- Common issues:
  - "Crawled - currently not indexed" (normal, be patient)
  - "Discovered - currently not indexed" (Google knows about it)
  - "Soft 404" (page returns 404 or has no content)
  - "Server error (5xx)" (site has errors)

**3. Check Crawl Stats:**
- Search Console → Settings → Crawl stats
- Verify Googlebot is crawling daily
- Look for crawl errors or DNS issues
- Check "Requests per day" (should be hundreds)

**4. Force Recrawl:**
- Use URL Inspection → Request Indexing again
- Wait another 3-4 days
- Repeat for key pages

---

## 📞 Escalation (If Needed After 14 Days)

If indexation hasn't improved after 2 weeks:

### Option 1: Google Search Central Help

1. Go to: https://support.google.com/webmasters/community
2. Create new post with:
   - Title: "Site de-indexed on Oct 21, 2025 - Technical issue now fixed"
   - Description:
     ```
     My site partyondelivery.com had 225 indexed pages until Oct 21, 2025.
     On that date, indexed pages dropped to near 0.

     Root cause identified: Client-side metadata manipulation on /corporate page.
     Fix deployed: Oct 29, 2025 - Converted to server-side metadata.

     URL Inspection shows pages are crawlable.
     Sitemap submitted and valid.
     robots.txt allows Googlebot.

     Re-indexing requested on [date], but no improvement after 14 days.

     Request: Manual review or advice on next steps.
     ```
3. Attach screenshots from Search Console
4. Tag with: #indexing #technical #seo

### Option 2: Reconsideration Request (If Manual Action)

1. Search Console → Security & Manual Actions
2. If manual action exists, click "Request Review"
3. Explain the issue was technical (not spam)
4. Show the fix that was implemented

---

## 📋 Success Criteria

The fix is working when:
- ✅ Indexed pages increasing (50+ in week 1, 100+ in week 2)
- ✅ "Valid" pages in Coverage report climbing
- ✅ Organic impressions recovering to baseline
- ✅ No new errors in Coverage report
- ✅ Corporate page shows proper metadata in View Source

---

## 🎯 Next Actions for Future Pages

As you fix the remaining 9 P0 pages + 10 P1 pages:

1. Deploy fix to production
2. Wait 2-3 minutes for Vercel deployment
3. Verify metadata in production HTML
4. Request re-indexing via URL Inspection
5. Track in monitoring spreadsheet

**Do NOT request all pages at once** - Google may see it as spam. Spread out over multiple days.

---

## 📝 Quick Reference Commands

**Check production metadata:**
```bash
curl -s https://partyondelivery.com/corporate | grep -E "<title>|meta name=\"description\""
```

**Run SEO audit:**
```bash
cd "C:\Party On Delivery\WEBSITE FILES\PartyOn2"
npx tsx scripts/seo-audit.ts
```

**Check sitemap:**
```bash
curl -s https://partyondelivery.com/sitemap.xml
```

**Ping Google about sitemap:**
```bash
curl "https://www.google.com/ping?sitemap=https://partyondelivery.com/sitemap.xml"
```

---

**Last Updated:** 2025-10-29
**Next Review:** 2025-11-05 (1 week check-in)
**Full Recovery Target:** 2025-11-26 (4 weeks)
