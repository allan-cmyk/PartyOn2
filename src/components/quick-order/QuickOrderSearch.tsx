/**
 * @fileoverview Search bar for quick order page with inline results
 * @module components/quick-order/QuickOrderSearch
 */

'use client';

import { useState, useEffect, useRef, type ReactElement } from 'react';
import { ShopifyProduct } from '@/lib/shopify/types';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant } from '@/lib/shopify/utils';
import { useCartContext } from '@/contexts/CartContext';

interface QuickOrderSearchProps {
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Callback when a result is clicked (for closing overlay) */
  onResultClick?: () => void;
}

/**
 * Search bar with dropdown results and quick-add functionality
 * Designed for mobile-first quick ordering experience
 */
export default function QuickOrderSearch({
  autoFocus = false,
  onResultClick,
}: QuickOrderSearchProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCartContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products with debounce
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(searchTerm)}&first=8`
        );
        const data = await response.json();
        const products = data.products?.edges?.map(
          (edge: { node: ShopifyProduct }) => edge.node
        ) || [];
        setResults(products);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleQuickAdd = async (product: ShopifyProduct) => {
    const variant = getFirstAvailableVariant(product);
    if (!variant) return;

    setAddingId(product.id);
    try {
      await addToCart(variant.id, 1);
      // Call callback after successful add (e.g., to close overlay)
      onResultClick?.();
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setAddingId(null);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products..."
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-0 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.map((product) => {
                const variant = getFirstAvailableVariant(product);
                const isAdding = addingId === product.id;

                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50"
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images.edges.length > 0 ? (
                        <img
                          src={getProductImageUrl(product, 100)}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-sm text-green-600 font-semibold">
                        {formatPrice(
                          product.priceRange.minVariantPrice.amount,
                          product.priceRange.minVariantPrice.currencyCode
                        )}
                      </p>
                    </div>

                    {/* Quick Add Button */}
                    {variant && (
                      <button
                        onClick={() => handleQuickAdd(product)}
                        disabled={isAdding}
                        className="flex-shrink-0 w-8 h-8 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        {isAdding ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No products found for &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
