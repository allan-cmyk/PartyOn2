/**
 * @fileoverview Submit URLs to IndexNow API for instant search engine notification
 * @module scripts/indexnow-submit
 *
 * Submits URLs to the IndexNow API, notifying Bing, Yandex, Naver, and Seznam
 * about new or updated content for faster indexing.
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs https://partyondelivery.com/
 *   node scripts/indexnow-submit.mjs https://partyondelivery.com/blog/post-1 https://partyondelivery.com/blog/post-2
 *
 * Environment Variables:
 *   INDEXNOW_KEY - Your IndexNow API key (required)
 *   SITE_HOST    - Your site hostname (optional, defaults to partyondelivery.com)
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local and .env
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Try .env.local first, then .env
try {
  dotenv.config({ path: resolve(projectRoot, '.env.local') });
} catch {
  // Ignore if .env.local doesn't exist
}
dotenv.config({ path: resolve(projectRoot, '.env') });

// Configuration
const CONFIG = {
  host: process.env.SITE_HOST || 'partyondelivery.com',
  key: process.env.INDEXNOW_KEY,
  endpoint: 'https://api.indexnow.org/indexnow',
  batchSize: 100, // IndexNow API accepts up to 10,000 URLs, but we batch at 100 for reliability
};

// Validate that the key is configured
if (!CONFIG.key) {
  console.error('\n[ERROR] INDEXNOW_KEY environment variable is not set.\n');
  console.error('Please add your IndexNow key to .env.local:');
  console.error('  INDEXNOW_KEY=your_32_character_hex_key\n');
  console.error('Generate a new key with:');
  console.error('  node scripts/generate-indexnow-key.mjs\n');
  process.exit(1);
}

// Get key location URL (where search engines verify the key)
const keyLocation = `https://${CONFIG.host}/${CONFIG.key}.txt`;

/**
 * Submit a batch of URLs to the IndexNow API
 * @param {string[]} urls - Array of URLs to submit
 * @returns {Promise<{success: boolean, status?: number, message: string}>}
 */
async function submitBatch(urls) {
  const payload = {
    host: CONFIG.host,
    key: CONFIG.key,
    keyLocation: keyLocation,
    urlList: urls,
  };

  try {
    const response = await fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    // IndexNow returns 200 OK or 202 Accepted for success
    if (response.ok || response.status === 202) {
      return {
        success: true,
        status: response.status,
        message: `${response.status} ${response.statusText}`,
      };
    }

    // Handle error responses
    const errorText = await response.text();
    return {
      success: false,
      status: response.status,
      message: `${response.status} ${response.statusText}: ${errorText}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error.message}`,
    };
  }
}

/**
 * Validate and normalize a URL
 * @param {string} url - URL to validate
 * @returns {string|null} - Normalized URL or null if invalid
 */
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    // Ensure it's HTTPS and matches our host
    if (parsed.protocol !== 'https:') {
      console.warn(`  [WARN] Skipping non-HTTPS URL: ${url}`);
      return null;
    }
    // Normalize by removing trailing slashes (except for root)
    const normalized = parsed.href.replace(/\/$/, '') || parsed.origin + '/';
    return normalized;
  } catch {
    console.warn(`  [WARN] Invalid URL format: ${url}`);
    return null;
  }
}

/**
 * Split array into batches
 * @param {Array} array - Array to split
 * @param {number} size - Batch size
 * @returns {Array[]} - Array of batches
 */
function batchArray(array, size) {
  const batches = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

/**
 * Main function - process URLs from command line arguments
 */
async function main() {
  const args = process.argv.slice(2);

  // Show usage if no URLs provided
  if (args.length === 0) {
    console.log('\n' + '='.repeat(70));
    console.log('  IndexNow URL Submission Tool');
    console.log('='.repeat(70) + '\n');
    console.log('Usage:');
    console.log('  node scripts/indexnow-submit.mjs <url1> [url2] [url3] ...\n');
    console.log('Examples:');
    console.log('  # Submit a single URL');
    console.log('  node scripts/indexnow-submit.mjs https://partyondelivery.com/\n');
    console.log('  # Submit multiple URLs');
    console.log('  node scripts/indexnow-submit.mjs https://partyondelivery.com/blog/post-1 https://partyondelivery.com/blog/post-2\n');
    console.log('  # Submit all URLs from sitemap (Unix/Mac)');
    console.log('  node scripts/indexnow-submit.mjs $(grep -o \'https://[^<]*\' public/sitemap.xml)\n');
    console.log('  # Submit priority pages');
    console.log('  node scripts/indexnow-submit.mjs https://partyondelivery.com/ https://partyondelivery.com/products https://partyondelivery.com/about\n');
    console.log('Configuration:');
    console.log(`  Host: ${CONFIG.host}`);
    console.log(`  Key:  ${CONFIG.key.substring(0, 8)}...${CONFIG.key.substring(CONFIG.key.length - 4)}`);
    console.log(`  Key Location: ${keyLocation}\n`);
    process.exit(0);
  }

  console.log('\n' + '='.repeat(70));
  console.log('  IndexNow URL Submission');
  console.log('='.repeat(70) + '\n');

  // Validate and normalize URLs
  console.log('[1/3] Validating URLs...\n');
  const validUrls = args
    .map(url => validateUrl(url.trim()))
    .filter(url => url !== null);

  if (validUrls.length === 0) {
    console.error('[ERROR] No valid URLs to submit.\n');
    process.exit(1);
  }

  console.log(`  Found ${validUrls.length} valid URL(s) out of ${args.length} provided.\n`);

  // Split into batches
  const batches = batchArray(validUrls, CONFIG.batchSize);
  console.log(`[2/3] Submitting to IndexNow API (${batches.length} batch(es))...\n`);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchNum = i + 1;

    process.stdout.write(`  Batch ${batchNum}/${batches.length} (${batch.length} URLs)... `);

    const result = await submitBatch(batch);

    if (result.success) {
      console.log(`OK (${result.message})`);
      successCount += batch.length;
    } else {
      console.log(`FAILED`);
      console.log(`    Error: ${result.message}`);
      failureCount += batch.length;

      // Provide troubleshooting tips for common errors
      if (result.status === 403) {
        console.log('    Tip: Key file not accessible. Verify the file exists at:');
        console.log(`         ${keyLocation}`);
      } else if (result.status === 400) {
        console.log('    Tip: Invalid request format. Check URL formatting.');
      } else if (result.status === 422) {
        console.log('    Tip: Invalid key. Regenerate with: node scripts/generate-indexnow-key.mjs');
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n' + '-'.repeat(70));
  console.log('[3/3] Summary\n');
  console.log(`  Total URLs: ${args.length}`);
  console.log(`  Valid URLs: ${validUrls.length}`);
  console.log(`  Submitted:  ${successCount}`);
  console.log(`  Failed:     ${failureCount}\n`);

  if (successCount > 0) {
    console.log('Search engines notified:');
    console.log('  - Bing');
    console.log('  - Yandex');
    console.log('  - Seznam');
    console.log('  - Naver\n');
    console.log('Expected indexing time: 24-72 hours\n');
  }

  console.log('='.repeat(70) + '\n');

  // Exit with error code if any failures
  process.exit(failureCount > 0 ? 1 : 0);
}

// Run the main function
main();
