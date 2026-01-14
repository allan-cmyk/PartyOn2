import {
  GroupOrder,
  GroupOrderWithParticipants,
  CreateGroupOrderInput,
  JoinGroupOrderInput,
  GroupOrderShareData
} from './types'

const API_BASE = '/api/group-orders'

export class GroupOrderAPI {
  /**
   * Create a new group order
   */
  static async create(input: CreateGroupOrderInput): Promise<GroupOrder & GroupOrderShareData> {
    const response = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || errorData.details || 'Failed to create group order'
      console.error('Create group order error:', errorData)
      throw new Error(errorMessage)
    }

    return response.json()
  }

  /**
   * Fetch group order by share code
   */
  static async getByCode(shareCode: string): Promise<GroupOrderWithParticipants> {
    const response = await fetch(`${API_BASE}/${shareCode}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Group order not found')
      }
      throw new Error('Failed to fetch group order')
    }

    return response.json()
  }

  /**
   * Join an existing group order as participant
   */
  static async join(groupOrderId: string, input: JoinGroupOrderInput): Promise<{ participantId: string }> {
    const response = await fetch(`${API_BASE}/id/${groupOrderId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error('Failed to join group order')
    }

    return response.json()
  }

  /**
   * Lock a group order (host only) - prevents new participants from joining
   */
  static async lock(shareCode: string, hostCustomerId: string): Promise<GroupOrder> {
    const response = await fetch(`${API_BASE}/${shareCode}/lock-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostCustomerId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to lock group order')
    }

    return response.json()
  }

  /**
   * Create checkout by merging all participant carts into a Shopify draft order
   */
  static async createCheckout(
    shareCode: string,
    hostCustomerId: string,
    hostEmail: string,
    hostPhone?: string
  ): Promise<{ checkoutUrl: string }> {
    const response = await fetch(`${API_BASE}/${shareCode}/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostCustomerId, hostEmail, hostPhone }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to create checkout')
    }

    return response.json()
  }

  /**
   * Remove a participant from the group order (host only)
   */
  static async removeParticipant(
    shareCode: string,
    participantId: string,
    hostCustomerId: string
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/${shareCode}/remove-participant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, hostCustomerId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to remove participant')
    }
  }

  /**
   * Update participant cart totals (called when cart changes)
   */
  static async updateCart(
    shareCode: string,
    cartId: string,
    cartTotal: number,
    itemCount: number
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/${shareCode}/update-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId, cartTotal, itemCount }),
    })

    if (!response.ok) {
      throw new Error('Failed to update cart')
    }
  }
}