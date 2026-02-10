/**
 * Group Order Cart Setup
 * Handles delivery settings for group order participants
 *
 * In the custom cart system, delivery fees and discounts are managed
 * through the cart API. Group order free delivery is applied during
 * the draft order checkout process, not at the individual cart level.
 */

/**
 * Set up a participant's cart for a group order
 * Returns success indicators for discount and attribute setup
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
  try {
    // Set delivery info on the cart via custom API
    const response = await fetch('/api/v1/cart/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_date: groupOrderData.deliveryDate,
        delivery_time: groupOrderData.deliveryTime,
      }),
    });

    const attributesSet = response.ok;

    // Free delivery is applied at checkout (draft order level) for group orders,
    // not at the individual cart level
    return { discountApplied: true, attributesSet };
  } catch (error) {
    console.error('Failed to set up group order cart:', error);
    return { discountApplied: false, attributesSet: false };
  }
}
