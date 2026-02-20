'use client';

import { useState, useEffect, type ReactElement } from 'react';
import type { Product } from '@/lib/types/product';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';
import { DASHBOARD_CATEGORIES } from '@/lib/dashboard/categories';
import CategorySection from './CategorySection';
import DashboardProductCard from './DashboardProductCard';

interface Props {
  shareCode: string;
  tabId: string;
  participantId: string;
  draftItems: DraftCartItemView[];
  onItemChanged: () => void;
  recsSection?: ReactElement | null;
}

export default function ProductBrowse({
  shareCode,
  tabId,
  participantId,
  draftItems,
  onItemChanged,
  recsSection,
}: Props): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(searchQuery.trim())}&first=30`
        );
        if (!res.ok) return;
        const json = await res.json();
        const items = (json.products?.edges || []).map(
          (e: { node: Product }) => e.node
        );
        setSearchResults(items);
      } catch {
        // Silently fail
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  // Build draft item map for search results
  const draftMap = new Map<string, DraftCartItemView>();
  for (const item of draftItems) {
    draftMap.set(`${item.productId}:${item.variantId}`, item);
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isSearching ? (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            {searching
              ? 'Searching...'
              : `Results for "${searchQuery}" (${searchResults.length})`}
          </h2>
          {!searching && searchResults.length === 0 && (
            <p className="text-gray-500 text-sm">No products found.</p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {searchResults.map((product) => {
              const variant = product.variants.edges[0]?.node;
              const existingItem = variant
                ? draftMap.get(`${product.id}:${variant.id}`)
                : undefined;
              return (
                <DashboardProductCard
                  key={product.id}
                  product={product}
                  shareCode={shareCode}
                  tabId={tabId}
                  participantId={participantId}
                  existingItem={existingItem}
                  onItemChanged={onItemChanged}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          {recsSection}
          {DASHBOARD_CATEGORIES.map((cat) => (
            <CategorySection
              key={cat.collectionHandle}
              label={cat.label}
              collectionHandle={cat.collectionHandle}
              shareCode={shareCode}
              tabId={tabId}
              participantId={participantId}
              draftItems={draftItems}
              onItemChanged={onItemChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
