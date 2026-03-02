'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TierStats {
  customerCount: number;
  totalPoints: number;
  totalLifetimeSpend: number;
}

interface LoyaltyTier {
  id: string;
  name: string;
  color: string;
  minLifetimeSpend: number;
  pointsMultiplier: number;
  discountPercent: number;
  freeDeliveryMin: number | null;
  benefits: string[];
  stats: TierStats;
}

interface Summary {
  totalCustomers: number;
  totalPointsOutstanding: number;
  totalLifetimeSpend: number;
  totalPointsEarned: number;
}

interface Transaction {
  id: string;
  type: string;
  points: number;
  description: string | null;
  customerName: string;
  createdAt: string;
}

interface LoyaltyData {
  tiers: LoyaltyTier[];
  summary: Summary;
  recentTransactions: Transaction[];
}

/**
 * Admin Loyalty Program Dashboard
 */
export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/v1/admin/loyalty');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeTiers = async () => {
    setInitializing(true);
    try {
      const response = await fetch('/api/v1/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init' }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to initialize tiers:', error);
    } finally {
      setInitializing(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTransactionColor = (type: string): string => {
    const colors: Record<string, string> = {
      EARNED: 'text-green-600',
      REDEEMED: 'text-red-600',
      BONUS: 'text-blue-600',
      ADJUSTED: 'text-yellow-600',
      EXPIRED: 'text-gray-500',
    };
    return colors[type] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold text-black mb-6">Loyalty Program</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.tiers.length) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold text-black mb-6">Loyalty Program</h1>
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-black mb-2">Loyalty Tiers Not Configured</h2>
          <p className="text-gray-600 mb-4">
            Initialize the default loyalty tiers to start rewarding your customers.
          </p>
          <button
            onClick={initializeTiers}
            disabled={initializing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {initializing ? 'Initializing...' : 'Initialize Loyalty Tiers'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Loyalty Program</h1>
          <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Back to Reports Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total Members</h3>
          <p className="text-2xl font-bold text-black">{data.summary.totalCustomers}</p>
        </div>
        <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Points Outstanding</h3>
          <p className="text-2xl font-bold text-black">
            {data.summary.totalPointsOutstanding.toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total Lifetime Spend</h3>
          <p className="text-2xl font-bold text-black">
            {formatCurrency(data.summary.totalLifetimeSpend)}
          </p>
        </div>
        <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Points Value</h3>
          <p className="text-2xl font-bold text-black">
            {formatCurrency(data.summary.totalPointsOutstanding * 0.10)}
          </p>
          <p className="text-xs text-gray-500">Liability</p>
        </div>
      </div>

      {/* Tiers */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Loyalty Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.tiers.map((tier) => (
            <div
              key={tier.id}
              className="border-2 rounded-lg p-4"
              style={{ borderColor: tier.color }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                <h3 className="font-semibold text-black">{tier.name}</h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="font-medium text-black">{tier.stats.customerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Spend</span>
                  <span className="font-medium text-black">
                    {formatCurrency(tier.minLifetimeSpend)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Multiplier</span>
                  <span className="font-medium text-black">{tier.pointsMultiplier}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-black">{tier.discountPercent}%</span>
                </div>
              </div>

              {tier.benefits.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <ul className="text-xs text-gray-600 space-y-1">
                    {tier.benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500">+</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Recent Points Activity</h2>
        {data.recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {data.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-black">{tx.customerName}</p>
                  <p className="text-sm text-gray-500">{tx.description || tx.type}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getTransactionColor(tx.type)}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
