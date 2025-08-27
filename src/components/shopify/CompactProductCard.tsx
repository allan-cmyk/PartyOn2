'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShopifyProduct } from '@/lib/shopify/types';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant, canPurchaseAlcohol } from '@/lib/shopify/utils';
import { useCart } from '@/lib/shopify/hooks/useCart';
import AgeVerificationModal from '../AgeVerificationModal';

interface CompactProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export default function CompactProductCard({ product, index = 0 }: CompactProductCardProps) {
  const { addToCart, loading: cartLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const imageUrl = getProductImageUrl(product);
  const variant = getFirstAvailableVariant(product);
  const price = product.priceRange.minVariantPrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!variant?.id || !variant.availableForSale) return;
    
    if (!canPurchaseAlcohol()) {
      setShowAgeVerification(true);
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart(variant.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAgeVerified = async () => {
    setShowAgeVerification(false);
    localStorage.setItem('age_verified', 'true');
    
    if (variant?.id && variant.availableForSale) {
      setIsAdding(true);
      try {
        await addToCart(variant.id, 1);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <div className="bg-white border border-gray-200 hover:border-gold-600 transition-all duration-200 overflow-hidden">
        {/* Compact Image - Square aspect ratio */}
        <Link href={`/products/${product.handle}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                  />
                </svg>
              </div>
            )}
            
            {/* Out of Stock Overlay */}
            {!variant?.availableForSale && (
              <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                <span className="text-white font-light tracking-[0.1em] text-xs">SOLD OUT</span>
              </div>
            )}

            {/* Quick Add Button on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleAddToCart}
                disabled={!variant?.availableForSale || isAdding || cartLoading}
                className="absolute bottom-3 left-3 right-3 py-2 bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white text-xs font-medium tracking-[0.1em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding || cartLoading ? 'ADDING...' : 'QUICK ADD'}
              </button>
            </div>
          </div>
        </Link>

        {/* Compact Product Details */}
        <div className="p-3">
          {/* Title - Smaller and truncated */}
          <Link href={`/products/${product.handle}`}>
            <h3 className="font-serif text-sm text-gray-900 mb-1 line-clamp-2 hover:text-gold-600 transition-colors cursor-pointer">
              {product.title}
            </h3>
          </Link>

          {/* Vendor - Very small */}
          {product.vendor && (
            <p className="text-xs text-gray-500 mb-2">
              {product.vendor}
            </p>
          )}

          {/* Price and Cart Button Row */}
          <div className="flex items-center justify-between">
            <p className="font-medium text-base text-gray-900">
              {formatPrice(price.amount, price.currencyCode)}
            </p>
            
            {/* Compact Cart Icon Button */}
            <button
              onClick={handleAddToCart}
              disabled={!variant?.availableForSale || isAdding || cartLoading}
              className={`p-1.5 rounded transition-colors ${
                variant?.availableForSale && !isAdding && !cartLoading
                  ? 'bg-gold-600 text-white hover:bg-gold-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Add to cart"
            >
              {isAdding || cartLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Age Verification Modal */}
      <AgeVerificationModal
        isOpen={showAgeVerification}
        onClose={() => setShowAgeVerification(false)}
        onVerify={handleAgeVerified}
      />
    </motion.div>
  );
}