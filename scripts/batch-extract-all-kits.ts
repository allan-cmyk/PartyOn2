#!/usr/bin/env node
/**
 * Batch Cocktail Kit Image Extractor
 *
 * Extracts images for ALL cocktail kits in the Shopify store.
 * Auto-starts dev server, processes all kits, then shuts down.
 *
 * Usage:
 *   npm run extract-all-kits
 */

import { spawn, ChildProcess, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// Configuration
const SHOPIFY_STORE_URL = 'https://partyondelivery.com';
const API_URL = process.env.USE_LOCAL === 'true' ? 'http://localhost:3000' : 'https://partyondelivery.com';
const OUTPUT_BASE_DIR = path.join(__dirname, '../public/images/products');
const REPORT_PATH = path.join(__dirname, 'extraction-report.json');

interface ProductImage {
  url: string;
  altText: string | null;
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description?: string;
  images: {
    edges: Array<{
      node: ProductImage;
    }>;
  };
}

interface ExtractionResult {
  title: string;
  handle: string;
  success: boolean;
  error?: string;
  componentsFound?: number;
  imagesDownloaded?: number;
  folderPath?: string;
}

interface BundleComponent {
  name: string;
  size?: string;
}

// ============================================
// Dev Server Management
// ============================================

// Dev server management only needed for local mode
async function startDevServer(): Promise<ChildProcess | null> {
  if (API_URL.includes('partyondelivery.com')) {
    console.log('Using production API - no dev server needed.\n');
    return null;
  }

  console.log('Starting dev server...');

  const server = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'pipe',
    cwd: path.join(__dirname, '..'),
  });

  // Wait for server to be ready
  await waitForServer(API_URL, 60000);
  console.log('Dev server is ready!\n');

  return server;
}

async function waitForServer(url: string, timeout: number): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch {
      // Server not ready yet
    }
    await sleep(1000);
    process.stdout.write('.');
  }

  throw new Error(`Server did not start within ${timeout}ms`);
}

function killDevServer(server: ChildProcess | null): void {
  if (!server) {
    return;
  }

  console.log('\nShutting down dev server...');

  if (process.platform === 'win32') {
    exec(`taskkill /pid ${server.pid} /T /F`, (err) => {
      if (err) {
        console.warn('Warning: Could not kill server process:', err.message);
      }
    });
  } else {
    server.kill('SIGTERM');
  }
}

// ============================================
// Fetch All Cocktail Kits
// ============================================

async function fetchAllCocktailKits(): Promise<ShopifyProduct[]> {
  console.log('Fetching all cocktail kits from Shopify...');

  // Use the "party-pitcher-cocktails" collection which contains the actual cocktail kit bundles
  const url = `${API_URL}/api/products?collection=party-pitcher-cocktails&first=50`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch kits: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.products?.edges?.length) {
    throw new Error('No cocktail kits found in Shopify');
  }

  const kits = data.products.edges.map((e: { node: ShopifyProduct }) => e.node);
  console.log(`Found ${kits.length} cocktail kits\n`);

  return kits;
}

// ============================================
// Bundle Component Parsing (from existing extractor)
// ============================================

function parseBundleComponents(description: string, title: string): BundleComponent[] {
  const components: BundleComponent[] = [];

  // First, try to find items separated by star emojis
  const starPattern = /⭐([^⭐]+)/g;
  const starMatches = [...description.matchAll(starPattern)];

  if (starMatches.length > 0) {
    for (const match of starMatches) {
      const cleaned = match[1]
        .replace(/\s*\(\d+\)\s*$/, '')
        .replace(/^[•\-\s]+/, '')
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

// ============================================
// Product Search & Image Download
// ============================================

function extractSearchKeywords(productName: string): { keywords: string; size?: string; isSingle: boolean } {
  const isSingle = /\(1\)|\bsingle\b|• 1\b/i.test(productName);

  let cleaned = productName
    .split(/[•⭐]/)[0]
    .replace(/\s*\(\d+\)\s*/g, '')
    .trim();

  const sizeMatch = productName.match(/(\d+(?:\.\d+)?)\s*(ml|oz|l|gallon|liter)/i);
  const size = sizeMatch ? sizeMatch[0].toLowerCase() : undefined;

  cleaned = cleaned
    .replace(/\d+(?:\.\d+)?\s*(ml|oz|l|gallon|liter)/gi, '')
    .replace(/\s+bottle\s*/gi, ' ')
    .replace(/\s+bottles\s*/gi, ' ')
    .replace(/\s+can\s*/gi, ' ')
    .replace(/\s+cans\s*/gi, ' ')
    .replace(/\s+pack\s*/gi, ' ')
    .replace(/\s+\.\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let keywords = '';
  const lowerCleaned = cleaned.toLowerCase();

  if (lowerCleaned.includes('lime juice')) {
    keywords = 'lime juice';
  } else if (lowerCleaned.includes('triple sec')) {
    keywords = 'triple sec';
  } else if (lowerCleaned.includes('simple syrup')) {
    keywords = 'simple syrup';
  } else if (lowerCleaned.includes('bitters')) {
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
    keywords = cleaned;
  }

  return { keywords, size, isSingle };
}

function scoreProductMatch(product: ShopifyProduct, searchInfo: { keywords: string; size?: string; isSingle: boolean }): number {
  let score = 100;
  const title = product.title.toLowerCase();

  if (searchInfo.isSingle) {
    if (/\d+\s*pack/i.test(title) || /pack\s*of\s*\d+/i.test(title)) {
      score -= 60;
    }
  }

  if ((searchInfo.keywords.includes('topo chico') || searchInfo.keywords.includes('sparkling water')) &&
      title.includes('hard seltzer')) {
    score -= 70;
  }

  const flavorKeywords = ['strawberry', 'lemon', 'lime', 'berry', 'cherry', 'orange', 'grape', 'mango', 'peach', 'grapefruit', 'twist', 'blackberry', 'blueberry', 'raspberry'];
  const isFlavoredWater = title.includes('water') && flavorKeywords.some(flavor => title.includes(flavor));
  const isFlavoredLemonade = title.includes('lemonade') && flavorKeywords.some(flavor => title.includes(flavor) && flavor !== 'lemon');

  if ((searchInfo.keywords.includes('topo chico') || searchInfo.keywords.includes('sparkling water')) && isFlavoredWater) {
    score -= 40;
  }

  if (searchInfo.keywords.includes('lemonade') && isFlavoredLemonade) {
    score -= 50;
  }

  if (title.includes('hydration') || title.includes('recovery') || title.includes('electrolyte')) {
    score -= 60;
  }

  if ((searchInfo.keywords.includes('topo chico') || searchInfo.keywords.includes('sparkling water')) &&
      (title.includes('regular') || title.includes('original'))) {
    score += 30;
  }

  if (searchInfo.size && title.includes(searchInfo.size)) {
    score += 50;
  }

  if (searchInfo.size) {
    const targetSize = parseFloat(searchInfo.size);
    const productSizeMatch = title.match(/(\d+(?:\.\d+)?)\s*(ml|oz|l|gallon|liter)/i);
    if (productSizeMatch) {
      const productSize = parseFloat(productSizeMatch[1]);
      const sizeDiff = Math.abs(targetSize - productSize);
      if (sizeDiff > targetSize * 0.5) {
        score -= 25;
      }
    }
  }

  const keywordParts = searchInfo.keywords.toLowerCase().split(' ');
  keywordParts.forEach(keyword => {
    if (title.includes(keyword)) {
      score += 10;
    }
  });

  return score;
}

async function searchProduct(searchTerm: string): Promise<ShopifyProduct | null> {
  try {
    const searchInfo = extractSearchKeywords(searchTerm);
    const searchQuery = searchInfo.keywords;
    const encodedTerm = encodeURIComponent(searchQuery);
    const url = `${API_URL}/api/products?search=${encodedTerm}&first=10`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.products?.edges?.length) {
      return null;
    }

    const scoredProducts = data.products.edges.map((edge: { node: ShopifyProduct }) => ({
      product: edge.node,
      score: scoreProductMatch(edge.node, searchInfo)
    }));

    scoredProducts.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    return scoredProducts[0].product;
  } catch {
    return null;
  }
}

async function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
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
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

function getHighestResImage(product: ShopifyProduct, preferPng: boolean = true): ProductImage | null {
  if (!product.images?.edges?.length) {
    return null;
  }

  const images = product.images.edges.map(e => e.node);

  if (preferPng) {
    const pngImage = images.find(img => img.url.toLowerCase().includes('.png'));
    if (pngImage) {
      const highResUrl = pngImage.url.split('?')[0];
      return { ...pngImage, url: highResUrl };
    }
  }

  const firstImage = images[0];
  const highResUrl = firstImage.url.split('?')[0];
  return { ...firstImage, url: highResUrl };
}

// ============================================
// Bundle Product Fetching
// ============================================

async function fetchBundleProduct(handle: string): Promise<{ handle: string; title: string; description: string }> {
  const response = await fetch(`${SHOPIFY_STORE_URL}/products/${handle}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch bundle product: ${response.statusText}`);
  }

  const html = await response.text();

  const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
  const matches = html.matchAll(jsonLdRegex);

  for (const match of matches) {
    try {
      const jsonData = JSON.parse(match[1]);
      if (jsonData['@type'] === 'Product') {
        return {
          handle,
          title: jsonData.name || '',
          description: jsonData.description || '',
        };
      }
      if (jsonData['@graph']) {
        const productData = jsonData['@graph'].find((item: { '@type': string }) => item['@type'] === 'Product');
        if (productData) {
          return {
            handle,
            title: productData.name || '',
            description: productData.description || '',
          };
        }
      }
    } catch {
      continue;
    }
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+(?:name|property)="description"\s+content="([^"]+)"/);

  return {
    handle,
    title: titleMatch ? titleMatch[1].replace(/ - \$[\d,.]+ \| Party On Delivery.*$/i, '').trim() : '',
    description: descMatch ? descMatch[1] : '',
  };
}

function sanitizeFolderName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// Single Kit Extraction
// ============================================

async function extractKitImages(kit: ShopifyProduct): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    title: kit.title,
    handle: kit.handle,
    success: false,
  };

  try {
    // Fetch full bundle details from storefront
    const bundleProduct = await fetchBundleProduct(kit.handle);

    // Parse components from description
    const components = parseBundleComponents(bundleProduct.description, bundleProduct.title);
    result.componentsFound = components.length;

    if (components.length === 0) {
      result.error = 'No components found in bundle description';
      return result;
    }

    // Create output folder
    const folderName = sanitizeFolderName(bundleProduct.title);
    const outputDir = path.join(OUTPUT_BASE_DIR, folderName);
    result.folderPath = outputDir;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Download images for each component
    let successCount = 0;

    for (const component of components) {
      const product = await searchProduct(component.name);

      if (!product) {
        continue;
      }

      const image = getHighestResImage(product, true);

      if (!image) {
        continue;
      }

      const ext = image.url.split('.').pop()?.split('?')[0] || 'png';
      const filename = `${product.handle}.${ext}`;
      const outputPath = path.join(outputDir, filename);

      try {
        await downloadImage(image.url, outputPath);
        successCount++;
      } catch {
        // Continue on download failure
      }

      await sleep(100); // Rate limiting
    }

    result.imagesDownloaded = successCount;
    result.success = successCount > 0;

    if (successCount === 0) {
      result.error = 'No images downloaded';
    }

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

// ============================================
// Utilities
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// ============================================
// Main Execution
// ============================================

async function main(): Promise<void> {
  const startTime = Date.now();
  let server: ChildProcess | null = null;
  const results: ExtractionResult[] = [];

  try {
    // Start dev server
    server = await startDevServer();

    // Fetch all cocktail kits
    const kits = await fetchAllCocktailKits();

    // Process each kit
    for (let i = 0; i < kits.length; i++) {
      const kit = kits[i];
      console.log(`\n[${i + 1}/${kits.length}] Processing: ${kit.title}`);
      console.log(`   Handle: ${kit.handle}`);

      const result = await extractKitImages(kit);
      results.push(result);

      if (result.success) {
        console.log(`   Components found: ${result.componentsFound}`);
        console.log(`   Images downloaded: ${result.imagesDownloaded}`);
        console.log(`   Folder: ${result.folderPath}`);
      } else {
        console.log(`   ERROR: ${result.error}`);
      }

      // Small delay between kits
      await sleep(500);
    }

    // Generate report
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const totalImages = results.reduce((sum, r) => sum + (r.imagesDownloaded || 0), 0);

    const report = {
      timestamp: new Date().toISOString(),
      duration: formatDuration(Date.now() - startTime),
      totalKits: kits.length,
      successful: successCount,
      failed: failCount,
      totalImagesDownloaded: totalImages,
      results,
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('EXTRACTION COMPLETE');
    console.log('='.repeat(50));
    console.log(`Total kits processed: ${kits.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Total images downloaded: ${totalImages}`);
    console.log(`Duration: ${formatDuration(Date.now() - startTime)}`);
    console.log(`Report saved to: ${REPORT_PATH}`);

    if (failCount > 0) {
      console.log('\nFailed kits:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.title}: ${r.error}`);
      });
    }

  } catch (error) {
    console.error('\nFATAL ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    // Always kill the dev server
    if (server) {
      killDevServer(server);
    }
  }
}

// Run
main()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nError:', error);
    process.exit(1);
  });
