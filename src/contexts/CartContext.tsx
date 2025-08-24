'use client';

import React, { createContext, useContext, useState } from 'react';
import { useCart } from '@/lib/shopify/hooks/useCart';
import { ShopifyCart } from '@/lib/shopify/types';

interface CartContextType extends ReturnType<typeof useCart> {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartHook = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const checkAgeVerification = () => {
    const ageVerified = localStorage.getItem('ageVerified');
    return ageVerified === 'true';
  };

  const openCart = () => {
    if (!checkAgeVerification()) {
      // Reload the page to show age verification modal
      localStorage.removeItem('ageVerified');
      window.location.reload();
      return;
    }
    setIsCartOpen(true);
  };

  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => {
    if (!checkAgeVerification()) {
      localStorage.removeItem('ageVerified');
      window.location.reload();
      return;
    }
    setIsCartOpen(prev => !prev);
  };

  // Override addToCart to check age verification
  const addToCart = async (variantId: string, quantity: number = 1): Promise<ShopifyCart> => {
    console.log('CartContext addToCart called with:', { variantId, quantity, variantIdType: typeof variantId });
    
    if (!checkAgeVerification()) {
      localStorage.removeItem('ageVerified');
      window.location.reload();
      throw new Error('Age verification required');
    }
    return cartHook.addToCart(variantId, quantity);
  };

  const value: CartContextType = {
    ...cartHook,
    addToCart,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};