'use client'

import { useEffect } from 'react'
import { useCartContext } from '@/contexts/CartContext'
import { useGroupOrderContext } from '@/contexts/GroupOrderContext'

/**
 * Syncs cart totals with the group order backend
 */
export function useGroupCartSync() {
  const { cart } = useCartContext()
  const { currentGroupOrder, groupOrderCode, isInGroupOrder } = useGroupOrderContext()
  
  useEffect(() => {
    if (!isInGroupOrder || !groupOrderCode || !cart) return
    
    // Calculate total and item count
    const cartTotal = parseFloat(cart.cost.subtotalAmount.amount)
    const itemCount = cart.totalQuantity
    
    // Update cart totals in backend
    const updateCartTotals = async () => {
      try {
        const response = await fetch(`/api/group-orders/${groupOrderCode}/update-cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartId: cart.id,
            cartTotal,
            itemCount,
          }),
        })
        
        if (!response.ok) {
          console.error('Failed to update cart totals')
        }
      } catch (error) {
        console.error('Error updating cart totals:', error)
      }
    }
    
    // Debounce updates to avoid too many API calls
    const timer = setTimeout(updateCartTotals, 1000)
    
    return () => clearTimeout(timer)
  }, [cart?.totalQuantity, cart?.cost.subtotalAmount.amount, isInGroupOrder, groupOrderCode])
}