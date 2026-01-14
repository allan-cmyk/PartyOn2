'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ProductVariant {
  id: string;
  sku: string | null;
  title: string;
  price: number;
  inventory: number;
  available: boolean;
}

interface ProductCategory {
  handle: string;
  title: string;
}

interface Product {
  id: string;
  handle: string;
  title: string;
  vendor: string | null;
  productType: string | null;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  price: number;
  compareAtPrice: number | null;
  image: { url: string; altText: string | null } | null;
  categories: ProductCategory[];
  variants: ProductVariant[];
  totalInventory: number;
  variantCount: number;
  createdAt: string;
}

interface Filters {
  vendors: string[];
  categories: { handle: string; title: string }[];
  statuses: string[];
}

interface ProductsData {
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
  filters: Filters;
}

/**
 * Admin Products Management Page
 */
export default function ProductsPage() {
  const [data, setData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [vendorFilter, setVendorFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (vendorFilter) params.set('vendor', vendorFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      params.set('page', page.toString());
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('limit', '20');

      const response = await fetch(`/api/v1/admin/products?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, vendorFilter, categoryFilter, page, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const updateProductStatus = async (productId: string, status: string) => {
    try {
      await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getInventoryColor = (inventory: number): string => {
    if (inventory === 0) return 'text-red-600';
    if (inventory < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Products</h1>
          <p className="text-gray-600 text-sm">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/sync"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sync from Shopify
        </Link>
      </div>

      {/* Filters Row */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Statuses</option>
            {data?.filters.statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Vendor Filter */}
          <select
            value={vendorFilter}
            onChange={(e) => { setVendorFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Vendors</option>
            {data?.filters.vendors.map((vendor) => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-black"
          >
            <option value="">All Categories</option>
            {data?.filters.categories.map((cat) => (
              <option key={cat.handle} value={cat.handle}>{cat.title}</option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="createdAt">Date Added</option>
            <option value="inventory">Inventory</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
          {data && (
            <span className="ml-auto text-sm text-gray-500">
              {data.pagination.total} product{data.pagination.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : data?.products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Inventory</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image.url}
                          alt={product.image.altText || product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium text-black hover:text-blue-600"
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {product.variantCount} variant{product.variantCount !== 1 ? 's' : ''}
                          {product.categories.length > 0 && (
                            <span> | {product.categories.map(c => c.title).join(', ')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-medium text-black">{formatCurrency(product.price)}</span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through block">
                        {formatCurrency(product.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`font-medium ${getInventoryColor(product.totalInventory)}`}>
                      {product.totalInventory}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-gray-600 text-sm">{product.vendor || '-'}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Edit
                      </Link>
                      {product.status === 'ACTIVE' ? (
                        <button
                          onClick={() => updateProductStatus(product.id, 'DRAFT')}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          Deactivate
                        </button>
                      ) : product.status === 'DRAFT' ? (
                        <button
                          onClick={() => updateProductStatus(product.id, 'ACTIVE')}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => updateProductStatus(product.id, 'DRAFT')}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(data.pagination.pages, page + 1))}
              disabled={page === data.pagination.pages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
