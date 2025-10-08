# QA Checklist - Sitemap Deployment

## Pre-Deployment
- [ ] `old_sitemap.xml` placed in project root
- [ ] All Python dependencies installed
- [ ] Shopify access token set in environment (if using API)

## Build Process
- [ ] `python crawl_and_merge.py` completed successfully
- [ ] `urls_current.csv` contains expected URL count
- [ ] `urls_legacy.csv` loaded from old sitemap
- [ ] `url_inventory.csv` shows no unexpected duplicates

## Redirects
- [ ] `redirects.csv` generated with reasonable matches
- [ ] `orphans.csv` reviewed manually for unmapped URLs
- [ ] Redirect similarity scores > 0.6 for all mappings

## Sitemap Generation
- [ ] `sitemap_index.xml.gz` exists
- [ ] Child sitemaps split correctly (pages, products, collections, blogs)
- [ ] All files compressed (.gz)
- [ ] No file exceeds 49k URLs
- [ ] No file exceeds 45MB

## Content Validation
- [ ] All `<loc>` URLs are HTTPS and absolute
- [ ] All `<loc>` URLs are canonical (no redirects)
- [ ] `<lastmod>` present for all URLs in ISO 8601 format
- [ ] `<priority>` values reasonable (0.5-1.0)
- [ ] `<changefreq>` values appropriate for page types

## Image Sitemap (if enabled)
- [ ] Image URLs are absolute
- [ ] Max 10 images per page URL
- [ ] Image URLs resolve correctly

## Accessibility
- [ ] Spot-check 20 random URLs return 200 OK
- [ ] Homepage in sitemap with priority 1.0
- [ ] Key service pages (weddings, products) included
- [ ] Blog posts included with correct dates
- [ ] No cart/checkout/account URLs present

## Robots.txt
- [ ] `robots.txt` updated with sitemap index URL:
      `Sitemap: https://partyondelivery.com/sitemap_index.xml.gz`
- [ ] No conflicting Disallow rules

## Search Engine Submission
- [ ] Google ping returned HTTP 200
- [ ] Bing ping returned HTTP 200
- [ ] Google Search Console shows new sitemap
- [ ] All child sitemaps appear in Search Console
- [ ] No critical errors in Search Console

## Redirects Upload
- [ ] `redirects.csv` imported to Shopify > Navigation > URL Redirects
- [ ] Sample legacy URLs now 301 to correct destinations
- [ ] No redirect chains (A → B → C)

## Post-Deployment (24-48 hours)
- [ ] Google Search Console shows "Success" status
- [ ] Indexed URL count increasing
- [ ] No unexpected errors in Search Console
- [ ] Traffic from legacy URLs redirecting correctly

## Notes
- Review `output/validation_report.txt` for detailed statistics
- Keep `old_sitemap.xml` for future comparison
- Re-run workflow weekly or after major content changes
