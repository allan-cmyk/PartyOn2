import { shopifyFetch } from '@/lib/shopify/client'
import { CART_DISCOUNT_CODES_UPDATE_MUTATION } from '@/lib/shopify/mutations/discount'
import { UPDATE_CART_ATTRIBUTES_MUTATION } from '@/lib/shopify/mutations/cart'

/**
 * Discount code for free delivery on group orders
 * This should be set up in Shopify Admin as:
 * - Type: Free Shipping
 * - No minimum requirements
 * - Can combine with other discounts
 */
const GROUP_FREE_DELIVERY_CODE = 'GROUPFREEDELIVERY'

interface DiscountUpdateResponse {
  cartDiscountCodesUpdate: {
    cart: {
      id: string
      discountCodes: Array<{
        applicable: boolean
        code: string
      }>
    }
    userErrors: Array<{
      field: string
      message: string
    }>
  }
}

interface AttributesUpdateResponse {
  cartAttributesUpdate: {
    cart: {
      id: string
      checkoutUrl: string
      attributes: Array<{
        key: string
        value: string
      }>
    }
    userErrors: Array<{
      field: string
      message: string
    }>
  }
}

/**
 * Apply the group free delivery discount code to a cart
 */
export async function applyGroupFreeDelivery(cartId: string): Promise<boolean> {
  try {
    const response = await shopifyFetch<DiscountUpdateResponse>({
      query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
      variables: {
        cartId,
        discountCodes: [GROUP_FREE_DELIVERY_CODE],
      },
    })

    if (response.cartDiscountCodesUpdate.userErrors.length > 0) {
      console.error('Error applying group free delivery:', response.cartDiscountCodesUpdate.userErrors)
      return false
    }

    const appliedCode = response.cartDiscountCodesUpdate.cart.discountCodes.find(
      dc => dc.code === GROUP_FREE_DELIVERY_CODE
    )

    if (!appliedCode?.applicable) {
      console.warn('Group free delivery code not applicable. Make sure it is set up in Shopify Admin.')
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to apply group free delivery:', error)
    return false
  }
}

/**
 * Remove the group free delivery discount code from a cart
 */
export async function removeGroupFreeDelivery(cartId: string): Promise<boolean> {
  try {
    const response = await shopifyFetch<DiscountUpdateResponse>({
      query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
      variables: {
        cartId,
        discountCodes: [], // Empty array removes all discount codes
      },
    })

    if (response.cartDiscountCodesUpdate.userErrors.length > 0) {
      console.error('Error removing group free delivery:', response.cartDiscountCodesUpdate.userErrors)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to remove group free delivery:', error)
    return false
  }
}

/**
 * Set cart attributes for group order tracking
 * These attributes are passed to Shopify orders for fulfillment
 */
export async function setGroupOrderAttributes(
  cartId: string,
  groupOrderData: {
    shareCode: string
    groupName: string
    deliveryDate: string
    deliveryTime: string
  }
): Promise<boolean> {
  try {
    const attributes = [
      { key: 'group_order', value: 'true' },
      { key: 'share_code', value: groupOrderData.shareCode },
      { key: 'group_name', value: groupOrderData.groupName },
      { key: 'delivery_date', value: groupOrderData.deliveryDate },
      { key: 'delivery_time', value: groupOrderData.deliveryTime },
    ]

    const response = await shopifyFetch<AttributesUpdateResponse>({
      query: UPDATE_CART_ATTRIBUTES_MUTATION,
      variables: {
        cartId,
        attributes,
      },
    })

    if (response.cartAttributesUpdate.userErrors.length > 0) {
      console.error('Error setting group order attributes:', response.cartAttributesUpdate.userErrors)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to set group order attributes:', error)
    return false
  }
}

/**
 * Apply both free delivery and cart attributes for a group order participant
 * Call this when a participant joins a group order
 */
export async function setupGroupOrderCart(
  cartId: string,
  groupOrderData: {
    shareCode: string
    groupName: string
    deliveryDate: string
    deliveryTime: string
  }
): Promise<{ discountApplied: boolean; attributesSet: boolean }> {
  const [discountApplied, attributesSet] = await Promise.all([
    applyGroupFreeDelivery(cartId),
    setGroupOrderAttributes(cartId, groupOrderData),
  ])

  return { discountApplied, attributesSet }
}

/**
 * Clear group order settings from a cart (used when leaving a group order)
 */
export async function clearGroupOrderCart(cartId: string): Promise<boolean> {
  try {
    // Remove discount
    await removeGroupFreeDelivery(cartId)

    // Clear group attributes
    const response = await shopifyFetch<AttributesUpdateResponse>({
      query: UPDATE_CART_ATTRIBUTES_MUTATION,
      variables: {
        cartId,
        attributes: [
          { key: 'group_order', value: '' },
          { key: 'share_code', value: '' },
          { key: 'group_name', value: '' },
          { key: 'delivery_date', value: '' },
          { key: 'delivery_time', value: '' },
        ],
      },
    })

    if (response.cartAttributesUpdate.userErrors.length > 0) {
      console.error('Error clearing group order attributes:', response.cartAttributesUpdate.userErrors)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to clear group order cart:', error)
    return false
  }
}
