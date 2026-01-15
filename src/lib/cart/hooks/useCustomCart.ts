/**
 * Custom Cart Hook
 * Replaces Shopify cart with local PostgreSQL-backed cart
 * Transforms data to match ShopifyCart interface for backwards compatibility
 */

import { useState, useEffect, useCallback } from 'react';
import { ShopifyCart } from '@/lib/shopify/types';

interface CustomCartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    title: string;
    handle: string;
  };
  variant: {
    id: string;
    title: string;
    sku: string | null;
    price: string;
  };
}

interface CustomCart {
  id: string;
  items: CustomCartItem[];
  subtotal: string;
  taxAmount: string;
  deliveryFee: string;
  discountAmount: string;
  total: string;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryAddress?: Record<string, string>;
  deliveryPhone?: string;
  deliveryInstructions?: string;
}

interface CartApiResponse {
  success: boolean;
  data?: {
    cart: CustomCart;
    checkout: Record<string, unknown>;
    validation: {
      valid: boolean;
      minimum: number;
      current: number;
      difference: number;
    };
  };
  error?: string;
}

/**
 * Transform custom cart to ShopifyCart format for backwards compatibility
 */
function transformToShopifyCart(cart: CustomCart): ShopifyCart {
  const subtotal = parseFloat(cart.subtotal);
  const total = parseFloat(cart.total);
  const tax = parseFloat(cart.taxAmount);

  return {
    id: cart.id,
    checkoutUrl: '/checkout', // Custom checkout page
    totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    lines: {
      edges: cart.items.map(item => ({
        node: {
          id: item.id,
          quantity: item.quantity,
          merchandise: {
            id: item.variantId,
            title: item.variant.title,
            price: {
              amount: item.price,
              currencyCode: 'USD',
            },
            product: {
              title: item.product.title,
              handle: item.product.handle,
              images: {
                edges: [], // Images will be loaded separately if needed
              },
            },
          },
        },
      })),
    },
    cost: {
      totalAmount: {
        amount: total.toFixed(2),
        currencyCode: 'USD',
      },
      subtotalAmount: {
        amount: subtotal.toFixed(2),
        currencyCode: 'USD',
      },
      totalTaxAmount: {
        amount: tax.toFixed(2),
        currencyCode: 'USD',
      },
    },
    attributes: [],
  };
}

export function useCustomCart() {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [customCart, setCustomCart] = useState<CustomCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/cart', {
        credentials: 'include', // Include cookies for session
      });

      const data: CartApiResponse = await response.json();

      if (data.success && data.data) {
        setCustomCart(data.data.cart);
        setCart(transformToShopifyCart(data.data.cart));
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add item to cart
   * @param variantId - The variant ID to add (matches Shopify interface)
   * @param quantity - Quantity to add
   * @param productId - Optional product ID (required for custom cart)
   * @param price - Optional price (required for custom cart)
   */
  const addToCart = useCallback(async (
    variantId: string,
    quantity: number = 1,
    productId?: string,
    price?: number
  ): Promise<ShopifyCart> => {
    try {
      setLoading(true);

      // If productId/price not provided, try to fetch product details
      let resolvedProductId = productId;
      let resolvedPrice = price;

      if (!resolvedProductId || resolvedPrice === undefined) {
        // Fetch product details by variant ID
        const productResponse = await fetch(`/api/v1/products/variant/${variantId}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          resolvedProductId = productData.productId;
          resolvedPrice = parseFloat(productData.price);
        } else {
          throw new Error('Could not find product for variant');
        }
      }

      const response = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          operation: 'add',
          productId: resolvedProductId,
          variantId,
          quantity,
          price: resolvedPrice,
        }),
      });

      const data: CartApiResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      setCustomCart(data.data.cart);
      const transformedCart = transformToShopifyCart(data.data.cart);
      setCart(transformedCart);
      return transformedCart;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update cart item quantity
   */
  const updateCartItem = useCallback(async (lineId: string, quantity: number) => {
    if (!customCart) return;

    try {
      setLoading(true);

      const response = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          operation: 'update',
          itemId: lineId,
          quantity,
        }),
      });

      const data: CartApiResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to update cart');
      }

      setCustomCart(data.data.cart);
      setCart(transformToShopifyCart(data.data.cart));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customCart]);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (lineId: string) => {
    if (!customCart) return;

    try {
      setLoading(true);

      const response = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          operation: 'remove',
          itemId: lineId,
        }),
      });

      const data: CartApiResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to remove from cart');
      }

      setCustomCart(data.data.cart);
      setCart(transformToShopifyCart(data.data.cart));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customCart]);

  /**
   * Clear cart
   */
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          operation: 'clear',
        }),
      });

      const data: CartApiResponse = await response.json();

      if (data.success && data.data) {
        setCustomCart(data.data.cart);
        setCart(transformToShopifyCart(data.data.cart));
      } else {
        setCustomCart(null);
        setCart(null);
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setCustomCart(null);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create cart with multiple items at once
   */
  const createCartWithItems = useCallback(async (
    items: Array<{ merchandiseId: string; quantity: number; productId?: string; price?: number }>
  ) => {
    try {
      // Clear existing cart first
      await clearCart();

      // Add items one by one (API doesn't support batch add yet)
      let resultCart: ShopifyCart | null = null;
      for (const item of items) {
        resultCart = await addToCart(item.merchandiseId, item.quantity, item.productId, item.price);
      }

      return resultCart;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [clearCart, addToCart]);

  /**
   * Update cart attributes (delivery info)
   * For custom cart, this updates delivery fields directly
   */
  const updateCartAttributes = useCallback(async (
    attributes: Array<{ key: string; value: string }>
  ) => {
    if (!customCart) return;

    try {
      setLoading(true);

      // Parse attributes into delivery info
      const deliveryInfo: Record<string, string> = {};
      for (const attr of attributes) {
        deliveryInfo[attr.key] = attr.value;
      }

      const response = await fetch('/api/v1/cart/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(deliveryInfo),
      });

      const data: CartApiResponse = await response.json();

      if (data.success && data.data) {
        setCustomCart(data.data.cart);
        const transformedCart = transformToShopifyCart(data.data.cart);
        setCart(transformedCart);
        return transformedCart;
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customCart]);

  return {
    cart,
    customCart, // Expose raw custom cart for advanced features
    loading,
    error,
    addToCart,
    createCartWithItems,
    updateCartItem,
    removeFromCart,
    clearCart,
    updateCartAttributes,
    refetchCart: fetchCart,
  };
}
