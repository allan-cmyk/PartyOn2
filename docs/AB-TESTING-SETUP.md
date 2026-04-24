# A/B Testing & Analytics Setup Guide

You now have three complementary analytics sources feeding the Marketing Director:

| Source | What it's good for | Where data lives |
|---|---|---|
| **First-party `AnalyticsEvent`** (our DB) | A/B test significance, per-page bounce/CTA rates, anything that has to join to orders | Neon Postgres |
| **GA4** | All-browser sessions, acquisition, channel revenue, funnel drop-off | Google |
| **Microsoft Clarity** | Heatmaps, scroll maps, rage/dead clicks, session replay | Clarity dashboard |

Events fired from the site now **double-write** — they go to GA4/Vercel (for those dashboards) AND to `AnalyticsEvent` (so we own a sample-free copy).

---

## 1. Microsoft Clarity (5 min, free, unlimited)

1. Go to **https://clarity.microsoft.com** and sign in with your Microsoft account (free to create)
2. **New project** → name it "Party On Delivery" → site URL `https://partyondelivery.com`
3. On the setup screen, find your **Project ID** — it's the 10-character code in their install snippet (e.g., `abcdef1234`). You can also find it in **Settings → Setup**.
4. Add to Vercel env vars (Project Settings → Environment Variables):
   ```
   NEXT_PUBLIC_CLARITY_PROJECT_ID=your_10_char_id
   ```
5. Also add it to your local `.env.local` for dev
6. Redeploy. The script loads automatically in production.

Dashboards to check once data starts rolling in (~1-2 hours):
- **Recordings** → watch actual sessions
- **Heatmaps** → per-page click/scroll/area maps
- **Insights** → rage clicks, dead clicks, excessive scrolling flags

---

## 2. GA4 Custom Dimensions (15 min, one-time admin)

Your site fires `experiment_id` and `variant_id` as event parameters on every A/B-tested event — but GA4 won't let you filter/group by them until you **register them as custom dimensions**.

1. Go to **https://analytics.google.com** → your POD property → **Admin** (bottom left gear)
2. **Custom definitions → Create custom dimension**
3. Create these three:

| Dimension name | Scope | Event parameter |
|---|---|---|
| Experiment ID | Event | `experiment_id` |
| Variant ID | Event | `variant_id` |
| Section | Event | `section` |

4. Save each. Data starts populating within ~24 hours.

After that, in Explore reports you can:
- Filter any report by `experiment_id` / `variant_id`
- Build variant-level conversion funnels
- The Data API can now return these fields (Marketing Director will be able to query them)

---

## 3. First-party `AnalyticsEvent` — already live, no setup

The API endpoint `/api/v1/events/track` is live. Every call to `trackEvent(...)` in the app now mirrors to this table.

**Table schema:**
- `name` — event type (`page_view`, `cta_click`, `scroll_depth`, `section_view`, `experiment_exposure`, `experiment_conversion`, etc.)
- `sessionId` / `visitorId` — anonymous identifiers
- `path` / `fullUrl` / `referrer` — page context
- `utmSource` / `utmMedium` / `utmCampaign` — from first-touch attribution
- `experimentId` / `variantId` — populated on experiment events
- `properties` — free-form JSON per event (e.g., `{ button_text, section }`)

**Querying:**

```bash
# Per-variant rollup with significance (replaces ExperimentVariant aggregate counts)
curl -H "Cookie: $OPS_COOKIE" \
  'https://partyondelivery.com/api/admin/analytics/experiments?metric=rollup&experimentId=<id>&days=30'

# Active experiments at a glance
curl -H "Cookie: $OPS_COOKIE" \
  'https://partyondelivery.com/api/admin/analytics/experiments?metric=list&days=30'

# Per-page bounce rate + CTA click rate
curl -H "Cookie: $OPS_COOKIE" \
  'https://partyondelivery.com/api/admin/analytics/experiments?metric=pages&days=30'
```

---

## 4. Running an A/B test — full workflow

1. **Create an `Experiment` row** in Prisma admin with `status: RUNNING` and 2+ `ExperimentVariant` rows (one marked `isControl`)
2. In your page component, randomly assign visitors to a variant and call:
   ```ts
   import { trackHeroVariant } from '@/lib/analytics/ga4-events';
   trackHeroVariant(experimentId, variantId, 'hero');
   ```
3. On conversion (checkout page, form submit, etc.), call:
   ```ts
   import { trackExperimentConversion } from '@/lib/analytics/ga4-events';
   trackExperimentConversion(experimentId, variantId, 'purchase', orderTotal);
   ```
4. After 1-2 weeks of traffic, query the rollup endpoint. The `SignificanceResult` tells you: winner, p-value, confidence, lift %.
5. Marketing Director agent can also pull this and recommend whether to ship the winner.

---

## 5. What the Marketing Director sees now

After the nightly snapshot cron runs next, `docs/WEBSITE-ANALYTICS.md` will include per-page bounce rate and CTA click rate from our own data — much more granular than the GA4-only version. The agent can answer "which landing page has the worst bounce rate" or "which experiments have enough data to call."

## Rotate that Vercel token

Also — since Vercel Analytics turned out to have no usable API, go to **https://vercel.com/account/tokens** and **delete** the access token you shared earlier. We don't need it, and it's in the chat transcript.
