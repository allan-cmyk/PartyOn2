# Sitemap Rebuild & Deploy Plan for PartyOnDelivery.com

## Prerequisites
- Python 3.9+
- Your old sitemap file saved as `./old_sitemap.xml`
- Access to deploy robots.txt to production
- (Optional) Google Search Console credentials for API submission

## Quick Start

```bash
# 1. Setup environment
python -m venv .venv
.venv\Scripts\activate  # On Mac/Linux: source .venv/bin/activate

# 2. Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# 3. Place your old sitemap
# Copy old_sitemap.xml to this directory

# 4. Run full workflow (one command at a time)
python crawl_and_merge.py
python map_redirects.py
python build_sitemaps.py
python validate_sitemaps.py
```

## What Each Step Does

### 1. **Crawl & Merge** (`python crawl_and_merge.py`)
- Loads your legacy sitemap (old_sitemap.xml)
- Fetches current https://partyondelivery.com/sitemap.xml (Next.js generated)
- Discovers Shopify products/collections via Storefront API
- Crawls remaining pages (blogs, services, locations)
- Normalizes URLs & filters exclusions
- Outputs: `output/urls_current.csv`, `output/urls_legacy.csv`, `output/url_inventory.csv`

### 2. **Map Redirects** (`python map_redirects.py`)
- Compares legacy vs current URLs
- Uses fuzzy slug matching for changed paths
- Generates Shopify-compatible redirects.csv
- Flags orphaned URLs for manual review
- Outputs: `output/redirects.csv`, `output/orphans.csv`, `output/unchanged.csv`

### 3. **Build Sitemaps** (`python build_sitemaps.py`)
- Filters to canonical, 200-status URLs only
- Splits by type: pages, products, collections, blogs
- Adds image sitemap entries (og:image + product images)
- Auto-splits at 49k URLs / 45MB per file
- Gzips all files for bandwidth efficiency
- Outputs: `output/sitemap_index.xml.gz`, `output/sitemap-*-1.xml.gz`, etc.

### 4. **Validate** (`python validate_sitemaps.py`)
- Checks XML well-formedness & namespaces
- Verifies lastmod dates (ISO 8601)
- Confirms file size / URL count limits
- Tests that all URLs resolve 200/301
- Outputs: `output/validation_report.txt`

### 5. **Submit** (Manual after deployment)
- Upload sitemaps to production
- Update robots.txt
- Run: `bash submit_search_engines.sh` (or use Git Bash on Windows)

## Configuration

Edit script headers to customize:

```python
PRIMARY_DOMAIN = "https://partyondelivery.com"
EXCLUDE_PATH_PATTERNS = r"(^/cart)|(^/checkout)|(^/account)|(\?.*utm_)"
MAX_URLS_PER_FILE = 49000
DEFAULT_CHANGEFREQ = "weekly"
DEFAULT_PRIORITY = 0.5
GENERATE_IMAGE_SITEMAP = True
```

## Deployment

1. **Upload Sitemaps**: Copy `output/sitemap*.xml.gz` to your site's `/public/` directory (or CDN)
2. **Update Robots.txt**: Add line from `robots_update.txt`
3. **Upload Redirects**: Import `output/redirects.csv` to Shopify > Navigation > URL Redirects
4. **Verify**: Use `qa_checklist.md` to confirm everything works

## Troubleshooting

- **"No products found"**: Check `SHOPIFY_STOREFRONT_ACCESS_TOKEN` env var
- **"Old sitemap missing"**: Ensure `old_sitemap.xml` exists in root
- **Rate limits**: Adjust `CRAWL_DELAY` in crawl script (default: 0.3s)
- **Large sitemaps**: Increase `MAX_URLS_PER_FILE` if needed (max 50k)

## Maintenance

Re-run weekly or after major site changes:
```bash
python crawl_and_merge.py
python map_redirects.py
python build_sitemaps.py
python validate_sitemaps.py
```

Keep old sitemaps for historical comparison in `output/archive/`.
