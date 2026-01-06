#!/usr/bin/env node
/**
 * Fetch Keg Rental Product Images from Shopify
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHOPIFY_DOMAIN = 'premier-concierge.myshopify.com';
const OUTPUT_DIR = path.join(__dirname, '../keg-party-package-composite');

// Products to fetch by handle
const PRODUCTS = [
  { handle: 'keg-tap-rental', filename: 'keg-tap-rental.png' },
  { handle: 'keg-tub-rental', filename: 'keg-tub-rental.png' },
];

async function fetchProductJson(handle) {
  const url = `https://${SHOPIFY_DOMAIN}/products/${handle}.json`;
  console.log(`Fetching: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`);
  }

  const data = await response.json();
  return data.product;
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Get high-res version by removing size params
    let cleanUrl = url.split('?')[0];

    // If URL has size constraint like _100x100, try to get original
    cleanUrl = cleanUrl.replace(/_\d+x\d*\./, '.');

    console.log(`Downloading: ${cleanUrl}`);

    https.get(cleanUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Saved: ${outputPath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('='.repeat(50));
  console.log('Keg Rental Product Image Fetcher');
  console.log('='.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const item of PRODUCTS) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`Product: ${item.handle}`);

    try {
      const product = await fetchProductJson(item.handle);
      console.log(`Title: ${product.title}`);

      if (!product.images?.length) {
        console.log('⚠ No images found for this product');
        continue;
      }

      console.log(`Images available: ${product.images.length}`);

      // Get first image (primary)
      const imageUrl = product.images[0].src;
      const outputPath = path.join(OUTPUT_DIR, item.filename);

      await downloadImage(imageUrl, outputPath);
      console.log('✓ SUCCESS');

    } catch (error) {
      console.error(`✗ ERROR: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('Complete! Folder contents:');

  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach(f => {
    const stats = fs.statSync(path.join(OUTPUT_DIR, f));
    const sizeKb = Math.round(stats.size / 1024);
    console.log(`  - ${f} (${sizeKb} KB)`);
  });
}

main().catch(console.error);
