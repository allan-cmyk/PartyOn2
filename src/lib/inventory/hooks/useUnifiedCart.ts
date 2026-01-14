/**
 * Unified Cart Hook
 * Switches between Shopify cart and custom cart based on feature flag
 */

'use client';

import { useEffect, useState } from 'react';
import { useCart as useShopifyCart } from '@/lib/shopify/hooks/useCart';
import { useCustomCart } from './useCustomCart';

// Unified cart item type
export interface UnifiedCartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  sku: string | null;
  quantity: number;
  price: number;
  imageUrl?: string;
}

// Unified cart type
export interface UnifiedCart {
  id: string;
  items: UnifiedCartItem[];
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountCode: string | null;
  discountAmount: number;
  total: number;
  checkoutUrl?: string;
  deliveryDate?: string | null;
  deliveryTime?: string | null;
  deliveryAddress?: Record<string, string> | null;
}

/**
 * Check if custom cart is enabled
 */
async function checkCustomCartEnabled(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/features?key=USE_CUSTOM_CART');
    if (!res.ok) return false;
    const data = await res.json();
    return data?.enabled === true;
  } catch {
    return false;
  }
}

/**
 * Unified cart hook that switches between backends
 */
export function useUnifiedCart() {
  const [useCustom, setUseCustom] = useState(false);
  const [isCheckingFlag, setIsCheckingFlag] = useState(true);

  const shopifyCart = useShopifyCart();
  const customCart = useCustomCart();

  // Check feature flag on mount
  useEffect(() => {
    checkCustomCartEnabled().then(enabled => {
      setUseCustom(enabled);
      setIsCheckingFlag(false);
    });
  }, []);

  // If still checking flag, return loading state
  if (isCheckingFlag) {
    return {
      cart: null,
      isLoading: true,
      error: null,
      addToCart: async () => null,
      updateCartItem: async () => {},
      removeFromCart: async () => {},
      clearCart: async () => {},
      itemCount: 0,
      isEmpty: true,
      meetsMinimum: false,
      isCustomCart: false,
    };
  }

  // Use custom cart
  if (useCustom) {
    const cart: UnifiedCart | null = customCart.cart
      ? {
          id: customCart.cart.id,
          items: customCart.cart.items.map(item => ({
            id: item.id,
            variantId: item.variantId,
            productId: item.productId,
            title: item.product.title,
            variantTitle: item.variant.title,
            sku: item.variant.sku,
            quantity: item.quantity,
            price: item.price,
          })),
          itemCount: customCart.itemCount,
          subtotal: customCart.cart.subtotal,
          taxAmount: customCart.cart.taxAmount,
          deliveryFee: customCart.cart.deliveryFee,
          discountCode: customCart.cart.discountCode,
          discountAmount: customCart.cart.discountAmount,
          total: customCart.cart.total,
          deliveryDate: customCart.cart.deliveryDate,
          deliveryTime: customCart.cart.deliveryTime,
          deliveryAddress: customCart.cart.deliveryAddress,
        }
      : null;

    return {
      cart,
      isLoading: customCart.isLoading,
      error: customCart.error,
      addToCart: async (variantId: string, quantity: number, productId?: string, price?: number) => {
        if (!productId || price === undefined) {
          throw new Error('productId and price are required for custom cart');
        }
        return customCart.addToCart(productId, variantId, quantity, price);
      },
      updateCartItem: async (itemId: string, quantity: number) => {
        await customCart.updateCartItem(itemId, quantity);
      },
      removeFromCart: async (itemId: string) => {
        await customCart.removeFromCart(itemId);
      },
      clearCart: customCart.clearCart,
      setDeliveryInfo: customCart.setDeliveryInfo,
      applyDiscount: customCart.applyDiscount,
      removeDiscount: customCart.removeDiscount,
      itemCount: customCart.itemCount,
      isEmpty: customCart.isEmpty,
      meetsMinimum: customCart.meetsMinimum,
      hasDeliveryInfo: customCart.hasDeliveryInfo,
      isCustomCart: true,
    };
  }

  // Use Shopify cart
  const shopifyCartData = shopifyCart.cart;
  const cart: UnifiedCart | null = shopifyCartData
    ? {
        id: shopifyCartData.id,
        items:
          shopifyCartData.lines?.edges?.map(edge => ({
            id: edge.node.id,
            variantId: edge.node.merchandise.id,
            productId: edge.node.merchandise.product.handle, // Use handle as ID since product.id not in type
            title: edge.node.merchandise.product.title,
            variantTitle: edge.node.merchandise.title,
            sku: null, // SKU not available in cart line
            quantity: edge.node.quantity,
            price: parseFloat(edge.node.merchandise.price.amount),
            imageUrl: edge.node.merchandise.product.images?.edges?.[0]?.node?.url,
          })) || [],
        itemCount: shopifyCartData.totalQuantity || 0,
        subtotal: parseFloat(shopifyCartData.cost?.subtotalAmount?.amount || '0'),
        taxAmount: parseFloat(shopifyCartData.cost?.totalTaxAmount?.amount || '0'),
        deliveryFee: 25, // Default delivery fee
        discountCode: shopifyCartData.discountCodes?.[0]?.code || null,
        discountAmount: 0,
        total: parseFloat(shopifyCartData.cost?.totalAmount?.amount || '0'),
        checkoutUrl: shopifyCartData.checkoutUrl,
      }
    : null;

  return {
    cart,
    isLoading: shopifyCart.loading,
    error: shopifyCart.error,
    addToCart: shopifyCart.addToCart,
    updateCartItem: shopifyCart.updateCartItem,
    removeFromCart: shopifyCart.removeFromCart,
    clearCart: async () => {
      // Shopify doesn't have a clear cart, remove items one by one
      if (shopifyCartData?.lines?.edges) {
        for (const edge of shopifyCartData.lines.edges) {
          await shopifyCart.removeFromCart(edge.node.id);
        }
      }
    },
    itemCount: shopifyCartData?.totalQuantity || 0,
    isEmpty: !shopifyCartData?.lines?.edges?.length,
    meetsMinimum: parseFloat(shopifyCartData?.cost?.subtotalAmount?.amount || '0') >= 100,
    isCustomCart: false,
  };
}
