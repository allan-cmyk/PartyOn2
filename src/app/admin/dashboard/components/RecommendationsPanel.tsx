'use client';

/**
 * RecommendationsPanel Component
 * Displays AI-powered recommendations based on analytics data
 */

import { ReactElement } from 'react';
import Link from 'next/link';
import type { Recommendation, RecommendationPriority } from '@/lib/analytics/types';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  loading?: boolean;
}

function PriorityBadge({ priority }: { priority: RecommendationPriority }): ReactElement {
  const styles: Record<RecommendationPriority, { bg: string; text: string; icon: string }> = {
    high: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
    low: { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' },
  };

  const style = styles[priority];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.icon} {priority.toUpperCase()}
    </span>
  );
}

function CategoryIcon({ category }: { category: string }): ReactElement {
  const icons: Record<string, string> = {
    cta: '🎯',
    engagement: '📊',
    conversion: '💰',
    test: '🧪',
    content: '📝',
  };

  return <span className="text-lg">{icons[category] || '💡'}</span>;
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}): ReactElement {
  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <CategoryIcon category={recommendation.category} />
          <h3 className="font-semibold text-gray-900">{recommendation.title}</h3>
        </div>
        <PriorityBadge priority={recommendation.priority} />
      </div>

      <p className="mb-3 text-sm text-gray-600">{recommendation.description}</p>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div>
          <span className="text-gray-500">{recommendation.metric}:</span>{' '}
          <span className="font-medium text-gray-700">
            {recommendation.currentValue}
          </span>
          {recommendation.targetValue && (
            <>
              {' '}
              <span className="text-gray-400">→</span>{' '}
              <span className="font-medium text-green-600">
                {recommendation.targetValue}
              </span>
            </>
          )}
        </div>

        {recommendation.estimatedImpact && (
          <div className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
            Impact: {recommendation.estimatedImpact}
          </div>
        )}
      </div>

      {recommendation.actionUrl && (
        <Link
          href={recommendation.actionUrl}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          Take Action →
        </Link>
      )}
    </div>
  );
}

function GroupedRecommendations({
  recommendations,
  priority,
}: {
  recommendations: Recommendation[];
  priority: RecommendationPriority;
}): ReactElement | null {
  const filtered = recommendations.filter((r) => r.priority === priority);
  if (filtered.length === 0) return null;

  const labels: Record<RecommendationPriority, string> = {
    high: 'HIGH PRIORITY',
    medium: 'MEDIUM PRIORITY',
    low: 'LOW PRIORITY',
  };

  const borderColors: Record<RecommendationPriority, string> = {
    high: 'border-l-red-400',
    medium: 'border-l-yellow-400',
    low: 'border-l-green-400',
  };

  return (
    <div className={`border-l-4 pl-4 ${borderColors[priority]}`}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {labels[priority]}
      </h3>
      <div className="space-y-3">
        {filtered.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton(): ReactElement {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default function RecommendationsPanel({
  recommendations,
  loading = false,
}: RecommendationsPanelProps): ReactElement {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-green-100 p-2">
            <svg
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mb-1 font-medium text-gray-900">All Clear!</h3>
          <p className="text-sm text-gray-500">
            No urgent recommendations at this time. Keep monitoring your metrics.
          </p>
        </div>
      </div>
    );
  }

  const highCount = recommendations.filter((r) => r.priority === 'high').length;
  const mediumCount = recommendations.filter((r) => r.priority === 'medium').length;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h2 className="text-lg font-semibold text-gray-900">AI Recommendations</h2>
        </div>
        <div className="flex gap-2 text-xs">
          {highCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
              {highCount} urgent
            </span>
          )}
          {mediumCount > 0 && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-yellow-700">
              {mediumCount} suggested
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <GroupedRecommendations recommendations={recommendations} priority="high" />
        <GroupedRecommendations recommendations={recommendations} priority="medium" />
        <GroupedRecommendations recommendations={recommendations} priority="low" />
      </div>
    </div>
  );
}
