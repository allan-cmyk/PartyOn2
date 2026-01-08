'use client';

import { ReactElement } from 'react';
import { TrafficMetrics, TrafficSource } from '@/lib/analytics/types';

interface TrafficOverviewProps {
  metrics: TrafficMetrics | null;
  sources: TrafficSource[];
  loading?: boolean;
}

/**
 * Traffic overview showing sessions, users, and source breakdown
 */
export default function TrafficOverview({
  metrics,
  sources,
  loading = false,
}: TrafficOverviewProps): ReactElement {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic</h3>
        <p className="text-gray-500 text-sm">
          Connect Google Analytics to see traffic data
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Sessions</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.sessions.toLocaleString()}
          </p>
          {metrics.sessionsChange !== 0 && (
            <p
              className={`text-xs ${
                metrics.sessionsChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.sessionsChange >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(metrics.sessionsChange)}%
            </p>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.users.toLocaleString()}
          </p>
          {metrics.usersChange !== 0 && (
            <p
              className={`text-xs ${
                metrics.usersChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.usersChange >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(metrics.usersChange)}%
            </p>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pageviews</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.pageviews.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Bounce Rate</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.bounceRate}%</p>
        </div>
      </div>

      {/* Traffic Sources */}
      {sources.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Traffic Sources</h4>
          <div className="space-y-2">
            {sources.slice(0, 5).map((source) => (
              <div key={source.source} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{source.source}</span>
                    <span className="text-gray-500">{source.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
