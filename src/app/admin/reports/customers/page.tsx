'use client';

import { useState, useEffect } from 'react';

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  lifetimeValue: number;
  avgOrderValue: number;
}

interface AcquisitionData {
  month: string;
  newCustomers: number;
}

interface CustomerSummary {
  totalCustomers: number;
  customersWithOrders: number;
  repeatCustomers: number;
  repeatRate: number;
  newCustomersInRange: number;
  avgLifetimeValue: number;
  totalLifetimeValue: number;
}

interface Segments {
  noOrders: number;
  oneOrder: number;
  twoToFiveOrders: number;
  sixPlusOrders: number;
}

interface ValueSegments {
  under100: number;
  from100to500: number;
  from500to1000: number;
  over1000: number;
}

interface CustomerReport {
  dateRange: { start: string; end: string };
  summary: CustomerSummary;
  topCustomers: TopCustomer[];
  acquisitionChart: AcquisitionData[];
  segments: Segments;
  valueSegments: ValueSegments;
}

type DateRange = '30d' | '90d' | '365d';

/**
 * Customer Report Page
 * Customer analytics and segmentation
 */
export default function CustomerReportPage() {
  const [data, setData] = useState<CustomerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('90d');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/reports/customers?range=${range}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMaxAcquisition = (): number => {
    if (!data?.acquisitionChart) return 0;
    return Math.max(...data.acquisitionChart.map((d) => d.newCustomers), 1);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-black mb-6">Customer Report</h1>
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
          <h1 className="text-2xl font-bold text-black">Customer Report</h1>
          <a href="/admin/reports" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Back to Reports Dashboard
          </a>
        </div>
        <div className="flex gap-2">
          {(['30d', '90d', '365d'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded font-medium text-sm transition-colors ${
                range === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total Customers</h3>
          <p className="text-2xl font-bold text-black">{data?.summary.totalCustomers || 0}</p>
        </div>
        <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">With Orders</h3>
          <p className="text-2xl font-bold text-black">{data?.summary.customersWithOrders || 0}</p>
        </div>
        <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Repeat Rate</h3>
          <p className="text-2xl font-bold text-black">{data?.summary.repeatRate || 0}%</p>
        </div>
        <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Avg Lifetime Value</h3>
          <p className="text-2xl font-bold text-black">{formatCurrency(data?.summary.avgLifetimeValue || 0)}</p>
        </div>
      </div>

      {/* Customer Acquisition Chart */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Customer Acquisition</h2>
        {data?.acquisitionChart && data.acquisitionChart.length > 0 ? (
          <div className="h-48">
            <div className="flex h-full items-end gap-2">
              {data.acquisitionChart.map((point, index) => {
                const height = (point.newCustomers / getMaxAcquisition()) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors cursor-pointer group relative"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                        {point.newCustomers} new customers
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {point.month}
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

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Segments by Orders */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">By Order Count</h2>
          {data?.segments && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">No Orders</span>
                  <span className="font-medium text-black">{data.segments.noOrders}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-gray-400 rounded-full"
                    style={{ width: `${(data.segments.noOrders / data.summary.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">1 Order</span>
                  <span className="font-medium text-black">{data.segments.oneOrder}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${(data.segments.oneOrder / data.summary.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">2-5 Orders</span>
                  <span className="font-medium text-black">{data.segments.twoToFiveOrders}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-400 rounded-full"
                    style={{ width: `${(data.segments.twoToFiveOrders / data.summary.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">6+ Orders</span>
                  <span className="font-medium text-black">{data.segments.sixPlusOrders}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(data.segments.sixPlusOrders / data.summary.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Segments by Value */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">By Lifetime Value</h2>
          {data?.valueSegments && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Under $100</span>
                  <span className="font-medium text-black">{data.valueSegments.under100}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-gray-400 rounded-full"
                    style={{ width: `${(data.valueSegments.under100 / data.summary.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">$100 - $500</span>
                  <span className="font-medium text-black">{data.valueSegments.from100to500}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${(data.valueSegments.from100to500 / data.summary.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">$500 - $1,000</span>
                  <span className="font-medium text-black">{data.valueSegments.from500to1000}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-400 rounded-full"
                    style={{ width: `${(data.valueSegments.from500to1000 / data.summary.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Over $1,000</span>
                  <span className="font-medium text-black">{data.valueSegments.over1000}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(data.valueSegments.over1000 / data.summary.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">New in Period</span>
              <span className="font-semibold text-black">{data?.summary.newCustomersInRange || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Repeat Customers</span>
              <span className="font-semibold text-black">{data?.summary.repeatCustomers || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Repeat Rate</span>
              <span className="font-semibold text-green-600">{data?.summary.repeatRate || 0}%</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Total LTV</span>
              <span className="font-semibold text-black">{formatCurrency(data?.summary.totalLifetimeValue || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Top Customers by Lifetime Value</h2>
        {data?.topCustomers && data.topCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-black">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-black">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-black">Email</th>
                  <th className="text-right py-3 px-4 font-semibold text-black">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-black">Avg Order</th>
                  <th className="text-right py-3 px-4 font-semibold text-black">Lifetime Value</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-black">{customer.name}</td>
                    <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                    <td className="py-3 px-4 text-right text-black">{customer.orderCount}</td>
                    <td className="py-3 px-4 text-right text-black">{formatCurrency(customer.avgOrderValue)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">{formatCurrency(customer.lifetimeValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No customer data</p>
        )}
      </div>
    </div>
  );
}
