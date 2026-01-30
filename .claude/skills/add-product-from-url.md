# Add Product from URL

Add a product to Shopify inventory by extracting details from any product URL (Total Wine, Specs, etc.).

## Usage

```
/add-product-from-url <URL>
```

Example:
```
/add-product-from-url https://www.totalwine.com/spirits/scotch/single-malt/macallan-12-year/p/123456
```

## Workflow

When this skill is invoked with a product URL:

### Step 1: Scrape the Product Page

Use the `mcp__firecrawl__firecrawl_scrape` tool to extract product information:

```
mcp__firecrawl__firecrawl_scrape with:
- url: <provided URL>
- formats: ["markdown"]
```

### Step 2: Extract Product Details

From the scraped content, extract:

1. **Product Name** - The main product title (without size)
2. **Size** - Look for patterns like "750ml", "1L", "1.75L", "12oz", etc. Default to "750ml" if not found
3. **Original Price** - Extract the numeric price
4. **Description** - The product description text
5. **Category** - Determine from product type (Scotch, Bourbon, Vodka, Tequila, Wine, Beer, etc.)
6. **Brand/Vendor** - Extract the brand name
7. **Image URL** - The main product image (high resolution preferred)
8. **Additional Details** - ABV, Country, Region, Taste notes if available

### Step 3: Transform the Data

Apply these transformations:

1. **Title Format**: `{Product Name} • {Size}`
   - Example: "Macallan 18 Year Double Cask Single Malt Scotch • 750ml"

2. **Price Calculation**:
   - New Price = Original Price × 1.27
   - Round UP to nearest .99
   - Formula: `Math.ceil(originalPrice * 1.27) - 0.01`
   - Example: $359.99 × 1.27 = $457.19 → rounds to $457.99

3. **Description**: Rephrase the original description to make it unique while preserving key details. Include:
   - Rewritten main description (different wording, same meaning)
   - Bullet points with: Country/Region, ABV, Size, Taste Profile (if available)

4. **Category Mapping** to Shopify Product Types:
   - Scotch, Whisky, Whiskey → "Whiskey"
   - Bourbon → "Bourbon"
   - Vodka → "Vodka"
   - Tequila, Mezcal → "Tequila"
   - Rum → "Rum"
   - Gin → "Gin"
   - Wine, Red Wine, White Wine → "Wine"
   - Beer, Ale, Lager, IPA → "Beer"
   - Champagne, Sparkling → "Champagne & Sparkling"
   - Cognac, Brandy → "Brandy & Cognac"
   - Liqueur, Cordial → "Liqueurs"

5. **Collection Assignment** based on category:
   - Map to existing Shopify collections
   - Add relevant tags: category, brand, type (e.g., "Scotch", "Macallan", "Single Malt")

### Step 4: Create Product in Shopify

Use the Shopify Admin API to create the product:

1. **Create Product** with:
   - title: Formatted title with interdot and size
   - descriptionHtml: Rephrased HTML description
   - vendor: Extracted brand
   - productType: Mapped category
   - tags: Auto-generated tags
   - status: "ACTIVE"

2. **Add Media** (main image only):
   - originalSource: Image URL from scraped page
   - mediaContentType: "IMAGE"

3. **Update Variant** with:
   - price: Calculated price (original + 27%, rounded to .99)
   - sku: Auto-generated (BRAND-PRODUCT-SIZE format)
   - inventoryManagement: "SHOPIFY" (tracked)
   - inventoryPolicy: "CONTINUE" (sell when out of stock)

### Step 5: Report Results

Output a summary:
```
✅ Product Created Successfully!

Title: {title}
Price: ${calculated_price} (was ${original_price} + 27%)
SKU: {sku}
Category: {category}
Vendor: {vendor}

Store URL: https://premier-concierge.myshopify.com/products/{handle}
Admin URL: https://premier-concierge.myshopify.com/admin/products/{id}
```

## Configuration

- **Markup**: 27%
- **Price Rounding**: Up to nearest .99
- **Size Default**: 750ml
- **Inventory**: Tracked, continue selling when out of stock
- **Images**: Main image only
- **Collections**: Auto-assigned based on category
- **Status**: Active (published immediately)

## Error Handling

- If URL cannot be scraped: Report error and suggest checking the URL
- If price not found: Ask user to provide the original price
- If product creation fails: Show Shopify API error details
- If image import fails: Create product without image and notify user

## Supported Sources

This skill works best with:
- Total Wine & More (totalwine.com)
- Spec's (specsonline.com)
- Drizly (drizly.com)
- ReserveBar (reservebar.com)
- Wine.com
- Most liquor/wine retailer websites with structured product pages
