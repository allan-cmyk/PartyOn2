/**
 * Custom Cart Hook
 * React hook for server-side cart management
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR, { mutate } from 'swr';

// Types
interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  product: { id: string; title: string; handle: string };
  variant: { id: string; title: string; sku: string | null; price: number };
}

interface Cart {
  id: string;
  customerId: string | null;
  sessionId: string | null;
  status: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountCode: string | null;
  discountAmount: number;
  total: number;
  deliveryDate: string | null;
  deliveryTime: string | null;
  deliveryAddress: Record<string, string> | null;
  deliveryPhone: string | null;
  deliveryInstructions: string | null;
}

interface CartValidation {
  valid: boolean;
  minimum: number;
  current: number;
  difference: number;
}

interface CartResponse {
  success: boolean;
  data?: {
    cart: Cart;
    validation: CartValidation;
  };
  error?: string;
}

// Fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
};

/**
 * Custom cart hook for server-side cart management
 */
export function useCustomCart() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart data with SWR
  const { data, error: swrError, isValidating } = useSWR<CartResponse>(
    '/api/v1/cart',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const cart = data?.data?.cart || null;
  const validation = data?.data?.validation || null;

  // Clear error when data changes
  useEffect(() => {
    if (swrError) {
      setError(swrError.message);
    } else {
      setError(null);
    }
  }, [swrError]);

  /**
   * Add item to cart
   */
  const addToCart = useCallback(async (
    productId: string,
    variantId: string,
    quantity: number,
    price: number
  ): Promise<Cart | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'add',
          productId,
          variantId,
          quantity,
          price,
        }),
      });

      const result: CartResponse = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add to cart');
      }

      // Revalidate cart data
      await mutate('/api/v1/cart');

      return result.data?.cart || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update item quantity
   */
  const updateCartItem = useCallback(async (
    itemId: string,
    quantity: number
  ): Promise<Cart | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'update',
          itemId,
          quantity,
        }),
      });

      const result: CartResponse = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update cart');
      }

      await mutate('/api/v1/cart');

      return result.data?.cart || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update cart';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (itemId: string): Promise<Cart | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'remove',
          itemId,
        }),
      });

      const result: CartResponse = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove from cart');
      }

      await mutate('/api/v1/cart');

      return result.data?.cart || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove from cart';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear cart
   */
  const clearCart = useCallback(async (): Promise<Cart | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'clear' }),
      });

      const result: CartResponse = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to clear cart');
      }

      await mutate('/api/v1/cart');

      return result.data?.cart || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set delivery info
   */
  const setDeliveryInfo = useCallback(async (delivery: {
    date: string;
    time: string;
    address: {
      address1: string;
      address2?: string;
      city: string;
      province?: string;
      zip: string;
      country?: string;
    };
    phone: string;
    instructions?: string;
    isExpress?: boolean;
  }): Promise<Cart | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/cart/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(delivery),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to set delivery info');
      }

      await mutate('/api/v1/cart');

      return result.data?.cart || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set delivery info';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Apply discount code
   */
  const applyDiscount = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/cart/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Invalid discount code');
      }

      await mutate('/api/v1/cart');

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply discount';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove discount code
   */
  const removeDiscount = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/cart/discount', {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove discount');
      }

      await mutate('/api/v1/cart');

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove discount';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cart,
    validation,
    isLoading: isLoading || isValidating,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    setDeliveryInfo,
    applyDiscount,
    removeDiscount,
    // Computed values
    itemCount: cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    isEmpty: !cart?.items?.length,
    meetsMinimum: validation?.valid ?? false,
    hasDeliveryInfo: !!(cart?.deliveryDate && cart?.deliveryTime && cart?.deliveryAddress),
  };
}
