---
title: "PREMIER: 86% of group dashboards never convert — diagnose the activation funnel"
period_proposed: 2026-W19
date_proposed: 2026-05-05
date_accepted: 2026-05-05
date_executed: null
date_measured: null
status: accepted
risk_tier: recommend
effort: M
impact_dollars_monthly: null
segment: boat
source: director
related_briefing: 2026-W19
db_id: 4fe8e34e-83cb-4ee7-9576-4a60386400dc
tags: [recommendation]
---

# PREMIER: 86% of group dashboards never convert — diagnose the activation funnel

## What

The PREMIER attribution audit (closing the P1 concern in marketing ADR M0001) ruled out missing revenue — every sub-order under a PREMIER group dashboard correctly carries affiliateId. But the audit surfaced a much bigger problem in the data: of 415 PREMIER group dashboards created in the last 90 days, only 59 produced any paid order — a 14% activation rate. At the tab level, 820 tabs → 81 paid orders (9.9%).

This is not an attribution bug; it's a conversion bug. The 86% of dashboards that go cold are the highest-leverage area we have on PREMIER right now — they're already past the hardest step (a confirmed boat booking that triggered the dashboard creation webhook).

Likely culprits to investigate, in order of suspicion:
1. Claim-link delivery (GHL handoff at src/app/api/webhooks/create-dashboard/route.ts:136). Are the boater-facing texts/emails actually being sent and clicked? Pull GHL delivery + click metrics for the 356 cold dashboards.
2. Tab UX in the dashboard. Multi-tab group orders may be confusing if the boater doesn't realize they're supposed to share the link with their party. Check session recordings or analytics for solo-visit-then-bounce.
3. Booking-to-dashboard timing. When does the dashboard get created relative to the boat trip date? If it's days vs. minutes before, the urgency profile is very different.

Action: Allan to pull GHL message-delivery and link-click metrics for the 356 non-converting PREMIER dashboards (90-day window). If delivery is the bottleneck, fix the GHL flow. If delivery is fine but clicks are low, A/B the message copy. If clicks are fine but checkout isn't, instrument the dashboard funnel.

Why now: PREMIER drove $15K of attributed revenue at 14% activation. Even moving to 25% activation would add roughly $11K/month. This is the highest-impact narrative finding from the W19 audit cycle and isn't covered by any open rec or heuristic.

## Updates

- 2026-05-05 — Created with status `accepted` from source `director`.
- 2026-05-06 — Status open → approved (operator).

---
_Mirror file. Edited automatically by the triage queue when status changes. Source of truth is the database (id: `4fe8e34e-83cb-4ee7-9576-4a60386400dc`). Slug: `premier-86-of-group-dashboards-never-convert-diagnose-the-ac`._
