'use client';

import { ReactElement } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  icon?: ReactElement;
  loading?: boolean;
}

/**
 * Metric card component for displaying KPIs
 */
export default function MetricCard({
  title,
  value,
  change,
  prefix = '',
  suffix = '',
  icon,
  loading = false,
}: MetricCardProps): ReactElement {
  const isPositive = change !== undefined && change >= 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1">
          <span
            className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-400">vs prev period</span>
        </div>
      )}
    </div>
  );
}
