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

export function useGroupOrderActions(groupOrderId: string | null) {
  const lockOrder = useCallback(async () => {
    if (!groupOrderId) return
    
    try {
      const result = await GroupOrderAPI.lock(groupOrderId)
      return result
    } catch (error) {
      console.error('Failed to lock group order:', error)
      throw error
    }
  }, [groupOrderId])

  const createCheckout = useCallback(async () => {
    if (!groupOrderId) return
    
    try {
      const result = await GroupOrderAPI.createCheckout(groupOrderId)
      return result
    } catch (error) {
      console.error('Failed to create checkout:', error)
      throw error
    }
  }, [groupOrderId])

  const removeParticipant = useCallback(async (participantId: string) => {
    if (!groupOrderId) return
    
    try {
      await GroupOrderAPI.removeParticipant(groupOrderId, participantId)
    } catch (error) {
      console.error('Failed to remove participant:', error)
      throw error
    }
  }, [groupOrderId])

  return {
    lockOrder,
    createCheckout,
    removeParticipant,
  }
}

export function useHostGroupOrders(customerId: string | null) {
  const { data, error, mutate } = useSWR(
    customerId ? `/api/group-orders/host/${customerId}` : null,
    () => customerId ? GroupOrderAPI.getHostOrders(customerId) : null
  )

  return {
    orders: data || [],
    isLoading: !error && !data && customerId !== null,
    error,
    refresh: mutate,
  }
}