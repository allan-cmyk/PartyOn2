#!/usr/bin/env node
/**
 * Fetches https://partyondelivery.com/sitemap.xml, HEADs every <loc>,
 * and reports any URL that doesn't return 200. Rate-limited to ~5 req/sec.
 *
 * Usage: node scripts/seo/audit-sitemap-status.mjs [--sitemap URL] [--json]
 *
 * Output: human-readable summary to stdout + JSON to
 * /tmp/sitemap-status-<YYYY-MM-DD>.json
 */

import fs from 'node:fs';

const args = process.argv.slice(2);
const sitemapUrl =
  args.find((a, i) => args[i - 1] === '--sitemap') ||
  'https://partyondelivery.com/sitemap.xml';
const wantJson = args.includes('--json');

async function loadSitemap(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sitemap fetch ${url} → ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].trim()
  );
  return locs;
}

async function headWithFallback(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
    // Some Next.js routes return 405 to HEAD; fall back to GET.
    if (res.status === 405) {
      const get = await fetch(url, { method: 'GET', redirect: 'manual' });
      return { status: get.status, location: get.headers.get('location') };
    }
    return { status: res.status, location: res.headers.get('location') };
  } catch (err) {
    return { status: 0, error: String(err) };
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const urls = await loadSitemap(sitemapUrl);
console.error(`Sitemap: ${sitemapUrl} (${urls.length} URLs)`);

const results = [];
const concurrency = 5;
let i = 0;

async function worker() {
  while (i < urls.length) {
    const idx = i++;
    const url = urls[idx];
    const r = await headWithFallback(url);
    results[idx] = { url, ...r };
    if (idx % 50 === 0) console.error(`  checked ${idx + 1}/${urls.length}`);
    await delay(200); // ~5 req/sec/worker = 25/s total — cap politely
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

const byStatus = new Map();
for (const r of results) {
  byStatus.set(r.status, (byStatus.get(r.status) || 0) + 1);
}

const fourXX = results.filter((r) => r.status >= 400 && r.status < 500);
const redirects = results.filter((r) => r.status >= 300 && r.status < 400);
const errors = results.filter((r) => r.status === 0 || r.status >= 500);

console.log('\n=== Status distribution ===');
for (const [s, n] of [...byStatus.entries()].sort()) {
  console.log(`  ${s || 'fetch-error'}  ${n}`);
}

console.log(`\n=== 4xx URLs (${fourXX.length}) ===`);
for (const r of fourXX) console.log(`  ${r.status}  ${r.url}`);

console.log(`\n=== Redirects (${redirects.length}) ===`);
for (const r of redirects.slice(0, 20))
  console.log(`  ${r.status}  ${r.url}  →  ${r.location || '?'}`);
if (redirects.length > 20) console.log(`  …and ${redirects.length - 20} more`);

console.log(`\n=== Errors / 5xx (${errors.length}) ===`);
for (const r of errors) console.log(`  ${r.status}  ${r.url}`);

const today = new Date().toISOString().split('T')[0];
const out = `/tmp/sitemap-status-${today}.json`;
fs.writeFileSync(
  out,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sitemap: sitemapUrl,
      total: urls.length,
      byStatus: Object.fromEntries(byStatus),
      fourXX,
      redirects,
      errors,
    },
    null,
    2
  )
);
console.log(`\nWrote ${out}`);

if (wantJson) console.log(JSON.stringify({ fourXX, redirects, errors }));
