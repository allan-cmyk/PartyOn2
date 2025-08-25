'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShopifyProduct } from '@/lib/shopify/types';
import { formatPrice, getProductImageUrl, getFirstAvailableVariant, canPurchaseAlcohol } from '@/lib/shopify/utils';
import { useCart } from '@/lib/shopify/hooks/useCart';
import AgeVerificationModal from '../AgeVerificationModal';

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
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
    
    // Check if user needs age verification for alcohol products
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
    
    // Now add to cart
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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="bg-white border border-gray-200 hover:border-gold-600 transition-all duration-300 overflow-hidden">
        {/* Product Image - Clickable */}
        <Link href={`/products/${product.handle}`}>
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 cursor-pointer">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            )}
            
            {/* Out of Stock Overlay */}
            {!variant?.availableForSale && (
              <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                <span className="text-white font-light tracking-[0.2em] text-sm">OUT OF STOCK</span>
              </div>
            )}

            {/* Quick View on Hover */}
            <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/20 transition-colors duration-300 flex items-center justify-center">
              <span className="text-white font-light tracking-[0.15em] text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                QUICK VIEW
              </span>
            </div>
          </div>
        </Link>

        {/* Product Details */}
        <div className="p-6">
          {/* Vendor */}
          {product.vendor && (
            <p className="text-xs text-gray-500 tracking-[0.15em] mb-2">
              {product.vendor.toUpperCase()}
            </p>
          )}

          {/* Title - Clickable */}
          <Link href={`/products/${product.handle}`}>
            <h3 className="font-serif text-lg text-gray-900 mb-3 tracking-[0.05em] hover:text-gold-600 transition-colors cursor-pointer">
              {product.title}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline justify-between mb-4">
            <p className="font-light text-xl text-gray-900 tracking-[0.05em]">
              {formatPrice(price.amount, price.currencyCode)}
            </p>
            
            {/* Product Type Badge */}
            {product.productType && (
              <span className="text-xs text-gray-500 tracking-[0.1em]">
                {product.productType.toUpperCase()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Add to Cart Button - Always Visible */}
            <button
              onClick={handleAddToCart}
              disabled={!variant?.availableForSale || isAdding || cartLoading}
              className={`w-full py-2 transition-colors duration-300 text-xs tracking-[0.15em] ${
                variant?.availableForSale && !isAdding && !cartLoading
                  ? 'bg-gold-600 text-white hover:bg-gold-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAdding || cartLoading ? 'ADDING...' : !variant?.availableForSale ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>

            {/* View Details Button */}
            <Link href={`/products/${product.handle}`}>
              <button className="w-full py-2 border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-colors duration-300 text-xs tracking-[0.15em]">
                VIEW DETAILS
              </button>
            </Link>
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