#!/usr/bin/env python3
"""
Sitemap Validator for PartyOn Delivery
Validates XML structure, content, and URL accessibility
"""

import os
import gzip
import requests
from lxml import etree
from urllib.parse import urlparse
from datetime import datetime
from tqdm import tqdm
import re
import random

# ==================== CONFIGURATION ====================
OUTPUT_DIR = "./output"
PRIMARY_DOMAIN = "https://partyondelivery.com"
MAX_URLS_PER_FILE = 50000
MAX_FILE_SIZE_MB = 50
REQUEST_TIMEOUT = 5
USER_AGENT = "PartyOnSitemapValidator/1.0"

NS_SITEMAP = "http://www.sitemaps.org/schemas/sitemap/0.9"

# ==================== VALIDATION FUNCTIONS ====================

def validate_xml_structure(filepath: str) -> tuple:
    """Validate XML well-formedness and schema"""
    errors = []

    try:
        # Decompress if gzipped
        if filepath.endswith('.gz'):
            with gzip.open(filepath, 'rb') as f:
                content = f.read()
        else:
            with open(filepath, 'rb') as f:
                content = f.read()

        # Parse XML
        tree = etree.fromstring(content)

        # Check root element
        if tree.tag not in [f'{{{NS_SITEMAP}}}urlset', f'{{{NS_SITEMAP}}}sitemapindex']:
            errors.append(f"Invalid root element: {tree.tag}")

        # Validate namespace
        if tree.nsmap.get(None) != NS_SITEMAP:
            errors.append(f"Missing or incorrect namespace")

        return True, errors

    except etree.XMLSyntaxError as e:
        return False, [f"XML syntax error: {e}"]
    except Exception as e:
        return False, [f"Validation error: {e}"]

def validate_file_size(filepath: str) -> tuple:
    """Check file size limits"""
    size_mb = os.path.getsize(filepath) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        return False, f"File too large: {size_mb:.2f}MB (max {MAX_FILE_SIZE_MB}MB)"

    return True, None

def validate_url_count(filepath: str) -> tuple:
    """Check URL count limits"""
    with gzip.open(filepath, 'rb') as f:
        tree = etree.parse(f)

    urls = tree.xpath('//ns:url', namespaces={'ns': NS_SITEMAP})
    count = len(urls)

    if count > MAX_URLS_PER_FILE:
        return False, f"Too many URLs: {count} (max {MAX_URLS_PER_FILE})"

    return True, None

def validate_lastmod_format(filepath: str) -> list:
    """Check lastmod date formats"""
    errors = []

    with gzip.open(filepath, 'rb') as f:
        tree = etree.parse(f)

    lastmods = tree.xpath('//ns:lastmod/text()', namespaces={'ns': NS_SITEMAP})

    # ISO 8601 pattern
    iso_pattern = r'^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$'

    for lastmod in lastmods:
        if not re.match(iso_pattern, lastmod):
            errors.append(f"Invalid lastmod format: {lastmod}")

    return errors

def validate_url_accessibility(filepath: str, sample_size: int = 20) -> dict:
    """Test URL accessibility (sample)"""
    session = requests.Session()
    session.headers['User-Agent'] = USER_AGENT

    with gzip.open(filepath, 'rb') as f:
        tree = etree.parse(f)

    urls = tree.xpath('//ns:loc/text()', namespaces={'ns': NS_SITEMAP})

    # Sample URLs
    sample_urls = random.sample(urls, min(sample_size, len(urls)))

    results = {
        '200': 0,
        '301': 0,
        '404': 0,
        'errors': 0
    }

    for url in tqdm(sample_urls, desc="Testing URLs"):
        try:
            resp = session.head(url, timeout=REQUEST_TIMEOUT, allow_redirects=False)

            if resp.status_code == 200:
                results['200'] += 1
            elif resp.status_code == 301:
                results['301'] += 1
            elif resp.status_code == 404:
                results['404'] += 1
            else:
                results['errors'] += 1
        except:
            results['errors'] += 1

    return results

# ==================== MAIN WORKFLOW ====================

def main():
    print("=" * 70)
    print("PartyOn Delivery - Sitemap Validation")
    print("=" * 70)

    # Find all sitemap files
    sitemap_files = [f for f in os.listdir(OUTPUT_DIR) if f.startswith('sitemap') and f.endswith('.gz')]

    if not sitemap_files:
        print("[ERROR] No sitemap files found in output directory")
        return

    print(f"\n[FILES] Found {len(sitemap_files)} sitemap files")

    validation_results = {}

    for sitemap_file in tqdm(sitemap_files, desc="Validating"):
        filepath = os.path.join(OUTPUT_DIR, sitemap_file)

        results = {
            'file': sitemap_file,
            'xml_valid': False,
            'size_valid': False,
            'url_count_valid': False,
            'lastmod_errors': [],
            'accessibility': {}
        }

        # XML structure
        xml_valid, xml_errors = validate_xml_structure(filepath)
        results['xml_valid'] = xml_valid
        results['xml_errors'] = xml_errors

        if not xml_valid:
            validation_results[sitemap_file] = results
            continue

        # File size
        size_valid, size_error = validate_file_size(filepath)
        results['size_valid'] = size_valid
        if size_error:
            results['size_error'] = size_error

        # URL count
        if 'sitemapindex' not in sitemap_file:
            count_valid, count_error = validate_url_count(filepath)
            results['url_count_valid'] = count_valid
            if count_error:
                results['url_count_error'] = count_error

            # Lastmod format
            results['lastmod_errors'] = validate_lastmod_format(filepath)

            # URL accessibility (sample)
            if 'pages-1' in sitemap_file or 'products-1' in sitemap_file:
                results['accessibility'] = validate_url_accessibility(filepath)

        validation_results[sitemap_file] = results

    # Generate report
    print("\n" + "=" * 70)
    print("Validation Report")
    print("=" * 70)

    all_valid = True

    for filename, results in validation_results.items():
        print(f"\n[FILE] {filename}")

        if results['xml_valid']:
            print("   [OK] XML structure valid")
        else:
            print("   [ERROR] XML structure invalid:")
            for error in results.get('xml_errors', []):
                print(f"      - {error}")
            all_valid = False

        if results['size_valid']:
            print("   [OK] File size OK")
        else:
            print(f"   [ERROR] {results.get('size_error', 'Size check failed')}")
            all_valid = False

        if results.get('url_count_valid'):
            print("   [OK] URL count OK")
        elif results.get('url_count_error'):
            print(f"   [ERROR] {results['url_count_error']}")
            all_valid = False

        if results.get('lastmod_errors'):
            print(f"   [WARN]  {len(results['lastmod_errors'])} lastmod format issues")
            all_valid = False
        else:
            if 'sitemapindex' not in filename:
                print("   [OK] Lastmod dates OK")

        if results.get('accessibility'):
            acc = results['accessibility']
            print(f"   [ANALYZE] Accessibility (sample):")
            print(f"      200 OK: {acc['200']}")
            print(f"      301 Redirect: {acc['301']}")
            print(f"      404 Not Found: {acc['404']}")
            print(f"      Errors: {acc['errors']}")

            if acc['404'] > 0 or acc['errors'] > 0:
                print("      [WARN]  Some URLs are not accessible")

    # Final verdict
    print("\n" + "=" * 70)
    if all_valid:
        print("[OK] All validations passed!")
        print("\n[READY] Ready to submit to search engines")
        print("   Run: python submit_search_engines.sh")
    else:
        print("[ERROR] Some validations failed")
        print("   Review errors above and rebuild sitemaps if needed")

    print("=" * 70)

if __name__ == "__main__":
    main()
