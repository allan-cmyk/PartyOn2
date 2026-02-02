'use client';

import { useState, useEffect, ReactElement } from 'react';
import { addDraftItemV2 } from '@/lib/group-orders-v2/api-client';
import { getCollectionsForOrderType, ORDER_TYPES } from '@/lib/group-orders-v2/order-types';

interface CatalogProduct {
  id: string;
  title: string;
  handle: string;
  basePrice: number;
  productType: string | null;
  images: { url: string }[];
  variants: {
    id: string;
    title: string;
    price: number;
    availableForSale: boolean;
  }[];
}

interface Props {
  shareCode: string;
  tabId: string;
  participantId: string;
  orderType?: string | null;
  onItemAdded: () => void;
}

export default function GroupProductCatalog({
  shareCode,
  tabId,
  participantId,
  orderType,
  onItemAdded,
}: Props): ReactElement {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  const collections = getCollectionsForOrderType(orderType);
  const orderTypeLabel = ORDER_TYPES.find((t) => t.value === orderType)?.label;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let url = '/api/v1/admin/products?limit=50&status=ACTIVE';
        if (collections.length > 0) {
          url += `&category=${encodeURIComponent(collections[0])}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        if (json.success) {
          // API returns { data: { products: [...], pagination, filters } }
          const productsArray = json.data?.products ?? json.data;
          setProducts(Array.isArray(productsArray) ? productsArray : []);
        }
      } catch {
        console.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);

  const filtered = search
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.productType || '').toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const handleAdd = async (product: CatalogProduct) => {
    const variant = (product.variants || [])[0];
    if (!variant) return;

    setAddingId(product.id);
    try {
      await addDraftItemV2(shareCode, tabId, {
        participantId,
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title !== 'Default' ? variant.title : undefined,
        price: Number(variant.price),
        imageUrl: product.images?.[0]?.url,
        quantity: 1,
      });
      onItemAdded();
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-v2-text uppercase tracking-wide">
          Browse Products
        </h3>
      </div>

      {orderTypeLabel && collections.length > 0 && (
        <div className="mb-3 text-xs text-v2-muted">
          Showing products for: <span className="font-medium text-v2-text">{orderTypeLabel}</span>
        </div>
      )}

      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-v2-border rounded-lg px-3 py-2 text-sm text-v2-text focus:ring-2 focus:ring-brand-blue"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-v2-muted text-center py-6">
          No products found.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
          {filtered.map((product) => {
            const variant = product.variants?.[0];
            const price = variant ? Number(variant.price) : Number(product.basePrice);
            const imgUrl = product.images?.[0]?.url;
            const isAdding = addingId === product.id;

            return (
              <div
                key={product.id}
                className="bg-v2-card border border-v2-border rounded-lg overflow-hidden hover:border-brand-blue/30 transition-colors v2-card-hover"
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={product.title}
                    className="w-full h-28 object-cover bg-gray-50"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-28 bg-gray-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-v2-text line-clamp-2 mb-1">
                    {product.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-v2-text">
                      ${price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={isAdding}
                      className="text-xs px-2.5 py-1 bg-brand-blue text-white rounded-md hover:bg-brand-blue/90 disabled:opacity-50 v2-btn-press"
                    >
                      {isAdding ? '...' : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
