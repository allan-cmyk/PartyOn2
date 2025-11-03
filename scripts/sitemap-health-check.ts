#!/usr/bin/env tsx

/**
 * Sitemap Health Check and Monitoring Script
 *
 * This script validates your sitemap and checks for common issues that could
 * cause Google Search Console warnings.
 *
 * Features:
 * - Validates XML structure
 * - Checks all URLs for accessibility (200 status)
 * - Detects redirects (301/302)
 * - Identifies 404 and 500 errors
 * - Verifies robots.txt compatibility
 * - Generates detailed health report
 *
 * Usage:
 *   npm run sitemap-check
 *   npm run sitemap-check -- --url=https://custom-domain.com/sitemap.xml
 *   npm run sitemap-check -- --sample=50
 *
 * Options:
 *   --url        Custom sitemap URL (default: http://localhost:3000/sitemap.xml)
 *   --sample     Number of URLs to check (default: all)
 *   --verbose    Show detailed logs
 *   --json       Output results as JSON
 *
 * Author: Party On Delivery Team
 * Last Updated: Nov 2024
 */

import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  url: string;
  status: number;
  issue?: string;
  redirectTo?: string;
}

interface HealthReport {
  timestamp: string;
  sitemapUrl: string;
  totalUrls: number;
  checkedUrls: number;
  healthyUrls: number;
  issues: {
    redirects: CheckResult[];
    notFound: CheckResult[];
    serverErrors: CheckResult[];
    blockedByRobots: CheckResult[];
    other: CheckResult[];
  };
  summary: {
    healthScore: number;
    status: 'healthy' | 'warning' | 'critical';
    recommendations: string[];
  };
}

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string = ''): string => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : defaultValue;
};
const hasFlag = (name: string): boolean => args.includes(`--${name}`);

const SITEMAP_URL = getArg('url', 'http://localhost:3000/sitemap.xml');
const SAMPLE_SIZE = parseInt(getArg('sample', '0')) || 0;
const VERBOSE = hasFlag('verbose');
const JSON_OUTPUT = hasFlag('json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  if (!JSON_OUTPUT) {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

function logVerbose(message: string): void {
  if (VERBOSE && !JSON_OUTPUT) {
    console.log(`${colors.cyan}[VERBOSE] ${message}${colors.reset}`);
  }
}

/**
 * Fetch and parse sitemap XML
 */
async function fetchSitemap(url: string): Promise<string[]> {
  log(`\nFetching sitemap from: ${url}`, 'blue');

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlContent = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlContent);

    // Extract URLs from sitemap
    const urls: string[] = [];

    if (result.urlset && result.urlset.url) {
      for (const urlEntry of result.urlset.url) {
        if (urlEntry.loc && urlEntry.loc[0]) {
          urls.push(urlEntry.loc[0]);
        }
      }
    }

    log(`✓ Found ${urls.length} URLs in sitemap`, 'green');
    return urls;
  } catch (error) {
    log(`✗ Failed to fetch sitemap: ${error}`, 'red');
    throw error;
  }
}

/**
 * Check if URL is blocked by robots.txt
 */
async function checkRobotsTxt(baseUrl: string): Promise<string[]> {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();
    const response = await fetch(robotsUrl);

    if (!response.ok) {
      logVerbose('No robots.txt found or not accessible');
      return [];
    }

    const robotsTxt = await response.text();
    const disallowRules: string[] = [];

    // Parse simple Disallow rules (this is a basic parser)
    const lines = robotsTxt.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith('disallow:')) {
        const path = trimmed.substring('disallow:'.length).trim();
        if (path) {
          disallowRules.push(path);
        }
      }
    }

    logVerbose(`Found ${disallowRules.length} Disallow rules in robots.txt`);
    return disallowRules;
  } catch (error) {
    logVerbose(`Could not check robots.txt: ${error}`);
    return [];
  }
}

/**
 * Check if URL is blocked by robots.txt rules
 */
function isBlockedByRobots(url: string, disallowRules: string[]): boolean {
  const urlPath = new URL(url).pathname;

  for (const rule of disallowRules) {
    // Simple pattern matching (a full implementation would be more complex)
    if (rule.endsWith('*')) {
      const prefix = rule.slice(0, -1);
      if (urlPath.startsWith(prefix)) {
        return true;
      }
    } else if (urlPath === rule || urlPath.startsWith(rule)) {
      return true;
    }
  }

  return false;
}

/**
 * Check a single URL for issues
 */
async function checkUrl(url: string, disallowRules: string[]): Promise<CheckResult> {
  logVerbose(`Checking: ${url}`);

  try {
    // Check robots.txt blocking
    if (isBlockedByRobots(url, disallowRules)) {
      return {
        url,
        status: 0,
        issue: 'Blocked by robots.txt'
      };
    }

    // Check URL accessibility
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual'
    });

    const result: CheckResult = {
      url,
      status: response.status
    };

    // Categorize issues
    if (response.status >= 300 && response.status < 400) {
      result.issue = 'Redirect';
      result.redirectTo = response.headers.get('location') || 'Unknown';
    } else if (response.status === 404) {
      result.issue = 'Not Found';
    } else if (response.status >= 500) {
      result.issue = 'Server Error';
    } else if (response.status !== 200) {
      result.issue = `Unexpected status: ${response.status}`;
    }

    return result;
  } catch (error) {
    return {
      url,
      status: 0,
      issue: `Error: ${error}`
    };
  }
}

/**
 * Check all URLs in sitemap
 */
async function checkAllUrls(urls: string[], disallowRules: string[]): Promise<CheckResult[]> {
  const urlsToCheck = SAMPLE_SIZE > 0 ? urls.slice(0, SAMPLE_SIZE) : urls;

  log(`\nChecking ${urlsToCheck.length} URLs...`, 'blue');

  if (!JSON_OUTPUT) {
    process.stdout.write('Progress: [');
  }

  const results: CheckResult[] = [];
  const progressInterval = Math.max(1, Math.floor(urlsToCheck.length / 50));

  for (let i = 0; i < urlsToCheck.length; i++) {
    const result = await checkUrl(urlsToCheck[i], disallowRules);
    results.push(result);

    // Show progress bar
    if (!JSON_OUTPUT && i % progressInterval === 0) {
      process.stdout.write('=');
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (!JSON_OUTPUT) {
    process.stdout.write(']\n');
  }

  return results;
}

/**
 * Generate health report
 */
function generateReport(sitemapUrl: string, allUrls: string[], results: CheckResult[]): HealthReport {
  const issues = {
    redirects: results.filter(r => r.issue === 'Redirect'),
    notFound: results.filter(r => r.issue === 'Not Found'),
    serverErrors: results.filter(r => r.issue === 'Server Error'),
    blockedByRobots: results.filter(r => r.issue === 'Blocked by robots.txt'),
    other: results.filter(r => r.issue && !['Redirect', 'Not Found', 'Server Error', 'Blocked by robots.txt'].includes(r.issue))
  };

  const healthyUrls = results.filter(r => !r.issue).length;
  const totalIssues = results.length - healthyUrls;
  const healthScore = Math.round((healthyUrls / results.length) * 100);

  const recommendations: string[] = [];

  if (issues.blockedByRobots.length > 0) {
    recommendations.push('Remove URLs blocked by robots.txt from your sitemap');
  }
  if (issues.notFound.length > 0) {
    recommendations.push('Fix or remove URLs returning 404 errors');
  }
  if (issues.redirects.length > 0) {
    recommendations.push('Update redirecting URLs to their final destinations');
  }
  if (issues.serverErrors.length > 0) {
    recommendations.push('Investigate and fix server errors (500+)');
  }
  if (healthScore === 100) {
    recommendations.push('Sitemap is healthy! No action required.');
  }

  let status: 'healthy' | 'warning' | 'critical';
  if (healthScore >= 95) {
    status = 'healthy';
  } else if (healthScore >= 80) {
    status = 'warning';
  } else {
    status = 'critical';
  }

  return {
    timestamp: new Date().toISOString(),
    sitemapUrl,
    totalUrls: allUrls.length,
    checkedUrls: results.length,
    healthyUrls,
    issues,
    summary: {
      healthScore,
      status,
      recommendations
    }
  };
}

/**
 * Display report in console
 */
function displayReport(report: HealthReport): void {
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║              Sitemap Health Check Report                  ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');

  log(`\nTimestamp: ${report.timestamp}`);
  log(`Sitemap URL: ${report.sitemapUrl}`);
  log(`Total URLs in sitemap: ${report.totalUrls}`);
  log(`URLs checked: ${report.checkedUrls}`);

  // Health score with color
  const scoreColor = report.summary.healthScore >= 95 ? 'green' :
                     report.summary.healthScore >= 80 ? 'yellow' : 'red';
  log(`\n${'═'.repeat(60)}`, 'blue');
  log(`Health Score: ${report.summary.healthScore}%`, scoreColor);
  log(`Status: ${report.summary.status.toUpperCase()}`, scoreColor);
  log(`${'═'.repeat(60)}`, 'blue');

  // Issues breakdown
  log('\n📊 Issues Breakdown:', 'bold');
  log(`  ✓ Healthy URLs: ${report.healthyUrls}`, 'green');
  log(`  ⚠ Redirects (301/302): ${report.issues.redirects.length}`, report.issues.redirects.length > 0 ? 'yellow' : 'green');
  log(`  ✗ Not Found (404): ${report.issues.notFound.length}`, report.issues.notFound.length > 0 ? 'red' : 'green');
  log(`  ✗ Server Errors (500+): ${report.issues.serverErrors.length}`, report.issues.serverErrors.length > 0 ? 'red' : 'green');
  log(`  ⚠ Blocked by robots.txt: ${report.issues.blockedByRobots.length}`, report.issues.blockedByRobots.length > 0 ? 'yellow' : 'green');
  log(`  ⚠ Other issues: ${report.issues.other.length}`, report.issues.other.length > 0 ? 'yellow' : 'green');

  // Show specific issues if any
  if (report.issues.blockedByRobots.length > 0) {
    log('\n⚠ URLs Blocked by robots.txt:', 'yellow');
    report.issues.blockedByRobots.slice(0, 10).forEach(item => {
      log(`  - ${item.url}`, 'yellow');
    });
    if (report.issues.blockedByRobots.length > 10) {
      log(`  ... and ${report.issues.blockedByRobots.length - 10} more`, 'yellow');
    }
  }

  if (report.issues.notFound.length > 0) {
    log('\n✗ URLs Returning 404:', 'red');
    report.issues.notFound.slice(0, 10).forEach(item => {
      log(`  - ${item.url}`, 'red');
    });
    if (report.issues.notFound.length > 10) {
      log(`  ... and ${report.issues.notFound.length - 10} more`, 'red');
    }
  }

  if (report.issues.redirects.length > 0) {
    log('\n⚠ Redirecting URLs:', 'yellow');
    report.issues.redirects.slice(0, 5).forEach(item => {
      log(`  - ${item.url}`, 'yellow');
      log(`    → ${item.redirectTo}`, 'cyan');
    });
    if (report.issues.redirects.length > 5) {
      log(`  ... and ${report.issues.redirects.length - 5} more`, 'yellow');
    }
  }

  // Recommendations
  log('\n💡 Recommendations:', 'bold');
  report.summary.recommendations.forEach((rec, index) => {
    log(`  ${index + 1}. ${rec}`);
  });

  log('\n' + '═'.repeat(60), 'blue');
}

/**
 * Save report to file
 */
function saveReport(report: HealthReport): void {
  const reportsDir = path.join(process.cwd(), 'sitemap-reports');

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `sitemap-health-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`;
  const filepath = path.join(reportsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  log(`\n💾 Report saved to: ${filepath}`, 'green');
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    log('╔════════════════════════════════════════════════════════════╗', 'blue');
    log('║           PartyOn Delivery - Sitemap Health Check         ║', 'blue');
    log('╚════════════════════════════════════════════════════════════╝', 'blue');

    // Fetch sitemap
    const urls = await fetchSitemap(SITEMAP_URL);

    if (urls.length === 0) {
      log('✗ No URLs found in sitemap', 'red');
      process.exit(1);
    }

    // Get base URL from sitemap
    const baseUrl = new URL(urls[0]).origin;

    // Check robots.txt
    const disallowRules = await checkRobotsTxt(baseUrl);

    // Check all URLs
    const results = await checkAllUrls(urls, disallowRules);

    // Generate report
    const report = generateReport(SITEMAP_URL, urls, results);

    if (JSON_OUTPUT) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      displayReport(report);
      saveReport(report);

      // Exit with error code if critical
      if (report.summary.status === 'critical') {
        process.exit(1);
      }
    }
  } catch (error) {
    log(`\n✗ Fatal error: ${error}`, 'red');
    process.exit(1);
  }
}

// Run the script
main();
