'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export interface BundleComponentData {
  componentProductId: string;
  componentProductTitle: string;
  componentProductHandle: string;
  componentProductImage: string | null;
  componentVariantId: string | null;
  componentVariantTitle: string | null;
  quantity: number;
}

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  image: { url: string } | null;
  isBundle: boolean;
  variants: Array<{
    id: string;
    title: string;
    sku: string | null;
  }>;
}

interface BundleComponentPickerProps {
  isBundle: boolean;
  onIsBundleChange: (isBundle: boolean) => void;
  components: BundleComponentData[];
  onComponentsChange: (components: BundleComponentData[]) => void;
  currentProductId?: string;
  disabled?: boolean;
}

export function BundleComponentPicker({
  isBundle,
  onIsBundleChange,
  components,
  onComponentsChange,
  currentProductId,
  disabled,
}: BundleComponentPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/v1/admin/products?search=${encodeURIComponent(query)}&limit=10&status=ACTIVE`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(
          data.data.products
            .filter((p: SearchResult) => p.id !== currentProductId && !p.isBundle)
            .map((p: { id: string; title: string; handle: string; image: { url: string } | null; isBundle: boolean; variants: Array<{ id: string; title: string; sku: string | null }> }) => ({
              id: p.id,
              title: p.title,
              handle: p.handle,
              image: p.image,
              isBundle: p.isBundle,
              variants: p.variants,
            }))
        );
        setShowDropdown(true);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(value), 300);
  };

  const addComponent = (product: SearchResult) => {
    // Prevent duplicates
    if (components.some((c) => c.componentProductId === product.id)) return;

    const defaultVariant = product.variants.length === 1 ? product.variants[0] : null;

    onComponentsChange([
      ...components,
      {
        componentProductId: product.id,
        componentProductTitle: product.title,
        componentProductHandle: product.handle,
        componentProductImage: product.image?.url || null,
        componentVariantId: defaultVariant?.id || null,
        componentVariantTitle: defaultVariant?.title || null,
        quantity: 1,
      },
    ]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeComponent = (productId: string) => {
    onComponentsChange(components.filter((c) => c.componentProductId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    onComponentsChange(
      components.map((c) => (c.componentProductId === productId ? { ...c, quantity } : c))
    );
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <h2 className="font-semibold text-black mb-4">Product Bundle</h2>

      {/* Toggle */}
      <label className="flex items-center gap-3 cursor-pointer mb-4">
        <div className="relative">
          <input
            type="checkbox"
            checked={isBundle}
            onChange={(e) => onIsBundleChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${isBundle ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isBundle ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-gray-700 font-medium">This is a product bundle</span>
      </label>

      {isBundle && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Add component products that make up this bundle. Inventory will be tracked through the component products.
          </p>

          {/* Search input */}
          <div ref={searchRef} className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for products to add..."
              disabled={disabled}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            {searching && (
              <div className="absolute right-3 top-2.5">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Dropdown results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((product) => {
                  const alreadyAdded = components.some((c) => c.componentProductId === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => !alreadyAdded && addComponent(product)}
                      disabled={alreadyAdded}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 ${alreadyAdded ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image src={product.image.url} alt={product.title} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.handle}</p>
                      </div>
                      {alreadyAdded && <span className="text-xs text-gray-400">Added</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected components */}
          {components.length > 0 ? (
            <div className="space-y-2">
              {components.map((comp) => (
                <div
                  key={comp.componentProductId}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {comp.componentProductImage ? (
                      <Image src={comp.componentProductImage} alt={comp.componentProductTitle} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{comp.componentProductTitle}</p>
                    {comp.componentVariantTitle && comp.componentVariantTitle !== 'Default' && (
                      <p className="text-xs text-gray-500">{comp.componentVariantTitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Qty:</label>
                    <input
                      type="number"
                      min={1}
                      value={comp.quantity}
                      onChange={(e) => updateQuantity(comp.componentProductId, parseInt(e.target.value) || 1)}
                      disabled={disabled}
                      className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeComponent(comp.componentProductId)}
                    disabled={disabled}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm">No components added yet.</p>
              <p className="text-xs mt-1">Search above to add products to this bundle.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
