'use client';

import { useState, useEffect, type ReactElement } from 'react';
import type { Product } from '@/lib/types/product';
import type { DraftCartItemView } from '@/lib/group-orders-v2/types';
import DashboardProductCard from './DashboardProductCard';

interface Props {
  label: string;
  collectionHandle: string;
  shareCode: string;
  tabId: string;
  participantId: string;
  draftItems: DraftCartItemView[];
  isLocked?: boolean;
  onItemChanged: () => void;
}

type ExpansionState = 'initial' | 'more' | 'all';

const INITIAL_COUNT = 6;
const MORE_COUNT = 24;

export default function CategorySection({
  label,
  collectionHandle,
  shareCode,
  tabId,
  participantId,
  draftItems,
  isLocked,
  onItemChanged,
}: Props): ReactElement | null {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expansion, setExpansion] = useState<ExpansionState>('initial');

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        const res = await fetch(
          `/api/products?localCollection=${collectionHandle}&first=48`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        const items = (json.products?.edges || []).map(
          (e: { node: Product }) => e.node
        );
        setProducts(items);
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [collectionHandle]);

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-heading font-bold tracking-[0.08em] text-gray-900 mb-3 text-center md:text-left">{label}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: INITIAL_COUNT }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg animate-pulse aspect-square" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  // Build a map of productId+variantId -> draft item for quick lookup (only this participant's items)
  const draftMap = new Map<string, DraftCartItemView>();
  for (const item of draftItems) {
    if (item.addedBy.id === participantId) {
      draftMap.set(`${item.productId}:${item.variantId}`, item);
    }
  }

  const visibleCount =
    expansion === 'initial'
      ? INITIAL_COUNT
      : expansion === 'more'
      ? MORE_COUNT
      : products.length;
  const visible = products.slice(0, visibleCount);
  const hasMore = products.length > visibleCount;

  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-heading font-bold tracking-[0.08em] text-gray-900 mb-3 text-center md:text-left">{label}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {visible.map((product) => {
          const variant = product.variants.edges[0]?.node;
          const itemKey = variant ? `${product.id}:${variant.id}` : product.id;
          const existingItem = variant
            ? draftMap.get(`${product.id}:${variant.id}`)
            : undefined;
          return (
            <DashboardProductCard
              key={itemKey}
              product={product}
              shareCode={shareCode}
              tabId={tabId}
              participantId={participantId}
              existingItem={existingItem}
              isLocked={isLocked}
              onItemChanged={onItemChanged}
            />
          );
        })}
      </div>
      {hasMore && (
        <div className="mt-3 text-center">
          <button
            onClick={() =>
              setExpansion(expansion === 'initial' ? 'more' : 'all')
            }
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {expansion === 'initial' ? 'See More' : 'See All'} ({products.length - visibleCount} more)
          </button>
        </div>
      )}
    </section>
  );
}
