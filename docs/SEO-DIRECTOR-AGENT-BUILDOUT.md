# SEO Director Agent — Buildout Brief

**Drop this entire file into a new Claude Code session.** It is self-contained — the new session will have no memory of the conversation that produced it.

**Goal of the new session:** Build the SEO Director agent for Party On Delivery and ship it through Phase 1 (read-only / recommendations), then scope Phase 2 (autonomous content production).

---

## 1. Context — why this agent exists

Party On Delivery (premium alcohol + party coordination delivery, Austin TX) is being reorganized around an "agentic org structure" — director-level Claude agents that own a functional area, surface decisions to the operator (Allan), and execute routine work autonomously. The original 6-director scope (Apr 18, 2026) was:

1. Marketing Director ← **shipped & mature**, see `docs/marketing/` and `Programs/Marketing-Director.md` in the Obsidian vault
2. Sales & Partnerships Director — not built
3. Operations Director — being built next, in parallel with this agent
4. Finance Director — not built
5. Customer Success Director — not built
6. Product Director — not built

Plus a Chief of Staff agent above all of them (not built).

In the original sketch, **SEO was a sub-agent under Marketing**. We are promoting it to **its own director** because:

- **Time horizon mismatch.** Marketing Director runs weekly tactical cycles (pause this affiliate, ship this landing-page test). SEO operates on 30–90 day feedback loops. Mixing them confuses the triage queue.
- **Output-type mismatch.** Marketing Director *recommends*; the operator ships. SEO *produces content* (blog posts, internal links, schema, alt text). It is a write-mode agent, not a read-mode agent.
- **Dedicated data sources.** SEMrush (accessed via a custom Cowork browser-automation skill — see §3) plus Google Search Console give SEO a data surface that doesn't overlap with Marketing's GA4/Vercel/GBP/orders pipeline.
- **Strategic weight.** Organic search is currently a near-zero channel for partyondelivery.com (per `docs/seo-audit-2026-03-30.md`: 1,289 URLs in sitemap, ~0 indexed at audit time). It needs sustained, focused ownership — not a sidecar to a busy director.

---

## 2. Scope

### In scope (own these outcomes)

- **Position tracking** across target keywords. Detect rank movement, lost-position alerts, new ranking opportunities.
- **Keyword research and prioritization.** Identify the next 5–10 keywords worth targeting given current authority + commercial intent + competition.
- **Content production.**
  - Blog post drafts (the existing `/api/cron/generate-blog` route is currently broken — see §6).
  - Internal linking improvements (interlace existing 133 blog posts + service pages to spread authority).
  - On-page SEO fixes (titles, meta descriptions, H1/H2 hierarchy, schema.org JSON-LD).
- **Technical SEO monitoring.** Indexation status (was 0/1289 in March), crawl errors, Core Web Vitals from Vercel, sitemap freshness.
- **Backlink monitoring.** New refdomains, lost backlinks, anchor-text drift.
- **Competitive watch.** Track competitor organic-traffic movement and content cadence.
- **SERP feature opportunities.** Featured snippets, People Also Ask, local pack.

### Out of scope (other directors own these)

- Paid search and ad spend → Marketing Director
- Conversion-rate optimization on landing pages once they rank → Marketing Director
- Affiliate / partner referral attribution → Marketing Director (governed by ADR M0001 in vault)
- Email/SMS retention sequences → Marketing Director (eventually CS Director)

### Deliverables for the operator

Mirror the Marketing Director cadence so the surfaces feel familiar:

- **Weekly briefing email** (ISO week, Monday morning) — top movers, lost positions, new opportunities, blog-post output of the week, this-week recommendations.
- **Triage queue** — same `MarketingRecommendation` model pattern (or a parallel `SEORecommendation` model) with statuses `proposed → accepted → executed → measured`.
- **Monthly content calendar** — what got published, what's drafted next, paired with target keyword & internal-link map.
- **Quarterly strategic review** — keyword strategy, pillar/cluster map, technical-debt items.

---

## 3. Available data sources

There is **no Ahrefs subscription and no SEMrush MCP**. Do not propose either. The data pipeline for the SEO Director is built from these four sources:

### A. SEMrush — via a custom Cowork browser-automation skill (NEW — build this)

The operator has a paid SEMrush account but is not connecting it via API or MCP. Instead, the SEO Director will get SEMrush data through a **Cowork skill that drives a real browser** (Playwright) into the SEMrush UI on a weekly schedule. The skill must:

1. Log into the operator's SEMrush account using credentials stored in env vars (`SEMRUSH_EMAIL`, `SEMRUSH_PASSWORD`) — handle 2FA if enabled by pausing for operator confirmation, or use a long-lived session cookie
2. Navigate to the relevant SEMrush dashboards for `partyondelivery.com`:
   - **Position Tracking** — current rank for tracked keywords + week-over-week deltas
   - **Organic Research** — top-ranking pages, total organic traffic estimate, keyword count
   - **Backlink Analytics** — new + lost referring domains
   - **Site Audit** — technical issues count, severity breakdown
   - **Keyword Magic Tool** — for any keywords queued by the SEO Director for research
3. **Take screenshots** of each dashboard view (full-page) and save under `data/seo/semrush/<YYYY-MM-DD>/<dashboard>.png`
4. **Scrape the data tables** on each page (rank, change, search volume, keyword, URL, date, etc.) and write to `data/seo/semrush/<YYYY-MM-DD>/<dashboard>.json` — structured data the SEO Director can read
5. Run **weekly** via Cowork's scheduling (Monday morning, before the SEO briefing email goes out)
6. On failure (login broken, layout changed, captcha): write a `data/seo/semrush/<YYYY-MM-DD>/FAILED.md` with the error and screenshots of the failure point, and the SEO Director's briefing flags it to the operator

**Existing tools in this environment that help build the skill:**

- The `webapp-testing` skill (Playwright-based) — start here; it's the closest existing pattern.
- The `Claude_in_Chrome` MCP tools (`mcp__Claude_in_Chrome__*`) — gives a Claude session a real Chrome browser with `navigate`, `find`, `form_input`, `read_page`, `read_network_requests`, etc. Useful during skill *development* to record selectors interactively.
- The `mcp__Claude_Preview__preview_screenshot` and `preview_eval` tools — for capturing + extracting in dev.

**Skill name suggestion:** `seo-semrush-snapshot` — lives at `.claude/skills/seo-semrush-snapshot/SKILL.md` with a `script.ts` that runs the Playwright flow.

**Important constraints:**

- Respect SEMrush's UI rate limits — sleep between navigations, don't spam.
- Do not commit screenshots to the repo. Add `data/seo/semrush/` to `.gitignore`. Sync the JSON-only summary to a structured DB table (`SEORanking` model — see §4) so historical trends are queryable.
- Login credentials must come from env vars only — never hardcoded. Add to `.env.example` and Vercel env config.
- The skill is the **only** place that touches SEMrush. The SEO Director consumes the JSON output, not the live site.

### B. Google Search Console — already piped in

GSC data is already pulled by the existing `analytics-snapshot` cron at `src/app/api/cron/analytics-snapshot/route.ts` and surfaced at `/api/admin/analytics/internal`. The SEO Director should:

- Read the GSC fields from the daily `AnalyticsSnapshot` rows for trend analysis
- If anything is missing (specific queries, position-history granularity), **extend the existing snapshot cron** — don't build a parallel GSC pipeline.

GSC is the source of truth for **clicks, impressions, CTR, average position, and indexation**. SEMrush is third-party-estimated and often inflates traffic numbers.

### C. Google Analytics 4 — already piped in

GA4 lives at `/api/admin/analytics/ga4` (behind `requireOpsAuth`). Use it for:

- Behavior of organic visitors after they land (engagement, conversion to order)
- Revenue attribution to organic traffic via `Order.utmSource` + `Order.landingPage`
- Comparison of organic vs. other channels

### D. Vercel Web Vitals + first-party events

- **Vercel Web Vitals** at `/api/admin/analytics/vercel` — Core Web Vitals per page. Bad LCP/CLS hurts rankings; the SEO Director surfaces top offenders.
- **`AnalyticsEvent` model** — populated by `AttributionTracker` on every page load. Lets the SEO Director query "users who landed on /blog/X then converted within N days" without round-tripping through GA4.

### Summary of the data flow

```
SEMrush UI ──Cowork weekly skill (Playwright)──> data/seo/semrush/<date>/*.json + *.png
                                                          │
                                                          ▼
                                              SEORanking (DB table)
                                                          │
GSC ──> existing analytics-snapshot ─────> AnalyticsSnapshot ─┐
                                                          │   │
GA4 ──> existing /api/admin/analytics/ga4 ────────────────┼───┤
                                                          │   ▼
Vercel ──> existing /api/admin/analytics/vercel ──────────┼─> seo-snapshot cron ──> SEOSnapshot ──> seo-briefing email + triage queue
                                                          │
First-party events ──> AnalyticsEvent ────────────────────┘
```

---

## 4. Existing infrastructure to reuse — DO NOT rebuild

### The Marketing Director template

The SEO Director should structurally mirror the Marketing Director. Read these in order before designing anything:

1. `.claude/agents/marketing-director.md` — the agent definition (Sonnet, recommendations-only Phase 1, tools restricted to Read/Grep/Glob/Bash). Use the same frontmatter shape.
2. `~/Projects/Obsidian/Obsidian/PartyOn2/Programs/Marketing-Director.md` — the program doc explaining the data pipeline, cron schedule, admin surface, and memory layout. The SEO equivalent should be `Programs/SEO-Director.md`.
3. `~/Projects/Obsidian/Obsidian/PartyOn2/Memory/Marketing/README.md` — the memory conventions (folders, frontmatter schemas, lifecycle, hard rules). Mirror this exactly under `Memory/SEO/`.
4. `src/app/api/cron/analytics-snapshot/route.ts` — the daily snapshot cron pattern.
5. `src/app/api/cron/weekly-briefing/route.ts` + `src/lib/email/templates/marketing-briefing.ts` + `src/lib/analytics/briefing-payload.ts` — Monday email pipeline.
6. `src/app/api/cron/measure-recommendations/route.ts` — 14-day measurement loop that captures outcomes for shipped recs.
7. `src/app/admin/analytics/recommendations/` — triage queue UI (read it; build the SEO version as `/admin/seo/recommendations` or merge into the same UI with a `domain` filter).
8. `src/lib/analytics/experiment-significance.ts` — two-proportion z-test, useful when measuring blog-post performance lifts.

### Database models to reuse or extend

Look at `prisma/schema.prisma` for:

- `AnalyticsSnapshot` — daily snapshot of marketing metrics. SEO can either piggyback (add columns) or add a parallel `SEOSnapshot` model. **Recommendation: parallel model.** Marketing snapshot is already wide; keep concerns separated.
- `MarketingRecommendation` — the rec lifecycle model. Mirror as `SEORecommendation` (same status enum: `open|approved|shipped|rejected|invalidated`, plus `measured`).
- `BlogPost` — the blog content model. Existing 133 posts live as MDX in `content/blog/posts/`, **not** in the DB. Read `content/blog/posts/` directly via filesystem; do not migrate to DB unless you have a specific reason.
- `AnalyticsEvent` — first-party event log. Useful for "users who landed on /blog/X then converted."

### Existing scripts to wire in

Don't rewrite these — call or extend them:

- `scripts/seo-audit.ts` — checks `'use client'` pages for proper SSR metadata. Run this on a schedule and surface diffs.
- `scripts/validate-blog-links.ts` — finds broken outbound links in blog posts. Run weekly.
- `scripts/automated-daily-blog.ts` — the original blog generator. **Currently broken** (see §6). The SEO Director should own fixing/replacing this.
- `scripts/generate-blog-images.ts` — image generation for blog posts (uses local `image-generator-tool`).
- `scripts/migrate-shopify-blogs.ts` — historical migration script, probably done; just for reference.
- `scripts/topics.json` — the 107 blog topics; per memory note all are currently published. New topics need to come from the SEMrush Cowork skill output + GSC striking-distance keyword analysis.

### Most recent SEO ground-truth

`docs/seo-audit-2026-03-30.md` — full audit from late March. Read it. Key findings to address:
- 0 of 1,289 URLs were indexed at audit time
- Sitemap `<lastmod>` was being regenerated on every request (now fixed)
- GSC verification status uncertain — confirm

The SEO Director's first job in Phase 1 is to **re-run the audit and produce a delta**: what got fixed, what's still broken, what's new.

---

## 5. Architectural decision — sibling director, not Marketing sub-agent

Already explained in §1 but to make it operational:

- New agent definition file: `.claude/agents/seo-director.md`
- New Obsidian program doc: `Programs/SEO-Director.md`
- New Obsidian memory tree: `Memory/SEO/{Briefings,Recommendations,Decisions,Channel-Performance,Open-Questions.md,README.md}` mirroring `Memory/Marketing/`
- New cron(s) under `src/app/api/cron/seo-*`
- New admin surface under `/admin/seo/` (or extend `/admin/analytics/` with an SEO tab)
- New `MarketingRecommendation`-style model: `SEORecommendation`
- Decision ADRs prefixed `S` (so `S0001`, `S0002`...) to not collide with engineering ADRs (numeric) or marketing ADRs (`M0001`...)

Marketing Director and SEO Director will collaborate but not depend on each other:
- Marketing reads the SEO snapshot for context (how much organic is contributing)
- SEO reads Marketing's `Order` data for revenue-per-keyword attribution

---

## 6. Known broken thing — fix early

`src/app/api/cron/generate-blog/route.ts` uses a dead OpenRouter model and has not been generating blogs. From the saved memory note: "blog generator broken — pending SEO sub-agent." This is now your responsibility.

Two paths:

**Path A — minimal fix.** Update the model ID to a current one (`anthropic/claude-3.5-sonnet` or `anthropic/claude-sonnet-4-6` via OpenRouter, or call the Anthropic SDK directly). Keep the existing topic/MDX flow.

**Path B — rebuild it properly under the SEO Director.** Replace the topic-list-driven generator with one that:
1. Reads current rankings from the latest `SEORanking` rows (sourced from the SEMrush Cowork skill output) plus GSC data in `AnalyticsSnapshot`
2. Identifies a target keyword cluster the site is close to ranking for (positions 11–25 on a meaningful-volume keyword = "striking distance")
3. Drafts a post optimized for that cluster + internal-links to existing related posts on the site
4. Writes to `content/blog/posts/` as MDX with proper frontmatter (see existing posts for the schema)
5. Logs the published post + target keyword + initial position to a `BlogPostPerformance` table for measurement

Recommendation: **Path B**, but in two phases. Phase 1: get rankings + keyword research wired in and surface "next post to write" recommendations to the operator. Phase 2: actually draft + publish autonomously once Phase 1 has earned trust.

---

## 7. Suggested phased build

### Phase 0 — Setup (Day 1)

- Create `.claude/agents/seo-director.md` (mirror Marketing Director frontmatter).
- Create empty Obsidian memory shell at `Memory/SEO/`.
- Read all 8 reference files listed in §4.
- Confirm GSC + GA4 + Vercel admin endpoints return data (these already exist).
- Sketch the SEMrush Cowork skill (`.claude/skills/seo-semrush-snapshot/SKILL.md`) — selectors, dashboards to capture, output schema. Don't implement the Playwright flow yet; that's Phase 1.

### Phase 1 — Read-only & recommendations (Weeks 1–2)

- **Build the SEMrush Cowork skill first** — this is the data input. Without it, the snapshot cron has no rank data. Implement Playwright login, navigate, screenshot, scrape for the 5 dashboards listed in §3.A. Write outputs to `data/seo/semrush/<date>/`.
- Add `SEORanking` model (per-keyword, per-snapshot-date row: `keyword`, `position`, `previousPosition`, `searchVolume`, `url`, `capturedAt`, `source: 'semrush' | 'gsc'`).
- Build `src/app/api/cron/seo-snapshot/route.ts` — daily pull from GSC + the latest SEMrush JSON (already on disk from the weekly skill run) + on-page audit (`scripts/seo-audit.ts`). Writes one `SEOSnapshot` row per day.
- Build `SEORecommendation` model + heuristic generators inside the snapshot cron (e.g. "page X dropped from position 5 to 11 — investigate", "keyword Y has rising volume and you rank #14 — write a post").
- Build the Monday `seo-briefing` email + template.
- Surface the queue in admin UI.
- The agent itself is invokable via `Agent({ subagent_type: "seo-director", ... })` and produces narrative analyses on top of the snapshot.

**Exit criterion for Phase 1:** Allan reads the Monday SEO briefing for 2 consecutive weeks and the recommendations are useful enough to act on.

### Phase 2 — Autonomous content production (Week 3+)

- Fix or replace the blog generator (Path B from §6).
- Add internal-linking pass: after a new post publishes, find related posts and add reciprocal links.
- Add schema.org enrichment: enhance existing posts with FAQPage, HowTo, Product where relevant.
- Add monthly competitive-content scan: what topics are competitors ranking for that we aren't covering.

**Exit criterion for Phase 2:** SEO Director publishes ≥4 posts/month autonomously, internal-link graph density measurably improves, indexation rate climbs.

### Phase 3 — Authority building (Quarter 2+)

- Surface backlink prospects from the SEMrush Backlink Analytics + Organic Research dashboards (extend the Cowork skill to capture competitor data on the same weekly run).
- Draft outreach email templates (handed to operator to send — not autonomous).
- Track digital-PR opportunities (HARO equivalents, podcast pitches).

---

## 8. Files this build will likely touch

```
.claude/agents/seo-director.md                     [NEW]
.claude/skills/seo-semrush-snapshot/SKILL.md       [NEW — Cowork browser-automation skill]
.claude/skills/seo-semrush-snapshot/script.ts      [NEW — Playwright login + scrape]
.claude/skills/seo-semrush-snapshot/selectors.ts   [NEW — SEMrush DOM selectors, isolated for easy fixes]
prisma/schema.prisma                               [+SEORecommendation, +SEOSnapshot, +SEORanking, +BlogPostPerformance]
src/app/api/cron/seo-snapshot/route.ts             [NEW]
src/app/api/cron/seo-briefing/route.ts             [NEW]
src/app/api/cron/measure-seo-recommendations/route.ts   [NEW]
src/app/api/admin/seo/snapshot/route.ts            [NEW]
src/app/api/admin/seo/recommendations/route.ts     [NEW]
src/app/api/admin/seo/keywords/route.ts            [NEW]
src/app/admin/seo/page.tsx                         [NEW]
src/app/admin/seo/recommendations/page.tsx         [NEW]
src/lib/seo/snapshot.ts                            [NEW — GSC + SEMrush-JSON reader]
src/lib/seo/semrush-import.ts                      [NEW — reads data/seo/semrush/<date>/*.json into SEORanking]
src/lib/seo/keyword-prioritizer.ts                 [NEW — heuristic ranker]
src/lib/seo/internal-linker.ts                     [NEW]
src/lib/seo/blog-generator.ts                      [NEW or replaces scripts/automated-daily-blog.ts]
src/lib/email/templates/seo-briefing.ts            [NEW]
src/app/api/cron/generate-blog/route.ts            [FIX or RETIRE — see §6]
vercel.json                                        [+ new cron schedules]
.gitignore                                         [+ data/seo/semrush/]
.env.example                                       [+ SEMRUSH_EMAIL, SEMRUSH_PASSWORD]
data/seo/semrush/                                  [NEW dir — gitignored]
docs/marketing/weekly/                             [Marketing keeps writing here]
docs/seo/weekly/                                   [NEW — SEO writes here]
docs/seo/recommendations/                          [NEW]
content/blog/posts/                                [SEO Director writes here in Phase 2]

# Obsidian vault (manual creates, not in repo)
PartyOn2/Programs/SEO-Director.md
PartyOn2/Memory/SEO/README.md
PartyOn2/Memory/SEO/Open-Questions.md
PartyOn2/Memory/SEO/Briefings/
PartyOn2/Memory/SEO/Recommendations/
PartyOn2/Memory/SEO/Decisions/
PartyOn2/Memory/SEO/Channel-Performance/
```

---

## 9. First-session checklist (drop-into-new-session steps)

1. Read this entire doc.
2. Read the 8 reference files in §4 (especially the Marketing Director vault doc — it's the template).
3. Confirm GSC, GA4, and Vercel admin endpoints work (these already exist; no new MCPs to wire). Make sure `SEMRUSH_EMAIL` and `SEMRUSH_PASSWORD` env vars exist or get added — the Cowork skill needs them.
4. Read `docs/seo-audit-2026-03-30.md` and re-check current indexation status (via the existing GSC pipe in `analytics-snapshot`).
5. **Write Phase 0 deliverables**: the `.claude/agents/seo-director.md` file + the Obsidian `Programs/SEO-Director.md` skeleton + the `Memory/SEO/README.md` (copy Marketing's, swap names).
6. **Open a PR** with just the Phase 0 scaffolding before writing any cron / model / UI code. Get operator review.
7. Once Phase 0 PR merges, scope Phase 1 in a follow-up PR — start with the snapshot cron + DB models, no UI yet.

---

## 10. Hard rules (apply throughout)

- **Never publish a blog post or commit content edits without operator approval until Phase 2 is explicitly approved.** Phase 1 is recommendations-only.
- **Never delete or rewrite an existing blog post** — append, don't rewrite (mirroring vault rule).
- **All decisions go through ADR** — `Memory/SEO/Decisions/S0001-...md` etc. Never write an ADR without operator approval.
- **27% margin floor doesn't apply here**, but the SEO Director should never recommend keyword targets that would lead to traffic with no commercial intent (e.g., generic Austin tourism queries).
- **TABC compliance** — any auto-generated content must not make medical claims about alcohol, must include responsible-drinking disclaimers where appropriate, must respect age-gating on the site.
- **No `any` type, files <500 lines, components <200 lines, functions <50 lines** (per project CLAUDE.md).
- **Use existing design system** for any admin UI (`.btn-primary`, `.card`, etc. — see project CLAUDE.md design system section).

---

## 11. Open questions for the operator (ask before building)

1. **SEMrush plan tier** — confirm which subscription tier (affects keyword/project quotas the Cowork skill should respect) and which projects/dashboards are already configured for `partyondelivery.com`.
2. **SEMrush 2FA status** — is 2FA enabled on the SEMrush account? If yes, the Cowork skill needs a one-time interactive setup to capture a long-lived session cookie; if no, simple email/password login works.
3. **Where do credentials live?** — Vercel env vars (for production crons), `.env.local` (for local dev), or a separate secret store? Confirm before the skill is built.
4. **GSC verification** — has GSC been re-verified since the March audit? (Check by looking at the latest `AnalyticsSnapshot` rows for non-null GSC fields.)
5. **Indexation status now** — has the 0/1289 indexation issue resolved since March? Re-check via the GSC data in `analytics-snapshot` and Google's `site:partyondelivery.com` query.
6. **Blog cadence target** — 1/week, 2/week, daily? Affects Phase 2 scope.
7. **Editorial voice constraints** — any topics off-limits? Any Austin neighborhoods we don't serve and shouldn't write content targeting?
8. **Image generation cost cap** — `automated-daily-blog.ts` uses a local `image-generator-tool`. Confirm the cost model and monthly cap.

---

## 12. Success metrics (set baselines in Phase 0, measure quarterly)

- **Indexation rate** — % of sitemap URLs in Google's index (baseline: ~0% in March 2026)
- **Total organic clicks/month** — from GSC
- **Keywords ranking in top 10 / top 3** — from the SEMrush Position Tracking dashboard (captured weekly via the Cowork skill)
- **Average position** for tracked keywords
- **Authority Score (SEMrush)** trend — captured weekly
- **Referring domains** — net new per month, from SEMrush Backlink Analytics
- **Internal-link graph density** — average inbound internal links per blog post
- **Revenue attributable to organic search** — join `Order.utmSource` + `Order.landingPage` against organic-landing-page set

---

That's everything a fresh session needs. Once they finish Phase 0, the agent will be invokable as `subagent_type: "seo-director"` and the Operations Director (which is being built in parallel in this conversation) will have a sibling to coordinate with.
