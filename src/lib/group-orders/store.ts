// In-memory store for demo purposes
// In production, use a real database like PostgreSQL or Supabase

import { GroupOrder, GroupParticipant } from './types'

// Singleton store instance
class GroupOrderStore {
  private orders: Map<string, GroupOrder & { participants: GroupParticipant[] }>

  constructor() {
    this.orders = new Map()
  }

  createOrder(order: GroupOrder & { participants: GroupParticipant[] }) {
    this.orders.set(order.shareCode, order)
    return order
  }

  getOrderByCode(shareCode: string) {
    return this.orders.get(shareCode)
  }

  getOrderById(id: string) {
    for (const order of this.orders.values()) {
      if (order.id === id) {
        return order
      }
    }
    return null
  }

  updateOrder(shareCode: string, updates: Partial<GroupOrder & { participants: GroupParticipant[] }>) {
    const order = this.orders.get(shareCode)
    if (!order) return null
    
    const updatedOrder = { ...order, ...updates, updatedAt: new Date().toISOString() }
    this.orders.set(shareCode, updatedOrder)
    return updatedOrder
  }

  addParticipant(orderId: string, participant: GroupParticipant) {
    const order = this.getOrderById(orderId)
    if (!order) return null
    
    order.participants.push(participant)
    order.updatedAt = new Date().toISOString()
    return participant
  }

  getOrdersByHostId(hostCustomerId: string) {
    const hostOrders: GroupOrder[] = []
    for (const order of this.orders.values()) {
      if (order.hostCustomerId === hostCustomerId) {
        hostOrders.push(order)
      }
    }
    return hostOrders
  }
}

// Export singleton instance
export const groupOrderStore = new GroupOrderStore()