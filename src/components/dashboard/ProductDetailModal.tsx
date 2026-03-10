'use client';

import { useState, useRef, type ReactElement } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types/product';

interface Props {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
  qty: number;
  busy: boolean;
  available: boolean;
  isLocked?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetQuantity?: (qty: number) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  qty,
  busy,
  available,
  isLocked,
  onIncrement,
  onDecrement,
  onSetQuantity,
}: Props): ReactElement {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const variant = product.variants.edges[0]?.node;
  const price = variant ? parseFloat(variant.price.amount) : 0;
  const variantTitle =
    variant && variant.title !== 'Default Title' && variant.title !== 'Default'
      ? variant.title
      : null;
  const images = product.images.edges.map((e) => e.node);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-lg font-heading font-bold tracking-[0.08em] text-gray-900 truncate pr-4">
            {product.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product image */}
        {images.length > 0 && (
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={images[0].url}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 500px"
            />
            {!available && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-base font-medium text-gray-500">Out of stock</span>
              </div>
            )}
          </div>
        )}

        {/* Product info */}
        <div className="px-6 py-4">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p className="text-xl font-bold text-gray-900">${price.toFixed(2)}</p>
              {variantTitle && (
                <p className="text-sm text-gray-500 mt-0.5">{variantTitle}</p>
              )}
            </div>
            {qty > 0 && (
              <span className="text-sm font-medium text-gray-500">{qty} in cart</span>
            )}
          </div>

          {/* Description */}
          {product.descriptionHtml ? (
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : product.description ? (
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          ) : null}
        </div>

        {/* Add to cart / qty controls */}
        {!isLocked && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl">
            {qty > 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-lg">
                  <button
                    onClick={onDecrement}
                    disabled={busy}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-l-lg transition-colors disabled:opacity-50"
                  >
                    {qty === 1 ? (
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ) : (
                      <span className="text-lg font-medium">-</span>
                    )}
                  </button>
                  {editing ? (
                    <input
                      ref={editInputRef}
                      type="number"
                      min="1"
                      step="1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        } else if (e.key === 'Escape') {
                          setEditing(false);
                        }
                      }}
                      onBlur={() => {
                        const val = parseInt(editValue, 10);
                        if (onSetQuantity) {
                          if (editValue === '' || val === 0) {
                            onSetQuantity(0);
                          } else if (!isNaN(val) && val !== qty) {
                            onSetQuantity(val);
                          }
                        }
                        setEditing(false);
                      }}
                      className="w-10 text-center text-base font-semibold text-gray-900 bg-white border border-brand-blue rounded outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (busy || !onSetQuantity) return;
                        setEditing(true);
                        setEditValue(String(qty));
                        setTimeout(() => editInputRef.current?.select(), 0);
                      }}
                      className={`w-10 text-center text-base font-semibold text-gray-900 ${onSetQuantity ? 'cursor-text hover:bg-gray-200 rounded transition-colors' : ''}`}
                    >
                      {busy ? (
                        <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        qty
                      )}
                    </button>
                  )}
                  <button
                    onClick={onIncrement}
                    disabled={busy}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-r-lg transition-colors disabled:opacity-50"
                  >
                    <span className="text-lg font-medium">+</span>
                  </button>
                </div>
                <span className="text-base font-semibold text-gray-900">
                  ${(price * qty).toFixed(2)}
                </span>
              </div>
            ) : (
              <button
                onClick={onAddToCart}
                disabled={busy || !available}
                className="w-full py-3 bg-brand-yellow text-gray-900 text-base font-semibold tracking-[0.08em] rounded-lg hover:bg-yellow-400 active:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <span className="inline-block w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'ADD TO CART'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
