'use client';

/**
 * CustomerBehaviorPanel Component
 * Displays CTA performance and scroll funnel metrics
 */

import { ReactElement } from 'react';
import type { BehaviorMetrics, CTAPerformance } from '@/lib/analytics/types';

interface CustomerBehaviorPanelProps {
  metrics: BehaviorMetrics | null;
  loading?: boolean;
}

function MetricBox({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}): ReactElement {
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-center">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
      {subtext && (
        <div className="mt-0.5 text-xs text-gray-400">{subtext}</div>
      )}
    </div>
  );
}

function CTAPerformanceBar({
  cta,
  maxClicks,
}: {
  cta: CTAPerformance;
  maxClicks: number;
}): ReactElement {
  const percentage = maxClicks > 0 ? (cta.clicks / maxClicks) * 100 : 0;

  const sectionLabels: Record<string, string> = {
    hero: 'Hero',
    choose_path: 'Choose Path',
    services: 'Services',
    footer_cta: 'Footer',
    navigation: 'Navigation',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 truncate text-sm text-gray-600">
        {sectionLabels[cta.section] || cta.section}
      </div>
      <div className="flex-1">
        <div className="h-4 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="w-12 text-right text-sm font-medium text-gray-700">
        {cta.clickRate.toFixed(1)}%
      </div>
    </div>
  );
}

function ScrollFunnelBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}): ReactElement {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-10 text-xs font-medium text-gray-500">{label}</div>
      <div className="flex-1">
        <div className="h-3 overflow-hidden rounded bg-gray-100">
          <div
            className="h-full rounded bg-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="w-12 text-right text-xs text-gray-600">
        {Math.round(percentage)}%
      </div>
    </div>
  );
}

function TopCTAsList({ ctas }: { ctas: CTAPerformance[] }): ReactElement {
  return (
    <div className="space-y-2">
      {ctas.slice(0, 5).map((cta, index) => (
        <div key={`${cta.buttonText}-${cta.section}`} className="flex items-start gap-2 text-sm">
          <span className="font-medium text-gray-400">{index + 1}.</span>
          <div className="flex-1">
            <span className="font-medium text-gray-700">
              &quot;{cta.buttonText}&quot;
            </span>
            <span className="ml-1 text-gray-400">({cta.section})</span>
          </div>
          <div className="text-right">
            <div className="font-medium text-gray-700">{cta.clicks} clicks</div>
            <div className="text-xs text-gray-400">{cta.clickRate.toFixed(1)}% rate</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton(): ReactElement {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default function CustomerBehaviorPanel({
  metrics,
  loading = false,
}: CustomerBehaviorPanelProps): ReactElement {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!metrics) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Customer Behavior</h2>
        <p className="mt-2 text-sm text-gray-500">
          GA4 custom events not configured. Add tracking to see behavior metrics.
        </p>
      </div>
    );
  }

  const maxClicks = Math.max(...metrics.ctaPerformance.map((c) => c.clicks), 1);

  // Group CTAs by section for the bar chart
  const sectionStats: Record<string, { clicks: number; rate: number }> = {};
  for (const cta of metrics.ctaPerformance) {
    if (!sectionStats[cta.section]) {
      sectionStats[cta.section] = { clicks: 0, rate: 0 };
    }
    sectionStats[cta.section].clicks += cta.clicks;
    sectionStats[cta.section].rate = Math.max(
      sectionStats[cta.section].rate,
      cta.clickRate
    );
  }

  const sectionCTAs = Object.entries(sectionStats)
    .map(([section, stats]) => ({
      buttonText: section,
      buttonUrl: '/',
      section: section as CTAPerformance['section'],
      clicks: stats.clicks,
      clickRate: stats.rate,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Customer Behavior</h2>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          title="Learn about behavior metrics"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-4">
        <MetricBox
          label="Total CTA Clicks"
          value={metrics.totalCTAClicks.toLocaleString()}
        />
        <MetricBox
          label="Avg Click Rate"
          value={`${metrics.overallClickRate.toFixed(1)}%`}
        />
        <MetricBox
          label="Scroll Completion"
          value={`${Math.round(
            (metrics.scrollFunnel.depth100 / metrics.scrollFunnel.totalUsers) * 100
          )}%`}
        />
        <MetricBox
          label="Time to 1st Click"
          value={`${metrics.avgTimeToFirstClick.toFixed(1)}s`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CTA Performance by Section */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            CTA Performance by Section
          </h3>
          <div className="space-y-2">
            {sectionCTAs.map((cta) => (
              <CTAPerformanceBar
                key={cta.section}
                cta={cta}
                maxClicks={maxClicks}
              />
            ))}
          </div>
        </div>

        {/* Scroll Funnel */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Scroll Funnel</h3>
          <div className="space-y-2">
            <ScrollFunnelBar
              label="25%"
              value={metrics.scrollFunnel.depth25}
              total={metrics.scrollFunnel.totalUsers}
            />
            <ScrollFunnelBar
              label="50%"
              value={metrics.scrollFunnel.depth50}
              total={metrics.scrollFunnel.totalUsers}
            />
            <ScrollFunnelBar
              label="75%"
              value={metrics.scrollFunnel.depth75}
              total={metrics.scrollFunnel.totalUsers}
            />
            <ScrollFunnelBar
              label="100%"
              value={metrics.scrollFunnel.depth100}
              total={metrics.scrollFunnel.totalUsers}
            />
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Dropoff: {metrics.scrollFunnel.dropoff25to50}% at 25-50%,{' '}
            {metrics.scrollFunnel.dropoff50to75}% at 50-75%
          </div>
        </div>
      </div>

      {/* Top Performing CTAs */}
      <div className="mt-6 border-t pt-4">
        <h3 className="mb-3 text-sm font-medium text-gray-700">
          Top Performing CTAs
        </h3>
        <TopCTAsList ctas={metrics.ctaPerformance} />
      </div>
    </div>
  );
}
