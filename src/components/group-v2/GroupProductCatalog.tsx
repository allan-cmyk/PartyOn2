'use client';

import { useState, useEffect, ReactElement } from 'react';
import { addDraftItemV2 } from '@/lib/group-orders-v2/api-client';

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
  onItemAdded: () => void;
}

export default function GroupProductCatalog({
  shareCode,
  tabId,
  participantId,
  onItemAdded,
}: Props): ReactElement {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/v1/admin/products?limit=50&status=ACTIVE');
        const json = await res.json();
        if (json.success) {
          setProducts(json.data || []);
        }
      } catch {
        console.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = search
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.productType || '').toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const handleAdd = async (product: CatalogProduct) => {
    const variant = product.variants[0];
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
        imageUrl: product.images[0]?.url,
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
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Browse Products
        </h3>
      </div>

      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-gold-500"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No products found.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
          {filtered.map((product) => {
            const variant = product.variants[0];
            const price = variant ? Number(variant.price) : Number(product.basePrice);
            const imgUrl = product.images[0]?.url;
            const isAdding = addingId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
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
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                    {product.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      ${price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={isAdding}
                      className="text-xs px-2.5 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
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
