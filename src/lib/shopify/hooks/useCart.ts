import { useState, useEffect, useCallback } from 'react';
import { shopifyFetch } from '../client';
import {
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  GET_CART_QUERY,
  UPDATE_CART_ATTRIBUTES_MUTATION,
} from '../mutations/cart';
import { ShopifyCart } from '../types';
import { getStoredCartId, setStoredCartId, clearStoredCartId } from '../utils';

interface CartLine {
  merchandiseId: string;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load cart on mount
  useEffect(() => {
    const cartId = getStoredCartId();
    if (cartId) {
      fetchCart(cartId);
    }
  }, []);

  const fetchCart = async (cartId: string) => {
    try {
      setLoading(true);
      const response = await shopifyFetch<{ cart: ShopifyCart }>({
        query: GET_CART_QUERY,
        variables: { cartId },
      });

      if (response.cart) {
        setCart(response.cart);
      } else {
        // Cart not found, clear stored ID
        clearStoredCartId();
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      clearStoredCartId();
    } finally {
      setLoading(false);
    }
  };

  const createCart = async (lineItems: CartLine[]) => {
    try {
      setLoading(true);
      const response = await shopifyFetch<{
        cartCreate: {
          cart: ShopifyCart;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>({
        query: CREATE_CART_MUTATION,
        variables: { lineItems },
      });

      if (response.cartCreate.userErrors.length > 0) {
        throw new Error(response.cartCreate.userErrors[0].message);
      }

      const newCart = response.cartCreate.cart;
      setCart(newCart);
      setStoredCartId(newCart.id);
      return newCart;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addToCart = useCallback(async (merchandiseId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      
      console.log('addToCart called with:', { merchandiseId, quantity, merchandiseIdType: typeof merchandiseId });
      
      // Ensure merchandiseId is a string
      if (typeof merchandiseId !== 'string') {
        console.error('merchandiseId must be a string, received:', merchandiseId);
        throw new Error('Invalid merchandiseId');
      }
      
      let currentCart = cart;
      
      // Create cart if it doesn't exist
      if (!currentCart) {
        console.log('Creating new cart with:', { merchandiseId, quantity });
        currentCart = await createCart([{ merchandiseId, quantity }]);
        return currentCart;
      }

      console.log('Adding to existing cart:', { cartId: currentCart.id, merchandiseId, quantity });
      const response = await shopifyFetch<{
        cartLinesAdd: {
          cart: ShopifyCart;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>({
        query: ADD_TO_CART_MUTATION,
        variables: {
          cartId: currentCart.id,
          lineItems: [{ merchandiseId, quantity }],
        },
      });

      if (response.cartLinesAdd.userErrors.length > 0) {
        throw new Error(response.cartLinesAdd.userErrors[0].message);
      }

      setCart(response.cartLinesAdd.cart);
      return response.cartLinesAdd.cart;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const updateCartItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;

    try {
      setLoading(true);
      
      const response = await shopifyFetch<{
        cartLinesUpdate: {
          cart: ShopifyCart;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>({
        query: UPDATE_CART_MUTATION,
        variables: {
          cartId: cart.id,
          lines: [{ id: lineId, quantity }],
        },
      });

      if (response.cartLinesUpdate.userErrors.length > 0) {
        throw new Error(response.cartLinesUpdate.userErrors[0].message);
      }

      setCart(response.cartLinesUpdate.cart);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const removeFromCart = useCallback(async (lineId: string) => {
    if (!cart) return;

    try {
      setLoading(true);
      
      const response = await shopifyFetch<{
        cartLinesRemove: {
          cart: ShopifyCart;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>({
        query: REMOVE_FROM_CART_MUTATION,
        variables: {
          cartId: cart.id,
          lineIds: [lineId],
        },
      });

      if (response.cartLinesRemove.userErrors.length > 0) {
        throw new Error(response.cartLinesRemove.userErrors[0].message);
      }

      setCart(response.cartLinesRemove.cart);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart(null);
    clearStoredCartId();
  }, []);

  const updateCartAttributes = useCallback(async (attributes: Array<{ key: string; value: string }>) => {
    if (!cart) return;

    try {
      setLoading(true);
      
      const response = await shopifyFetch<{
        cartAttributesUpdate: {
          cart: ShopifyCart;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>({
        query: UPDATE_CART_ATTRIBUTES_MUTATION,
        variables: {
          cartId: cart.id,
          attributes,
        },
      });

      if (response.cartAttributesUpdate.userErrors.length > 0) {
        throw new Error(response.cartAttributesUpdate.userErrors[0].message);
      }

      setCart(response.cartAttributesUpdate.cart);
      return response.cartAttributesUpdate.cart;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    updateCartAttributes,
  };
}