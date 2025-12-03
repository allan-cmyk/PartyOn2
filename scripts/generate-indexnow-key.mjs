/**
 * @fileoverview Generate a secure IndexNow API key
 * @module scripts/generate-indexnow-key
 *
 * IndexNow is a protocol that allows websites to instantly notify search
 * engines (Bing, Yandex, Naver, Seznam) about content changes for faster indexing.
 *
 * Usage: node scripts/generate-indexnow-key.mjs
 *
 * This script generates a cryptographically secure 32-character hexadecimal key
 * and provides setup instructions for integrating with your site.
 */

import crypto from 'crypto';

// Generate a secure 32-character hexadecimal key using crypto.randomBytes
const key = crypto.randomBytes(16).toString('hex');

console.log('\n' + '='.repeat(70));
console.log('  IndexNow API Key Generator');
console.log('='.repeat(70) + '\n');

console.log('Your new IndexNow key:\n');
console.log(`  ${key}\n`);

console.log('-'.repeat(70));
console.log('  SETUP INSTRUCTIONS');
console.log('-'.repeat(70) + '\n');

console.log('Step 1: Add the key to your environment variables');
console.log('-----------------------------------------------');
console.log('Add this line to your .env.local file:\n');
console.log(`  INDEXNOW_KEY=${key}\n`);

console.log('Step 2: Create the key verification file');
console.log('----------------------------------------');
console.log('Create a text file in your public directory:\n');
console.log(`  public/${key}.txt\n`);
console.log('The file should contain only the key (no newlines):\n');
console.log(`  echo -n "${key}" > public/${key}.txt\n`);
console.log('Or on Windows PowerShell:\n');
console.log(`  Set-Content -Path "public\\${key}.txt" -Value "${key}" -NoNewline\n`);

console.log('Step 3: Commit and deploy');
console.log('-------------------------');
console.log('Commit the key file and deploy to your hosting provider:\n');
console.log(`  git add public/${key}.txt`);
console.log('  git commit -m "feat: add IndexNow verification key"');
console.log('  git push\n');

console.log('Step 4: Verify the key file is accessible');
console.log('-----------------------------------------');
console.log('After deployment, verify the key file at:\n');
console.log(`  https://partyondelivery.com/${key}.txt\n`);

console.log('Step 5: Submit URLs to search engines');
console.log('-------------------------------------');
console.log('Use the submission script to notify search engines:\n');
console.log('  node scripts/indexnow-submit.mjs https://partyondelivery.com/');
console.log('  node scripts/indexnow-submit.mjs https://partyondelivery.com/blog/new-post\n');

console.log('='.repeat(70));
console.log('  IMPORTANT NOTES');
console.log('='.repeat(70) + '\n');

console.log('- Keep your INDEXNOW_KEY secret in .env.local (not committed to git)');
console.log('- The key file in public/ is meant to be public (verification)');
console.log('- IndexNow notifies: Bing, Yandex, Naver, Seznam');
console.log('- Google does NOT support IndexNow (use Search Console instead)');
console.log('- Bing indexing often correlates with faster Google discovery\n');

console.log('='.repeat(70) + '\n');
