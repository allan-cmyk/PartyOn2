'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CollectionDetail {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  position: number;
  productCount: number;
  children: { id: string; handle: string; title: string; productCount: number }[];
}

interface CollectionProduct {
  id: string;
  handle: string;
  title: string;
  vendor: string | null;
  productType: string | null;
  basePrice: number;
  imageUrl: string | null;
  position: number;
}

interface AllProduct {
  id: string;
  title: string;
  productType: string | null;
  image: { url: string } | null;
  price: number;
}

export default function CollectionDetailPage(): ReactElement {
  const params = useParams();
  const id = params.id as string;

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [allProducts, setAllProducts] = useState<AllProduct[]>([]);
  const [addSearch, setAddSearch] = useState('');
  const [loadingAll, setLoadingAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    try {
      const [colRes, prodRes] = await Promise.all([
        fetch(`/api/v1/admin/collections/${id}`),
        fetch(`/api/v1/admin/collections/${id}/products?limit=100`),
      ]);
      const colJson = await colRes.json();
      const prodJson = await prodRes.json();
      if (colJson.collection) setCollection(colJson.collection);
      if (prodJson.products) setProducts(prodJson.products);
    } catch {
      console.error('Failed to fetch collection');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const fetchAllProducts = useCallback(async () => {
    setLoadingAll(true);
    try {
      const res = await fetch('/api/v1/admin/products?limit=100&status=ACTIVE');
      const json = await res.json();
      if (json.success) {
        const list = json.data?.products ?? json.data;
        setAllProducts(Array.isArray(list) ? list : []);
      }
    } catch {
      console.error('Failed to fetch all products');
    } finally {
      setLoadingAll(false);
    }
  }, []);

  const handleOpenAdd = () => {
    setShowAdd(true);
    setSelectedIds(new Set());
    setAddSearch('');
    fetchAllProducts();
  };

  const toggleSelect = (pid: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  const handleAddProducts = async () => {
    if (selectedIds.size === 0) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/v1/admin/collections/${id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setShowAdd(false);
        fetchCollection();
      }
    } catch {
      alert('Failed to add products');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await fetch(`/api/v1/admin/collections/${id}/products`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: [productId] }),
      });
      fetchCollection();
    } catch {
      alert('Failed to remove product');
    } finally {
      setRemovingId(null);
    }
  };

  // Filter available products (exclude already in collection)
  const existingIds = new Set(products.map((p) => p.id));
  const availableProducts = allProducts
    .filter((p) => !existingIds.has(p.id))
    .filter((p) =>
      !addSearch || p.title.toLowerCase().includes(addSearch.toLowerCase())
    );

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <p className="text-gray-600">Collection not found.</p>
        <Link href="/ops/collections" className="text-purple-600 hover:underline mt-2 inline-block">
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{collection.title}</h1>
            <p className="text-gray-500 mt-0.5">
              <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">{collection.handle}</code>
              {' '}&middot; {collection.productCount} products
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenAdd}
            className="group px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md shadow-purple-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Products
          </button>
          <Link
            href="/ops/collections"
            className="group px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>
      </div>

      {/* Add Products Modal */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Products to Collection</h2>
            <span className="text-sm text-purple-600 font-medium">{selectedIds.size} selected</span>
          </div>
          <input
            type="text"
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 mb-4"
          />
          {loadingAll ? (
            <div className="py-8 text-center text-gray-500">Loading products...</div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
              {availableProducts.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">No products available to add.</div>
              ) : (
                availableProducts.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    {p.image ? (
                      <img src={p.image.url} alt={p.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.productType || 'No type'} &middot; ${Number(p.price).toFixed(2)}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddProducts}
              disabled={adding || selectedIds.size === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all duration-200 shadow-md shadow-purple-200"
            >
              {adding ? 'Adding...' : `Add ${selectedIds.size} Product${selectedIds.size !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products in Collection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-700 text-xl font-semibold">No products in this collection</p>
            <p className="text-gray-500 mt-2">Click &quot;Add Products&quot; to assign products to this collection.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-purple-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        {p.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">{p.productType || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-900">${Number(p.basePrice).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemove(p.id)}
                      disabled={removingId === p.id}
                      className="px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {removingId === p.id ? '...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
