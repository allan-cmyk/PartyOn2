/**
 * @fileoverview Quick Order page - streamlined product ordering
 * @module app/quick-order/page
 */

'use client';

import { useState, type ReactElement } from 'react';
import { useQuickOrderProducts } from '@/hooks/useQuickOrderProducts';
import CategoryTabs from '@/components/quick-order/CategoryTabs';
import QuickOrderGrid from '@/components/quick-order/QuickOrderGrid';
import CartSummaryBar from '@/components/quick-order/CartSummaryBar';
import QuickOrderSearch from '@/components/quick-order/QuickOrderSearch';

/**
 * Quick Order page with streamlined mobile-first ordering experience
 *
 * Features:
 * - Sticky category tabs for filtering
 * - Simplified product cards with one-tap add
 * - Inline quantity controls after first add
 * - Sticky cart summary bar at bottom
 * - Optimistic UI updates
 */
export default function QuickOrderPage(): ReactElement {
  const [activeCategory, setActiveCategory] = useState('all');
  const { products, loading, error } = useQuickOrderProducts(activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quick Order</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tap to add, we&apos;ll deliver
          </p>
        </div>
        <QuickOrderSearch />
      </div>

      {/* Category Tabs - Sticky */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Product Grid */}
      <main className="px-4 py-4 pb-24">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load products. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <QuickOrderGrid products={products} loading={loading} />
        )}
      </main>

      {/* Cart Summary Bar - Fixed Bottom */}
      <CartSummaryBar />
    </div>
  );
}
