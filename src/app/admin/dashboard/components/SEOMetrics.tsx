'use client';

import { ReactElement } from 'react';
import { SEOMetrics as SEOMetricsType, TopKeyword } from '@/lib/analytics/types';

interface SEOMetricsProps {
  metrics: SEOMetricsType | null;
  keywords: TopKeyword[];
  loading?: boolean;
}

/**
 * SEO metrics showing Search Console data
 */
export default function SEOMetrics({
  metrics,
  keywords,
  loading = false,
}: SEOMetricsProps): ReactElement {
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Performance</h3>
        <p className="text-gray-500 text-sm">
          Connect Search Console to see SEO data
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Performance</h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Impressions</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.impressions.toLocaleString()}
          </p>
          {metrics.impressionsChange !== 0 && (
            <p
              className={`text-xs ${
                metrics.impressionsChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.impressionsChange >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(metrics.impressionsChange)}%
            </p>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Clicks</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.clicks.toLocaleString()}
          </p>
          {metrics.clicksChange !== 0 && (
            <p
              className={`text-xs ${
                metrics.clicksChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.clicksChange >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(metrics.clicksChange)}%
            </p>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">CTR</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.ctr}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Position</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.avgPosition}</p>
        </div>
      </div>

      {/* Top Keywords */}
      {keywords.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Keywords</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="pb-2">Keyword</th>
                  <th className="pb-2 text-right">Clicks</th>
                  <th className="pb-2 text-right">Pos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keywords.slice(0, 10).map((kw, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 text-gray-700 truncate max-w-[150px]">
                      {kw.keyword}
                    </td>
                    <td className="py-2 text-right text-gray-600">{kw.clicks}</td>
                    <td className="py-2 text-right">
                      <span
                        className={`${
                          kw.position <= 10
                            ? 'text-green-600'
                            : kw.position <= 20
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {kw.position}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
