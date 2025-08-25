import { 
  GroupOrder, 
  GroupOrderWithParticipants, 
  CreateGroupOrderInput, 
  JoinGroupOrderInput,
  GroupOrderShareData 
} from './types'

const API_BASE = '/api/group-orders'

export class GroupOrderAPI {
  static async create(input: CreateGroupOrderInput): Promise<GroupOrder & GroupOrderShareData> {
    const response = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create group order')
    }
    
    return response.json()
  }

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

  static async lock(groupOrderId: string): Promise<GroupOrder> {
    const response = await fetch(`${API_BASE}/id/${groupOrderId}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (!response.ok) {
      throw new Error('Failed to lock group order')
    }
    
    return response.json()
  }

  static async createCheckout(groupOrderId: string): Promise<{ checkoutUrl: string }> {
    const response = await fetch(`${API_BASE}/id/${groupOrderId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (!response.ok) {
      throw new Error('Failed to create checkout')
    }
    
    return response.json()
  }

  static async removeParticipant(groupOrderId: string, participantId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/id/${groupOrderId}/participants/${participantId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to remove participant')
    }
  }

  static async getHostOrders(customerId: string): Promise<GroupOrder[]> {
    const response = await fetch(`${API_BASE}/host/${customerId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch host orders')
    }
    
    return response.json()
  }
}