'use client';

import React, { createContext, useContext, useState, ReactElement } from 'react';
import { useCart as useShopifyCart } from '@/lib/shopify/hooks/useCart';
import { useCustomCart } from '@/lib/cart/hooks/useCustomCart';
import { ShopifyCart } from '@/lib/shopify/types';
import { trackMetaEvent } from '@/components/MetaPixel';
import { trackCartAction, trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/track';
import { completePendingGroupOrderJoin } from '@/lib/group-orders/hooks';

// Feature flag - set to true to use custom cart instead of Shopify
const USE_CUSTOM_CART = process.env.NEXT_PUBLIC_USE_CUSTOM_CART === 'true';

interface CustomCartData {
  discountCode?: string | null;
  discountAmount?: string | number;
  subtotal?: string | number;
  total?: string | number;
}

interface CartContextType {
  cart: ShopifyCart | null;
  customCartData: CustomCartData | null;  // Direct access to custom cart discount data
  loading: boolean;
  error: Error | null;
  addToCart: (variantId: string, quantity?: number) => Promise<ShopifyCart>;
  createCartWithItems: (items: Array<{ merchandiseId: string; quantity: number }>) => Promise<ShopifyCart | null | undefined>;
  updateCartItem: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  clearCart: () => void | Promise<void>;
  updateCartAttributes: (attributes: Array<{ key: string; value: string }>) => Promise<ShopifyCart | undefined>;
  refetchCart: () => Promise<void>;  // Allow manual refetch after discount applied
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isCustomCart: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }): ReactElement {
  // Use either custom cart or Shopify cart based on feature flag
  const shopifyCartHook = useShopifyCart();
  const customCartHook = useCustomCart();

  // Select which cart hook to use
  const cartHook = USE_CUSTOM_CART ? customCartHook : shopifyCartHook;

  const [isCartOpen, setIsCartOpen] = useState(false);

  const checkAgeVerification = (): boolean => {
    // Check both possible keys for backwards compatibility
    const ageVerified = localStorage.getItem('age_verified') || localStorage.getItem('ageVerified');
    return ageVerified === 'true';
  };

  const openCart = (): void => {
    if (!checkAgeVerification()) {
      // Reload the page to show age verification modal
      localStorage.removeItem('age_verified');
      localStorage.removeItem('ageVerified');
      window.location.reload();
      return;
    }
    setIsCartOpen(true);

    // Track cart open event with cart info
    if (cartHook.cart) {
      trackEvent(ANALYTICS_EVENTS.OPEN_CART, {
        cart_total: parseFloat(cartHook.cart.cost?.totalAmount?.amount || '0'),
        item_count: cartHook.cart.totalQuantity || 0
      });
    }
  };

  const closeCart = (): void => setIsCartOpen(false);

  const toggleCart = (): void => {
    if (!checkAgeVerification()) {
      localStorage.removeItem('age_verified');
      localStorage.removeItem('ageVerified');
      window.location.reload();
      return;
    }
    setIsCartOpen(prev => !prev);
  };

  // Override addToCart to check age verification and fire tracking events
  const addToCart = async (variantId: string, quantity: number = 1): Promise<ShopifyCart> => {
    console.log('[CART CONTEXT] addToCart called with:', {
      variantId,
      quantity,
      variantIdType: typeof variantId,
      usingCustomCart: USE_CUSTOM_CART,
      currentCartId: cartHook.cart?.id,
      currentCartQuantity: cartHook.cart?.totalQuantity
    });

    const isAgeVerified = checkAgeVerification();
    console.log('[CART CONTEXT] Age verification check:', {
      isAgeVerified,
      localStorage_age_verified: typeof window !== 'undefined' ? localStorage.getItem('age_verified') : 'N/A',
      localStorage_ageVerified: typeof window !== 'undefined' ? localStorage.getItem('ageVerified') : 'N/A'
    });

    if (!isAgeVerified) {
      console.log('[CART CONTEXT] Age verification failed, reloading page to show modal');
      localStorage.removeItem('age_verified');
      localStorage.removeItem('ageVerified');
      window.location.reload();
      throw new Error('Age verification required');
    }

    // Check if this is creating a new cart (first item added)
    const isCreatingNewCart = !cartHook.cart;
    console.log('[CART CONTEXT] isCreatingNewCart:', isCreatingNewCart);

    let result;
    try {
      result = await cartHook.addToCart(variantId, quantity);
      console.log('[CART CONTEXT] addToCart result:', {
        success: !!result,
        cartId: result?.id,
        totalQuantity: result?.totalQuantity,
        itemCount: result?.lines?.edges?.length
      });
    } catch (err) {
      console.error('[CART CONTEXT] addToCart error:', err);
      throw err;
    }

    // If we just created a new cart, check for pending group order join
    if (isCreatingNewCart && result?.id) {
      try {
        const joined = await completePendingGroupOrderJoin(result.id);
        if (joined) {
          console.log('✅ User automatically joined group order with new cart');
        }
      } catch (err) {
        console.error('Failed to complete pending group order join:', err);
      }
    }

    // Find the added item to get product details for tracking
    const addedLine = result?.lines?.edges?.find(
      edge => edge.node.merchandise.id === variantId
    )?.node;

    // Fire Vercel Analytics AddToCart event
    trackCartAction(
      'add',
      variantId,
      addedLine?.merchandise?.product?.title || 'Unknown Product',
      parseFloat(addedLine?.merchandise?.price?.amount || '0'),
      quantity
    );

    // Fire Meta Pixel AddToCart event
    trackMetaEvent('AddToCart', {
      content_type: 'product',
      content_ids: variantId,
      num_items: quantity,
      currency: 'USD',
    });

    return result;
  };

  // Override removeFromCart to fire tracking events
  const removeFromCart = async (lineId: string): Promise<void> => {
    // Get item details before removing for tracking
    const removedLine = cartHook.cart?.lines?.edges?.find(
      edge => edge.node.id === lineId
    )?.node;

    await cartHook.removeFromCart(lineId);

    // Fire Vercel Analytics RemoveFromCart event
    if (removedLine) {
      trackCartAction(
        'remove',
        removedLine.merchandise.id,
        removedLine.merchandise.product?.title || 'Unknown Product',
        parseFloat(removedLine.merchandise.price?.amount || '0'),
        removedLine.quantity
      );
    }
  };

  // Override updateCartItem to fire tracking events
  const updateCartItem = async (lineId: string, quantity: number): Promise<void> => {
    // Get item details for tracking
    const updatedLine = cartHook.cart?.lines?.edges?.find(
      edge => edge.node.id === lineId
    )?.node;

    await cartHook.updateCartItem(lineId, quantity);

    // Fire Vercel Analytics UpdateCartQuantity event
    if (updatedLine) {
      trackCartAction(
        'update',
        updatedLine.merchandise.id,
        updatedLine.merchandise.product?.title || 'Unknown Product',
        parseFloat(updatedLine.merchandise.price?.amount || '0'),
        quantity
      );
    }
  };

  // Extract custom cart data for direct access to discount info (custom cart only)
  const customCartData: CustomCartData | null = USE_CUSTOM_CART && customCartHook.customCart
    ? {
        discountCode: customCartHook.customCart.discountCode,
        discountAmount: customCartHook.customCart.discountAmount,
        subtotal: customCartHook.customCart.subtotal,
        total: customCartHook.customCart.total,
      }
    : null;

  // DEBUG: Log customCartData when it changes
  if (customCartData) {
    console.log('[CartContext] customCartData derived:', {
      discountCode: customCartData.discountCode,
      discountAmount: customCartData.discountAmount,
      discountAmountType: typeof customCartData.discountAmount,
      subtotal: customCartData.subtotal,
      total: customCartData.total,
      rawCustomCart: customCartHook.customCart,
    });
  }

  const value: CartContextType = {
    cart: cartHook.cart,
    customCartData,
    loading: cartHook.loading,
    error: cartHook.error,
    addToCart,
    createCartWithItems: cartHook.createCartWithItems,
    updateCartItem,
    removeFromCart,
    clearCart: cartHook.clearCart,
    updateCartAttributes: cartHook.updateCartAttributes,
    refetchCart: USE_CUSTOM_CART ? customCartHook.refetchCart : async () => {},
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    isCustomCart: USE_CUSTOM_CART,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};
