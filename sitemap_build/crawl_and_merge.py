#!/usr/bin/env python3
"""
Crawl & Merge Script for PartyOn Delivery Sitemap Rebuild
Discovers current URLs, merges with legacy sitemap, validates all endpoints
"""

import os
import re
import sys
import time
import requests
import pandas as pd
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.robotparser import RobotFileParser
from bs4 import BeautifulSoup
from lxml import etree
from tqdm import tqdm
from typing import Set, Dict, List, Tuple
from datetime import datetime
import json

# ==================== CONFIGURATION ====================
PRIMARY_DOMAIN = "https://partyondelivery.com"
OLD_SITEMAP_PATH = "./old_sitemap.xml"
OUTPUT_DIR = "./output"
EXCLUDE_PATH_PATTERNS = r"(^/cart)|(^/checkout)|(^/account)|(^/admin)|(\?.*utm_)|(\?variant=)|(\?page=thank_you)"
RESPECT_ROBOTS = True
MAX_CRAWL_PAGES = 1000  # Safety limit
CRAWL_DELAY = 0.3  # Seconds between requests
REQUEST_TIMEOUT = 10
USER_AGENT = "PartyOnSitemapBot/1.0 (SEO Audit)"

# Shopify Storefront API (read from env or use placeholder)
SHOPIFY_DOMAIN = os.getenv("NEXT_PUBLIC_SHOPIFY_DOMAIN", "premier-concierge.myshopify.com")
SHOPIFY_ACCESS_TOKEN = os.getenv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN", "")

# ==================== UTILITIES ====================

def setup_session() -> requests.Session:
    """Create configured requests session"""
    session = requests.Session()
    session.headers.update({
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
    })
    return session

def normalize_url(url: str) -> str:
    """Normalize URL: lowercase host, strip fragments, trim trailing slash"""
    parsed = urlparse(url)

    # Lowercase scheme and netloc
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path

    # Strip trailing slash except for root
    if path != '/' and path.endswith('/'):
        path = path.rstrip('/')

    # Remove fragment
    fragment = ''

    # Keep query unless it matches exclude patterns
    query = parsed.query
    if query and re.search(EXCLUDE_PATH_PATTERNS, f"?{query}"):
        query = ''

    return urlunparse((scheme, netloc, path, parsed.params, query, fragment))

def should_exclude(url: str) -> bool:
    """Check if URL matches exclusion patterns"""
    parsed = urlparse(url)
    full_path = f"{parsed.path}?{parsed.query}" if parsed.query else parsed.path
    return bool(re.search(EXCLUDE_PATH_PATTERNS, full_path))

def is_internal(url: str, domain: str) -> bool:
    """Check if URL belongs to primary domain"""
    return urlparse(url).netloc == urlparse(domain).netloc

def load_robots_parser() -> RobotFileParser:
    """Load and parse robots.txt"""
    rp = RobotFileParser()
    rp.set_url(urljoin(PRIMARY_DOMAIN, '/robots.txt'))
    try:
        rp.read()
        print(f"[OK] Loaded robots.txt from {PRIMARY_DOMAIN}")
    except Exception as e:
        print(f"[WARN] Could not load robots.txt: {e}")
    return rp

# ==================== LEGACY SITEMAP LOADING ====================

def load_legacy_sitemap(path: str) -> List[Dict]:
    """Extract URLs from old sitemap XML"""
    if not os.path.exists(path):
        print(f"[WARN] Old sitemap not found at {path}, skipping legacy URLs")
        return []

    try:
        tree = etree.parse(path)
        root = tree.getroot()

        # Handle both sitemap and sitemapindex
        namespaces = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

        urls = []
        for loc in root.xpath('//ns:loc/text()', namespaces=namespaces):
            urls.append({
                'url': normalize_url(loc),
                'source': 'legacy'
            })

        print(f"[OK] Loaded {len(urls)} URLs from legacy sitemap")
        return urls

    except Exception as e:
        print(f"❌ Error parsing legacy sitemap: {e}")
        return []

# ==================== CURRENT SITEMAP DISCOVERY ====================

def discover_from_nextjs_sitemap(session: requests.Session) -> List[Dict]:
    """Fetch current Next.js generated sitemap"""
    sitemap_url = urljoin(PRIMARY_DOMAIN, '/sitemap.xml')

    try:
        resp = session.get(sitemap_url, timeout=REQUEST_TIMEOUT)
        if resp.status_code != 200:
            print(f"[WARN] Could not fetch Next.js sitemap (HTTP {resp.status_code})")
            return []

        tree = etree.fromstring(resp.content)
        namespaces = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

        urls = []
        for url_elem in tree.xpath('//ns:url', namespaces=namespaces):
            loc = url_elem.xpath('ns:loc/text()', namespaces=namespaces)
            lastmod = url_elem.xpath('ns:lastmod/text()', namespaces=namespaces)

            if loc:
                urls.append({
                    'url': normalize_url(loc[0]),
                    'lastmod': lastmod[0] if lastmod else None,
                    'source': 'nextjs_sitemap'
                })

        print(f"[OK] Discovered {len(urls)} URLs from Next.js sitemap")
        return urls

    except Exception as e:
        print(f"[WARN] Error fetching Next.js sitemap: {e}")
        return []

# ==================== SHOPIFY API DISCOVERY ====================

def fetch_shopify_products(session: requests.Session) -> List[Dict]:
    """Fetch products via Shopify Storefront API"""
    if not SHOPIFY_ACCESS_TOKEN:
        print("[WARN] No Shopify access token, skipping product discovery")
        return []

    query = """
    {
      products(first: 250) {
        edges {
          node {
            handle
            updatedAt
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
    """

    try:
        resp = session.post(
            f"https://{SHOPIFY_DOMAIN}/api/2024-01/graphql.json",
            json={'query': query},
            headers={
                'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            timeout=REQUEST_TIMEOUT
        )

        if resp.status_code != 200:
            print(f"[WARN] Shopify API error (HTTP {resp.status_code})")
            return []

        data = resp.json()
        products = data.get('data', {}).get('products', {}).get('edges', [])

        urls = []
        for edge in products:
            node = edge['node']
            urls.append({
                'url': f"{PRIMARY_DOMAIN}/products/{node['handle']}",
                'lastmod': node.get('updatedAt'),
                'images': [node['featuredImage']['url']] if node.get('featuredImage') else [],
                'source': 'shopify_api'
            })

        print(f"[OK] Discovered {len(urls)} products from Shopify API")
        return urls

    except Exception as e:
        print(f"[WARN] Error fetching Shopify products: {e}")
        return []

# ==================== WEB CRAWLING ====================

def crawl_page(session: requests.Session, url: str, robots: RobotFileParser) -> Tuple[Dict, Set[str]]:
    """Crawl single page and extract metadata + links"""

    if RESPECT_ROBOTS and not robots.can_fetch(USER_AGENT, url):
        return {'url': url, 'status_code': 403, 'error': 'blocked_by_robots'}, set()

    try:
        resp = session.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)

        page_data = {
            'url': normalize_url(url),
            'status_code': resp.status_code,
            'canonical': None,
            'lastmod': resp.headers.get('Last-Modified'),
            'etag': resp.headers.get('ETag'),
            'content_type': resp.headers.get('Content-Type', ''),
            'images': [],
            'alternates': [],
            'source': 'crawl'
        }

        links = set()

        if resp.status_code == 200 and 'text/html' in page_data['content_type']:
            soup = BeautifulSoup(resp.content, 'lxml')

            # Extract canonical
            canonical = soup.find('link', rel='canonical')
            if canonical and canonical.get('href'):
                page_data['canonical'] = normalize_url(urljoin(url, canonical['href']))

            # Extract Open Graph image
            og_image = soup.find('meta', property='og:image')
            if og_image and og_image.get('content'):
                page_data['images'].append(urljoin(url, og_image['content']))

            # Extract all images (limit to first 10)
            for img in soup.find_all('img', limit=10):
                if img.get('src'):
                    page_data['images'].append(urljoin(url, img['src']))

            # Extract hreflang alternates
            for link in soup.find_all('link', rel='alternate', hreflang=True):
                if link.get('href'):
                    page_data['alternates'].append({
                        'hreflang': link.get('hreflang'),
                        'href': normalize_url(urljoin(url, link['href']))
                    })

            # Extract internal links
            for a in soup.find_all('a', href=True):
                href = urljoin(url, a['href'])
                if is_internal(href, PRIMARY_DOMAIN) and not should_exclude(href):
                    links.add(normalize_url(href))

        return page_data, links

    except requests.RequestException as e:
        return {'url': url, 'status_code': 0, 'error': str(e), 'source': 'crawl'}, set()

def crawl_site(session: requests.Session, seed_urls: Set[str], robots: RobotFileParser) -> List[Dict]:
    """Breadth-first crawl starting from seed URLs"""
    visited = set()
    to_visit = list(seed_urls)
    discovered_pages = []

    pbar = tqdm(total=min(len(to_visit), MAX_CRAWL_PAGES), desc="🕷️  Crawling")

    while to_visit and len(visited) < MAX_CRAWL_PAGES:
        url = to_visit.pop(0)

        if url in visited or should_exclude(url):
            continue

        visited.add(url)
        page_data, new_links = crawl_page(session, url, robots)
        discovered_pages.append(page_data)

        # Add new links to queue
        for link in new_links:
            if link not in visited and link not in to_visit:
                to_visit.append(link)

        pbar.update(1)
        time.sleep(CRAWL_DELAY)

    pbar.close()
    print(f"[OK] Crawled {len(discovered_pages)} pages")

    return discovered_pages

# ==================== MAIN WORKFLOW ====================

def main():
    print("=" * 70)
    print("PartyOn Delivery - Sitemap Crawl & Merge")
    print("=" * 70)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    session = setup_session()
    robots = load_robots_parser()

    # Step 1: Load legacy URLs
    print("\n[STEP 1] Loading legacy sitemap...")
    legacy_urls = load_legacy_sitemap(OLD_SITEMAP_PATH)

    # Step 2: Discover current URLs from Next.js sitemap
    print("\n[STEP 2] Discovering current URLs...")
    current_urls = discover_from_nextjs_sitemap(session)

    # Step 3: Fetch Shopify products
    print("\n[STEP 3] Fetching Shopify products...")
    product_urls = fetch_shopify_products(session)
    current_urls.extend(product_urls)

    # Step 4: Crawl for missing pages
    print("\n[STEP 4] Crawling site for additional pages...")
    seed_urls = {PRIMARY_DOMAIN}
    if current_urls:
        seed_urls.update([u['url'] for u in current_urls[:10]])  # Use first 10 as seeds

    crawled_pages = crawl_site(session, seed_urls, robots)
    current_urls.extend(crawled_pages)

    # Step 5: Normalize and deduplicate
    print("\n[STEP 5] Normalizing and deduplicating...")

    current_df = pd.DataFrame(current_urls)
    legacy_df = pd.DataFrame(legacy_urls)

    # Remove duplicates
    if not current_df.empty:
        current_df = current_df.drop_duplicates(subset=['url'])
    if not legacy_df.empty:
        legacy_df = legacy_df.drop_duplicates(subset=['url'])

    # Merge into inventory
    all_urls = pd.concat([current_df, legacy_df], ignore_index=True)
    all_urls = all_urls.drop_duplicates(subset=['url'], keep='first')

    # Flag issues
    if not all_urls.empty:
        all_urls['is_canonical'] = all_urls.apply(
            lambda row: pd.isna(row.get('canonical')) or row['url'] == row.get('canonical'),
            axis=1
        )
        all_urls['is_200'] = all_urls.get('status_code', 200) == 200

    # Step 6: Save outputs
    print("\n[STEP 6] Saving outputs...")

    current_df.to_csv(f"{OUTPUT_DIR}/urls_current.csv", index=False)
    legacy_df.to_csv(f"{OUTPUT_DIR}/urls_legacy.csv", index=False)
    all_urls.to_csv(f"{OUTPUT_DIR}/url_inventory.csv", index=False)

    print(f"\n[OK] Complete!")
    print(f"   Current URLs: {len(current_df)}")
    print(f"   Legacy URLs: {len(legacy_df)}")
    print(f"   Total unique: {len(all_urls)}")
    if not all_urls.empty:
        print(f"   Non-200 status: {(~all_urls.get('is_200', True)).sum()}")
        print(f"   Non-canonical: {(~all_urls.get('is_canonical', True)).sum()}")
    print(f"\n[FILES] Outputs saved to {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
