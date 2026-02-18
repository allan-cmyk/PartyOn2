'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProfitDisplay } from '@/components/ops/products/ProfitDisplay';
import { ImageManager } from '@/components/ops/products/ImageManager';
import { InventoryTable } from '@/components/ops/products/InventoryTable';
import { BundleComponentPicker, type BundleComponentData } from '@/components/ops/products/BundleComponentPicker';

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  position: number;
}

interface VariantInventory {
  id: string;
  locationId: string;
  location: string;
  quantity: number;
  costPerUnit: number | null;
}

interface ProductVariant {
  id: string;
  sku: string | null;
  title: string;
  price: number;
  compareAtPrice: number | null;
  costPerUnit: number | null;
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

interface ProductBundleComponent {
  id: string;
  componentProductId: string;
  componentProductTitle: string;
  componentProductHandle: string;
  componentProductImage: string | null;
  componentVariantId: string | null;
  componentVariantTitle: string | null;
  componentVariantSku: string | null;
  quantity: number;
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
  isBundle: boolean;
  bundleComponents: ProductBundleComponent[];
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
  costPerUnit: number | null;
  stats: {
    totalSold: number;
    orderCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string;
  basePrice: string;
  compareAtPrice: string;
  costPerUnit: string;
  abv: string;
  metaTitle: string;
  metaDescription: string;
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
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editIsBundle, setEditIsBundle] = useState(false);
  const [editBundleComponents, setEditBundleComponents] = useState<BundleComponentData[]>([]);
  const [formData, setFormData] = useState<EditFormData>({
    title: '', handle: '', description: '', vendor: '', productType: '',
    tags: '', basePrice: '', compareAtPrice: '', costPerUnit: '', abv: '', metaTitle: '', metaDescription: ''
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchProduct() {
    try {
      const response = await fetch(`/api/v1/admin/products/${id}`);
      const result = await response.json();
      if (result.success) {
        setProduct(result.data);
        initFormData(result.data);
      } else {
        setError(result.error || 'Failed to load product');
      }
    } catch {
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }

  function initFormData(p: ProductData) {
    setFormData({
      title: p.title,
      handle: p.handle,
      description: p.description || '',
      vendor: p.vendor || '',
      productType: p.productType || '',
      tags: p.tags.join(', '),
      basePrice: p.basePrice.toString(),
      compareAtPrice: p.compareAtPrice?.toString() || '',
      costPerUnit: p.costPerUnit?.toString() || '',
      abv: p.abv?.toString() || '',
      metaTitle: p.metaTitle || '',
      metaDescription: p.metaDescription || '',
    });
    setEditIsBundle(p.isBundle);
    setEditBundleComponents(
      (p.bundleComponents || []).map((bc) => ({
        componentProductId: bc.componentProductId,
        componentProductTitle: bc.componentProductTitle,
        componentProductHandle: bc.componentProductHandle,
        componentProductImage: bc.componentProductImage,
        componentVariantId: bc.componentVariantId,
        componentVariantTitle: bc.componentVariantTitle,
        quantity: bc.quantity,
      }))
    );
  }

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          handle: formData.handle,
          description: formData.description || null,
          vendor: formData.vendor || null,
          productType: formData.productType || null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          basePrice: parseFloat(formData.basePrice) || 0,
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : null,
          abv: formData.abv ? parseFloat(formData.abv) : null,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
          isBundle: editIsBundle,
          bundleComponents: editIsBundle ? editBundleComponents.map((c) => ({
            componentProductId: c.componentProductId,
            componentVariantId: c.componentVariantId,
            quantity: c.quantity,
          })) : [],
        }),
      });
      const result = await response.json();
      if (result.success) {
        // Refetch full product data to get updated costPerUnit
        await fetchProduct();
        setEditMode(false);
        setToast({ message: 'Product saved successfully', type: 'success' });
      } else {
        setToast({ message: result.error || 'Failed to save', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to save product', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (product) initFormData(product);
    setEditMode(false);
  };

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
        setToast({ message: `Product ${newStatus.toLowerCase()}`, type: 'success' });
      }
    } catch {
      setToast({ message: 'Failed to update status', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (permanent: boolean) => {
    setDeleting(true);
    try {
      const url = permanent ? `/api/v1/admin/products/${id}?permanent=true` : `/api/v1/admin/products/${id}`;
      const response = await fetch(url, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        window.location.href = '/ops/products';
      } else {
        setToast({ message: result.error || 'Failed to delete', type: 'error' });
        setShowDeleteModal(false);
      }
    } catch {
      setToast({ message: 'Failed to delete product', type: 'error' });
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
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

  const handleImagesChange = (updatedImages: Array<{
    id: string;
    url: string;
    altText: string | null;
    position: number;
    width?: number | null;
    height?: number | null;
  }>) => {
    if (!product) return;
    // Map to full ProductImage type with defaults for width/height
    const images: ProductImage[] = updatedImages.map(img => ({
      ...img,
      width: img.width ?? null,
      height: img.height ?? null,
    }));
    setProduct({ ...product, images });
  };

  const handleVariantUpdate = (variantId: string, updates: Partial<ProductVariant>) => {
    if (!product) return;
    const updatedVariants = product.variants.map((v) =>
      v.id === variantId ? { ...v, ...updates } : v
    );
    const newTotalInventory = updatedVariants.reduce((sum, v) => sum + v.inventory, 0);
    setProduct({ ...product, variants: updatedVariants, totalInventory: newTotalInventory });
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
          <Link href="/ops/products" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = product.images[selectedImage] || product.images[0];

  return (
    <div className="p-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-black mb-2">Delete Product?</h3>
            <p className="text-gray-600 mb-4">
              {product.stats.orderCount > 0
                ? `This product has ${product.stats.orderCount} orders. It will be archived instead of permanently deleted.`
                : 'This will permanently delete the product. This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(product.stats.orderCount === 0)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : product.stats.orderCount > 0 ? 'Archive' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/ops/products" className="text-blue-600 hover:underline">Products</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          {editMode ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-2xl font-bold text-black mb-2 w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Product title"
            />
          ) : (
            <h1 className="text-2xl font-bold text-black mb-2">{product.title}</h1>
          )}
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(product.status)}`}>
              {product.status}
            </span>
            {product.isBundle && (
              <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full border bg-purple-100 text-purple-800 border-purple-300">
                Bundle
              </span>
            )}
            {!editMode && product.vendor && <span className="text-gray-500">by {product.vendor}</span>}
            {!editMode && product.productType && <span className="text-gray-400">| {product.productType}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              {product.status === 'ACTIVE' ? (
                <button onClick={() => updateStatus('DRAFT')} disabled={saving}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Deactivate'}
                </button>
              ) : product.status === 'ARCHIVED' ? (
                <button onClick={() => updateStatus('ACTIVE')} disabled={saving}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Restore'}
                </button>
              ) : (
                <button onClick={() => updateStatus('ACTIVE')} disabled={saving}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Activate'}
                </button>
              )}
              <button onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                Delete
              </button>
              <Link href="/ops/products" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Back
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">Images ({product.images.length})</h2>
          {editMode ? (
            <ImageManager
              productId={product.id}
              images={product.images}
              onImagesChange={handleImagesChange}
              disabled={saving}
            />
          ) : product.images.length > 0 ? (
            <>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image src={mainImage.url} alt={mainImage.altText || product.title} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button key={img.id} onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-blue-500' : 'border-gray-200'}`}>
                      <Image src={img.url} alt={img.altText || `Image ${idx + 1}`} fill className="object-cover" sizes="80px" />
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
            {editMode ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Price ($)</label>
                  <input type="number" step="0.01" value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Compare At ($)</label>
                  <input type="number" step="0.01" value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="Original price"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Cost ($)</label>
                  <input type="number" step="0.01" value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                    placeholder="Your cost per unit"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">ABV (%)</label>
                  <input type="number" step="0.1" value={formData.abv}
                    onChange={(e) => setFormData({ ...formData, abv: e.target.value })}
                    placeholder="Alcohol by volume"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-black">{formatCurrency(product.basePrice)}</span>
                  {product.compareAtPrice && (
                    <span className="text-xl text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
                  )}
                </div>
                {product.abv !== null && <p className="text-sm text-gray-500 mt-2">ABV: {product.abv}%</p>}
                <ProfitDisplay
                  price={product.basePrice}
                  cost={product.costPerUnit}
                  compareAtPrice={product.compareAtPrice}
                  currencyCode={product.currencyCode}
                />
              </>
            )}
          </div>

          {/* Details */}
          {editMode && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-black mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Handle (URL slug)</label>
                  <input type="text" value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Vendor</label>
                    <input type="text" value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Product Type</label>
                    <input type="text" value={formData.productType}
                      onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tags (comma separated)</label>
                  <input type="text" value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="wine, red, premium"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
          )}

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

          {/* Categories & Tags (view mode only) */}
          {!editMode && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-black mb-4">Organization</h2>
              {product.categories.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((cat) => (
                      <span key={cat.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{cat.title}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.categories.length === 0 && product.tags.length === 0 && (
                <p className="text-gray-400 text-sm">No categories or tags</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bundle Components */}
      {editMode ? (
        <div className="mb-8">
          <BundleComponentPicker
            isBundle={editIsBundle}
            onIsBundleChange={setEditIsBundle}
            components={editBundleComponents}
            onComponentsChange={setEditBundleComponents}
            currentProductId={product.id}
            disabled={saving}
          />
        </div>
      ) : product.isBundle && product.bundleComponents.length > 0 ? (
        <div className="bg-white border-2 border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-black mb-4">Bundle Components ({product.bundleComponents.length})</h2>
          <div className="space-y-2">
            {product.bundleComponents.map((bc) => (
              <div key={bc.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {bc.componentProductImage ? (
                    <Image src={bc.componentProductImage} alt={bc.componentProductTitle} width={40} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/ops/products/${bc.componentProductId}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">
                    {bc.componentProductTitle}
                  </Link>
                  {bc.componentVariantTitle && bc.componentVariantTitle !== 'Default' && (
                    <p className="text-xs text-gray-500">{bc.componentVariantTitle}</p>
                  )}
                </div>
                <span className="text-sm text-gray-600 font-medium">x{bc.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Description */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="font-semibold text-black mb-4">Description</h2>
        {editMode ? (
          <textarea value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            placeholder="Product description..."
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
        ) : product.descriptionHtml ? (
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        ) : product.description ? (
          <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
        ) : (
          <p className="text-gray-400">No description</p>
        )}
      </div>

      {/* Variants Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-black">Variants ({product.variants.length})</h2>
        </div>
        <InventoryTable
          productId={product.id}
          variants={product.variants}
          currencyCode={product.currencyCode}
          editMode={editMode}
          onVariantUpdate={handleVariantUpdate}
        />
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SEO */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">SEO</h2>
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Meta Title</label>
                <input type="text" value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="Page title for search engines"
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Meta Description</label>
                <textarea value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  placeholder="Brief description for search results"
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          ) : (
            <>
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
              {!product.metaTitle && !product.metaDescription && (
                <p className="text-gray-400 text-sm">No SEO metadata</p>
              )}
            </>
          )}
        </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
