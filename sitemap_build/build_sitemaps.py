#!/usr/bin/env python3
"""
Sitemap Builder for PartyOn Delivery
Generates Google/Bing-compliant XML sitemaps with splitting & compression
"""

import os
import gzip
import re
import pandas as pd
from lxml import etree
from urllib.parse import urlparse
from datetime import datetime
from typing import List, Dict
from tqdm import tqdm

# ==================== CONFIGURATION ====================
PRIMARY_DOMAIN = "https://partyondelivery.com"
OUTPUT_DIR = "./output"
MAX_URLS_PER_FILE = 49000
MAX_FILE_SIZE_MB = 45
DEFAULT_CHANGEFREQ = "weekly"
DEFAULT_PRIORITY = 0.5
GENERATE_IMAGE_SITEMAP = True
GENERATE_VIDEO_SITEMAP = False
GENERATE_HREFLANG = False

# Priority overrides by URL pattern
PRIORITY_MAP = {
    r'^/$': 1.0,
    r'^/weddings': 0.9,
    r'^/boat-parties': 0.9,
    r'^/bach-parties': 0.9,
    r'^/corporate': 0.9,
    r'^/products/': 0.7,
    r'^/collections/': 0.6,
    r'^/blogs?/': 0.6,
    r'^/delivery/': 0.7,
}

CHANGEFREQ_MAP = {
    r'^/$': 'daily',
    r'^/products/': 'weekly',
    r'^/blogs?/': 'monthly',
}

# XML Namespaces
NS_SITEMAP = "http://www.sitemaps.org/schemas/sitemap/0.9"
NS_IMAGE = "http://www.google.com/schemas/sitemap-image/1.1"
NS_XHTML = "http://www.w3.org/1999/xhtml"

NSMAP = {
    None: NS_SITEMAP,
    'image': NS_IMAGE,
    'xhtml': NS_XHTML
}

# ==================== UTILITIES ====================

def get_priority(url: str) -> float:
    """Determine priority based on URL pattern"""
    path = urlparse(url).path
    for pattern, priority in PRIORITY_MAP.items():
        if re.match(pattern, path):
            return priority
    return DEFAULT_PRIORITY

def get_changefreq(url: str) -> str:
    """Determine changefreq based on URL pattern"""
    path = urlparse(url).path
    for pattern, freq in CHANGEFREQ_MAP.items():
        if re.match(pattern, path):
            return freq
    return DEFAULT_CHANGEFREQ

def format_lastmod(date_str) -> str:
    """Convert date to W3C Datetime format (ISO 8601)"""
    if pd.isna(date_str):
        return datetime.utcnow().strftime('%Y-%m-%d')

    try:
        # Try parsing common formats
        if isinstance(date_str, str):
            if 'T' in date_str:
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                dt = datetime.strptime(date_str, '%Y-%m-%d')
        else:
            dt = date_str

        return dt.strftime('%Y-%m-%d')
    except:
        return datetime.utcnow().strftime('%Y-%m-%d')

def categorize_url(url: str) -> str:
    """Determine URL type for sitemap splitting"""
    path = urlparse(url).path.lower()

    if '/products/' in path:
        return 'products'
    elif '/collections/' in path or '/categories/' in path:
        return 'collections'
    elif '/blog' in path or '/articles/' in path or '/news/' in path:
        return 'blogs'
    else:
        return 'pages'

# ==================== SITEMAP GENERATION ====================

def create_url_element(url_data: Dict, root: etree.Element, include_images: bool = False):
    """Add <url> element to sitemap"""
    url_elem = etree.SubElement(root, 'url')

    # Required: <loc>
    loc = etree.SubElement(url_elem, 'loc')
    loc.text = url_data['url']

    # Optional: <lastmod>
    if 'lastmod' in url_data and url_data['lastmod']:
        lastmod = etree.SubElement(url_elem, 'lastmod')
        lastmod.text = format_lastmod(url_data['lastmod'])

    # Optional: <changefreq>
    changefreq = etree.SubElement(url_elem, 'changefreq')
    changefreq.text = get_changefreq(url_data['url'])

    # Optional: <priority>
    priority = etree.SubElement(url_elem, 'priority')
    priority.text = str(get_priority(url_data['url']))

    # Images
    if include_images and 'images' in url_data and url_data['images']:
        images = url_data['images']
        # Skip if images is NaN or float
        if isinstance(images, float):
            images = []
        elif isinstance(images, str):
            try:
                images = eval(images)  # Convert string representation of list
            except:
                images = [images]
        elif not isinstance(images, list):
            images = []

        for img_url in images[:10]:  # Max 10 images per URL
            img_elem = etree.SubElement(url_elem, f'{{{NS_IMAGE}}}image')
            img_loc = etree.SubElement(img_elem, f'{{{NS_IMAGE}}}loc')
            img_loc.text = img_url

    # Hreflang alternates
    if GENERATE_HREFLANG and 'alternates' in url_data and url_data['alternates']:
        alternates = url_data['alternates']
        if isinstance(alternates, str):
            try:
                alternates = eval(alternates)
            except:
                alternates = []

        for alt in alternates:
            if isinstance(alt, dict):
                link = etree.SubElement(
                    url_elem,
                    f'{{{NS_XHTML}}}link',
                    rel='alternate',
                    hreflang=alt.get('hreflang', ''),
                    href=alt.get('href', '')
                )

def build_sitemap(urls: List[Dict], filename: str, include_images: bool = False):
    """Generate single sitemap XML file"""
    root = etree.Element('urlset', nsmap=NSMAP if include_images else {None: NS_SITEMAP})

    for url_data in urls:
        create_url_element(url_data, root, include_images)

    # Write XML
    tree = etree.ElementTree(root)
    xml_path = f"{OUTPUT_DIR}/{filename}"

    with open(xml_path, 'wb') as f:
        tree.write(f, pretty_print=True, xml_declaration=True, encoding='UTF-8')

    # Gzip
    with open(xml_path, 'rb') as f_in:
        with gzip.open(f"{xml_path}.gz", 'wb') as f_out:
            f_out.writelines(f_in)

    # Remove uncompressed
    os.remove(xml_path)

    return f"{filename}.gz"

def build_sitemap_index(sitemap_files: List[str], filename: str = "sitemap_index.xml"):
    """Generate sitemap index file"""
    root = etree.Element('sitemapindex', xmlns=NS_SITEMAP)

    for sitemap_file in sitemap_files:
        sitemap_elem = etree.SubElement(root, 'sitemap')
        loc = etree.SubElement(sitemap_elem, 'loc')
        loc.text = f"{PRIMARY_DOMAIN}/{sitemap_file}"

        lastmod = etree.SubElement(sitemap_elem, 'lastmod')
        lastmod.text = datetime.utcnow().strftime('%Y-%m-%d')

    # Write XML
    tree = etree.ElementTree(root)
    xml_path = f"{OUTPUT_DIR}/{filename}"

    with open(xml_path, 'wb') as f:
        tree.write(f, pretty_print=True, xml_declaration=True, encoding='UTF-8')

    # Gzip
    with open(xml_path, 'rb') as f_in:
        with gzip.open(f"{xml_path}.gz", 'wb') as f_out:
            f_out.writelines(f_in)

    os.remove(xml_path)

    return f"{filename}.gz"

# ==================== MAIN WORKFLOW ====================

def main():
    print("=" * 70)
    print("PartyOn Delivery - Sitemap Builder")
    print("=" * 70)

    # Load inventory
    print("\n[LOAD] Loading URL inventory...")

    try:
        inventory = pd.read_csv(f"{OUTPUT_DIR}/url_inventory.csv")
    except FileNotFoundError:
        print("❌ Error: url_inventory.csv not found")
        print("   Run crawl_and_merge.py first")
        return

    # Filter to canonical, 200-status URLs (or missing status = assume valid)
    print(f"   Total URLs in inventory: {len(inventory)}")

    if 'status_code' in inventory.columns:
        # Include URLs with 200 status OR missing status (NaN)
        inventory = inventory[(inventory['status_code'] == 200) | (inventory['status_code'].isna())]
    if 'is_canonical' in inventory.columns:
        inventory = inventory[inventory['is_canonical'] == True]

    print(f"   Valid URLs for sitemap: {len(inventory)}")

    # Categorize URLs
    print("\n[ANALYZE] Categorizing URLs...")
    inventory['category'] = inventory['url'].apply(categorize_url)

    category_counts = inventory['category'].value_counts()
    for cat, count in category_counts.items():
        print(f"   {cat}: {count}")

    # Split by category and build sitemaps
    print("\n[BUILD]  Building sitemaps...")
    generated_files = []

    for category in tqdm(category_counts.index, desc="Categories"):
        urls = inventory[inventory['category'] == category].to_dict('records')

        # Split if needed
        chunks = [urls[i:i + MAX_URLS_PER_FILE] for i in range(0, len(urls), MAX_URLS_PER_FILE)]

        for idx, chunk in enumerate(chunks, 1):
            filename = f"sitemap-{category}-{idx}.xml"
            generated_file = build_sitemap(chunk, filename, include_images=GENERATE_IMAGE_SITEMAP)
            generated_files.append(generated_file)

    # Build sitemap index
    print("\n[INDEX] Building sitemap index...")
    index_file = build_sitemap_index(generated_files)

    # Generate validation report
    print("\n[REPORT] Generating validation report...")

    report = f"""
Sitemap Build Report
{'=' * 70}
Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

Summary:
  Total URLs: {len(inventory)}
  Categories: {len(category_counts)}
  Sitemap files: {len(generated_files)}
  Sitemap index: {index_file}

Breakdown by Category:
{category_counts.to_string()}

Generated Files:
{chr(10).join(['  - ' + f for f in generated_files])}

Index File:
  - {index_file}

Next Steps:
  1. Run validate_sitemaps.py to verify correctness
  2. Upload files to production /public/ directory
  3. Update robots.txt with: Sitemap: {PRIMARY_DOMAIN}/sitemap_index.xml.gz
  4. Submit to Google/Bing using submit_search_engines.sh
"""

    with open(f"{OUTPUT_DIR}/validation_report.txt", 'w') as f:
        f.write(report)

    print(report)
    print(f"\n[OK] Complete! Files saved to {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
