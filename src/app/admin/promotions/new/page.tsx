'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'FREE_SHIPPING';

interface FormData {
  code: string;
  name: string;
  description: string;
  type: DiscountType;
  value: string;
  minOrderAmount: string;
  minQuantity: string;
  maxUsageCount: string;
  usagePerCustomer: string;
  buyQuantity: string;
  getQuantity: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  combinable: boolean;
}

/**
 * Create New Discount Page
 */
export default function NewDiscountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    minQuantity: '',
    maxUsageCount: '',
    usagePerCustomer: '',
    buyQuantity: '',
    getQuantity: '',
    startsAt: new Date().toISOString().slice(0, 16),
    expiresAt: '',
    isActive: true,
    combinable: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
        maxUsageCount: formData.maxUsageCount ? parseInt(formData.maxUsageCount) : undefined,
        usagePerCustomer: formData.usagePerCustomer ? parseInt(formData.usagePerCustomer) : undefined,
        buyQuantity: formData.type === 'BUY_X_GET_Y' ? parseInt(formData.buyQuantity) : undefined,
        getQuantity: formData.type === 'BUY_X_GET_Y' ? parseInt(formData.getQuantity) : undefined,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        isActive: formData.isActive,
        combinable: formData.combinable,
      };

      const response = await fetch('/api/v1/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to create discount');
        return;
      }

      router.push('/admin/promotions');
    } catch {
      setError('Failed to create discount. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Create Discount</h1>
        <Link href="/admin/promotions" className="text-blue-600 hover:text-blue-800 text-sm">
          &larr; Back to Promotions
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="e.g., SAVE20"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Summer Sale"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Internal description for this discount"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Discount Type & Value */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Discount Type</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage Off</option>
                <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                <option value="BUY_X_GET_Y">Buy X Get Y Free</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>

            {formData.type !== 'FREE_SHIPPING' && formData.type !== 'BUY_X_GET_Y' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'PERCENTAGE' ? 'Percentage *' : 'Amount *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    required
                    min="0"
                    max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                    step="0.01"
                    placeholder={formData.type === 'PERCENTAGE' ? '10' : '20.00'}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {formData.type === 'PERCENTAGE' ? '%' : '$'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {formData.type === 'BUY_X_GET_Y' && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy Quantity *
                </label>
                <input
                  type="number"
                  name="buyQuantity"
                  value={formData.buyQuantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="2"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Get Quantity *
                </label>
                <input
                  type="number"
                  name="getQuantity"
                  value={formData.getQuantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="1"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value (100% = Free)
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="100"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Conditions</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  className="w-full pl-7 pr-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Items
              </label>
              <input
                type="number"
                name="minQuantity"
                value={formData.minQuantity}
                onChange={handleChange}
                min="0"
                placeholder="No minimum"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Usage Limits</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Uses Allowed
              </label>
              <input
                type="number"
                name="maxUsageCount"
                value={formData.maxUsageCount}
                onChange={handleChange}
                min="0"
                placeholder="Unlimited"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uses Per Customer
              </label>
              <input
                type="number"
                name="usagePerCustomer"
                value={formData.usagePerCustomer}
                onChange={handleChange}
                min="0"
                placeholder="Unlimited"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Validity Period */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Validity Period</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starts At
              </label>
              <input
                type="datetime-local"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (customers can use this code immediately)
              </span>
            </label>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="combinable"
                  checked={formData.combinable}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Can be combined with other discount codes
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                When enabled, customers can stack this code with other combinable codes (max 3 per order)
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Creating...' : 'Create Discount'}
          </button>
          <Link
            href="/admin/promotions"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
