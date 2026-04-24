/**
 * Nightly analytics snapshot cron.
 *
 * Pulls from GA4, Vercel Analytics, GBP, and internal DB, upserts a row on
 * AnalyticsSnapshot for today's date, and regenerates docs/WEBSITE-ANALYTICS.md.
 *
 * Auth: Bearer CRON_SECRET (matches pattern of generate-blog / affiliate-commissions).
 *
 * SEMrush is intentionally skipped in Phase 1 — no API key available. Add when
 * SEMRUSH_API_KEY becomes available.
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/database/client';
import {
  getTrafficMetrics,
  getTrafficSources,
  getTopPages,
  getRevenueByChannel,
  getConversionByLandingPage,
  getCheckoutFunnel,
} from '@/lib/analytics/google-analytics';
import { getTopKeywords, getSEOMetrics } from '@/lib/analytics/search-console';
import { getWebVitals, getVercelTopPages } from '@/lib/analytics/vercel-analytics';
import { syncGbpReviews, getGbpInsights, getSegmentSentiment } from '@/lib/analytics/gbp';
import {
  getChannelRollup,
  getLandingPageRollup,
  getProductMargins,
} from '@/lib/analytics/internal-rollups';
import { getPageEngagement } from '@/lib/analytics/variant-rollup';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const endDate = new Date();
  const start7 = new Date();
  start7.setDate(start7.getDate() - 7);
  const start30 = new Date();
  start30.setDate(start30.getDate() - 30);

  const errors: string[] = [];
  const safe = async <T>(label: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (err) {
      console.error(`[analytics-snapshot] ${label} failed:`, err);
      errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  };

  // Parallel pulls across sources
  const [
    traffic,
    trafficSources,
    topPages,
    revenueByChannel,
    conversionByPage,
    funnel,
    seoMetrics,
    topKeywords,
    webVitals,
    vercelTopPages,
    channels,
    landingRollup,
    productMargins,
  ] = await Promise.all([
    safe('ga4.traffic', () => getTrafficMetrics(start30, endDate)),
    safe('ga4.sources', () => getTrafficSources(start30, endDate)),
    safe('ga4.top-pages', () => getTopPages(start30, endDate, 20)),
    safe('ga4.revenue-by-channel', () => getRevenueByChannel(start30, endDate)),
    safe('ga4.conversion-by-page', () => getConversionByLandingPage(start30, endDate)),
    safe('ga4.funnel', () => getCheckoutFunnel(start30, endDate)),
    safe('gsc.seo', () => getSEOMetrics(start30, endDate)),
    safe('gsc.keywords', () => getTopKeywords(start30, endDate, 50)),
    safe('vercel.web-vitals', () => getWebVitals(start7, endDate)),
    safe('vercel.top-pages', () => getVercelTopPages(start30, endDate)),
    safe('internal.channels', () => getChannelRollup(30)),
    safe('internal.landing-pages', () => getLandingPageRollup(30)),
    safe('internal.product-margins', () => getProductMargins(30)),
  ]);

  const pageEngagement = await safe('internal.page-engagement', () => getPageEngagement(30));

  // GBP sync (writes to GbpReview table) + insights
  await safe('gbp.sync', () => syncGbpReviews());
  const gbpInsights = await safe('gbp.insights', () => getGbpInsights(30));
  const gbpSegments = await safe('gbp.segments', () => getSegmentSentiment(90));

  // Upsert snapshot
  const snapshot = await prisma.analyticsSnapshot.upsert({
    where: { date: today },
    update: {
      sessions: traffic?.sessions ?? 0,
      users: traffic?.users ?? 0,
      pageviews: traffic?.pageviews ?? 0,
      bounceRate: traffic?.bounceRate != null ? traffic.bounceRate : null,
      avgSessionDuration: traffic?.avgSessionDuration != null ? traffic.avgSessionDuration : null,
      impressions: seoMetrics?.impressions ?? 0,
      clicks: seoMetrics?.clicks ?? 0,
      ctr: seoMetrics?.ctr != null ? seoMetrics.ctr : null,
      avgPosition: seoMetrics?.avgPosition != null ? seoMetrics.avgPosition : null,
      topPages: (topPages ?? []) as unknown as object,
      topKeywords: (topKeywords ?? []) as unknown as object,
      topReferrers: (trafficSources ?? []) as unknown as object,
      vercelData: { webVitals, topPages: vercelTopPages } as unknown as object,
      gbpData: { insights: gbpInsights, segments: gbpSegments } as unknown as object,
      marginData: { channels, productMargins } as unknown as object,
      segmentData: {
        landingPages: landingRollup,
        revenueByChannel,
        conversionByPage,
        funnel,
        pageEngagement,
      } as unknown as object,
    },
    create: {
      date: today,
      sessions: traffic?.sessions ?? 0,
      users: traffic?.users ?? 0,
      pageviews: traffic?.pageviews ?? 0,
      bounceRate: traffic?.bounceRate != null ? traffic.bounceRate : null,
      avgSessionDuration: traffic?.avgSessionDuration != null ? traffic.avgSessionDuration : null,
      impressions: seoMetrics?.impressions ?? 0,
      clicks: seoMetrics?.clicks ?? 0,
      ctr: seoMetrics?.ctr != null ? seoMetrics.ctr : null,
      avgPosition: seoMetrics?.avgPosition != null ? seoMetrics.avgPosition : null,
      topPages: (topPages ?? []) as unknown as object,
      topKeywords: (topKeywords ?? []) as unknown as object,
      topReferrers: (trafficSources ?? []) as unknown as object,
      vercelData: { webVitals, topPages: vercelTopPages } as unknown as object,
      gbpData: { insights: gbpInsights, segments: gbpSegments } as unknown as object,
      marginData: { channels, productMargins } as unknown as object,
      segmentData: {
        landingPages: landingRollup,
        revenueByChannel,
        conversionByPage,
        funnel,
        pageEngagement,
      } as unknown as object,
    },
  });

  // Regenerate human-readable markdown summary
  try {
    const md = renderMarkdown({
      date: today,
      traffic,
      channels: channels ?? [],
      landingRollup: landingRollup ?? [],
      revenueByChannel: revenueByChannel ?? [],
      conversionByPage: conversionByPage ?? [],
      funnel: funnel ?? [],
      productMargins: productMargins ?? [],
      gbpInsights,
      gbpSegments: gbpSegments ?? [],
      webVitals,
      topKeywords: topKeywords ?? [],
      pageEngagement: pageEngagement ?? [],
      errors,
    });
    const docsDir = path.join(process.cwd(), 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, 'WEBSITE-ANALYTICS.md'), md);
  } catch (err) {
    console.error('[analytics-snapshot] markdown write failed:', err);
    errors.push(`markdown: ${err instanceof Error ? err.message : String(err)}`);
  }

  return NextResponse.json({
    ok: true,
    snapshotId: snapshot.id,
    errors: errors.length ? errors : undefined,
  });
}

function renderMarkdown(s: {
  date: Date;
  traffic: { sessions: number; users: number; pageviews: number } | null;
  channels: Array<{ channel: string; orders: number; revenue: number; margin: number | null; averageOrderValue: number; averageMarginPct: number | null }>;
  landingRollup: Array<{ landingPage: string; orders: number; revenue: number; averageOrderValue: number }>;
  revenueByChannel: Array<{ channel: string; sessions: number; transactions: number; revenue: number; conversionRate: number }>;
  conversionByPage: Array<{ path: string; sessions: number; transactions: number; conversionRate: number }>;
  funnel: Array<{ eventName: string; users: number; dropOffFromPrevious: number | null }>;
  productMargins: Array<{ title: string; unitsSold: number; revenue: number; margin: number; marginPct: number }>;
  gbpInsights: { reviewCount: number; averageRating: number; fiveStarPct: number; oneStarPct: number } | null;
  gbpSegments: Array<{ segment: string; count: number; averageRating: number }>;
  webVitals: { lcp: number | null; inp: number | null; cls: number | null } | null;
  topKeywords: Array<{ keyword: string; clicks: number; impressions: number; position: number }>;
  pageEngagement: Array<{ path: string; sessions: number; pageviews: number; bounceRate: number; avgScrollDepth: number; ctaClicks: number; ctaClickRate: number }>;
  errors: string[];
}): string {
  const lines: string[] = [];
  lines.push(`# Website Analytics Snapshot`);
  lines.push('');
  lines.push(`_Generated: ${s.date.toISOString().split('T')[0]} — regenerated nightly by \`/api/cron/analytics-snapshot\`_`);
  lines.push('');

  if (s.errors.length) {
    lines.push(`> ⚠️ Partial pull: ${s.errors.length} source(s) failed. Check cron logs.`);
    lines.push('');
  }

  lines.push('## Traffic (last 30 days)');
  if (s.traffic) {
    lines.push(`- Sessions: **${s.traffic.sessions.toLocaleString()}**  •  Users: **${s.traffic.users.toLocaleString()}**  •  Pageviews: **${s.traffic.pageviews.toLocaleString()}**`);
  } else {
    lines.push('- _GA4 data unavailable_');
  }
  lines.push('');

  lines.push('## Revenue by internal channel (30d)');
  if (s.channels.length) {
    lines.push('| Channel | Orders | Revenue | AOV | Margin % |');
    lines.push('|---|---:|---:|---:|---:|');
    for (const c of s.channels) {
      lines.push(`| ${c.channel} | ${c.orders} | $${c.revenue.toLocaleString()} | $${c.averageOrderValue} | ${c.averageMarginPct ?? '—'}% |`);
    }
  } else {
    lines.push('_no orders_');
  }
  lines.push('');

  lines.push('## Landing page → orders (30d, our DB)');
  if (s.landingRollup.length) {
    lines.push('| Landing page | Orders | Revenue | AOV |');
    lines.push('|---|---:|---:|---:|');
    for (const r of s.landingRollup.slice(0, 15)) {
      lines.push(`| ${r.landingPage} | ${r.orders} | $${r.revenue.toLocaleString()} | $${r.averageOrderValue} |`);
    }
  } else {
    lines.push('_no attribution data yet — new orders will populate this_');
  }
  lines.push('');

  lines.push('## GA4 revenue by channel (30d)');
  if (s.revenueByChannel.length) {
    lines.push('| Channel | Sessions | Transactions | Revenue | Conv rate |');
    lines.push('|---|---:|---:|---:|---:|');
    for (const r of s.revenueByChannel) {
      lines.push(`| ${r.channel} | ${r.sessions} | ${r.transactions} | $${r.revenue.toLocaleString()} | ${(r.conversionRate * 100).toFixed(2)}% |`);
    }
  } else {
    lines.push('_GA4 data unavailable_');
  }
  lines.push('');

  lines.push('## Conversion by landing page (GA4, 30d)');
  if (s.conversionByPage.length) {
    lines.push('| Path | Sessions | Transactions | Conv rate |');
    lines.push('|---|---:|---:|---:|');
    for (const r of s.conversionByPage.slice(0, 15)) {
      lines.push(`| ${r.path} | ${r.sessions} | ${r.transactions} | ${(r.conversionRate * 100).toFixed(2)}% |`);
    }
  }
  lines.push('');

  lines.push('## Checkout funnel (30d)');
  if (s.funnel.length) {
    lines.push('| Step | Users | Drop-off |');
    lines.push('|---|---:|---:|');
    for (const f of s.funnel) {
      lines.push(`| ${f.eventName} | ${f.users} | ${f.dropOffFromPrevious == null ? '—' : (f.dropOffFromPrevious * 100).toFixed(1) + '%'} |`);
    }
  }
  lines.push('');

  lines.push('## Top product margins (30d)');
  if (s.productMargins.length) {
    lines.push('| Product | Units | Revenue | Margin | Margin % |');
    lines.push('|---|---:|---:|---:|---:|');
    for (const p of s.productMargins.slice(0, 15)) {
      lines.push(`| ${p.title} | ${p.unitsSold} | $${p.revenue.toLocaleString()} | $${p.margin.toLocaleString()} | ${p.marginPct}% |`);
    }
  }
  lines.push('');

  lines.push('## Google Business Profile (30d)');
  if (s.gbpInsights) {
    lines.push(`- Reviews: **${s.gbpInsights.reviewCount}**  •  Avg rating: **${s.gbpInsights.averageRating}**  •  5-star: ${s.gbpInsights.fiveStarPct}%  •  1-star: ${s.gbpInsights.oneStarPct}%`);
  } else {
    lines.push('_GBP not configured — set GBP_* env vars_');
  }
  if (s.gbpSegments.length) {
    lines.push('');
    lines.push('Segment sentiment (90d):');
    lines.push('| Segment | Reviews | Avg rating |');
    lines.push('|---|---:|---:|');
    for (const seg of s.gbpSegments) {
      lines.push(`| ${seg.segment} | ${seg.count} | ${seg.averageRating} |`);
    }
  }
  lines.push('');

  lines.push('## Web Vitals (7d)');
  if (s.webVitals) {
    lines.push(`- LCP: ${s.webVitals.lcp ?? '—'}ms  •  INP: ${s.webVitals.inp ?? '—'}ms  •  CLS: ${s.webVitals.cls ?? '—'}`);
  } else {
    lines.push('_Vercel Analytics not configured — set VERCEL_ANALYTICS_TOKEN_');
  }
  lines.push('');

  lines.push('## Per-page engagement (our tracker, 30d)');
  if (s.pageEngagement.length) {
    lines.push('| Path | Sessions | Pageviews | Bounce | Avg scroll | CTA clicks | CTA rate |');
    lines.push('|---|---:|---:|---:|---:|---:|---:|');
    for (const p of s.pageEngagement.slice(0, 20)) {
      lines.push(`| ${p.path} | ${p.sessions} | ${p.pageviews} | ${(p.bounceRate * 100).toFixed(0)}% | ${p.avgScrollDepth}% | ${p.ctaClicks} | ${(p.ctaClickRate * 100).toFixed(1)}% |`);
    }
  } else {
    lines.push('_no first-party event data yet — will populate after first session_');
  }
  lines.push('');

  lines.push('## Top search queries (GSC, 30d)');
  if (s.topKeywords.length) {
    lines.push('| Query | Clicks | Impressions | Avg position |');
    lines.push('|---|---:|---:|---:|');
    for (const k of s.topKeywords.slice(0, 20)) {
      lines.push(`| ${k.keyword} | ${k.clicks} | ${k.impressions} | ${k.position.toFixed(1)} |`);
    }
  }
  lines.push('');

  return lines.join('\n');
}
