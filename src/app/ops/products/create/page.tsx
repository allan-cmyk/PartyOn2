'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FormData {
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string;
  basePrice: string;
  compareAtPrice: string;
  abv: string;
  metaTitle: string;
  metaDescription: string;
  status: 'DRAFT' | 'ACTIVE';
}

interface UploadedImage {
  url: string;
  file?: File;
  uploading?: boolean;
}

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    handle: '',
    description: '',
    vendor: '',
    productType: '',
    tags: '',
    basePrice: '',
    compareAtPrice: '',
    abv: '',
    metaTitle: '',
    metaDescription: '',
    status: 'DRAFT',
  });

  // Auto-generate handle from title
  const generateHandle = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData({
      ...formData,
      title: newTitle,
      handle: formData.handle || generateHandle(newTitle),
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    for (const file of Array.from(files)) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        setError('Invalid file type. Supported: JPEG, PNG, WebP, GIF');
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Max size: 5MB');
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { url: previewUrl, file, uploading: true }]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('position', images.length.toString());

        const response = await fetch('/api/v1/admin/products/images', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setImages((prev) =>
            prev.map((img) =>
              img.url === previewUrl ? { url: result.data.url, uploading: false } : img
            )
          );
        } else {
          setImages((prev) => prev.filter((img) => img.url !== previewUrl));
          setError(result.error || 'Failed to upload image');
        }
      } catch {
        setImages((prev) => prev.filter((img) => img.url !== previewUrl));
        setError('Failed to upload image');
      }
    }

    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          handle: formData.handle || generateHandle(formData.title),
          description: formData.description || null,
          vendor: formData.vendor || null,
          productType: formData.productType || null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          basePrice: parseFloat(formData.basePrice),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          abv: formData.abv ? parseFloat(formData.abv) : null,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
          status: formData.status,
          images: images.filter((img) => !img.uploading).map((img, idx) => ({
            url: img.url,
            position: idx,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/ops/products/${result.data.id}`);
      } else {
        setError(result.error || 'Failed to create product');
      }
    } catch {
      setError('Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/ops/products" className="text-blue-600 hover:underline">Products</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Create New Product</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-black">Create New Product</h1>
        <Link href="/ops/products" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Cancel
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter product title"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Handle (URL slug)</label>
              <div className="flex items-center">
                <span className="text-gray-400 mr-1">/products/</span>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  placeholder="product-handle"
                  className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-generated from title. Edit if needed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product..."
                rows={4}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">Product Images</h2>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                {img.url.startsWith('blob:') || img.url.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <Image src={img.url} alt={`Product ${idx + 1}`} fill className="object-cover" sizes="200px" />
                )}
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!img.uploading && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {idx === 0 && !img.uploading && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                    Main
                  </span>
                )}
              </div>
            ))}

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage ? (
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium">Add Image</span>
                </>
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          <p className="text-xs text-gray-500">
            Supported formats: JPEG, PNG, WebP, GIF. Max size: 5MB per image.
            First image will be used as the main product image.
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                placeholder="0.00"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compare At Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.compareAtPrice}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                placeholder="Original price (optional)"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Shows as crossed-out price if higher than sale price</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.abv}
                onChange={(e) => setFormData({ ...formData, abv: e.target.value })}
                placeholder="Alcohol by volume"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">Organization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Brand or manufacturer"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <input
                type="text"
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                placeholder="e.g., Wine, Whiskey, Vodka"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="red, premium, sale (comma separated)"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">Status</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="DRAFT"
                checked={formData.status === 'DRAFT'}
                onChange={() => setFormData({ ...formData, status: 'DRAFT' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Draft</span>
              <span className="text-xs text-gray-500">(Not visible to customers)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="ACTIVE"
                checked={formData.status === 'ACTIVE'}
                onChange={() => setFormData({ ...formData, status: 'ACTIVE' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700">Active</span>
              <span className="text-xs text-gray-500">(Published immediately)</span>
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-black mb-4">Search Engine Optimization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Page title for search engines"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Brief description for search results"
                rows={2}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href="/ops/products"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
