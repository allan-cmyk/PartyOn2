'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
}

/**
 * Admin Feature Flags Page
 * Control feature rollout for gradual migration
 */
export default function FeaturesPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      const response = await fetch('/api/v1/admin/features');
      const data = await response.json();
      if (data.success) {
        setFlags(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (key: string, enabled: boolean) => {
    setUpdating(key);
    try {
      const response = await fetch('/api/v1/admin/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled }),
      });
      const data = await response.json();
      if (data.success) {
        setFlags(flags.map((f) => (f.key === key ? { ...f, enabled } : f)));
      }
    } catch (error) {
      console.error('Failed to update flag:', error);
    } finally {
      setUpdating(null);
    }
  };

  const setRollout = async (key: string, percentage: number) => {
    setUpdating(key);
    try {
      const response = await fetch('/api/v1/admin/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, rolloutPercentage: percentage }),
      });
      const data = await response.json();
      if (data.success) {
        setFlags(
          flags.map((f) =>
            f.key === key ? { ...f, rolloutPercentage: percentage, enabled: percentage > 0 } : f
          )
        );
      }
    } catch (error) {
      console.error('Failed to update rollout:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getFlagDescription = (key: string): { short: string; long: string } => {
    const descriptions: Record<string, { short: string; long: string }> = {
      use_custom_cart: {
        short: 'Use custom cart system instead of Shopify cart',
        long: 'Routes shopping cart operations to our local database instead of Shopify. Use the rollout slider to gradually migrate users (e.g., 10% initially, then increase).',
      },
      use_custom_checkout: {
        short: 'Use Stripe checkout instead of Shopify checkout',
        long: 'Redirects checkout to Stripe instead of Shopify. The rollout slider controls what percentage of customers use the new checkout.',
      },
      use_custom_products: {
        short: 'Load products from local database instead of Shopify',
        long: 'Serves product data from our PostgreSQL database. Use rollout slider to test with a subset of users before full migration.',
      },
      use_custom_inventory: {
        short: 'Use local inventory tracking instead of Shopify',
        long: 'Tracks stock levels in our database. Enables real-time inventory updates and AI features.',
      },
      use_custom_auth: {
        short: 'Use custom email/password auth instead of Shopify customer accounts',
        long: 'Switches customer login from Shopify Customer Accounts to our own authentication system.',
      },
      use_custom_customers: {
        short: 'Use local customer database instead of Shopify',
        long: 'Stores customer profiles and order history in our database for faster access and AI features.',
      },
      use_custom_orders: {
        short: 'Use local order management instead of Shopify',
        long: 'Processes and stores orders in our system. Required for full Shopify independence.',
      },
      ai_inventory_counting: {
        short: 'AI-powered image-based inventory counting',
        long: 'Upload a photo of your shelves/storage and Claude AI will identify products and count quantities. Great for quick stock checks - just snap a picture instead of manual counting.',
      },
      ai_stock_predictions: {
        short: 'AI stock predictions and reorder suggestions',
        long: 'Analyzes your sales history to predict when items will run low and suggests optimal reorder timing. Helps prevent stockouts and overordering.',
      },
      ai_query_assistant: {
        short: 'Natural language inventory assistant',
        long: 'Ask questions like "What\'s running low?" or "Show me best sellers this month" and get instant answers. No need to navigate complex reports.',
      },
    };
    return descriptions[key] || { short: 'No description available', long: '' };
  };

  const isAIFeature = (key: string): boolean => {
    return key.startsWith('ai_');
  };

  const getCategoryColor = (key: string): string => {
    if (key.startsWith('ai_')) return 'bg-purple-100 border-purple-300';
    if (key.includes('cart') || key.includes('checkout')) return 'bg-blue-100 border-blue-300';
    if (key.includes('product') || key.includes('inventory'))
      return 'bg-green-100 border-green-300';
    if (key.includes('auth') || key.includes('customer'))
      return 'bg-orange-100 border-orange-300';
    return 'bg-gray-100 border-gray-300';
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-black mb-6">Feature Flags</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-black mb-2">Feature Flags</h1>
      <p className="text-gray-700 mb-6">
        Control which features use the custom system vs Shopify. Use rollout percentages for gradual
        migration.
      </p>

      {/* Warning Banner */}
      <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mb-6">
        <p className="text-black text-sm">
          <strong>Warning:</strong> Enabling flags will route traffic to the custom system. Test
          thoroughly before enabling in production. Start with low rollout percentages.
        </p>
      </div>

      {/* Flags Grid */}
      <div className="space-y-4">
        {flags.map((flag) => {
          const description = getFlagDescription(flag.key);
          const isAI = isAIFeature(flag.key);

          return (
            <div
              key={flag.key}
              className={`rounded-lg border-2 p-4 ${getCategoryColor(flag.key)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold font-mono text-black">{flag.key}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        flag.enabled
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {flag.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    {isAI && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-600 text-white">
                        AI FEATURE
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-black mb-1">{description.short}</p>
                  <p className="text-sm text-gray-700">{description.long}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Rollout Slider - Only show for non-AI features */}
                  {!isAI && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-black font-medium w-10">{flag.rolloutPercentage}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={flag.rolloutPercentage}
                        onChange={(e) => setRollout(flag.key, parseInt(e.target.value))}
                        disabled={updating === flag.key}
                        className="w-24 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleFlag(flag.key, !flag.enabled)}
                    disabled={updating === flag.key}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      flag.enabled ? 'bg-green-600' : 'bg-gray-400'
                    } ${updating === flag.key ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        flag.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Rollout Progress Bar - Only show for non-AI features */}
              {!isAI && flag.enabled && flag.rolloutPercentage < 100 && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${flag.rolloutPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-700 mt-1">
                    {flag.rolloutPercentage}% of users will see the custom feature
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Migration Guide */}
      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-black mb-4">Migration Guide</h2>
        <ol className="text-sm text-black space-y-2">
          <li><strong>1.</strong> First sync all products from Shopify using the Sync page</li>
          <li><strong>2.</strong> Enable AI features (ai_*) for internal testing</li>
          <li><strong>3.</strong> Enable use_custom_products at 10% rollout</li>
          <li><strong>4.</strong> Monitor for issues, gradually increase to 100%</li>
          <li><strong>5.</strong> Enable use_custom_cart at 10%, then increase</li>
          <li><strong>6.</strong> Enable use_custom_checkout (Stripe) at 10%, then increase</li>
          <li><strong>7.</strong> Once stable, enable use_custom_auth and use_custom_customers</li>
          <li><strong>8.</strong> Finally, enable use_custom_orders to complete migration</li>
        </ol>
        <Link href="/admin/sync" className="text-blue-600 hover:text-blue-800 text-sm mt-4 block font-medium">
          Go to Sync Page &rarr;
        </Link>
      </div>
    </div>
  );
}
