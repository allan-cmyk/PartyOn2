'use client';

import { ReactElement } from 'react';
import { TopProduct } from '@/lib/analytics/types';

interface TopProductsTableProps {
  products: TopProduct[];
  loading?: boolean;
}

/**
 * Top selling products table
 */
export default function TopProductsTable({
  products,
  loading = false,
}: TopProductsTableProps): ReactElement {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Selling Products
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="pb-3">Product</th>
              <th className="pb-3 text-right">Qty</th>
              <th className="pb-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No sales data for this period
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {product.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-sm text-gray-600">
                    {product.quantity}
                  </td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
