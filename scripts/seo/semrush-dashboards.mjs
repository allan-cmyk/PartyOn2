/**
 * SEMrush dashboard config + KPI extraction patterns.
 *
 * The URL patterns and KPI labels were captured during the Phase 0 reconnaissance
 * (Memory/SEO/Recon-2026-05-06-semrush.md) and confirmed against the live UI on
 * 2026-05-06. Update this file if SEMrush relayouts a dashboard.
 *
 * Each dashboard entry is:
 *   - id:    filename slug (becomes <id>.png / <id>.json)
 *   - label: human-readable label for logs + manifest
 *   - urlBuilder: (cfg) => string — builds the direct URL from env-provided IDs
 *   - extract:    (bodyInnerText, fullPageHtml) => object — pure function, deterministic
 *
 * Keeping URL building and extraction pure lets us unit-test these without
 * Playwright running.
 */

/** @typedef {{ domain: string, projectId: string, folderId: string, campaignId: string, db: string }} SemrushConfig */

/**
 * Parse a number like "1.5K", "1,234", "638", "-13.78%", "$469.0", "+0.23".
 * Returns null if unparseable.
 *
 * @param {string|null|undefined} s
 * @returns {number|null}
 */
export function parseMetric(s) {
  if (s == null) return null;
  // Normalize en-dash to ASCII minus (SEMrush uses both), strip commas / $ / whitespace,
  // strip leading "+".
  const cleaned = String(s)
    .trim()
    .replace(/–/g, '-')
    .replace(/[,$\s]/g, '')
    .replace(/^[+]/, '');
  if (!cleaned) return null;
  // Handle "K" / "M" suffixes
  const kMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)([KM])$/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    return kMatch[2].toUpperCase() === 'K' ? val * 1000 : val * 1_000_000;
  }
  // Handle percentages — return as raw number (e.g. "-13.78%" -> -13.78)
  const pctMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (pctMatch) return parseFloat(pctMatch[1]);
  // Plain number with optional sign
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Find a "label\nvalue[\ndelta]" trio in body innerText, where label is exact-match.
 * SEMrush renders KPI tiles as stacked rows in the rendered text.
 *
 * Requires the value line to look numeric (digits with optional K/M/$/,/. and sign)
 * — this avoids matching section headers that share a label with a KPI tile (e.g.
 * "Backlinks" appears both as a nav header and as a KPI on the Backlink Analytics page).
 *
 * Delta is optional and accepts en-dash, plain minus, plus, or no sign — SEMrush
 * shows positive deltas in green without an explicit "+" prefix.
 *
 * Tries all occurrences of the label and returns the first one followed by a numeric line.
 *
 * @param {string} body
 * @param {string} label
 * @returns {{ value: number|null, delta: number|null, rawValue: string|null, rawDelta: string|null }}
 */
export function extractKpi(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match: label, then a value line that starts with optional $/sign and contains digits,
  // then optionally a delta line that's a percentage or signed number.
  const re = new RegExp(
    `(?:^|\\n)${escaped}\\n` +
      `(\\$?[+\\-–]?[\\d][\\d.,]*[KM]?%?)` + // value
      `(?:\\n([+\\-–]?[\\d.]+%?))?`, // optional delta
    'g'
  );
  let m;
  while ((m = re.exec(body)) !== null) {
    const value = parseMetric(m[1]);
    if (value === null) continue; // skip section-header false positives
    const rawDelta = m[2] ?? null;
    const normalizedDelta = rawDelta ? rawDelta.replace(/^–/, '-').replace(/–/g, '-') : null;
    return {
      value,
      delta: normalizedDelta ? parseMetric(normalizedDelta) : null,
      rawValue: m[1],
      rawDelta,
    };
  }
  return { value: null, delta: null, rawValue: null, rawDelta: null };
}

/** @type {Array<{ id: string, label: string, urlBuilder: (c: SemrushConfig) => string, extract: (body: string) => object }>} */
export const DASHBOARDS = [
  {
    id: 'position-tracking',
    label: 'Position Tracking — Landscape',
    urlBuilder: (c) =>
      `https://www.semrush.com/tracking/landscape/${c.projectId}_${c.campaignId}.html?fid=${c.folderId}`,
    extract(body) {
      // Visibility line on landscape: "<your-domain>\nYou\n25.70%\n+0.23"
      const visMatch = body.match(/You\n([\d.]+%)(?:\n([+\-–][\d.]+))?/);
      // First URL row, e.g. "https://partyondelivery.com/\n38\n5.39\n↑\n1.11\n2.23\n+0.79"
      const urlRowRe = /(https?:\/\/[^\n]+)\n(\d+)\n([\d.]+)\n(?:[↑↓])?\s*([\d.]+)?\s*\n([\d.]+)\n([+\-–][\d.]+)?/;
      const urlRow = body.match(urlRowRe);
      return {
        visibility_pct: visMatch ? parseMetric(visMatch[1]) : null,
        visibility_delta: visMatch && visMatch[2] ? parseMetric(visMatch[2].replace(/–/g, '-')) : null,
        top_url: urlRow
          ? {
              url: urlRow[1],
              keywords: parseMetric(urlRow[2]),
              avg_position: parseMetric(urlRow[3]),
              avg_position_change: urlRow[4] ? parseMetric(urlRow[4]) : null,
              est_traffic: parseMetric(urlRow[5]),
              est_traffic_change: urlRow[6] ? parseMetric(urlRow[6].replace(/–/g, '-')) : null,
            }
          : null,
      };
    },
  },
  {
    id: 'organic-research',
    label: 'Organic Research — Overview',
    urlBuilder: (c) =>
      `https://www.semrush.com/analytics/organic/overview/?db=${c.db}&q=${encodeURIComponent(c.domain)}&searchType=domain`,
    extract(body) {
      return {
        keywords: extractKpi(body, 'Keywords'),
        traffic: extractKpi(body, 'Traffic'),
        traffic_cost: extractKpi(body, 'Traffic Cost'),
        branded_traffic: extractKpi(body, 'Branded Traffic'),
        non_branded_traffic: extractKpi(body, 'Non-Branded Traffic'),
      };
    },
  },
  {
    id: 'backlink-analytics',
    label: 'Backlink Analytics — Overview',
    urlBuilder: (c) =>
      `https://www.semrush.com/analytics/backlinks/overview/?q=${encodeURIComponent(c.domain)}&searchType=domain`,
    extract(body) {
      const catMatch = body.match(/Category:\s*\n?\s*\n([^\n]+)/);
      return {
        referring_domains: extractKpi(body, 'Referring Domains'),
        backlinks: extractKpi(body, 'Backlinks'),
        monthly_visits: extractKpi(body, 'Monthly Visits'),
        organic_traffic: extractKpi(body, 'Organic Traffic'),
        outbound_domains: extractKpi(body, 'Outbound Domains'),
        category: catMatch ? catMatch[1].trim() : null,
      };
    },
  },
  {
    id: 'site-audit',
    label: 'Site Audit — Overview',
    urlBuilder: (c) => `https://www.semrush.com/siteaudit/campaign/${c.projectId}/review/overview/`,
    extract(body) {
      // "Pages crawled:\n246/1,000"
      const crawledMatch = body.match(/Pages crawled:\n([\d,]+)\/([\d,]+)/);
      // "Site Health" label followed (after 0-2 noise lines like accessibility hints) by "<value>%"
      // Real DOM: `Site Health\nPress "Tab" to enable charts accessibility module.\n80%\nno changes`
      const healthMatch = body.match(/Site Health\n(?:[^\n]*\n){0,2}?([\d.]+)%/);
      // Status mix lives as label-value rows
      const statusValue = (label) => {
        const re = new RegExp(`(?:^|\\n)${label}\\n(\\d+)`);
        const m = body.match(re);
        return m ? parseMetric(m[1]) : null;
      };
      // AI Search Health: "AI Search Health\nbeta\nPress \"Tab\" ...\n91%\n+1"
      const aiMatch = body.match(/AI Search Health[\s\S]*?([\d.]+)%(?:\n([+\-–]\d+))?/);
      // Total issues: "183 issues"
      const issuesMatch = body.match(/(\d+)\s+issues/);

      return {
        site_health_pct: healthMatch ? parseMetric(healthMatch[1]) : null,
        pages_crawled: crawledMatch ? parseMetric(crawledMatch[1]) : null,
        pages_crawl_cap: crawledMatch ? parseMetric(crawledMatch[2]) : null,
        status_mix: {
          healthy: statusValue('Healthy'),
          broken: statusValue('Broken'),
          have_issues: statusValue('Have issues'),
          redirects: statusValue('Redirects'),
          blocked: statusValue('Blocked'),
        },
        ai_search_health_pct: aiMatch ? parseMetric(aiMatch[1]) : null,
        ai_search_health_delta: aiMatch && aiMatch[2] ? parseMetric(aiMatch[2].replace(/–/g, '-')) : null,
        total_issues: issuesMatch ? parseMetric(issuesMatch[1]) : null,
      };
    },
  },
];

/**
 * Build the config object from environment variables, with reasonable defaults
 * for partyondelivery.com (per Memory/SEO/Recon-2026-05-06-semrush.md).
 *
 * @returns {SemrushConfig}
 */
export function loadConfig() {
  return {
    domain: process.env.SEMRUSH_DOMAIN || 'partyondelivery.com',
    projectId: process.env.SEMRUSH_PROJECT_ID || '26954798',
    folderId: process.env.SEMRUSH_FOLDER_ID || '8850397',
    campaignId: process.env.SEMRUSH_POSITION_CAMPAIGN_ID || '26954798_3575431',
    db: process.env.SEMRUSH_DB || 'us',
  };
}
