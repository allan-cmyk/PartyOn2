#!/usr/bin/env node
/**
 * Lightweight BFS crawler of internal links starting from the homepage.
 * Mimics SEMrush Site Audit: follows <a href> on same-origin pages up to a cap.
 * Reports any URL that returns 4xx/5xx + the pages that link to it.
 *
 * Usage:
 *   node scripts/seo/crawl-internal-links.mjs [--origin URL] [--max N]
 *
 * Output: stdout summary + /tmp/internal-crawl-<YYYY-MM-DD>.json
 */

import fs from 'node:fs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};

const ORIGIN = arg('--origin', 'https://partyondelivery.com');
const MAX_PAGES = parseInt(arg('--max', '300'), 10);
const CONCURRENCY = 4;

const visited = new Set();
const queue = [ORIGIN + '/'];
const pageStatus = new Map(); // url -> { status, contentType }
const inlinks = new Map(); // url -> Set<source>

function normalize(href, base) {
  try {
    const u = new URL(href, base);
    if (u.origin !== ORIGIN) return null;
    u.hash = '';
    // Strip trailing slash except for root
    let s = u.toString();
    if (s.endsWith('/') && s !== ORIGIN + '/') s = s.slice(0, -1);
    return s;
  } catch {
    return null;
  }
}

function extractLinks(html, base) {
  const out = new Set();
  for (const m of html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)) {
    const n = normalize(m[1], base);
    if (n) out.add(n);
  }
  return out;
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'PartyOnSEOAudit/1.0 (+seo audit)' },
    });
    const ct = res.headers.get('content-type') || '';
    const loc = res.headers.get('location') || null;
    let html = '';
    if (
      res.status >= 200 &&
      res.status < 300 &&
      ct.includes('text/html')
    ) {
      html = await res.text();
    }
    return { status: res.status, contentType: ct, location: loc, html };
  } catch (err) {
    return { status: 0, error: String(err), html: '' };
  }
}

let processed = 0;
async function worker() {
  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);
    const r = await fetchPage(url);
    pageStatus.set(url, {
      status: r.status,
      contentType: r.contentType,
      location: r.location,
    });
    processed++;
    if (processed % 25 === 0)
      console.error(`  crawled ${processed} / queue ${queue.length}`);

    if (r.html) {
      const links = extractLinks(r.html, url);
      for (const link of links) {
        if (!inlinks.has(link)) inlinks.set(link, new Set());
        inlinks.get(link).add(url);
        if (!visited.has(link) && !queue.includes(link)) queue.push(link);
      }
    }
  }
}

console.error(`Crawling ${ORIGIN} (cap ${MAX_PAGES} pages)…`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// Also probe any link we DISCOVERED but never crawled (would-be 4xx that never
// got queued because we hit the cap — still important).
const undiscovered = [...inlinks.keys()].filter((u) => !pageStatus.has(u));
console.error(`Probing ${undiscovered.length} discovered-but-uncrawled URLs…`);
let probed = 0;
async function probeWorker() {
  while (undiscovered.length > 0) {
    const u = undiscovered.shift();
    if (!u) break;
    const r = await fetchPage(u);
    pageStatus.set(u, {
      status: r.status,
      contentType: r.contentType,
      location: r.location,
    });
    probed++;
    if (probed % 25 === 0) console.error(`  probed ${probed}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, probeWorker));

const byStatus = new Map();
for (const [, v] of pageStatus) {
  byStatus.set(v.status, (byStatus.get(v.status) || 0) + 1);
}

const fourXX = [...pageStatus.entries()]
  .filter(([, v]) => v.status >= 400 && v.status < 500)
  .map(([url, v]) => ({
    url,
    status: v.status,
    linkedFrom: [...(inlinks.get(url) || [])],
  }));

const fiveXX = [...pageStatus.entries()]
  .filter(([, v]) => v.status >= 500)
  .map(([url, v]) => ({
    url,
    status: v.status,
    linkedFrom: [...(inlinks.get(url) || [])],
  }));

const redirs = [...pageStatus.entries()]
  .filter(([, v]) => v.status >= 300 && v.status < 400)
  .map(([url, v]) => ({
    url,
    status: v.status,
    location: v.location,
    linkedFrom: [...(inlinks.get(url) || [])],
  }));

console.log('\n=== Status distribution ===');
for (const [s, n] of [...byStatus.entries()].sort()) {
  console.log(`  ${s || 'fetch-error'}  ${n}`);
}

console.log(`\n=== 4xx URLs (${fourXX.length}) ===`);
for (const r of fourXX) {
  console.log(`  ${r.status}  ${r.url}`);
  for (const src of r.linkedFrom.slice(0, 6)) console.log(`        ← ${src}`);
  if (r.linkedFrom.length > 6)
    console.log(`        (+${r.linkedFrom.length - 6} more)`);
}

console.log(`\n=== 5xx URLs (${fiveXX.length}) ===`);
for (const r of fiveXX) console.log(`  ${r.status}  ${r.url}`);

console.log(`\n=== Redirects (${redirs.length}) ===`);
for (const r of redirs.slice(0, 30))
  console.log(`  ${r.status}  ${r.url}  →  ${r.location || '?'}`);

const today = new Date().toISOString().split('T')[0];
const outPath = `/tmp/internal-crawl-${today}.json`;
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      origin: ORIGIN,
      pagesVisited: visited.size,
      byStatus: Object.fromEntries(byStatus),
      fourXX,
      fiveXX,
      redirects: redirs,
    },
    null,
    2
  )
);
console.log(`\nWrote ${outPath}`);
