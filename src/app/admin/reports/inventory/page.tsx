'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface InventorySummary {
  totalItems: number;
  totalUnits: number;
  totalValue: number;
  lowStockCount: number;
  needsReorderCount: number;
  outOfStockCount: number;
}

interface CategoryStat {
  category: string;
  units: number;
  value: number;
  items: number;
}

interface InventoryItem {
  id: string;
  productId: string;
  productTitle: string;
  productType: string | null;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  soldQuantity: number;
  dailySales: number;
  daysOfStock: number | null;
  turnoverRate: number;
  inventoryValue: number;
  isLowStock: boolean;
  needsReorder: boolean;
}

interface TopSelling {
  productTitle: string;
  variantTitle: string | null;
  soldQuantity: number;
  currentStock: number;
  daysOfStock: number | null;
}

interface SlowMoving {
  productTitle: string;
  variantTitle: string | null;
  quantity: number;
  soldQuantity: number;
  turnoverRate: number;
  inventoryValue: number;
}

interface InventoryReport {
  dateRange: { start: string; end: string };
  summary: InventorySummary;
  inventoryByCategory: CategoryStat[];
  lowStockItems: InventoryItem[];
  reorderItems: InventoryItem[];
  topSelling: TopSelling[];
  slowMoving: SlowMoving[];
}

type DateRange = '7d' | '30d' | '90d';

/**
 * Inventory Report Page
 * Inventory health and turnover analytics
 */
export default function InventoryReportPage() {
  const [data, setData] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('30d');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/reports/inventory?range=${range}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory report:', error);
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

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold text-black mb-6">Inventory Report</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Inventory Report</h1>
          <Link href="/admin/reports" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Back to Reports Dashboard
          </Link>
        </div>
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
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total SKUs</h3>
          <p className="text-xl font-bold text-black">{data?.summary.totalItems || 0}</p>
        </div>
        <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total Units</h3>
          <p className="text-xl font-bold text-black">{data?.summary.totalUnits || 0}</p>
        </div>
        <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total Value</h3>
          <p className="text-xl font-bold text-black">{formatCurrency(data?.summary.totalValue || 0)}</p>
        </div>
        <div className={`border-2 rounded-lg p-4 ${(data?.summary.lowStockCount || 0) > 0 ? 'bg-yellow-100 border-yellow-300' : 'bg-gray-100 border-gray-300'}`}>
          <h3 className="text-xs font-medium text-gray-600 mb-1">Low Stock</h3>
          <p className="text-xl font-bold text-black">{data?.summary.lowStockCount || 0}</p>
        </div>
        <div className={`border-2 rounded-lg p-4 ${(data?.summary.needsReorderCount || 0) > 0 ? 'bg-orange-100 border-orange-300' : 'bg-gray-100 border-gray-300'}`}>
          <h3 className="text-xs font-medium text-gray-600 mb-1">Needs Reorder</h3>
          <p className="text-xl font-bold text-black">{data?.summary.needsReorderCount || 0}</p>
        </div>
        <div className={`border-2 rounded-lg p-4 ${(data?.summary.outOfStockCount || 0) > 0 ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-300'}`}>
          <h3 className="text-xs font-medium text-gray-600 mb-1">Out of Stock</h3>
          <p className="text-xl font-bold text-black">{data?.summary.outOfStockCount || 0}</p>
        </div>
      </div>

      {/* Two Column Layout - Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Low Stock Items */}
        <div className={`border-2 rounded-lg p-6 ${(data?.lowStockItems?.length || 0) > 0 ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold text-black mb-4">Low Stock Items</h2>
          {data?.lowStockItems && data.lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {data.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-black">{item.productTitle}</p>
                    {item.variantTitle && <p className="text-sm text-gray-600">{item.variantTitle}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${item.quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {item.quantity} units
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.daysOfStock !== null ? `${item.daysOfStock} days of stock` : 'No recent sales'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">All items have adequate stock</p>
          )}
        </div>

        {/* Reorder Suggestions */}
        <div className={`border-2 rounded-lg p-6 ${(data?.reorderItems?.length || 0) > 0 ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold text-black mb-4">Reorder Suggestions</h2>
          {data?.reorderItems && data.reorderItems.length > 0 ? (
            <div className="space-y-3">
              {data.reorderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-black">{item.productTitle}</p>
                    {item.variantTitle && <p className="text-sm text-gray-600">{item.variantTitle}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{item.quantity} / {item.reorderPoint}</p>
                    <p className="text-xs text-gray-500">
                      ~{item.dailySales}/day avg sales
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No items need reordering</p>
          )}
        </div>
      </div>

      {/* Inventory by Category */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Inventory by Category</h2>
        {data?.inventoryByCategory && data.inventoryByCategory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-black">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-black">SKUs</th>
                  <th className="text-right py-3 px-4 font-semibold text-black">Units</th>
                  <th className="text-right py-3 px-4 font-semibold text-black">Value</th>
                  <th className="text-right py-3 px-4 font-semibold text-black">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {data.inventoryByCategory.map((cat) => (
                  <tr key={cat.category} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-black">{cat.category}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{cat.items}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{cat.units}</td>
                    <td className="py-3 px-4 text-right text-black">{formatCurrency(cat.value)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(cat.value / (data.summary.totalValue || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-600 text-sm w-12 text-right">
                          {Math.round((cat.value / (data.summary.totalValue || 1)) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No inventory data</p>
        )}
      </div>

      {/* Two Column Layout - Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Top Selling Items</h2>
          {data?.topSelling && data.topSelling.length > 0 ? (
            <div className="space-y-3">
              {data.topSelling.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-black">{item.productTitle}</p>
                      {item.variantTitle && <p className="text-sm text-gray-600">{item.variantTitle}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{item.soldQuantity} sold</p>
                    <p className="text-xs text-gray-500">
                      {item.currentStock} in stock
                      {item.daysOfStock !== null && ` (${item.daysOfStock}d)`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No sales data for period</p>
          )}
        </div>

        {/* Slow Moving */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Slow Moving Items</h2>
          {data?.slowMoving && data.slowMoving.length > 0 ? (
            <div className="space-y-3">
              {data.slowMoving.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-black">{item.productTitle}</p>
                    {item.variantTitle && <p className="text-sm text-gray-600">{item.variantTitle}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-600">{item.quantity} units</p>
                    <p className="text-xs text-gray-500">
                      {item.soldQuantity} sold ({item.turnoverRate}% turnover)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No slow moving items identified</p>
          )}
        </div>
      </div>
    </div>
  );
}
