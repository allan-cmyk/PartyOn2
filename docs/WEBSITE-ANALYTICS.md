# Website Analytics Snapshot

_This file is **regenerated nightly** by `/api/cron/analytics-snapshot` (cron: `0 7 * * *` UTC). Do not hand-edit — changes will be overwritten._

## How to use

- The Marketing Director subagent (`.claude/agents/marketing-director.md`) reads this file on every invocation.
- Tables below are pulled from GA4, Google Search Console, Vercel Analytics, Google Business Profile, and our internal orders DB.
- The full structured snapshot lives on `AnalyticsSnapshot` (Prisma) — `marginData`, `vercelData`, `gbpData`, `segmentData` JSON columns.

## Manually regenerate

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://partyondelivery.com/api/cron/analytics-snapshot
```

## Known gaps (Phase 1)

- **SEMrush**: not connected. No API key — keyword competitive data is unavailable until `SEMRUSH_API_KEY` is set.
- **Vercel Web Analytics**: `VERCEL_ANALYTICS_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID` must be set for Web Vitals + top pages.
- **Google Business Profile**: `GOOGLE_MAPS_API_KEY` + `GOOGLE_PLACE_ID` must be set — uses Places API (New), returns up to the 5 most recent reviews.
- Historical orders (pre-2026-04) have `null` margin — run `npx tsx scripts/backfill-order-margins.ts` to backfill using current COGS.

---

_First snapshot will populate here after the first cron run._
