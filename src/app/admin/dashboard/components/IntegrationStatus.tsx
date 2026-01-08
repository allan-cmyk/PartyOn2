'use client';

import { ReactElement } from 'react';
import { AnalyticsConfig } from '@/lib/analytics/types';

interface IntegrationStatusProps {
  config: AnalyticsConfig;
}

/**
 * Shows status of data integrations and setup instructions
 */
export default function IntegrationStatus({
  config,
}: IntegrationStatusProps): ReactElement {
  const integrations = [
    {
      name: 'Shopify',
      configured: config.shopifyConfigured,
      description: 'Sales, orders, and product data',
    },
    {
      name: 'Google Analytics 4',
      configured: config.ga4Configured,
      description: 'Traffic, user behavior, conversions',
    },
    {
      name: 'Search Console',
      configured: config.searchConsoleConfigured,
      description: 'SEO rankings, keywords, impressions',
    },
  ];

  const allConfigured = integrations.every((i) => i.configured);

  if (allConfigured) {
    return <></>;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-amber-800 mb-2">
        Complete Your Dashboard Setup
      </h3>
      <p className="text-sm text-amber-700 mb-3">
        Connect more data sources to unlock the full dashboard:
      </p>
      <div className="space-y-2">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="flex items-center gap-2 text-sm"
          >
            {integration.configured ? (
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            <span
              className={
                integration.configured ? 'text-green-800' : 'text-amber-800'
              }
            >
              <strong>{integration.name}</strong>
              {!integration.configured && (
                <span className="text-amber-600 ml-1">
                  — {integration.description}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      {(!config.ga4Configured || !config.searchConsoleConfigured) && (
        <button
          onClick={() => {
            const setupSection = document.getElementById('setup-instructions');
            setupSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
        >
          View setup instructions →
        </button>
      )}
    </div>
  );
}
