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

/**
 * Ensures a variant ID is in Shopify Global ID (GID) format.
 * Shopify's Storefront API requires IDs in format: gid://shopify/ProductVariant/123456789
 *
 * @param variantId - The variant ID (could be numeric string or already a GID)
 * @returns The properly formatted GID string
 */
function ensureVariantGid(variantId: string): string {
  console.log('[GID CONVERSION] Input variantId:', variantId, 'Type:', typeof variantId);

  // Already in GID format
  if (variantId.startsWith('gid://shopify/ProductVariant/')) {
    console.log('[GID CONVERSION] Already in GID format, returning as-is');
    return variantId;
  }

  // Check if it's a numeric string (Shopify variant ID)
  if (/^\d+$/.test(variantId)) {
    const gid = `gid://shopify/ProductVariant/${variantId}`;
    console.log('[GID CONVERSION] Converted numeric ID to GID:', gid);
    return gid;
  }

  // Check if it looks like a UUID (local database ID) - these won't work with Shopify cart
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantId)) {
    console.error('[GID CONVERSION] ERROR: Received local UUID instead of Shopify ID:', variantId);
    console.error('[GID CONVERSION] This product variant does not have a Shopify ID - cannot add to Shopify cart');
    throw new Error(`Cannot add to cart: This product variant (${variantId}) is not synced with Shopify. Please contact support.`);
  }

  // Try to extract numeric ID from any other format
  const numericId = variantId.replace(/\D/g, '');
  if (numericId && numericId.length > 5) {
    const gid = `gid://shopify/ProductVariant/${numericId}`;
    console.log('[GID CONVERSION] Extracted numeric ID and converted to GID:', gid);
    return gid;
  }

  // Return original if we can't parse it (will likely fail at Shopify API level)
  console.error('[GID CONVERSION] Unable to convert variant ID to GID format:', variantId);
  throw new Error(`Invalid variant ID format: ${variantId}`);
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

      // Ensure all merchandise IDs are in GID format
      const formattedLineItems = lineItems.map(item => ({
        ...item,
        merchandiseId: ensureVariantGid(item.merchandiseId),
      }));

      console.log('[CART DEBUG] createCart called with lineItems:', formattedLineItems);

      const response = await shopifyFetch<{
        cartCreate: {
          cart: ShopifyCart;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>({
        query: CREATE_CART_MUTATION,
        variables: { lineItems: formattedLineItems },
      });

      console.log('[CART DEBUG] createCart response:', {
        hasCart: !!response?.cartCreate?.cart,
        cartId: response?.cartCreate?.cart?.id,
        totalQuantity: response?.cartCreate?.cart?.totalQuantity,
        userErrors: response?.cartCreate?.userErrors
      });

      if (response.cartCreate.userErrors.length > 0) {
        console.error('[CART DEBUG] createCart userErrors:', response.cartCreate.userErrors);
        throw new Error(response.cartCreate.userErrors[0].message);
      }

      const newCart = response.cartCreate.cart;
      console.log('[CART DEBUG] Created new cart, storing ID:', newCart.id);
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

  const createCartWithItems = useCallback(async (items: Array<{ merchandiseId: string; quantity: number }>) => {
    try {
      console.log('createCartWithItems called with:', items);

      // Clear existing cart first
      clearCart();

      // Create cart with all items at once, ensuring GID format for all IDs
      const cartLines: CartLine[] = items.map(item => ({
        merchandiseId: ensureVariantGid(item.merchandiseId),
        quantity: item.quantity
      }));

      console.log('createCartWithItems formatted cart lines:', cartLines);

      const newCart = await createCart(cartLines);
      console.log('✅ Created cart with all items:', newCart.id, 'Total items:', newCart.totalQuantity);
      return newCart;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const addToCart = useCallback(async (merchandiseId: string, quantity: number = 1) => {
    try {
      setLoading(true);

      // Ensure merchandiseId is a string
      if (typeof merchandiseId !== 'string') {
        console.error('[CART DEBUG] merchandiseId must be a string, received:', merchandiseId);
        throw new Error('Invalid merchandiseId');
      }

      // Convert to GID format if needed
      const formattedMerchandiseId = ensureVariantGid(merchandiseId);
      console.log('[CART DEBUG] addToCart called with:', {
        original: merchandiseId,
        formatted: formattedMerchandiseId,
        quantity,
      });

      let currentCart = cart;

      // Create cart if it doesn't exist
      if (!currentCart) {
        console.log('[CART DEBUG] No existing cart, creating new cart with:', { formattedMerchandiseId, quantity });
        currentCart = await createCart([{ merchandiseId: formattedMerchandiseId, quantity }]);
        console.log('[CART DEBUG] New cart created:', { cartId: currentCart?.id, totalQuantity: currentCart?.totalQuantity });
        return currentCart;
      }

      console.log('[CART DEBUG] Adding to existing cart:', { cartId: currentCart.id, formattedMerchandiseId, quantity });
      const response = await shopifyFetch<{
        cartLinesAdd: {
          cart: ShopifyCart;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>({
        query: ADD_TO_CART_MUTATION,
        variables: {
          cartId: currentCart.id,
          lineItems: [{ merchandiseId: formattedMerchandiseId, quantity }],
        },
      });

      console.log('[CART DEBUG] Shopify response:', {
        hasCart: !!response?.cartLinesAdd?.cart,
        cartId: response?.cartLinesAdd?.cart?.id,
        totalQuantity: response?.cartLinesAdd?.cart?.totalQuantity,
        userErrors: response?.cartLinesAdd?.userErrors,
        linesCount: response?.cartLinesAdd?.cart?.lines?.edges?.length
      });

      if (response.cartLinesAdd.userErrors.length > 0) {
        console.error('[CART DEBUG] Shopify userErrors:', response.cartLinesAdd.userErrors);
        throw new Error(response.cartLinesAdd.userErrors[0].message);
      }

      const updatedCart = response.cartLinesAdd.cart;
      console.log('[CART DEBUG] Setting cart state with:', {
        cartId: updatedCart?.id,
        totalQuantity: updatedCart?.totalQuantity,
        itemCount: updatedCart?.lines?.edges?.length
      });
      setCart(updatedCart);
      return updatedCart;
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
    createCartWithItems,
    updateCartItem,
    removeFromCart,
    clearCart,
    updateCartAttributes,
  };
}