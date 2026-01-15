'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  position: number;
}

interface VariantInventory {
  location: string;
  quantity: number;
}

interface ProductVariant {
  id: string;
  sku: string | null;
  title: string;
  price: number;
  compareAtPrice: number | null;
  options: {
    option1: { name: string; value: string } | null;
    option2: { name: string; value: string } | null;
    option3: { name: string; value: string } | null;
  };
  inventory: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  availableForSale: boolean;
  weight: number | null;
  weightUnit: string | null;
  image: { url: string; altText: string | null } | null;
  inventoryByLocation: VariantInventory[];
}

interface ProductCategory {
  id: string;
  handle: string;
  title: string;
}

interface ProductData {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  descriptionHtml: string | null;
  vendor: string | null;
  productType: string | null;
  tags: string[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  basePrice: number;
  compareAtPrice: number | null;
  currencyCode: string;
  metaTitle: string | null;
  metaDescription: string | null;
  abv: number | null;
  shopifyId: string | null;
  shopifySyncedAt: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: ProductCategory[];
  totalInventory: number;
  stats: {
    totalSold: number;
    orderCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/v1/admin/products/${id}`);
        const result = await response.json();
        if (result.success) {
          setProduct(result.data);
        } else {
          setError(result.error || 'Failed to load product');
        }
      } catch {
        setError('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!product) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        setProduct({ ...product, status: newStatus as ProductData['status'] });
      }
    } catch {
      console.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product?.currencyCode || 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-300',
      DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getInventoryColor = (qty: number): string => {
    if (qty === 0) return 'text-red-600 bg-red-50';
    if (qty < 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Product</h2>
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link
            href="/ops/products"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = product.images[selectedImage] || product.images[0];

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/ops/products" className="text-blue-600 hover:underline">
          Products
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">{product.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(product.status)}`}>
              {product.status}
            </span>
            {product.vendor && (
              <span className="text-gray-500">by {product.vendor}</span>
            )}
            {product.productType && (
              <span className="text-gray-400">| {product.productType}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {product.status === 'ACTIVE' ? (
            <button
              onClick={() => updateStatus('DRAFT')}
              disabled={saving}
              className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Deactivate'}
            </button>
          ) : (
            <button
              onClick={() => updateStatus('ACTIVE')}
              disabled={saving}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Activate'}
            </button>
          )}
          <Link
            href="/ops/products"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">Images ({product.images.length})</h2>

          {product.images.length > 0 ? (
            <>
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={mainImage.url}
                  alt={mainImage.altText || product.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Thumbnail Strip */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                        selectedImage === idx ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || `Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No images</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-black mb-4">Pricing</h2>
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-black">
                {formatCurrency(product.basePrice)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
            {product.abv !== null && (
              <p className="text-sm text-gray-500 mt-2">ABV: {product.abv}%</p>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-black mb-4">Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{product.totalInventory}</p>
                <p className="text-xs text-gray-600">In Stock</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{product.stats.totalSold}</p>
                <p className="text-xs text-gray-600">Units Sold</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{product.stats.orderCount}</p>
                <p className="text-xs text-gray-600">Orders</p>
              </div>
            </div>
          </div>

          {/* Categories & Tags */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-black mb-4">Organization</h2>
            {product.categories.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {cat.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.categories.length === 0 && product.tags.length === 0 && (
              <p className="text-gray-400 text-sm">No categories or tags</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.descriptionHtml && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-black mb-4">Description</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </div>
      )}

      {/* Variants Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-black">Variants ({product.variants.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Variant</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Inventory</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {product.variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {variant.image && (
                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={variant.image.url}
                            alt={variant.image.altText || variant.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-black">{variant.title}</p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          {variant.options.option1 && (
                            <span>{variant.options.option1.name}: {variant.options.option1.value}</span>
                          )}
                          {variant.options.option2 && (
                            <span>| {variant.options.option2.name}: {variant.options.option2.value}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {variant.sku || '-'}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-black">{formatCurrency(variant.price)}</span>
                    {variant.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through block">
                        {formatCurrency(variant.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getInventoryColor(variant.inventory)}`}>
                      {variant.inventory}
                    </span>
                    {variant.inventoryByLocation.length > 1 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {variant.inventoryByLocation.map((loc) => (
                          <div key={loc.location}>{loc.location}: {loc.quantity}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {variant.availableForSale ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SEO */}
        {(product.metaTitle || product.metaDescription) && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-black mb-4">SEO</h2>
            {product.metaTitle && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Meta Title</p>
                <p className="text-gray-800">{product.metaTitle}</p>
              </div>
            )}
            {product.metaDescription && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Meta Description</p>
                <p className="text-gray-600 text-sm">{product.metaDescription}</p>
              </div>
            )}
          </div>
        )}

        {/* System Info */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">System Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Product ID</span>
              <code className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">{product.id}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Handle</span>
              <code className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">{product.handle}</code>
            </div>
            {product.shopifyId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Shopify ID</span>
                <code className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">{product.shopifyId}</code>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-700">{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Updated</span>
              <span className="text-gray-700">{new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
            {product.shopifySyncedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Last Synced</span>
                <span className="text-gray-700">{new Date(product.shopifySyncedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
