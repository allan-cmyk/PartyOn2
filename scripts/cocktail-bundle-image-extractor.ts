#!/usr/bin/env node
/**
 * Cocktail Bundle Image Extractor
 *
 * Extracts individual product images from a cocktail kit bundle.
 *
 * Usage:
 *   npm run extract-bundle -- "Classic Margarita Pitcher Kit"
 *   npm run extract-bundle -- "https://partyondelivery.com/products/classic-margarita-pitcher-kit-20-drinks-per-pitcher"
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// Configuration
const SHOPIFY_STORE_URL = 'https://partyondelivery.com';
const LOCAL_API_URL = process.env.LOCAL_API_URL || 'http://localhost:3000';
const OUTPUT_BASE_DIR = path.join(__dirname, '../public/images/products');

interface ProductImage {
  url: string;
  altText: string | null;
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  images: {
    edges: Array<{
      node: ProductImage;
    }>;
  };
}

interface BundleComponent {
  name: string;
  size?: string;
  quantity?: string;
}

/**
 * Parse bundle components from product description
 */
function parseBundleComponents(description: string, title: string): BundleComponent[] {
  const components: BundleComponent[] = [];

  // First, try to find items separated by star emojis (⭐) or bullets
  const starPattern = /⭐([^⭐]+)/g;
  const starMatches = [...description.matchAll(starPattern)];

  if (starMatches.length > 0) {
    for (const match of starMatches) {
      const cleaned = match[1]
        .replace(/\s*\(\d+\)\s*$/, '') // Remove quantity markers like (1)
        .replace(/^[•\-\s]+/, '') // Remove bullets/dashes
        .trim();

      if (cleaned.length > 3 && !cleaned.toLowerCase().includes('add all') && !cleaned.toLowerCase().includes('perfect for')) {
        const sizeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(ml|oz|l|pack|can|gallon)/i);
        components.push({
          name: cleaned,
          size: sizeMatch ? sizeMatch[0] : undefined,
        });
      }
    }
  }

  // If no star-separated items found, try bullet points
  if (components.length === 0) {
    const bulletPattern = /[•\-]\s*([^\n•\-]+(?:bottle|can|pack|dispenser|juice|soda|water|liqueur|tequila|rum|vodka|whiskey|gin|wine|beer)[^\n]*)/gi;
    const bulletMatches = description.match(bulletPattern);

    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const cleaned = match
          .replace(/^[•\-]\s*/, '')
          .trim();

        if (cleaned.length > 3) {
          const sizeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(ml|oz|l|pack|can|gallon)/i);
          components.push({
            name: cleaned,
            size: sizeMatch ? sizeMatch[0] : undefined,
          });
        }
      });
    }
  }

  // If still no components found, look for lines with product keywords
  if (components.length === 0) {
    const productTypes = [
      'tequila', 'vodka', 'rum', 'gin', 'whiskey', 'bourbon',
      'triple sec', 'lime juice', 'lemon juice', 'orange juice',
      'sprite', 'coke', 'soda', 'sparkling water', 'tonic',
      'dispenser', 'pitcher', 'shaker'
    ];

    const lines = description.split(/[\n,]/);
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (productTypes.some(type => lowerLine.includes(type))) {
        const cleaned = line.trim();
        if (cleaned.length > 3) {
          components.push({ name: cleaned });
        }
      }
    }
  }

  return components;
}

/**
 * Extract search keywords and metadata from a product name
 */
function extractSearchKeywords(productName: string): { keywords: string; size?: string; isSingle: boolean } {
  // Check if it's a single item (mentions "1" or specific single indicators)
  const isSingle = /\(1\)|\bsingle\b|• 1\b/i.test(productName);

  // Clean up the product name - remove bullets, stars, and split on them
  let cleaned = productName
    .split(/[•⭐]/)[0]  // Take only the part before the bullet/star (the product name)
    .replace(/\s*\(\d+\)\s*/g, '') // Remove quantity markers like (1)
    .trim();

  // Extract size information from the ORIGINAL string (before we cleaned it)
  const sizeMatch = productName.match(/(\d+(?:\.\d+)?)\s*(ml|oz|l|gallon|liter)/i);
  const size = sizeMatch ? sizeMatch[0].toLowerCase() : undefined;

  // Remove common container words and size info from cleaned string
  cleaned = cleaned
    .replace(/\d+(?:\.\d+)?\s*(ml|oz|l|gallon|liter)/gi, '')
    .replace(/\s+bottle\s*/gi, ' ')
    .replace(/\s+bottles\s*/gi, ' ')
    .replace(/\s+can\s*/gi, ' ')
    .replace(/\s+cans\s*/gi, ' ')
    .replace(/\s+pack\s*/gi, ' ')
    .replace(/\s+\.\s*/g, ' ')  // Remove stray periods
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim();

  // Extract the main product keywords
  let keywords = '';
  const lowerCleaned = cleaned.toLowerCase();

  if (lowerCleaned.includes('lime juice')) {
    keywords = 'lime juice';
  } else if (lowerCleaned.includes('triple sec')) {
    keywords = 'triple sec';
  } else if (lowerCleaned.includes('simple syrup')) {
    keywords = 'simple syrup';
  } else if (lowerCleaned.includes('bitters')) {
    // Preserve bitters type
    if (lowerCleaned.includes('combo') || lowerCleaned.includes('aromatic')) {
      keywords = 'hella bitters combo';
    } else if (lowerCleaned.includes('orange')) {
      keywords = 'hella bitters orange';
    } else {
      keywords = 'bitters';
    }
  } else if (lowerCleaned.includes('jigger')) {
    keywords = 'jigger';
  } else if (lowerCleaned.includes('mixing glass') || lowerCleaned.includes('strainer') || lowerCleaned.includes('stirring spoon')) {
    keywords = 'bar set';
  } else if (lowerCleaned.includes('whiskey glass') || lowerCleaned.includes('rocks glass')) {
    keywords = 'whiskey glass';
  } else if (lowerCleaned.includes('tequila')) {
    // Preserve tequila variety (blanco, reposado, etc.)
    if (lowerCleaned.includes('blanco')) {
      keywords = 'blanco tequila';
    } else if (lowerCleaned.includes('reposado')) {
      keywords = 'reposado tequila';
    } else {
      keywords = 'tequila';
    }
  } else if (lowerCleaned.includes('sparkling water') || lowerCleaned.includes('seltzer')) {
    keywords = 'topo chico';
  } else if (lowerCleaned.includes('sprite')) {
    keywords = 'sprite';
  } else if (lowerCleaned.includes('lemonade')) {
    keywords = 'lemonade';
  } else if (lowerCleaned.includes('unsweet') && lowerCleaned.includes('tea')) {
    keywords = 'texas unsweet tea';
  } else if (lowerCleaned.includes('iced tea') || lowerCleaned.includes('ice tea')) {
    keywords = 'iced tea';
  } else if (lowerCleaned.includes('dispenser') || lowerCleaned.includes('pitcher')) {
    keywords = 'drink dispenser';
  } else {
    // Default: use cleaned name
    keywords = cleaned;
  }

  return { keywords, size, isSingle };
}

/**
 * Score a product match based on how well it matches the search criteria
 */
function scoreProductMatch(product: ShopifyProduct, searchInfo: { keywords: string; size?: string; isSingle: boolean }): number {
  let score = 100;
  const title = product.title.toLowerCase();

  // Penalize if single item is wanted but we got a pack
  if (searchInfo.isSingle) {
    if (/\d+\s*pack/i.test(title) || /pack\s*of\s*\d+/i.test(title)) {
      score -= 60; // Heavy penalty for packs when single is wanted
    }
  }

  // Penalize hard seltzer (alcoholic) when looking for plain sparkling water
  if ((searchInfo.keywords.includes('topo chico') || searchInfo.keywords.includes('sparkling water')) &&
      title.includes('hard seltzer')) {
    score -= 70; // Very heavy penalty for alcoholic when non-alcoholic is wanted
  }

  // Penalize flavored products when plain is more appropriate
  const flavorKeywords = ['strawberry', 'lemon', 'lime', 'berry', 'cherry', 'orange', 'grape', 'mango', 'peach', 'grapefruit', 'twist', 'blackberry', 'blueberry', 'raspberry'];
  const isFlavoredWater = title.includes('water') && flavorKeywords.some(flavor => title.includes(flavor));
  const isFlavoredLemonade = title.includes('lemonade') && flavorKeywords.some(flavor => title.includes(flavor) && flavor !== 'lemon');

  if ((searchInfo.keywords.includes('topo chico') || searchInfo.keywords.includes('sparkling water')) && isFlavoredWater) {
    score -= 40; // Penalize flavored water when plain sparkling water is wanted
  }

  if (searchInfo.keywords.includes('lemonade') && isFlavoredLemonade) {
    score -= 50; // Penalize flavored lemonade when plain lemonade is wanted
  }

  // Penalize hydration/recovery/sports drinks when looking for plain beverages
  if (title.includes('hydration') || title.includes('recovery') || title.includes('electrolyte')) {
    score -= 60;
  }

  // Reward "regular" or "original" for plain sparkling water
  if ((searchInfo.keywords.includes('topo chico') || searchInfo.keywords.includes('sparkling water')) &&
      (title.includes('regular') || title.includes('original'))) {
    score += 30;
  }

  // Reward size match (strong reward for exact match)
  if (searchInfo.size && title.includes(searchInfo.size)) {
    score += 50; // Increased from 20 to heavily favor exact size matches
  }

  // Penalize if size is very different
  if (searchInfo.size) {
    const targetSize = parseFloat(searchInfo.size);
    const productSizeMatch = title.match(/(\d+(?:\.\d+)?)\s*(ml|oz|l|gallon|liter)/i);
    if (productSizeMatch) {
      const productSize = parseFloat(productSizeMatch[1]);
      const sizeDiff = Math.abs(targetSize - productSize);
      if (sizeDiff > targetSize * 0.5) { // More than 50% different
        score -= 25;
      }
    }
  }

  // Reward exact keyword matches
  const keywordParts = searchInfo.keywords.toLowerCase().split(' ');
  keywordParts.forEach(keyword => {
    if (title.includes(keyword)) {
      score += 10;
    }
  });

  return score;
}

/**
 * Search for a product on Shopify by name
 */
async function searchProduct(searchTerm: string): Promise<ShopifyProduct | null> {
  try {
    // Extract keywords and metadata for better searching
    const searchInfo = extractSearchKeywords(searchTerm);
    // Don't include size in search query - it breaks Shopify search. Use size only for scoring.
    const searchQuery = searchInfo.keywords;
    const encodedTerm = encodeURIComponent(searchQuery);
    const url = `${LOCAL_API_URL}/api/products?search=${encodedTerm}&first=10`;

    console.log(`   → Searching API: ${searchQuery}${searchInfo.size ? ` (prefer ${searchInfo.size})` : ''}${searchInfo.isSingle ? ' (single item)' : ''}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`   ✗ API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.products?.edges?.length) {
      console.warn(`   ⚠️  No products found for "${searchInfo.keywords}"`);
      return null;
    }

    // Score all results and pick the best match
    const scoredProducts = data.products.edges.map((edge: any) => ({
      product: edge.node,
      score: scoreProductMatch(edge.node, searchInfo)
    }));

    // Sort by score (highest first)
    scoredProducts.sort((a: any, b: any) => b.score - a.score);

    // Return the best match
    const bestMatch = scoredProducts[0];
    console.log(`   → Best match: ${bestMatch.product.title} (score: ${bestMatch.score})`);

    return bestMatch.product;
  } catch (error) {
    console.warn(`   ✗ Error searching:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Download an image from URL
 */
async function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        if (response.headers.location) {
          downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Clean up partial file
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Get the highest resolution image from a product
 */
function getHighestResImage(product: ShopifyProduct, preferPng: boolean = true): ProductImage | null {
  if (!product.images?.edges?.length) {
    return null;
  }

  const images = product.images.edges.map(e => e.node);

  // If preferPng, try to find a PNG image first
  if (preferPng) {
    const pngImage = images.find(img => img.url.toLowerCase().includes('.png'));
    if (pngImage) {
      // Remove size constraints from Shopify URL to get highest res
      const highResUrl = pngImage.url.split('?')[0];
      return { ...pngImage, url: highResUrl };
    }
  }

  // Otherwise, return the first image without size constraints
  const firstImage = images[0];
  const highResUrl = firstImage.url.split('?')[0];
  return { ...firstImage, url: highResUrl };
}

/**
 * Fetch bundle product data from URL or search by name
 */
async function fetchBundleProduct(input: string): Promise<any> {
  let productHandle: string;

  // Check if input is a URL
  if (input.startsWith('http')) {
    const url = new URL(input);
    const pathParts = url.pathname.split('/');
    const productsIndex = pathParts.indexOf('products');
    if (productsIndex !== -1 && pathParts[productsIndex + 1]) {
      productHandle = pathParts[productsIndex + 1];
    } else {
      throw new Error('Invalid product URL');
    }
  } else {
    // Search by name
    const searchResult = await searchProduct(input);
    if (!searchResult) {
      throw new Error(`Could not find bundle product: ${input}`);
    }
    productHandle = searchResult.handle;
  }

  // Fetch product data from the storefront
  const response = await fetch(`${SHOPIFY_STORE_URL}/products/${productHandle}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bundle product: ${response.statusText}`);
  }

  const html = await response.text();

  // Extract product data from HTML
  // Look for Product JSON-LD structured data (there may be multiple ld+json scripts)
  const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
  const matches = html.matchAll(jsonLdRegex);

  for (const match of matches) {
    try {
      const jsonData = JSON.parse(match[1]);
      // Look for the Product schema
      if (jsonData['@type'] === 'Product') {
        return {
          handle: productHandle,
          title: jsonData.name || '',
          description: jsonData.description || '',
        };
      }
      // Handle @graph format
      if (jsonData['@graph']) {
        const productData = jsonData['@graph'].find((item: any) => item['@type'] === 'Product');
        if (productData) {
          return {
            handle: productHandle,
            title: productData.name || '',
            description: productData.description || '',
          };
        }
      }
    } catch (e) {
      // Skip invalid JSON
      continue;
    }
  }

  // Fallback: try to extract from meta tags
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+(?:name|property)="description"\s+content="([^"]+)"/);

  return {
    handle: productHandle,
    title: titleMatch ? titleMatch[1].replace(/ - \$[\d,.]+ \| Party On Delivery.*$/i, '').trim() : '',
    description: descMatch ? descMatch[1] : '',
  };
}

/**
 * Sanitize folder name for file system
 */
function sanitizeFolderName(name: string): string {
  // Remove or replace invalid characters, but keep spaces
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Main extraction function
 */
async function extractBundleImages(input: string): Promise<void> {
  console.log(`🔍 Fetching bundle product: ${input}`);

  // Fetch bundle product data
  const bundleProduct = await fetchBundleProduct(input);
  console.log(`✓ Found bundle: ${bundleProduct.title}`);

  // Parse components from description
  const components = parseBundleComponents(bundleProduct.description, bundleProduct.title);
  console.log(`📦 Found ${components.length} components:`);
  components.forEach((comp, i) => {
    console.log(`   ${i + 1}. ${comp.name}`);
  });

  if (components.length === 0) {
    console.warn('⚠️  No components found in bundle description. Please check the product page.');
    return;
  }

  // Create output folder
  const folderName = sanitizeFolderName(bundleProduct.title);
  const outputDir = path.join(OUTPUT_BASE_DIR, folderName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created folder: ${folderName}`);
  } else {
    console.log(`📁 Using existing folder: ${folderName}`);
  }

  // Download images for each component
  let successCount = 0;
  let skipCount = 0;

  for (const component of components) {
    console.log(`\n🔍 Searching for: ${component.name}`);

    const product = await searchProduct(component.name);

    if (!product) {
      console.warn(`   ⚠️  Product not found, skipping...`);
      skipCount++;
      continue;
    }

    console.log(`   ✓ Found: ${product.title}`);

    const image = getHighestResImage(product, true);

    if (!image) {
      console.warn(`   ⚠️  No image found, skipping...`);
      skipCount++;
      continue;
    }

    // Generate filename from product handle
    const ext = image.url.split('.').pop()?.split('?')[0] || 'png';
    const filename = `${product.handle}.${ext}`;
    const outputPath = path.join(outputDir, filename);

    try {
      await downloadImage(image.url, outputPath);
      console.log(`   ✓ Downloaded: ${filename}`);
      successCount++;
    } catch (error) {
      console.error(`   ✗ Failed to download image:`, error);
      skipCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Successfully downloaded: ${successCount} images`);
  console.log(`   Skipped: ${skipCount} images`);
  console.log(`   Output folder: ${outputDir}`);
}

// CLI execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npm run extract-bundle -- "<product name or URL>"');
  console.error('Example: npm run extract-bundle -- "Classic Margarita Pitcher Kit"');
  process.exit(1);
}

const input = args.join(' ');

extractBundleImages(input)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
