'use client';

import { ReactElement, useState } from 'react';
import Image from 'next/image';
import { InventoryAdjustModal } from './InventoryAdjustModal';

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

interface InventoryTableProps {
  productId: string;
  variants: ProductVariant[];
  currencyCode?: string;
  editMode: boolean;
  onVariantUpdate: (variantId: string, updates: Partial<ProductVariant>) => void;
}

/**
 * Editable inventory table for product variants
 */
export function InventoryTable({
  productId,
  variants,
  currencyCode = 'USD',
  editMode,
  onVariantUpdate,
}: InventoryTableProps): ReactElement {
  const [adjustingVariant, setAdjustingVariant] = useState<{
    id: string;
    title: string;
    sku: string | null;
    currentQuantity: number;
  } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);

  const getInventoryColor = (qty: number): string => {
    if (qty === 0) return 'text-red-600 bg-red-50';
    if (qty < 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const handleToggle = async (
    variantId: string,
    field: 'trackInventory' | 'allowBackorder' | 'availableForSale',
    currentValue: boolean
  ) => {
    setSavingId(variantId);
    try {
      const response = await fetch(`/api/v1/admin/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      const result = await response.json();
      if (result.success) {
        onVariantUpdate(variantId, { [field]: !currentValue });
      }
    } catch (error) {
      console.error('Toggle error:', error);
    } finally {
      setSavingId(null);
    }
  };

  const handleInventoryAdjust = (variantId: string, newQuantity: number) => {
    onVariantUpdate(variantId, { inventory: newQuantity });
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Variant
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                SKU
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Inventory
              </th>
              {editMode && (
                <>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Track
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Backorder
                  </th>
                </>
              )}
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Available
              </th>
              {editMode && (
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {variants.map((variant) => (
              <tr key={variant.id} className="hover:bg-gray-50">
                {/* Variant Info */}
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
                          <span>
                            {variant.options.option1.name}: {variant.options.option1.value}
                          </span>
                        )}
                        {variant.options.option2 && (
                          <span>
                            | {variant.options.option2.name}: {variant.options.option2.value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="px-6 py-4">
                  <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {variant.sku || '-'}
                  </code>
                </td>

                {/* Price */}
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-black">{formatCurrency(variant.price)}</span>
                  {variant.compareAtPrice && (
                    <span className="text-xs text-gray-400 line-through block">
                      {formatCurrency(variant.compareAtPrice)}
                    </span>
                  )}
                </td>

                {/* Inventory */}
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getInventoryColor(variant.inventory)}`}
                  >
                    {variant.inventory}
                  </span>
                  {variant.inventoryByLocation?.length > 1 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {variant.inventoryByLocation.map((loc) => (
                        <div key={loc.location}>
                          {loc.location}: {loc.quantity}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                {/* Track Inventory Toggle */}
                {editMode && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(variant.id, 'trackInventory', variant.trackInventory)}
                      disabled={savingId === variant.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        variant.trackInventory ? 'bg-blue-600' : 'bg-gray-300'
                      } ${savingId === variant.id ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          variant.trackInventory ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                )}

                {/* Allow Backorder Toggle */}
                {editMode && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(variant.id, 'allowBackorder', variant.allowBackorder)}
                      disabled={savingId === variant.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        variant.allowBackorder ? 'bg-blue-600' : 'bg-gray-300'
                      } ${savingId === variant.id ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          variant.allowBackorder ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                )}

                {/* Available for Sale */}
                <td className="px-6 py-4 text-center">
                  {editMode ? (
                    <button
                      onClick={() =>
                        handleToggle(variant.id, 'availableForSale', variant.availableForSale)
                      }
                      disabled={savingId === variant.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        variant.availableForSale ? 'bg-green-600' : 'bg-gray-300'
                      } ${savingId === variant.id ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          variant.availableForSale ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : variant.availableForSale ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </td>

                {/* Actions */}
                {editMode && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        setAdjustingVariant({
                          id: variant.id,
                          title: variant.title,
                          sku: variant.sku,
                          currentQuantity: variant.inventory,
                        })
                      }
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Adjust
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inventory Adjust Modal */}
      <InventoryAdjustModal
        variant={adjustingVariant}
        productId={productId}
        isOpen={adjustingVariant !== null}
        onClose={() => setAdjustingVariant(null)}
        onSave={handleInventoryAdjust}
      />
    </>
  );
}
