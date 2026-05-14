#!/usr/bin/env node
/**
 * Crawls internal pages (BFS from homepage), extracts every <img src> and
 * <source srcset>, HEAD-requests each unique image URL, and reports broken
 * ones grouped by URL pattern so the operator can spot single-root-cause
 * smells (e.g. one deleted hero image referenced by many pages).
 *
 * Usage:
 *   node scripts/seo/audit-broken-images.mjs [--origin URL] [--max N]
 *
 * Output: stdout + /tmp/broken-images-<YYYY-MM-DD>.json
 */

import fs from 'node:fs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};

const ORIGIN = arg('--origin', 'https://partyondelivery.com');
const MAX_PAGES = parseInt(arg('--max', '260'), 10);
const CONCURRENCY = 4;

function normalizeLink(href, base) {
  try {
    const u = new URL(href, base);
    if (u.origin !== ORIGIN) return null;
    u.hash = '';
    let s = u.toString();
    if (s.endsWith('/') && s !== ORIGIN + '/') s = s.slice(0, -1);
    return s;
  } catch {
    return null;
  }
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#x2F;/gi, '/')
    .replace(/&#47;/g, '/')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

function absoluteImg(src, base) {
  try {
    return new URL(decodeEntities(src), base).toString();
  } catch {
    return null;
  }
}

function extractImages(html, base) {
  const out = new Set();
  // <img src="..."> (also Next.js's rendered <img>)
  for (const m of html.matchAll(/<img\b[^>]*?\bsrc=["']([^"']+)["']/gi)) {
    const u = absoluteImg(m[1], base);
    if (u) out.add(u);
  }
  // <source srcset="url 1x, url 2x">
  for (const m of html.matchAll(/<source\b[^>]*?\bsrcset=["']([^"']+)["']/gi)) {
    for (const entry of m[1].split(',')) {
      const url = entry.trim().split(/\s+/)[0];
      if (!url) continue;
      const u = absoluteImg(url, base);
      if (u) out.add(u);
    }
  }
  // <img srcset="...">
  for (const m of html.matchAll(/<img\b[^>]*?\bsrcset=["']([^"']+)["']/gi)) {
    for (const entry of m[1].split(',')) {
      const url = entry.trim().split(/\s+/)[0];
      if (!url) continue;
      const u = absoluteImg(url, base);
      if (u) out.add(u);
    }
  }
  return out;
}

function extractLinks(html, base) {
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*?\bhref=["']([^"']+)["']/gi)) {
    const n = normalizeLink(m[1], base);
    if (n) out.add(n);
  }
  return out;
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'PartyOnSEOAudit/1.0' },
    });
    if (!res.ok) return { status: res.status, html: '' };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return { status: res.status, html: '' };
    return { status: res.status, html: await res.text() };
  } catch {
    return { status: 0, html: '' };
  }
}

async function probeImage(url) {
  try {
    // Next.js /_next/image returns 400 on HEAD; use GET with byte-range.
    const useGet = url.includes('/_next/image');
    const res = await fetch(url, {
      method: useGet ? 'GET' : 'HEAD',
      headers: useGet ? { Range: 'bytes=0-0' } : {},
      redirect: 'follow',
    });
    return res.status;
  } catch {
    return 0;
  }
}

const visited = new Set();
const queue = [ORIGIN + '/'];
const imagesOnPage = new Map(); // img URL -> Set<page URL>

let crawled = 0;
async function crawlWorker() {
  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);
    const r = await fetchHtml(url);
    crawled++;
    if (crawled % 25 === 0)
      console.error(`  crawled ${crawled} pages / queue ${queue.length}`);
    if (!r.html) continue;
    for (const img of extractImages(r.html, url)) {
      if (!imagesOnPage.has(img)) imagesOnPage.set(img, new Set());
      imagesOnPage.get(img).add(url);
    }
    for (const link of extractLinks(r.html, url)) {
      if (!visited.has(link) && !queue.includes(link)) queue.push(link);
    }
  }
}

console.error(`Crawling ${ORIGIN} (cap ${MAX_PAGES})…`);
await Promise.all(Array.from({ length: CONCURRENCY }, crawlWorker));
console.error(`Found ${imagesOnPage.size} unique image URLs across ${visited.size} pages.`);

const imageUrls = [...imagesOnPage.keys()];
const imgStatus = new Map();
let probed = 0;
let idx = 0;
async function probeWorker() {
  while (idx < imageUrls.length) {
    const i = idx++;
    const u = imageUrls[i];
    const s = await probeImage(u);
    imgStatus.set(u, s);
    probed++;
    if (probed % 100 === 0) console.error(`  probed ${probed}/${imageUrls.length}`);
  }
}

console.error(`Probing ${imageUrls.length} unique image URLs…`);
await Promise.all(Array.from({ length: 8 }, probeWorker));

const broken = [];
for (const [u, s] of imgStatus) {
  // 206 is a successful partial-content response (Range request)
  if (s === 200 || s === 206) continue;
  broken.push({ url: u, status: s, pages: [...imagesOnPage.get(u)] });
}

// Group by URL pattern (strip filename + query) so we can spot root causes
const groups = new Map();
for (const b of broken) {
  let key;
  try {
    const url = new URL(b.url);
    // strip /_next/image to underlying ?url= image
    if (url.pathname === '/_next/image') {
      const inner = url.searchParams.get('url') || '';
      try {
        key = new URL(inner, ORIGIN).pathname.replace(/\/[^/]+$/, '/*');
      } catch {
        key = '/_next/image?url=' + inner;
      }
    } else {
      key = url.origin + url.pathname.replace(/\/[^/]+$/, '/*');
    }
  } catch {
    key = b.url;
  }
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(b);
}

console.log(`\n=== Broken image groups (${groups.size}) ===`);
const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [key, list] of sorted.slice(0, 30)) {
  const allPages = new Set();
  for (const b of list) for (const p of b.pages) allPages.add(p);
  console.log(`\n  ${list.length}× → ${key}  (affects ${allPages.size} pages)`);
  for (const b of list.slice(0, 3)) {
    console.log(`    ${b.status}  ${b.url}`);
  }
  if (list.length > 3) console.log(`    …and ${list.length - 3} more URLs in this group`);
  for (const p of [...allPages].slice(0, 4)) console.log(`    ← ${p}`);
  if (allPages.size > 4) console.log(`    …and ${allPages.size - 4} more pages`);
}

console.log(`\n=== Total broken: ${broken.length} unique URLs ===`);
const pagesAffected = new Set();
for (const b of broken) for (const p of b.pages) pagesAffected.add(p);
console.log(`=== Pages with at least one broken image: ${pagesAffected.size} ===`);

const today = new Date().toISOString().split('T')[0];
const outPath = `/tmp/broken-images-${today}.json`;
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      origin: ORIGIN,
      pagesCrawled: visited.size,
      uniqueImages: imageUrls.length,
      brokenImages: broken,
      pagesAffected: [...pagesAffected],
      groups: sorted.map(([key, list]) => ({
        key,
        count: list.length,
        pages: [...new Set(list.flatMap((b) => b.pages))],
        sampleUrls: list.slice(0, 5).map((b) => ({ url: b.url, status: b.status })),
      })),
    },
    null,
    2
  )
);
console.log(`\nWrote ${outPath}`);
