'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'FREE_SHIPPING';

interface UsageRecord {
  id: string;
  customerId: string | null;
  orderId: string;
  amountSaved: number;
  usedAt: string;
}

interface DiscountData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: DiscountType;
  value: number;
  appliesToAll: boolean;
  applicableProducts: string[];
  applicableCategories: string[];
  minOrderAmount: number | null;
  minQuantity: number | null;
  maxUsageCount: number | null;
  usagePerCustomer: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
  usageCount: number;
  totalDiscountGiven: number;
  usageHistory: UsageRecord[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Discount Page
 */
export default function EditDiscountPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [discount, setDiscount] = useState<DiscountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscount();
  }, [id]);

  const fetchDiscount = async () => {
    try {
      const response = await fetch(`/api/v1/admin/discounts/${id}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to load discount');
        return;
      }

      setDiscount(result.data);
    } catch (err) {
      setError('Failed to load discount');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setDiscount((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? value === '' ? null : parseFloat(value)
          : value,
      };
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discount) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        code: discount.code,
        name: discount.name,
        description: discount.description,
        type: discount.type,
        value: discount.value,
        minOrderAmount: discount.minOrderAmount,
        minQuantity: discount.minQuantity,
        maxUsageCount: discount.maxUsageCount,
        usagePerCustomer: discount.usagePerCustomer,
        buyQuantity: discount.buyQuantity,
        getQuantity: discount.getQuantity,
        startsAt: discount.startsAt,
        expiresAt: discount.expiresAt,
        isActive: discount.isActive,
      };

      const response = await fetch(`/api/v1/admin/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to update discount');
        return;
      }

      router.push('/admin/promotions');
    } catch (err) {
      setError('Failed to update discount. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      const response = await fetch(`/api/v1/admin/discounts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to delete discount');
        return;
      }

      router.push('/admin/promotions');
    } catch (err) {
      setError('Failed to delete discount');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
          <p className="text-red-700">{error || 'Discount not found'}</p>
          <Link href="/admin/promotions" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            &larr; Back to Promotions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Edit Discount</h1>
          <Link href="/admin/promotions" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Back to Promotions
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Basic Information</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={discount.code}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={discount.name}
                      onChange={handleChange}
                      required
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
                    value={discount.description || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Type & Value */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Discount Type</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      value={discount.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                    >
                      <option value="PERCENTAGE">Percentage Off</option>
                      <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                      <option value="BUY_X_GET_Y">Buy X Get Y Free</option>
                      <option value="FREE_SHIPPING">Free Shipping</option>
                    </select>
                  </div>

                  {discount.type !== 'FREE_SHIPPING' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type="number"
                        name="value"
                        value={discount.value}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Conditions & Limits</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      value={discount.minOrderAmount || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="No minimum"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      name="maxUsageCount"
                      value={discount.maxUsageCount || ''}
                      onChange={handleChange}
                      min="0"
                      placeholder="Unlimited"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={discount.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </form>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Times Used</span>
                  <span className="font-semibold text-black">{discount.usageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Saved</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(discount.totalDiscountGiven)}
                  </span>
                </div>
              </div>
            </div>

            {discount.usageHistory.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-3">Recent Usage</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {discount.usageHistory.slice(0, 10).map((usage) => (
                    <div key={usage.id} className="text-sm border-b border-gray-100 pb-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order</span>
                        <span className="font-mono text-xs">{usage.orderId.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saved</span>
                        <span className="text-green-600">{formatCurrency(usage.amountSaved)}</span>
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(usage.usedAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
