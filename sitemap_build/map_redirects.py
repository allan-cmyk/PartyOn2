#!/usr/bin/env python3
"""
Redirect Mapper for PartyOn Delivery
Fuzzy-matches legacy URLs to current URLs for 301 redirects
"""

import os
import re
import pandas as pd
from difflib import SequenceMatcher
from urllib.parse import urlparse
from tqdm import tqdm

# ==================== CONFIGURATION ====================
OUTPUT_DIR = "./output"
SIMILARITY_THRESHOLD = 0.6  # Minimum similarity score (0-1)
PRIMARY_DOMAIN = "https://partyondelivery.com"

# ==================== UTILITIES ====================

def extract_slug(url: str) -> str:
    """Extract meaningful slug from URL path"""
    parsed = urlparse(url)
    path = parsed.path.strip('/')

    # Remove common prefixes
    path = re.sub(r'^(blogs?|pages?|products?|collections?|articles?)/', '', path)

    # Extract last segment
    segments = path.split('/')
    return segments[-1] if segments else path

def compute_similarity(slug1: str, slug2: str) -> float:
    """Calculate similarity between two slugs"""
    return SequenceMatcher(None, slug1.lower(), slug2.lower()).ratio()

def find_best_match(legacy_url: str, current_urls: pd.DataFrame) -> tuple:
    """Find best matching current URL for legacy URL"""
    legacy_slug = extract_slug(legacy_url)

    best_match = None
    best_score = 0

    for _, row in current_urls.iterrows():
        current_url = row['url']
        current_slug = extract_slug(current_url)

        score = compute_similarity(legacy_slug, current_slug)

        # Boost score if path structure is similar
        legacy_path = urlparse(legacy_url).path
        current_path = urlparse(current_url).path
        if legacy_path.split('/')[1:2] == current_path.split('/')[1:2]:  # Same top-level segment
            score += 0.1

        if score > best_score and score >= SIMILARITY_THRESHOLD:
            best_score = score
            best_match = current_url

    return best_match, best_score

# ==================== MAIN WORKFLOW ====================

def main():
    print("=" * 70)
    print("PartyOn Delivery - Redirect Mapping")
    print("=" * 70)

    # Load data
    print("\n[LOAD] Loading URL inventories...")

    try:
        legacy_df = pd.read_csv(f"{OUTPUT_DIR}/urls_legacy.csv")
        current_df = pd.read_csv(f"{OUTPUT_DIR}/urls_current.csv")
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("   Run crawl_and_merge.py first")
        return

    # Filter current URLs to canonical, 200-status only
    if 'status_code' in current_df.columns:
        current_df = current_df[current_df['status_code'] == 200]
    if 'is_canonical' in current_df.columns:
        current_df = current_df[current_df['is_canonical'] == True]

    print(f"   Legacy URLs: {len(legacy_df)}")
    print(f"   Current URLs: {len(current_df)}")

    # Find existing URLs (no redirect needed)
    legacy_urls = set(legacy_df['url'])
    current_urls_set = set(current_df['url'])

    unchanged = legacy_urls & current_urls_set
    to_map = legacy_urls - current_urls_set

    print(f"\n[OK] {len(unchanged)} URLs unchanged (no redirect needed)")
    print(f"[SEARCH] {len(to_map)} URLs need mapping")

    # Map redirects
    print("\n[REDIRECT] Finding best matches...")
    redirects = []
    orphans = []

    for legacy_url in tqdm(to_map, desc="Mapping"):
        match, score = find_best_match(legacy_url, current_df)

        if match:
            redirects.append({
                'Redirect from': legacy_url.replace(PRIMARY_DOMAIN, ''),  # Relative for Shopify
                'Redirect to': match.replace(PRIMARY_DOMAIN, ''),
                'similarity_score': round(score, 3)
            })
        else:
            orphans.append({
                'url': legacy_url,
                'reason': 'no_good_match'
            })

    # Save outputs
    print("\n[SAVE] Saving outputs...")

    redirects_df = pd.DataFrame(redirects)
    orphans_df = pd.DataFrame(orphans)
    unchanged_df = pd.DataFrame([{'url': u} for u in unchanged])

    redirects_df.to_csv(f"{OUTPUT_DIR}/redirects.csv", index=False)
    orphans_df.to_csv(f"{OUTPUT_DIR}/orphans.csv", index=False)
    unchanged_df.to_csv(f"{OUTPUT_DIR}/unchanged.csv", index=False)

    print(f"\n[OK] Complete!")
    print(f"   Redirects mapped: {len(redirects)}")
    print(f"   Orphaned URLs: {len(orphans)}")
    print(f"   Unchanged: {len(unchanged)}")
    print(f"\n[FILES] Files saved:")
    print(f"   - {OUTPUT_DIR}/redirects.csv (import to Shopify)")
    print(f"   - {OUTPUT_DIR}/orphans.csv (manual review needed)")
    print(f"   - {OUTPUT_DIR}/unchanged.csv (for reference)")

if __name__ == "__main__":
    main()
