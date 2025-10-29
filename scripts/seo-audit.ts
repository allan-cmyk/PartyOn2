#!/usr/bin/env tsx

/**
 * SEO Audit Script
 *
 * Systematically checks all 'use client' pages for proper server-side metadata.
 * Identifies pages with client-side DOM manipulation (BAD for SEO).
 * Generates actionable report with fix recommendations.
 *
 * Usage: npx tsx scripts/seo-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AuditResult {
  pagePath: string;
  routePath: string;
  hasClientDirective: boolean;
  hasLayoutFile: boolean;
  layoutHasMetadata: boolean;
  hasDOMMetadataManipulation: boolean;
  domManipulationLines: string[];
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'PASSED';
  issues: string[];
}

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const PRODUCTION_URL = 'https://partyondelivery.com';

/**
 * Recursively find all page.tsx files
 */
function findPageFiles(dir: string, basePath: string = ''): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const relativePath = path.join(basePath, item);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc
      if (!item.startsWith('.') && item !== 'node_modules') {
        files.push(...findPageFiles(fullPath, relativePath));
      }
    } else if (item === 'page.tsx' || item === 'page.ts') {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Convert file path to route path
 */
function filePathToRoute(filePath: string): string {
  // Remove page.tsx and convert to route
  let route = filePath.replace(/\/page\.tsx?$/, '');

  // Remove (main) or other route groups
  route = route.replace(/\/?\([^)]+\)\/?/g, '/');

  // Handle dynamic routes
  route = route.replace(/\[([^\]]+)\]/g, ':$1');

  // Clean up
  route = route.replace(/\/+/g, '/');
  if (route === '') route = '/';
  if (!route.startsWith('/')) route = '/' + route;

  return route;
}

/**
 * Check if file has 'use client' directive
 */
function hasClientDirective(filePath: string): boolean {
  const content = fs.readFileSync(path.join(APP_DIR, filePath), 'utf-8');
  return /^['"]use client['"];?/m.test(content);
}

/**
 * Check if layout.tsx exists in same directory
 */
function hasLayoutFile(pagePath: string): boolean {
  const dir = path.dirname(pagePath);
  const layoutPath = path.join(APP_DIR, dir, 'layout.tsx');
  return fs.existsSync(layoutPath);
}

/**
 * Check if layout.tsx exports metadata
 */
function layoutHasMetadata(pagePath: string): boolean {
  const dir = path.dirname(pagePath);
  const layoutPath = path.join(APP_DIR, dir, 'layout.tsx');

  if (!fs.existsSync(layoutPath)) return false;

  const content = fs.readFileSync(layoutPath, 'utf-8');
  return /export\s+const\s+metadata\s*[:=]/.test(content);
}

/**
 * Detect client-side metadata manipulation (BAD for SEO)
 */
function detectDOMManipulation(filePath: string): { found: boolean; lines: string[] } {
  const content = fs.readFileSync(path.join(APP_DIR, filePath), 'utf-8');
  const lines = content.split('\n');
  const issues: string[] = [];

  const patterns = [
    { regex: /document\.title\s*=/, description: 'Sets document.title' },
    { regex: /document\.querySelector\(['"]meta/, description: 'Queries meta tags' },
    { regex: /document\.createElement\(['"]meta/, description: 'Creates meta tags' },
    { regex: /document\.createElement\(['"]script/, description: 'Creates script tags' },
    { regex: /metaDescription\.setAttribute/, description: 'Modifies meta attributes' },
    { regex: /document\.head\.appendChild/, description: 'Appends to document head' },
  ];

  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      if (pattern.regex.test(line)) {
        issues.push(`Line ${index + 1}: ${pattern.description} - ${line.trim().substring(0, 60)}...`);
      }
    });
  });

  return {
    found: issues.length > 0,
    lines: issues
  };
}

/**
 * Determine priority based on route and issues
 */
function determinePriority(
  route: string,
  hasDOMManipulation: boolean,
  hasLayout: boolean,
  layoutHasMetadata: boolean
): 'P0' | 'P1' | 'P2' | 'P3' | 'PASSED' {
  // If has proper server-side metadata, PASSED
  if (hasLayout && layoutHasMetadata) {
    return 'PASSED';
  }

  // P0 - CRITICAL: DOM manipulation or high-traffic without metadata
  if (hasDOMManipulation) {
    return 'P0';
  }

  // High-traffic public pages
  const highTrafficRoutes = ['/products', '/weddings', '/boat-parties', '/bach-parties', '/corporate'];
  if (highTrafficRoutes.some(r => route.startsWith(r)) && !layoutHasMetadata) {
    return 'P0';
  }

  // P1 - HIGH: Public-facing pages without metadata
  const publicRoutes = ['/contact', '/partners', '/order', '/about', '/services'];
  if (publicRoutes.some(r => route.startsWith(r))) {
    return 'P1';
  }

  // P2 - MEDIUM: Supporting public pages
  const supportingRoutes = ['/collections', '/checkout', '/faqs', '/delivery-areas', '/blog'];
  if (supportingRoutes.some(r => route.startsWith(r))) {
    return 'P2';
  }

  // P3 - LOW: Authenticated pages, test pages, internal tools
  const lowPriorityRoutes = ['/account', '/group', '/test', '/cart/shared'];
  if (lowPriorityRoutes.some(r => route.startsWith(r))) {
    return 'P3';
  }

  // Default to P2 if no metadata
  return 'P2';
}

/**
 * Main audit function
 */
async function runAudit(): Promise<AuditResult[]> {
  console.log('🔍 Starting SEO Audit...\n');
  console.log(`Scanning: ${APP_DIR}\n`);

  const pageFiles = findPageFiles(APP_DIR);
  console.log(`Found ${pageFiles.length} page.tsx files\n`);

  const results: AuditResult[] = [];

  for (const pagePath of pageFiles) {
    const route = filePathToRoute(pagePath);
    const isClient = hasClientDirective(pagePath);

    // Only audit client components
    if (!isClient) continue;

    const hasLayout = hasLayoutFile(pagePath);
    const layoutMetadata = hasLayout ? layoutHasMetadata(pagePath) : false;
    const domManipulation = detectDOMManipulation(pagePath);

    const issues: string[] = [];
    if (!hasLayout) {
      issues.push('No layout.tsx file');
    } else if (!layoutMetadata) {
      issues.push('layout.tsx exists but does not export metadata');
    }
    if (domManipulation.found) {
      issues.push('Client-side DOM metadata manipulation detected');
    }

    const priority = determinePriority(route, domManipulation.found, hasLayout, layoutMetadata);

    results.push({
      pagePath,
      routePath: route,
      hasClientDirective: isClient,
      hasLayoutFile: hasLayout,
      layoutHasMetadata: layoutMetadata,
      hasDOMMetadataManipulation: domManipulation.found,
      domManipulationLines: domManipulation.lines,
      priority,
      issues
    });
  }

  return results.sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, PASSED: 4 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate report
 */
function generateReport(results: AuditResult[]): string {
  const critical = results.filter(r => r.priority === 'P0');
  const high = results.filter(r => r.priority === 'P1');
  const medium = results.filter(r => r.priority === 'P2');
  const low = results.filter(r => r.priority === 'P3');
  const passed = results.filter(r => r.priority === 'PASSED');

  let report = '';
  report += '═══════════════════════════════════════════════════════\n';
  report += '  SEO METADATA AUDIT REPORT\n';
  report += '═══════════════════════════════════════════════════════\n\n';
  report += `Date: ${new Date().toISOString()}\n`;
  report += `Total Client Pages: ${results.length}\n\n`;

  report += '📊 SUMMARY\n';
  report += '───────────────────────────────────────────────────────\n';
  report += `✅ PASSED: ${passed.length}\n`;
  report += `🔴 P0 - CRITICAL: ${critical.length}\n`;
  report += `🟠 P1 - HIGH: ${high.length}\n`;
  report += `🟡 P2 - MEDIUM: ${medium.length}\n`;
  report += `⚪ P3 - LOW: ${low.length}\n\n`;

  if (critical.length > 0) {
    report += '🔴 P0 - CRITICAL ISSUES (Fix Immediately)\n';
    report += '───────────────────────────────────────────────────────\n';
    critical.forEach(r => {
      report += `\n📄 ${r.routePath}\n`;
      report += `   File: ${r.pagePath}\n`;
      report += `   Issues:\n`;
      r.issues.forEach(issue => report += `      - ${issue}\n`);
      if (r.domManipulationLines.length > 0) {
        report += `   DOM Manipulation:\n`;
        r.domManipulationLines.forEach(line => report += `      ${line}\n`);
      }
    });
    report += '\n';
  }

  if (high.length > 0) {
    report += '🟠 P1 - HIGH PRIORITY\n';
    report += '───────────────────────────────────────────────────────\n';
    high.forEach(r => {
      report += `\n📄 ${r.routePath}\n`;
      report += `   File: ${r.pagePath}\n`;
      report += `   Issues:\n`;
      r.issues.forEach(issue => report += `      - ${issue}\n`);
    });
    report += '\n';
  }

  if (medium.length > 0) {
    report += '🟡 P2 - MEDIUM PRIORITY\n';
    report += '───────────────────────────────────────────────────────\n';
    medium.forEach(r => {
      report += `   ${r.routePath} - ${r.pagePath}\n`;
    });
    report += '\n';
  }

  if (low.length > 0) {
    report += '⚪ P3 - LOW PRIORITY\n';
    report += '───────────────────────────────────────────────────────\n';
    low.forEach(r => {
      report += `   ${r.routePath} - ${r.pagePath}\n`;
    });
    report += '\n';
  }

  if (passed.length > 0) {
    report += '✅ PASSED (Has Server-Side Metadata)\n';
    report += '───────────────────────────────────────────────────────\n';
    passed.forEach(r => {
      report += `   ${r.routePath} - ${r.pagePath}\n`;
    });
    report += '\n';
  }

  report += '═══════════════════════════════════════════════════════\n';
  report += '  RECOMMENDATIONS\n';
  report += '═══════════════════════════════════════════════════════\n\n';

  if (critical.length === 0 && high.length === 0) {
    report += '🎉 No critical issues found!\n';
    report += 'All high-traffic pages have proper server-side metadata.\n\n';
  } else {
    report += '1. Fix P0/P1 pages immediately (deploy to production ASAP)\n';
    report += '2. Create layout.tsx for each page with metadata export\n';
    report += '3. Remove client-side DOM manipulation from page.tsx\n';
    report += '4. Test with: curl -s https://partyondelivery.com/[route] | grep -E "<title>|meta name="\n';
    report += '5. Request re-indexing via Google Search Console\n\n';
  }

  report += '═══════════════════════════════════════════════════════\n';

  return report;
}

/**
 * Save report to file
 */
function saveReport(report: string): void {
  const reportPath = path.join(process.cwd(), 'SEO_AUDIT_REPORT.md');

  let markdownReport = '# SEO Metadata Audit Report\n\n';
  markdownReport += '```\n';
  markdownReport += report;
  markdownReport += '```\n\n';
  markdownReport += '## Fix Template\n\n';
  markdownReport += 'For each page needing fixes, create a `layout.tsx` file:\n\n';
  markdownReport += '```typescript\n';
  markdownReport += `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '[Page Title] | Party On Delivery Austin',
  description: '[Compelling description under 155 characters]',
  keywords: '[relevant, keywords]',
  openGraph: {
    title: '[Page Title]',
    description: '[Description]',
    type: 'website',
    url: 'https://partyondelivery.com/[route]',
  },
  alternates: {
    canonical: '/[route]',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function [Page]Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`;
  markdownReport += '```\n\n';
  markdownReport += '## Next Steps\n\n';
  markdownReport += '1. Review P0/P1 pages in this report\n';
  markdownReport += '2. Create `layout.tsx` files for each page\n';
  markdownReport += '3. Remove any client-side metadata manipulation\n';
  markdownReport += '4. Test locally: `npm run build`\n';
  markdownReport += '5. Deploy to production\n';
  markdownReport += '6. Request re-indexing in Google Search Console\n';

  fs.writeFileSync(reportPath, markdownReport);
  console.log(`\n📄 Report saved to: ${reportPath}\n`);
}

// Run audit
(async () => {
  try {
    const results = await runAudit();
    const report = generateReport(results);
    console.log(report);
    saveReport(report);

    // Exit with error code if critical issues found
    const criticalCount = results.filter(r => r.priority === 'P0').length;
    if (criticalCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
})();
