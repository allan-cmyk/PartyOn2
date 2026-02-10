'use client';

import { ReactElement, useState, useEffect } from 'react';

type AdjustmentType = 'add' | 'remove' | 'set';

interface VariantData {
  id: string;
  title: string;
  sku: string | null;
  currentQuantity: number;
}

interface InventoryAdjustModalProps {
  variant: VariantData | null;
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (variantId: string, newQuantity: number) => void;
}

/**
 * Modal for adjusting inventory quantity (add, remove, or set)
 */
export function InventoryAdjustModal({
  variant,
  productId,
  isOpen,
  onClose,
  onSave,
}: InventoryAdjustModalProps): ReactElement | null {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('add');
  const [value, setValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (variant) {
      setValue('');
      setAdjustmentType('add');
      setError(null);
    }
  }, [variant]);

  if (!isOpen || !variant) return null;

  const calculateNewQuantity = (): number => {
    const numValue = parseInt(value) || 0;
    switch (adjustmentType) {
      case 'add':
        return variant.currentQuantity + numValue;
      case 'remove':
        return Math.max(0, variant.currentQuantity - numValue);
      case 'set':
        return Math.max(0, numValue);
      default:
        return variant.currentQuantity;
    }
  };

  const newQuantity = calculateNewQuantity();
  const difference = newQuantity - variant.currentQuantity;

  const handleSave = async () => {
    if (!value || parseInt(value) < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/admin/products/${productId}/variants/${variant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryAdjustment: {
            type: adjustmentType,
            value: parseInt(value),
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update inventory');
      }

      onSave(variant.id, result.data.inventoryQuantity);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Adjust Inventory</h3>
          <p className="text-sm text-gray-500 mt-1">
            {variant.title}{variant.sku && ` (${variant.sku})`}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current Quantity */}
          <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <span className="text-gray-600">Current Quantity</span>
            <span className="text-2xl font-bold text-gray-900">{variant.currentQuantity}</span>
          </div>

          {/* Adjustment Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  adjustmentType === 'add'
                    ? 'bg-green-100 text-green-800 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('remove')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  adjustmentType === 'remove'
                    ? 'bg-red-100 text-red-800 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('set')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  adjustmentType === 'set'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Set To
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {adjustmentType === 'add' && 'Quantity to Add'}
              {adjustmentType === 'remove' && 'Quantity to Remove'}
              {adjustmentType === 'set' && 'New Quantity'}
            </label>
            <input
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter quantity"
              autoFocus
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center font-medium"
            />
          </div>

          {/* Preview */}
          {value && parseInt(value) >= 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">New Quantity</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-900">{newQuantity}</span>
                  {difference !== 0 && (
                    <span className={`ml-2 text-sm font-medium ${
                      difference > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({difference > 0 ? '+' : ''}{difference})
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !value || parseInt(value) < 0}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
