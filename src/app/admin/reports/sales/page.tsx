'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

interface OrderStatus {
  status: string;
  count: number;
}

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalTax: number;
  totalDeliveryFees: number;
  totalDiscounts: number;
}

interface SalesReport {
  dateRange: { start: string; end: string };
  summary: SalesSummary;
  chartData: ChartDataPoint[];
  revenueByCategory: CategoryRevenue[];
  ordersByStatus: OrderStatus[];
}

type DateRange = '7d' | '30d' | '90d';
type GroupBy = 'day' | 'week' | 'month';

/**
 * Sales Report Page
 * Detailed sales analytics with charts
 */
export default function SalesReportPage() {
  const [data, setData] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('30d');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/reports/sales?range=${range}&groupBy=${groupBy}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range, groupBy]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMaxRevenue = (): number => {
    if (!data?.chartData) return 0;
    return Math.max(...data.chartData.map((d) => d.revenue), 1);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500',
      CONFIRMED: 'bg-blue-500',
      PROCESSING: 'bg-purple-500',
      OUT_FOR_DELIVERY: 'bg-orange-500',
      DELIVERED: 'bg-green-500',
      CANCELLED: 'bg-red-500',
      REFUNDED: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-black mb-6">Sales Report</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Sales Report</h1>
          <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Back to Reports Dashboard
          </Link>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded font-medium text-sm transition-colors ${
                  range === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {r === '7d' ? '7D' : r === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="px-3 py-1.5 border-2 border-gray-300 rounded font-medium text-sm text-black"
          >
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Revenue</h3>
          <p className="text-xl font-bold text-black">{formatCurrency(data?.summary.totalRevenue || 0)}</p>
        </div>
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Orders</h3>
          <p className="text-xl font-bold text-black">{data?.summary.totalOrders || 0}</p>
        </div>
        <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Avg Order</h3>
          <p className="text-xl font-bold text-black">{formatCurrency(data?.summary.avgOrderValue || 0)}</p>
        </div>
        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Tax Collected</h3>
          <p className="text-xl font-bold text-black">{formatCurrency(data?.summary.totalTax || 0)}</p>
        </div>
        <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Delivery Fees</h3>
          <p className="text-xl font-bold text-black">{formatCurrency(data?.summary.totalDeliveryFees || 0)}</p>
        </div>
        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Discounts</h3>
          <p className="text-xl font-bold text-black">{formatCurrency(data?.summary.totalDiscounts || 0)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Revenue Over Time</h2>
        {data?.chartData && data.chartData.length > 0 ? (
          <div className="h-64">
            <div className="flex h-full items-end gap-1">
              {data.chartData.map((point, index) => {
                const height = (point.revenue / getMaxRevenue()) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer group relative"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                        {formatCurrency(point.revenue)}
                        <br />
                        {point.orders} orders
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {point.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No data for selected period</p>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Revenue by Category</h2>
          {data?.revenueByCategory && data.revenueByCategory.length > 0 ? (
            <div className="space-y-3">
              {data.revenueByCategory.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-black">{cat.category}</span>
                    <span className="text-gray-600">{formatCurrency(cat.revenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{cat.percentage}% of total</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No category data</p>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Orders by Status</h2>
          {data?.ordersByStatus && data.ordersByStatus.length > 0 ? (
            <div className="space-y-3">
              {data.ordersByStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`} />
                    <span className="font-medium text-black">{status.status.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-gray-600">{status.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No status data</p>
          )}
        </div>
      </div>
    </div>
  );
}
