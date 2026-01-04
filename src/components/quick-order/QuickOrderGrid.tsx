/**
 * @fileoverview Product grid container for Quick Order page
 * @module components/quick-order/QuickOrderGrid
 */

'use client';

import type { ReactElement } from 'react';
import type { ShopifyProduct } from '@/lib/shopify/types';
import QuickProductCard from './QuickProductCard';

interface QuickOrderGridProps {
  /** Products to display */
  products: ShopifyProduct[];
  /** Loading state */
  loading?: boolean;
}

/**
 * Skeleton card for loading state
 */
function SkeletonCard(): ReactElement {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

/**
 * Responsive product grid with loading skeleton support
 *
 * @example
 * ```tsx
 * <QuickOrderGrid products={products} loading={isLoading} />
 * ```
 */
export default function QuickOrderGrid({
  products,
  loading = false,
}: QuickOrderGridProps): ReactElement {
  // Show skeleton while loading
  if (loading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
      {products.map((product) => (
        <QuickProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
