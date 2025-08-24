'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';

interface CartButtonProps {
  isScrolled?: boolean;
}

export default function CartButton({ isScrolled = true }: CartButtonProps) {
  const { cart, openCart } = useCartContext();
  const itemCount = cart?.totalQuantity || 0;

  return (
    <button
      onClick={openCart}
      className={`relative p-2 transition-colors rounded-full group ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
      aria-label={`Cart with ${itemCount} items`}
    >
      <svg className={`w-6 h-6 transition-colors ${isScrolled ? 'text-gray-700 group-hover:text-gold-600' : 'text-white/90 group-hover:text-gold-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      
      {/* Item Count Badge */}
      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-gold-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
        >
          {itemCount}
        </motion.span>
      )}
    </button>
  );
}