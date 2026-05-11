---
name: seo-semrush-snapshot
description: Cowork browser-automation skill that captures four SEMrush dashboards for partyondelivery.com (Position Tracking, Organic Research, Backlink Analytics, Site Audit) and writes screenshots + extracted KPI JSON to data/seo/semrush/<YYYY-MM-DD>/ for the SEO Director agent to consume.
---

# seo-semrush-snapshot

Weekly SEMrush data capture for the [[seo-director]] agent. Drives a Playwright-controlled Chromium against the live SEMrush UI, screenshots four dashboards, extracts KPI values from the rendered text, and writes structured JSON the SEO Director reads from disk.

## How to run

```bash
# One-time, on the workstation that will run the snapshot:
npm run seo:snapshot:init       # opens a real browser, you log into SEMrush manually,
                                # profile saved to data/seo/.semrush-profile/

# Recurring (manual for now; Phase 1 PR 3 schedules it):
npm run seo:snapshot            # headless run, writes data/seo/semrush/<today>/
npm run seo:snapshot -- --headed   # show the browser (debugging)
```

Output:

```
data/seo/semrush/<YYYY-MM-DD>/
├── manifest.json
├── position-tracking.png
├── position-tracking.json
├── organic-research.png
├── organic-research.json
├── backlink-analytics.png
├── backlink-analytics.json
├── site-audit.png
├── site-audit.json
└── FAILED.md            # only on failure; FAILED.png alongside it
```

`manifest.json` summarizes per-dashboard success/failure so the eventual `/api/cron/seo-snapshot` reader can skip partial captures.

The whole `data/seo/` tree is gitignored.

## Why a persistent profile instead of email/password env vars

The Phase 0 reconnaissance (`Memory/SEO/Recon-2026-05-06-semrush.md`) found that the operator's Chrome already has a logged-in SEMrush session and a `npm run seo:snapshot:init` flow can capture that into a Playwright-managed profile with no credential handling. The profile lives in `data/seo/.semrush-profile/` (gitignored), so subsequent runs need no env vars and no 2FA juggling. If SEMrush expires the session, re-run `seo:snapshot:init`.

This is why the skill does not read `SEMRUSH_EMAIL` / `SEMRUSH_PASSWORD` env vars (despite the Phase 0 contract sketch mentioning them) — the persistent-profile path is simpler and safer.

## What gets captured (per dashboard)

URL patterns + extraction logic live in [`scripts/seo/semrush-dashboards.mjs`](../../../scripts/seo/semrush-dashboards.mjs). Each dashboard entry is a pure function from rendered body text to a typed JSON object, so the extractor is testable independently of Playwright.

### 1. Position Tracking (Landscape view)
- URL: `https://www.semrush.com/tracking/landscape/<projectId>_<campaignId>.html?fid=<folderId>`
- Captured fields: `visibility_pct`, `visibility_delta`, `top_url` (URL, keywords, avg position + change, est traffic + change)

### 2. Organic Research (Overview)
- URL: `https://www.semrush.com/analytics/organic/overview/?db=us&q=<domain>&searchType=domain`
- Captured KPIs (each as `{ value, delta, rawValue, rawDelta }`): `keywords`, `traffic`, `traffic_cost`, `branded_traffic`, `non_branded_traffic`

### 3. Backlink Analytics (Overview)
- URL: `https://www.semrush.com/analytics/backlinks/overview/?q=<domain>&searchType=domain`
- Captured KPIs: `referring_domains`, `backlinks`, `monthly_visits`, `organic_traffic`, `outbound_domains`, plus auto-detected `category`

### 4. Site Audit (Overview)
- URL: `https://www.semrush.com/siteaudit/campaign/<projectId>/review/overview/`
- Captured fields: `site_health_pct`, `pages_crawled`, `pages_crawl_cap`, `status_mix` (healthy/broken/have_issues/redirects/blocked), `ai_search_health_pct`, `ai_search_health_delta`, `total_issues`

**Deferred to a follow-up PR:** the Keyword Magic Tool (`scripts/topics.json`-driven on-demand queries, not scheduled).

## Config (env vars; defaults baked in)

Defaults match the partyondelivery.com main project, captured during Phase 0 recon. Override only when pointing at a different SEMrush project.

| Var | Default | Notes |
|---|---|---|
| `SEMRUSH_DOMAIN` | `partyondelivery.com` | Used in Organic Research + Backlink Analytics URLs |
| `SEMRUSH_PROJECT_ID` | `26954798` | The "POD" main project (not "POD AI") |
| `SEMRUSH_FOLDER_ID` | `8850397` | SEMrush project-folder ID |
| `SEMRUSH_POSITION_CAMPAIGN_ID` | `26954798_3575431` | Position Tracking campaign |
| `SEMRUSH_DB` | `us` | SEMrush database. `au` / `ca` available |

## Failure modes the skill catches

- **Session expired** — page redirects to `/login`. Script writes `FAILED.md` for that dashboard, screenshots the redirect, continues with the next dashboard. Operator re-runs `seo:snapshot:init`.
- **Layout change** — KPI extractors return `null` for fields. Manifest shows fields extracted = 0 or partial. SEO Director's freshness gate ignores nulls; operator inspects the screenshot.
- **Rate limit / Cloudflare challenge** — first request fails, cascade fails. `FAILED.md` includes the URL and screenshot. Recovery: wait, re-run.
- **Per-dashboard timeout (60s nav, 20s networkidle)** — captured as a per-dashboard FAIL; other dashboards still run.

## Where this fits in the SEO Director pipeline

```
[workstation cron / GitHub Actions]
            │
            ▼
[npm run seo:snapshot]  ──Playwright──▶ SEMrush UI
            │
            ▼
data/seo/semrush/<date>/*.{png,json,FAILED.md}
            │
            ▼ (Phase 1 PR 3)
[/api/cron/seo-snapshot] reads latest dir, writes SeoSnapshot DB row
            │
            ▼
SEO Director agent reads SeoSnapshot + freshness gate
```

Runner placement (GitHub Actions vs. workstation cron) is decided in Phase 1 PR 3 once the operator has run the snapshot manually a few times and the failure modes are observed in practice.

## Out of scope

- Running on Vercel serverless (no browser binaries)
- Real-time queries from the SEO Director agent (this skill is a producer; the agent is a consumer)
- Keyword Magic on-demand queries (Phase 1 follow-up PR)
- Backlink Audit toxicity scoring (requires one-time SEMrush campaign creation by the operator — outside Phase 1 scope)
- Multi-domain support (the script captures one domain per run; running for additional domains needs a per-domain env file)

## See also

- `Memory/SEO/Recon-2026-05-06-semrush.md` — Phase 0 reconnaissance findings; URL patterns, selectors, plan tier, project ownership notes
- `.claude/skills/webapp-testing/SKILL.md` — companion skill, Python Playwright for local app testing
- `.claude/agents/seo-director.md` — the consumer of this skill's output
- `scripts/seo/semrush-dashboards.mjs` — URL + extractor configs (pure, testable)
- `scripts/seo/semrush-init.mjs` — one-time profile setup
- `scripts/seo/semrush-snapshot.mjs` — main runner
