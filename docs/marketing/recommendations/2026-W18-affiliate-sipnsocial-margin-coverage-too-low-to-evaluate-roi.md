---
title: "Affiliate SIPNSOCIAL: margin coverage too low to evaluate ROI"
period_proposed: 2026-W18
date_proposed: 2026-04-27
date_accepted: null
date_executed: null
date_measured: null
status: dismissed
risk_tier: recommend
effort: M
impact_dollars_monthly: null
segment: all
source: snapshot-heuristic
related_briefing: 2026-W18
db_id: 3bab6c5d-06ba-456e-a7f6-142a5009e76f
tags: [recommendation]
---

# Affiliate SIPNSOCIAL: margin coverage too low to evaluate ROI

## What

Sip & Social On Wheels (code SIPNSOCIAL) drove 2 orders and $2,622.04 revenue, but only 0% of that revenue has cost data — ROI calculation is unreliable. Action: process more distributor invoices via Receive Shipment, then re-evaluate.

## Notes

Dismissed per marketing ADR M0001 (Do not pause affiliates based on current ROI heuristic — revenue under-attributed). Three attribution leaks identified: (1) /partners/<code> pages don't set ref_code cookie, (2) 30-day cookie-only attribution misses repeat-customer LTV, (3) group-dashboard sub-orders may not all carry affiliateId. Re-evaluate after P0 middleware fix ships, PREMIER sub-order audit closes, and margin coverage ≥70%.

## Updates

- 2026-04-27 — Created with status `dismissed` from source `auto-snapshot`.
- 2026-05-05 — Status open → rejected (operator). Notes: Dismissed per marketing ADR M0001 (Do not pause affiliates based on current ROI heuristic — revenue under-attributed). Three attribution leaks identified: (1) /partners/<code> pages don't set ref_code cookie, (2) 30-day cookie-only attribution misses repeat-customer LTV, (3) group-dashboard sub-orders may not all carry affiliateId. Re-evaluate after P0 middleware fix ships, PREMIER sub-order audit closes, and margin coverage ≥70%.

---
_Mirror file. Edited automatically by the triage queue when status changes. Source of truth is the database (id: `3bab6c5d-06ba-456e-a7f6-142a5009e76f`). Slug: `affiliate-sipnsocial-margin-coverage-too-low-to-evaluate-roi`._
