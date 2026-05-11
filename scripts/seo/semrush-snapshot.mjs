/**
 * SEMrush snapshot runner — captures the four dashboards the SEO Director consumes.
 *
 * Prereq: run `npm run seo:snapshot:init` once so a logged-in SEMrush session
 * is persisted at `data/seo/.semrush-profile/`. This script reuses that profile.
 *
 * For each of (Position Tracking, Organic Research, Backlink Analytics, Site Audit):
 *   1. Navigate to the dashboard URL.
 *   2. Wait for networkidle so SPA hydration finishes.
 *   3. Save a full-page screenshot to data/seo/semrush/<date>/<id>.png.
 *   4. Extract KPIs from the rendered text via pure extractors in
 *      semrush-dashboards.mjs (testable independent of Playwright).
 *   5. Write the extracted JSON + raw body text to <id>.json.
 *
 * On failure: write data/seo/semrush/<date>/FAILED.md with the error + a
 * screenshot of the failure point, and exit non-zero.
 *
 * Usage:
 *   npm run seo:snapshot                 # headless
 *   npm run seo:snapshot -- --headed     # show the browser (for debugging)
 *
 * The output schema is consumed by /api/cron/seo-snapshot (Phase 1 PR 3),
 * which reads the latest data/seo/semrush/<date>/ and writes a SeoSnapshot row.
 */

import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import { DASHBOARDS, loadConfig } from './semrush-dashboards.mjs';

const PROFILE_DIR = path.resolve(process.cwd(), 'data/seo/.semrush-profile');
const SNAPSHOT_ROOT = path.resolve(process.cwd(), 'data/seo/semrush');

const HEADED = process.argv.includes('--headed');

function todayDir() {
  const d = new Date();
  const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(SNAPSHOT_ROOT, iso);
}

async function ensureProfile() {
  try {
    const stat = await fs.stat(PROFILE_DIR);
    if (!stat.isDirectory()) throw new Error('profile path exists but is not a directory');
  } catch {
    console.error(
      `\n[!] No SEMrush session profile found at ${PROFILE_DIR}.\n` +
        '    Run: npm run seo:snapshot:init\n'
    );
    process.exit(1);
  }
}

async function writeFailure(outDir, where, err, page) {
  await fs.mkdir(outDir, { recursive: true });
  let screenshot = null;
  if (page) {
    try {
      screenshot = path.join(outDir, 'FAILED.png');
      await page.screenshot({ path: screenshot, fullPage: true });
    } catch {
      screenshot = null;
    }
  }
  const md =
    `# SEMrush snapshot FAILED — ${new Date().toISOString()}\n\n` +
    `**Stage:** ${where}\n\n` +
    `**Error:** \`${(err && err.message) || String(err)}\`\n\n` +
    (screenshot ? `**Screenshot:** \`${path.basename(screenshot)}\`\n\n` : '') +
    `Stack:\n\`\`\`\n${(err && err.stack) || ''}\n\`\`\`\n`;
  await fs.writeFile(path.join(outDir, 'FAILED.md'), md, 'utf8');
}

async function captureDashboard(page, dashboard, cfg, outDir) {
  const url = dashboard.urlBuilder(cfg);
  console.log(`  -> ${dashboard.label}`);
  console.log(`     ${url}`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  // Most SEMrush dashboards finish hydrating within a few seconds of domcontentloaded.
  // networkidle can hang on SEMrush due to long-poll analytics calls — bound it.
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {
    // ignore — proceed with whatever's rendered
  });
  // small extra settle wait
  await page.waitForTimeout(1500);

  // Quick logged-in sanity check — if we land on /login, abort this dashboard
  if (page.url().includes('/login')) {
    throw new Error(`Got redirected to login when fetching ${dashboard.id} — session expired`);
  }

  // Screenshot
  const pngPath = path.join(outDir, `${dashboard.id}.png`);
  await page.screenshot({ path: pngPath, fullPage: true });

  // Extract
  const body = await page.evaluate(() => document.body.innerText);
  const extracted = dashboard.extract(body);

  const json = {
    captured_at: new Date().toISOString(),
    dashboard: dashboard.id,
    label: dashboard.label,
    url,
    domain: cfg.domain,
    project_id: cfg.projectId,
    extracted,
    raw_body_text: body,
  };
  await fs.writeFile(path.join(outDir, `${dashboard.id}.json`), JSON.stringify(json, null, 2), 'utf8');

  console.log(`     OK (${Object.keys(extracted).length} fields extracted)`);
  return { id: dashboard.id, ok: true, fields: Object.keys(extracted).length };
}

async function main() {
  await ensureProfile();
  const cfg = loadConfig();
  const outDir = todayDir();
  await fs.mkdir(outDir, { recursive: true });

  console.log(`SEMrush snapshot — ${new Date().toISOString()}`);
  console.log(`Domain:   ${cfg.domain}`);
  console.log(`Project:  ${cfg.projectId} (folder ${cfg.folderId})`);
  console.log(`Output:   ${outDir}`);
  console.log('');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: !HEADED,
    viewport: { width: 1440, height: 900 },
  });

  const page = context.pages()[0] ?? (await context.newPage());
  let where = 'startup';
  const results = [];

  try {
    for (const dashboard of DASHBOARDS) {
      where = dashboard.id;
      try {
        const r = await captureDashboard(page, dashboard, cfg, outDir);
        results.push(r);
      } catch (err) {
        // Per-dashboard failure: record and continue so the operator still gets the others
        console.error(`     FAIL: ${err.message}`);
        results.push({ id: dashboard.id, ok: false, error: err.message });
        // Save a screenshot of whatever's on screen
        try {
          await page.screenshot({ path: path.join(outDir, `${dashboard.id}-FAILED.png`), fullPage: true });
        } catch {
          /* ignore */
        }
      }
      // SEMrush politeness: 3s between dashboard hits
      await page.waitForTimeout(3000);
    }

    // Manifest
    const manifest = {
      captured_at: new Date().toISOString(),
      domain: cfg.domain,
      project_id: cfg.projectId,
      folder_id: cfg.folderId,
      results,
      success: results.every((r) => r.ok),
    };
    await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    console.log('');
    console.log(`Done. ${results.filter((r) => r.ok).length} / ${results.length} dashboards captured.`);
    await context.close();

    if (!manifest.success) {
      console.error('One or more dashboards failed — see FAILED screenshots in', outDir);
      process.exit(2);
    }
  } catch (err) {
    console.error(`\nFatal error at stage [${where}]:`, err.message);
    await writeFailure(outDir, where, err, page);
    await context.close().catch(() => {});
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
