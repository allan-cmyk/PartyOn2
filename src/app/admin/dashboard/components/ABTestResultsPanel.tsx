'use client';

/**
 * ABTestResultsPanel Component
 * Displays A/B test experiment results with variant comparisons
 */

import { ReactElement } from 'react';
import Link from 'next/link';
import type { ABTestResults, ExperimentResult, ExperimentVariant } from '@/lib/analytics/types';

interface ABTestResultsPanelProps {
  results: ABTestResults | null;
  loading?: boolean;
}

function StatusBadge({ status }: { status: string }): ReactElement {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
  };

  const icons: Record<string, string> = {
    active: '🟢',
    paused: '🟡',
    completed: '✅',
    draft: '⚪',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] || styles.draft
      }`}
    >
      {icons[status]} {status.toUpperCase()}
    </span>
  );
}

function ConfidenceBar({ confidence }: { confidence: number }): ReactElement {
  const isSignificant = confidence >= 95;
  const isApproaching = confidence >= 80;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Confidence: {confidence}%</span>
        <span className="text-gray-400">
          {isSignificant ? '✓ Significant' : isApproaching ? 'Approaching 95%' : 'Need 95%'}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isSignificant
              ? 'bg-green-500'
              : isApproaching
              ? 'bg-yellow-500'
              : 'bg-gray-300'
          }`}
          style={{ width: `${Math.min(confidence, 100)}%` }}
        />
      </div>
    </div>
  );
}

function VariantCard({
  variant,
  isWinner,
  isControl,
}: {
  variant: ExperimentVariant;
  isWinner: boolean;
  isControl: boolean;
}): ReactElement {
  return (
    <div
      className={`rounded-lg border p-3 ${
        isWinner
          ? 'border-amber-300 bg-amber-50'
          : isControl
          ? 'border-gray-200 bg-gray-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-gray-900">
          {variant.name}
          {isWinner && <span className="ml-1">⭐</span>}
        </span>
        {isControl && (
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
            Control
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-gray-500">Impressions</div>
          <div className="font-medium">{variant.impressions.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Clicks</div>
          <div className="font-medium">{variant.clicks.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Click Rate</div>
          <div className="font-medium">{variant.clickRate.toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-gray-500">Conv. Rate</div>
          <div className="font-medium">{variant.conversionRate.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
}

function ExperimentCard({ experiment }: { experiment: ExperimentResult }): ReactElement {
  const controlVariant = experiment.variants.find((v) => v.isControl);
  const testVariants = experiment.variants.filter((v) => !v.isControl);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
          <div className="mt-1 text-xs text-gray-500">
            {experiment.page} · {experiment.elementId}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={experiment.status} />
          {experiment.status === 'active' && (
            <span className="text-xs text-gray-500">
              Day {experiment.daysRunning}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-2">
        {controlVariant && (
          <VariantCard
            variant={controlVariant}
            isWinner={experiment.winner === controlVariant.id}
            isControl={true}
          />
        )}
        {testVariants.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            isWinner={experiment.winner === variant.id}
            isControl={false}
          />
        ))}
      </div>

      {experiment.uplift !== 0 && (
        <div className="mb-2 text-center">
          <span
            className={`text-lg font-bold ${
              experiment.uplift > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {experiment.uplift > 0 ? '+' : ''}
            {experiment.uplift}% ↑
          </span>
          <span className="ml-2 text-sm text-gray-500">vs control</span>
        </div>
      )}

      <ConfidenceBar confidence={experiment.confidence} />

      <div className="mt-3 flex items-center gap-2 rounded bg-gray-50 p-2 text-sm">
        <span className="text-gray-500">📊</span>
        <span className="text-gray-600">{experiment.recommendedAction}</span>
      </div>
    </div>
  );
}

function LoadingSkeleton(): ReactElement {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default function ABTestResultsPanel({
  results,
  loading = false,
}: ABTestResultsPanelProps): ReactElement {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!results || results.experiments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">A/B Test Results</h2>
          <Link
            href="/admin/experiments"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Create Test →
          </Link>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 p-3">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="mb-1 font-medium text-gray-900">No A/B Tests Yet</h3>
          <p className="mb-4 text-sm text-gray-500">
            Create your first experiment to start optimizing conversions.
          </p>
          <Link
            href="/admin/experiments"
            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Create First Test
          </Link>
        </div>
      </div>
    );
  }

  // Separate active and completed experiments
  const activeExperiments = results.experiments.filter(
    (e) => e.status === 'active' || e.status === 'paused'
  );
  const completedExperiments = results.experiments.filter(
    (e) => e.status === 'completed'
  );

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">A/B Test Results</h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Active: {results.activeCount}
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Done: {results.completedCount}
          </span>
          <Link
            href="/admin/experiments"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Manage →
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {activeExperiments.map((exp) => (
          <ExperimentCard key={exp.id} experiment={exp} />
        ))}

        {completedExperiments.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-medium text-gray-500">
              Recently Completed
            </h3>
            {completedExperiments.slice(0, 2).map((exp) => (
              <ExperimentCard key={exp.id} experiment={exp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
