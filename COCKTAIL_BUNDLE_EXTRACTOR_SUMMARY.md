# Cocktail Bundle Image Extractor - Session Summary

## What Was Built

Created an automated agent that extracts individual product images from cocktail kit bundles on the Party On Delivery website.

**File:** `scripts/cocktail-bundle-image-extractor.ts`
**Commit:** `ac94675` - "Add cocktail bundle image extractor agent"

## Usage

```bash
# By URL
npm run extract-bundle -- "https://partyondelivery.com/products/classic-margarita-pitcher-kit-20-drinks-per-pitcher"

# By product name (when dev server is running)
npm run extract-bundle -- "Classic Margarita Pitcher Kit"
```

## Requirements

- **Dev server must be running** on `localhost:3002` (or set `LOCAL_API_URL` env var)
- Node.js with TypeScript support (`tsx`)
- Access to Shopify API credentials in `.env.local`

## How It Works

1. **Fetches bundle product** from URL or searches by name
2. **Parses description** to extract component products (handles ⭐ star emojis, bullets, etc.)
3. **Searches Shopify** for each component using intelligent keyword extraction
4. **Scores matches** using algorithm that:
   - Prefers single items over multi-packs (when bundle says "1")
   - Penalizes flavored products when plain is appropriate
   - Avoids alcoholic products when non-alcoholic is needed
   - Matches sizes and quantities
5. **Downloads highest-res PNG** images from Shopify CDN
6. **Organizes in folders** named after the bundle (preserves spaces)

## Output Location

```
C:\Party On Delivery\WEBSITE FILES\PartyOn2\public\images\products\
├── Austin Rita Party Pitcher Kit (24 drinks)/
│   ├── dulce-vida-blanco-tequila-80-proof.png
│   ├── stirrings-triple-sec-750ml-bottle.png
│   ├── organic-lime-juice-12oz.png
│   ├── sparkling-water.png
│   └── sprite-2l.png
└── [Other Bundle Names]/
```

## Test Results

Successfully tested on:
- ✅ Austin Rita Party Pitcher Kit (24 drinks) - 5 components extracted
- ✅ Skinny Margarita Pitcher Kit (20 drinks per pitcher) - 3 components extracted

## Known Limitations

1. **Product matching not perfect** - Some products may not exist in exact sizes/varieties described in bundles (e.g., "12oz single can" vs "12-pack")
2. **Depends on dev server** - Requires local Next.js server running for API access
3. **Port sensitivity** - Script defaults to port 3002, may need adjustment if server runs on different port
4. **Duplicate detection** - Only avoids downloading same filename twice, not intelligent duplicate detection

## Configuration

**Default settings in script:**
```typescript
const SHOPIFY_STORE_URL = 'https://partyondelivery.com';
const LOCAL_API_URL = process.env.LOCAL_API_URL || 'http://localhost:3002';
const OUTPUT_BASE_DIR = path.join(__dirname, '../public/images/products');
```

**To change API port:**
```bash
LOCAL_API_URL=http://localhost:3001 npm run extract-bundle -- "<url>"
```

## Scoring Algorithm Details

The agent scores product matches (higher = better):

**Positive factors (+points):**
- Exact keyword matches: +10 per keyword
- Size match: +20
- "Regular" or "Original" for plain products: +30

**Negative factors (-points):**
- Multi-pack when single wanted: -60
- Flavored water when plain wanted: -40
- Hard seltzer (alcoholic) when non-alcoholic wanted: -70
- Size >50% different: -25

## Common Issues & Solutions

### Issue: "Internal Server Error" from API
**Solution:** Restart dev server
```bash
# Kill existing server
# Then restart:
cd "C:\Party On Delivery\WEBSITE FILES\PartyOn2"
npm run dev
```

### Issue: Wrong products extracted
**Solution:** Check bundle description format - agent expects:
- Star emojis (⭐) or bullets (•) separating items
- Format: "Product Name • Size Bottle/Can (Quantity)"
- Example: "⭐Blanco Tequila • 750ml Bottle (1)"

### Issue: No images downloaded
**Solution:**
1. Verify dev server is running
2. Check port number (default: 3002)
3. Verify Shopify credentials in `.env.local`

## Future Improvements

Potential enhancements:
- [ ] Add metafield support for bundle component lists
- [ ] Improve scoring for better product matches
- [ ] Add fallback to direct Shopify Admin API
- [ ] Support for other bundle formats beyond cocktail kits
- [ ] Better handling of size conversions (12oz → 355ml)
- [ ] Option to search production site instead of local API

## Files Modified

1. `scripts/cocktail-bundle-image-extractor.ts` (NEW) - 535 lines
2. `package.json` - Added `extract-bundle` script

## Examples

### Example 1: Extract Classic Margarita Kit
```bash
npm run extract-bundle -- "https://partyondelivery.com/products/classic-margarita-pitcher-kit-20-drinks-per-pitcher"
```

**Output:**
```
✓ Found bundle: Austin Rita Party Pitcher Kit (24 drinks)
📦 Found 5 components
✅ Successfully downloaded: 5 images
Output folder: .../Austin Rita Party Pitcher Kit (24 drinks)
```

### Example 2: Extract by Name
```bash
npm run extract-bundle -- "Skinny Margarita Pitcher Kit"
```

## Contact & Support

- Agent created: November 15, 2025
- Session ID: 2025-11-15
- Built with Claude Code

---

**Note:** This is an automated tool. Always verify extracted images match bundle requirements before using in production.
