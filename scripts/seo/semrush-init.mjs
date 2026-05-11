/**
 * One-time SEMrush session init for the seo-semrush-snapshot skill.
 *
 * Opens a real (non-headless) Chromium with a persistent profile directory.
 * The operator logs into SEMrush manually in that window — handling any 2FA
 * themselves — then presses Enter in the terminal. The script saves the
 * profile (cookies + localStorage) to disk so future `npm run seo:snapshot`
 * runs can reuse the session headlessly.
 *
 * If SEMrush expires the session and the snapshot starts failing with login
 * redirects, re-run this script.
 *
 * Usage:
 *   npm run seo:snapshot:init
 */

import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const PROFILE_DIR = path.resolve(process.cwd(), 'data/seo/.semrush-profile');

async function main() {
  await fs.mkdir(PROFILE_DIR, { recursive: true });
  console.log(`Persistent profile: ${PROFILE_DIR}`);
  console.log('Launching Chromium...');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1440, height: 900 },
  });

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto('https://www.semrush.com/login/');

  const rl = readline.createInterface({ input, output });
  console.log('');
  console.log('  >>> Log into SEMrush in the Chromium window.');
  console.log('  >>> Handle any 2FA / captcha there.');
  console.log('  >>> When you see the SEMrush home/dashboard, come back here.');
  console.log('');
  await rl.question('Press ENTER once you are logged in and on a SEMrush page > ');
  rl.close();

  // Quick sanity check — visit /home/ and confirm a logged-in indicator
  await page.goto('https://www.semrush.com/home/', { waitUntil: 'domcontentloaded' });
  const hasLoginForm = (await page.$('input[type="password"]')) !== null;
  if (hasLoginForm) {
    console.error('\n[!] Login form still visible. Profile NOT saved.');
    await context.close();
    process.exit(1);
  }
  console.log('\n[OK] Session captured. Closing browser, profile is persisted.');
  await context.close();
  console.log(`Profile saved at: ${PROFILE_DIR}`);
  console.log('You can now run: npm run seo:snapshot');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
