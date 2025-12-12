/**
 * Blog Link Validation Script
 *
 * Extracts all external URLs from blog posts and validates they are working.
 * Outputs a report of broken, redirecting, and working links.
 */

import * as fs from 'fs';
import * as path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog', 'posts');
const REPORT_PATH = path.join(process.cwd(), 'scripts', 'link-report.json');

// Rate limiting delay between requests (ms)
const REQUEST_DELAY = 150;
const REQUEST_TIMEOUT = 10000;

interface LinkInfo {
  url: string;
  text: string;
  file: string;
  line: number;
}

interface ValidationResult {
  url: string;
  status: 'ok' | 'redirect' | 'broken' | 'timeout' | 'error';
  statusCode?: number;
  redirectUrl?: string;
  error?: string;
  occurrences: Array<{ file: string; text: string; line: number }>;
}

interface Report {
  timestamp: string;
  totalLinks: number;
  uniqueUrls: number;
  results: {
    ok: ValidationResult[];
    redirect: ValidationResult[];
    broken: ValidationResult[];
    timeout: ValidationResult[];
    error: ValidationResult[];
  };
  summary: {
    ok: number;
    redirect: number;
    broken: number;
    timeout: number;
    error: number;
  };
}

/**
 * Extract all markdown links from MDX files
 */
function extractLinksFromFile(filePath: string): LinkInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const links: LinkInfo[] = [];

  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      const text = match[1];
      const url = match[2];

      // Only include external URLs (http/https)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        links.push({
          url: url,
          text: text,
          file: fileName,
          line: lineIndex + 1
        });
      }
    }
  });

  return links;
}

/**
 * Get all MDX files from blog directory
 */
function getAllBlogFiles(): string[] {
  const files = fs.readdirSync(BLOG_DIR);
  return files
    .filter(f => f.endsWith('.mdx'))
    .map(f => path.join(BLOG_DIR, f));
}

/**
 * Group links by URL and collect all occurrences
 */
function groupLinksByUrl(links: LinkInfo[]): Map<string, LinkInfo[]> {
  const grouped = new Map<string, LinkInfo[]>();

  for (const link of links) {
    const existing = grouped.get(link.url) || [];
    existing.push(link);
    grouped.set(link.url, existing);
  }

  return grouped;
}

/**
 * Validate a single URL
 */
async function validateUrl(url: string): Promise<{
  status: 'ok' | 'redirect' | 'broken' | 'timeout' | 'error';
  statusCode?: number;
  redirectUrl?: string;
  error?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    // Use fetch with redirect: 'manual' to detect redirects
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
      }
    });

    clearTimeout(timeoutId);

    const statusCode = response.status;

    // Check for redirects
    if (statusCode >= 300 && statusCode < 400) {
      const redirectUrl = response.headers.get('location') || undefined;
      return { status: 'redirect', statusCode, redirectUrl };
    }

    // Check for success
    if (statusCode >= 200 && statusCode < 300) {
      return { status: 'ok', statusCode };
    }

    // Check for client/server errors
    if (statusCode >= 400) {
      return { status: 'broken', statusCode };
    }

    return { status: 'ok', statusCode };

  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return { status: 'timeout', error: 'Request timed out' };
      }
      return { status: 'error', error: err.message };
    }

    return { status: 'error', error: 'Unknown error' };
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main validation function
 */
async function validateAllLinks(): Promise<void> {
  console.log('\n🔗 Blog Link Validation Script\n');
  console.log('='.repeat(60));

  // Step 1: Extract all links from blog posts
  console.log('\n📖 Reading blog posts...');
  const blogFiles = getAllBlogFiles();
  console.log(`   Found ${blogFiles.length} MDX files`);

  const allLinks: LinkInfo[] = [];
  for (const file of blogFiles) {
    const links = extractLinksFromFile(file);
    allLinks.push(...links);
  }
  console.log(`   Extracted ${allLinks.length} total links`);

  // Step 2: Group by URL
  const groupedLinks = groupLinksByUrl(allLinks);
  const uniqueUrls = Array.from(groupedLinks.keys());
  console.log(`   ${uniqueUrls.length} unique URLs to validate\n`);

  // Filter out internal links
  const externalUrls = uniqueUrls.filter(url =>
    !url.includes('partyondelivery.com') &&
    !url.startsWith('mailto:') &&
    !url.includes('#')
  );
  console.log(`   ${externalUrls.length} external URLs (excluding partyondelivery.com)\n`);

  // Step 3: Validate each URL
  console.log('🔍 Validating URLs (this may take a few minutes)...\n');

  const results: ValidationResult[] = [];
  let processed = 0;

  for (const url of externalUrls) {
    processed++;
    const occurrences = groupedLinks.get(url)!;

    // Progress indicator
    if (processed % 20 === 0 || processed === externalUrls.length) {
      const percent = Math.round((processed / externalUrls.length) * 100);
      process.stdout.write(`\r   Progress: ${processed}/${externalUrls.length} (${percent}%)`);
    }

    const validation = await validateUrl(url);

    results.push({
      url,
      status: validation.status,
      statusCode: validation.statusCode,
      redirectUrl: validation.redirectUrl,
      error: validation.error,
      occurrences: occurrences.map(o => ({
        file: o.file,
        text: o.text,
        line: o.line
      }))
    });

    // Rate limiting
    await sleep(REQUEST_DELAY);
  }

  console.log('\n\n');

  // Step 4: Categorize results
  const report: Report = {
    timestamp: new Date().toISOString(),
    totalLinks: allLinks.length,
    uniqueUrls: externalUrls.length,
    results: {
      ok: results.filter(r => r.status === 'ok'),
      redirect: results.filter(r => r.status === 'redirect'),
      broken: results.filter(r => r.status === 'broken'),
      timeout: results.filter(r => r.status === 'timeout'),
      error: results.filter(r => r.status === 'error')
    },
    summary: {
      ok: 0,
      redirect: 0,
      broken: 0,
      timeout: 0,
      error: 0
    }
  };

  report.summary.ok = report.results.ok.length;
  report.summary.redirect = report.results.redirect.length;
  report.summary.broken = report.results.broken.length;
  report.summary.timeout = report.results.timeout.length;
  report.summary.error = report.results.error.length;

  // Step 5: Output report
  console.log('📊 VALIDATION RESULTS\n');
  console.log('='.repeat(60));
  console.log(`✅ OK:        ${report.summary.ok} links`);
  console.log(`↪️  Redirect:  ${report.summary.redirect} links`);
  console.log(`❌ Broken:    ${report.summary.broken} links`);
  console.log(`⏱️  Timeout:   ${report.summary.timeout} links`);
  console.log(`⚠️  Error:     ${report.summary.error} links`);
  console.log('='.repeat(60));

  // Show broken links details
  if (report.results.broken.length > 0) {
    console.log('\n❌ BROKEN LINKS:\n');
    for (const link of report.results.broken) {
      console.log(`   ${link.statusCode} - ${link.url}`);
      for (const occ of link.occurrences) {
        console.log(`       └─ ${occ.file}:${occ.line} "${occ.text}"`);
      }
    }
  }

  // Show timeout links
  if (report.results.timeout.length > 0) {
    console.log('\n⏱️  TIMEOUT LINKS (may need manual check):\n');
    for (const link of report.results.timeout) {
      console.log(`   ${link.url}`);
      for (const occ of link.occurrences) {
        console.log(`       └─ ${occ.file}:${occ.line} "${occ.text}"`);
      }
    }
  }

  // Show error links
  if (report.results.error.length > 0) {
    console.log('\n⚠️  ERROR LINKS:\n');
    for (const link of report.results.error) {
      console.log(`   ${link.url}`);
      console.log(`       Error: ${link.error}`);
      for (const occ of link.occurrences) {
        console.log(`       └─ ${occ.file}:${occ.line} "${occ.text}"`);
      }
    }
  }

  // Save full report to JSON
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n📁 Full report saved to: ${REPORT_PATH}\n`);
}

// Run the script
validateAllLinks().catch(console.error);
