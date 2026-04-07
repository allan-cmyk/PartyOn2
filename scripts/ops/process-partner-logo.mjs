#!/usr/bin/env node
/**
 * Download a partner logo from a URL, remove the white background,
 * trim, resize, and save to public/images/partners/{slug}-logo.png.
 *
 * Mirrors scripts/process-boat-logos.mjs but as a reusable single-logo CLI.
 *
 * Usage:
 *   node scripts/ops/process-partner-logo.mjs \
 *     --url "https://example.com/logo.png" \
 *     --slug "luxury-boat-rentals" \
 *     [--threshold 240]   # 0-255, higher = more aggressive bg removal
 *     [--max-size 600]
 *     [--color "#F8C8DC"] # recolor all non-transparent pixels to this hex color
 */
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const PARTNERS_DIR = path.join(process.cwd(), 'public/images/partners');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const flag = argv[i];
    if (!flag.startsWith('--')) continue;
    const key = flag.slice(2);
    const val = argv[i + 1];
    if (val === undefined || val.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = val;
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const url = args.url;
const slug = args.slug;
const threshold = parseInt(args.threshold) || 240;
const maxSize = parseInt(args['max-size']) || 600;
const colorHex = args.color || null;

function parseHex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) {
    console.error(`Invalid --color value "${hex}". Expected 6-digit hex like #F8C8DC.`);
    process.exit(1);
  }
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}
const targetColor = colorHex ? parseHex(colorHex) : null;

if (!url || !slug) {
  console.error('Missing required flags.');
  console.error('Usage: node scripts/ops/process-partner-logo.mjs --url <logo-url> --slug <partner-slug>');
  process.exit(1);
}

if (!fs.existsSync(PARTNERS_DIR)) {
  fs.mkdirSync(PARTNERS_DIR, { recursive: true });
}

const tmpDownload = `/tmp/${slug}-download`;
const tmpProcessed = `/tmp/${slug}-processed.png`;
const finalPath = path.join(PARTNERS_DIR, `${slug}-logo.png`);

// 1. Download
console.log(`Downloading: ${url}`);
const res = await fetch(url);
if (!res.ok) {
  console.error(`Download failed: HTTP ${res.status}`);
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
fs.writeFileSync(tmpDownload, buf);
console.log(`  saved ${buf.length} bytes`);

// 2. Remove white background
console.log(`Removing white background (threshold=${threshold})...`);
const image = sharp(tmpDownload);
const { data, info } = await image
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let madeTransparent = 0;
let recolored = 0;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r >= threshold && g >= threshold && b >= threshold) {
    data[i + 3] = 0;
    madeTransparent++;
  } else if (targetColor) {
    data[i] = targetColor.r;
    data[i + 1] = targetColor.g;
    data[i + 2] = targetColor.b;
    recolored++;
  }
}
console.log(`  ${madeTransparent.toLocaleString()} pixels made transparent`);
if (targetColor) {
  console.log(`  ${recolored.toLocaleString()} pixels recolored to ${colorHex}`);
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(tmpProcessed);

// 3. Trim and resize
console.log(`Trimming and resizing (max ${maxSize}px)...`);
await sharp(tmpProcessed)
  .trim()
  .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
  .png()
  .toFile(finalPath);

const meta = await sharp(finalPath).metadata();
console.log('');
console.log('Logo processed');
console.log(`  path:   ${finalPath}`);
console.log(`  size:   ${meta.width}x${meta.height}`);
console.log(`  format: ${meta.format}`);

// Cleanup
try {
  fs.unlinkSync(tmpDownload);
  fs.unlinkSync(tmpProcessed);
} catch {}
