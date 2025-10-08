# PartyOn Delivery - Sitemap Rebuild System

## 📋 Step-by-Step Execution Guide

### Step 1: Prepare Your Old Sitemap

1. **Download your current/old sitemap** from your live site:
   - Visit: `https://partyondelivery.com/sitemap.xml`
   - Save it as `old_sitemap.xml`
   - Place it in the `sitemap_build/` directory

   Or if you don't have one, create a dummy file:
   ```bash
   echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>' > old_sitemap.xml
   ```

### Step 2: Set Up Python Environment

```bash
# Navigate to the sitemap_build directory
cd "C:\Party On Delivery\WEBSITE FILES\PartyOn2\sitemap_build"

# Create virtual environment
python -m venv .venv

# Activate it (Windows)
.venv\Scripts\activate

# Activate it (Mac/Linux)
# source .venv/bin/activate

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

You should see output like:
```
Successfully installed requests-2.31.0 lxml-5.1.0 beautifulsoup4-4.12.3 ...
```

### Step 3: Set Environment Variables (Optional but Recommended)

For Shopify product discovery to work, set your environment variables:

**Windows (Command Prompt):**
```cmd
set NEXT_PUBLIC_SHOPIFY_DOMAIN=premier-concierge.myshopify.com
set NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=0135c2027fd4ff7e7d33a3e4b8123ece
```

**Windows (PowerShell):**
```powershell
$env:NEXT_PUBLIC_SHOPIFY_DOMAIN="premier-concierge.myshopify.com"
$env:NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="0135c2027fd4ff7e7d33a3e4b8123ece"
```

**Mac/Linux:**
```bash
export NEXT_PUBLIC_SHOPIFY_DOMAIN=premier-concierge.myshopify.com
export NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=0135c2027fd4ff7e7d33a3e4b8123ece
```

### Step 4: Run the Crawl & Merge

```bash
python crawl_and_merge.py
```

**What to expect:**
- ✅ Loaded robots.txt
- ✅ Loaded X URLs from legacy sitemap
- ✅ Discovered X URLs from Next.js sitemap
- ✅ Discovered X products from Shopify API
- 🕷️  Crawling progress bar
- ✅ Complete! Files saved to output/

**Outputs created:**
- `output/urls_current.csv` - All current URLs
- `output/urls_legacy.csv` - Legacy URLs from old sitemap
- `output/url_inventory.csv` - Merged inventory

### Step 5: Map Redirects

```bash
python map_redirects.py
```

**What to expect:**
- ✅ X URLs unchanged (no redirect needed)
- 🔍 X URLs need mapping
- 🔀 Finding best matches progress bar
- ✅ Complete! Redirects mapped

**Outputs created:**
- `output/redirects.csv` - **Import this to Shopify**
- `output/orphans.csv` - URLs that couldn't be matched
- `output/unchanged.csv` - URLs that stayed the same

**Review orphans.csv** - manually map any critical legacy URLs

### Step 6: Build Sitemaps

```bash
python build_sitemaps.py
```

**What to expect:**
- 📂 Loading URL inventory
- 📊 Categorizing URLs (pages: X, products: X, blogs: X, collections: X)
- 🏗️  Building sitemaps progress bar
- 📑 Building sitemap index
- ✅ Complete! Files saved to output/

**Outputs created:**
- `output/sitemap_index.xml.gz` - **Main file to upload**
- `output/sitemap-pages-1.xml.gz`
- `output/sitemap-products-1.xml.gz`
- `output/sitemap-blogs-1.xml.gz`
- `output/sitemap-collections-1.xml.gz`
- `output/validation_report.txt` - **Review this!**

### Step 7: Validate Sitemaps

```bash
python validate_sitemaps.py
```

**What to expect:**
- 📁 Found X sitemap files
- Validating progress bar
- ✅ Validation Report with checks for each file
- ✅ All validations passed! (or errors to fix)

**If you see errors:**
- Review the error messages
- Fix any issues in the source data
- Re-run `python build_sitemaps.py`

### Step 8: Deploy to Production

#### 8A. Upload Sitemaps

**Option 1: Via Vercel Dashboard**
1. Go to your Vercel project
2. Go to Storage or upload to `/public/` directory
3. Upload all `sitemap*.xml.gz` files from `output/`

**Option 2: Via Git** (Recommended)
```bash
# Copy sitemaps to public directory
cp output/sitemap*.xml.gz ../public/

# Commit and push
cd ..
git add public/sitemap*.xml.gz
git commit -m "Add production sitemaps"
git push origin main
```

#### 8B. Update Robots.txt

Add this line to `/public/robots.txt`:
```
Sitemap: https://partyondelivery.com/sitemap_index.xml.gz
```

Or see `robots_update.txt` for the full recommended robots.txt

#### 8C. Upload Redirects to Shopify

1. Log in to Shopify Admin
2. Go to **Online Store** → **Navigation** → **URL Redirects**
3. Click **Import**
4. Upload `output/redirects.csv`
5. Verify redirects are active

### Step 9: Submit to Search Engines

**After sitemaps are live in production:**

**Windows (Git Bash):**
```bash
bash submit_search_engines.sh
```

**Or manually:**
- Google: https://www.google.com/ping?sitemap=https://partyondelivery.com/sitemap_index.xml.gz
- Bing: https://www.bing.com/ping?sitemap=https://partyondelivery.com/sitemap_index.xml.gz

**In Google Search Console:**
1. Go to **Sitemaps** section
2. Add sitemap URL: `https://partyondelivery.com/sitemap_index.xml.gz`
3. Click **Submit**
4. Monitor for success/errors over next 24-48 hours

### Step 10: Verify & Monitor

Use `qa_checklist.md` to verify:
- [ ] Sitemaps accessible at live URL
- [ ] Random URLs return 200 OK
- [ ] Google Search Console shows "Success"
- [ ] Redirects working correctly
- [ ] No critical errors

## 🔄 Maintenance

**Re-run monthly or after major site changes:**

```bash
cd "C:\Party On Delivery\WEBSITE FILES\PartyOn2\sitemap_build"
.venv\Scripts\activate
python crawl_and_merge.py
python map_redirects.py
python build_sitemaps.py
python validate_sitemaps.py
# Upload new sitemaps to production
```

## 🐛 Troubleshooting

### "Module not found" error
```bash
# Make sure venv is activated
.venv\Scripts\activate
# Reinstall dependencies
python -m pip install -r requirements.txt
```

### "old_sitemap.xml not found"
```bash
# Create a dummy file if you don't have one
echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>' > old_sitemap.xml
```

### "No products found from Shopify"
- Check environment variables are set
- Verify Shopify access token is correct
- Script will still work, just won't include Shopify products

### Slow crawling
- Adjust `CRAWL_DELAY` in `crawl_and_merge.py` (default: 0.3 seconds)
- Reduce `MAX_CRAWL_PAGES` if site is very large

## 📞 Need Help?

1. Check `Plan.md` for detailed explanations
2. Review `qa_checklist.md` for common issues
3. Check output logs for specific error messages
4. Review `output/validation_report.txt` after building

## 📁 Directory Structure

```
sitemap_build/
├── README.md                      # This file
├── Plan.md                        # Detailed plan
├── qa_checklist.md               # QA checklist
├── robots_update.txt             # Robots.txt snippet
├── requirements.txt              # Python dependencies
├── Makefile                      # Build automation (optional)
├── crawl_and_merge.py            # Step 1
├── map_redirects.py              # Step 2
├── build_sitemaps.py             # Step 3
├── validate_sitemaps.py          # Step 4
├── submit_search_engines.sh      # Step 5
├── old_sitemap.xml              # Your old sitemap (you provide)
├── .venv/                        # Virtual environment
└── output/                       # Generated files
    ├── urls_current.csv
    ├── urls_legacy.csv
    ├── url_inventory.csv
    ├── redirects.csv             # Import to Shopify
    ├── orphans.csv
    ├── unchanged.csv
    ├── sitemap_index.xml.gz      # Upload to production
    ├── sitemap-pages-1.xml.gz
    ├── sitemap-products-1.xml.gz
    ├── sitemap-blogs-1.xml.gz
    ├── sitemap-collections-1.xml.gz
    └── validation_report.txt
```

---

**You're all set! Follow the steps above and you'll have production-ready sitemaps in about 10-15 minutes.** 🚀
