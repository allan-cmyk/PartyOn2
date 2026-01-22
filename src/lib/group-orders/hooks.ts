import useSWR from 'swr'
import { useCallback } from 'react'
import { GroupOrderAPI } from './api'
import { CreateGroupOrderInput, JoinGroupOrderInput } from './types'

export function useGroupOrder(shareCode: string | null) {
  const { data, error, mutate } = useSWR(
    shareCode ? `/api/group-orders/${shareCode}` : null,
    () => shareCode ? GroupOrderAPI.getByCode(shareCode) : null,
    {
      refreshInterval: 5000, // Refresh every 5 seconds for live updates
      revalidateOnFocus: true,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404s
        if (error?.message?.includes('not found')) return
        // Only retry 3 times
        if (retryCount >= 3) return
        // Retry after 5 seconds
        setTimeout(() => revalidate({ retryCount }), 5000)
      }
    }
  )

  return {
    groupOrder: data,
    isLoading: !error && !data && shareCode !== null,
    error,
    refresh: mutate,
  }
}

export function useCreateGroupOrder() {
  const createGroupOrder = useCallback(async (input: CreateGroupOrderInput) => {
    try {
      const result = await GroupOrderAPI.create(input)
      return result
    } catch (error) {
      console.error('Failed to create group order:', error)
      throw error
    }
  }, [])

  return { createGroupOrder }
}

export function useJoinGroupOrder() {
  const joinGroupOrder = useCallback(async (groupOrderId: string, input: JoinGroupOrderInput) => {
    try {
      const result = await GroupOrderAPI.join(groupOrderId, input)
      return result
    } catch (error) {
      console.error('Failed to join group order:', error)
      throw error
    }
  }, [])

  return { joinGroupOrder }
}

/**
 * Complete a pending group order join after cart is created
 * Called automatically when user adds first item to cart after clicking "JOIN"
 */
export async function completePendingGroupOrderJoin(cartId: string): Promise<boolean> {
  try {
    const pendingJoinData = localStorage.getItem('pendingGroupOrderJoin')
    if (!pendingJoinData) return false

    const pending = JSON.parse(pendingJoinData)

    // Join the group order with the new cart
    await GroupOrderAPI.join(pending.groupOrderId, {
      cartId,
      customerId: pending.customerId,
      guestName: pending.guestName,
      guestEmail: pending.guestEmail,
    })

    // Clear pending join data
    localStorage.removeItem('pendingGroupOrderJoin')

    console.log('✅ Completed pending group order join:', pending.shareCode)
    return true
  } catch (error) {
    console.error('Failed to complete pending group order join:', error)
    // Don't remove pending data on failure - user can retry
    return false
  }
}

/**
 * Hook for host actions on a group order
 * @param shareCode - The share code of the group order
 */
export function useGroupOrderActions(shareCode: string | null) {
  const lockOrder = useCallback(async (hostCustomerId: string) => {
    if (!shareCode) throw new Error('No share code provided')

    try {
      const result = await GroupOrderAPI.lock(shareCode, hostCustomerId)
      return result
    } catch (error) {
      console.error('Failed to lock group order:', error)
      throw error
    }
  }, [shareCode])

  const createCheckout = useCallback(async (
    hostCustomerId: string,
    hostEmail: string,
    hostPhone?: string
  ) => {
    if (!shareCode) throw new Error('No share code provided')

    try {
      const result = await GroupOrderAPI.createCheckout(
        shareCode,
        hostCustomerId,
        hostEmail,
        hostPhone
      )
      return result
    } catch (error) {
      console.error('Failed to create checkout:', error)
      throw error
    }
  }, [shareCode])

  const removeParticipant = useCallback(async (
    participantId: string,
    hostCustomerId: string
  ) => {
    if (!shareCode) throw new Error('No share code provided')

    try {
      await GroupOrderAPI.removeParticipant(shareCode, participantId, hostCustomerId)
    } catch (error) {
      console.error('Failed to remove participant:', error)
      throw error
    }
  }, [shareCode])

  const updateCart = useCallback(async (
    cartId: string,
    cartTotal: number,
    itemCount: number
  ) => {
    if (!shareCode) return

    try {
      await GroupOrderAPI.updateCart(shareCode, cartId, cartTotal, itemCount)
    } catch (error) {
      console.error('Failed to update cart:', error)
      // Don't throw - cart sync failures shouldn't break the UI
    }
  }, [shareCode])

  return {
    lockOrder,
    createCheckout,
    removeParticipant,
    updateCart,
  }
}