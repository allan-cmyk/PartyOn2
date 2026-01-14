import { prisma } from '@/lib/prisma'
import { GroupOrder, GroupParticipant, GroupOrderWithParticipants } from './types'
import { Prisma } from '@prisma/client'

/**
 * Database layer for group orders using Prisma + Neon PostgreSQL
 */
export const db = {
  /**
   * Check if a share code exists (simple check without participants)
   */
  async shareCodeExists(shareCode: string): Promise<boolean> {
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
      select: { id: true },
    })
    return order !== null
  },

  /**
   * Create a new group order
   */
  async createOrder(order: Omit<GroupOrder, 'createdAt' | 'updatedAt'> & { participants?: GroupParticipant[] }): Promise<GroupOrderWithParticipants> {
    const created = await prisma.groupOrder.create({
      data: {
        id: order.id,
        name: order.name,
        hostCustomerId: order.hostCustomerId,
        hostName: order.hostName,
        shareCode: order.shareCode,
        status: 'ACTIVE',
        deliveryDate: new Date(order.deliveryDate),
        deliveryTime: order.deliveryTime,
        deliveryAddress: order.deliveryAddress as Prisma.InputJsonValue,
        minimumOrderAmount: order.minimumOrderAmount || 0,
        expiresAt: new Date(order.expiresAt),
      },
    })

    // Return the created order with empty participants (new orders have none)
    return {
      id: created.id,
      name: created.name,
      hostCustomerId: created.hostCustomerId,
      hostName: created.hostName || undefined,
      shareCode: created.shareCode,
      status: created.status.toLowerCase() as 'active' | 'locked' | 'closed' | 'completed' | 'cancelled',
      deliveryDate: created.deliveryDate.toISOString(),
      deliveryTime: created.deliveryTime,
      deliveryAddress: created.deliveryAddress as GroupOrder['deliveryAddress'],
      minimumOrderAmount: Number(created.minimumOrderAmount),
      expiresAt: created.expiresAt.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      participants: [],
      totalAmount: 0,
      totalItems: 0,
    }
  },

  /**
   * Get a group order by share code
   */
  async getOrderByCode(shareCode: string): Promise<GroupOrderWithParticipants | null> {
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
      include: {
        participants: {
          where: { status: { not: 'REMOVED' } },
          orderBy: { joinedAt: 'asc' },
          select: {
            id: true,
            groupOrderId: true,
            customerId: true,
            guestName: true,
            guestEmail: true,
            cartId: true,
            ageVerified: true,
            status: true,
            cartTotal: true,
            itemCount: true,
            joinedAt: true,
            checkedOutAt: true,
            shopifyOrderId: true,
            shopifyOrderName: true,
          },
        },
        items: true,
      },
    })

    if (!order) return null
    return mapGroupOrderFromPrisma(order)
  },

  /**
   * Get a group order by ID
   */
  async getOrderById(id: string): Promise<GroupOrderWithParticipants | null> {
    const order = await prisma.groupOrder.findUnique({
      where: { id },
      include: {
        participants: {
          where: { status: { not: 'REMOVED' } },
        },
        items: true,
      },
    })

    if (!order) return null
    return mapGroupOrderFromPrisma(order)
  },

  /**
   * Add a participant to a group order
   */
  async addParticipant(orderId: string, participant: Omit<GroupParticipant, 'joinedAt'>): Promise<GroupParticipant> {
    const created = await prisma.groupParticipant.create({
      data: {
        id: participant.id,
        groupOrderId: orderId,
        customerId: participant.customerId,
        guestName: participant.guestName,
        guestEmail: participant.guestEmail,
        cartId: participant.cartId,
        ageVerified: participant.ageVerified,
        status: 'ACTIVE',
        cartTotal: participant.cartTotal || 0,
        itemCount: participant.itemCount || 0,
      },
    })

    return mapParticipantFromPrisma(created)
  },

  /**
   * Get all orders for a host
   */
  async getHostOrders(hostCustomerId: string): Promise<GroupOrder[]> {
    const orders = await prisma.groupOrder.findMany({
      where: { hostCustomerId },
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          where: { status: { not: 'REMOVED' } },
        },
        items: true,
      },
    })

    return orders.map(mapGroupOrderFromPrisma)
  },

  /**
   * Update participant cart totals
   */
  async updateParticipantCart(
    shareCode: string,
    cartId: string,
    cartTotal: number,
    itemCount: number
  ): Promise<GroupParticipant | null> {
    // Find the participant by cart ID within the group order
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
      include: { participants: true },
    })

    if (!order) return null

    const participant = order.participants.find(p => p.cartId === cartId)
    if (!participant) return null

    const updated = await prisma.groupParticipant.update({
      where: { id: participant.id },
      data: {
        cartTotal,
        itemCount,
      },
    })

    return mapParticipantFromPrisma(updated)
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    shareCode: string,
    status: 'active' | 'locked' | 'closed' | 'completed' | 'cancelled'
  ): Promise<GroupOrder | null> {
    const statusMap: Record<string, 'ACTIVE' | 'LOCKED' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'> = {
      active: 'ACTIVE',
      locked: 'LOCKED',
      closed: 'CLOSED',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED',
    }

    const updated = await prisma.groupOrder.update({
      where: { shareCode },
      data: { status: statusMap[status] },
      include: { participants: true, items: true },
    })

    return mapGroupOrderFromPrisma(updated)
  },

  /**
   * Remove participant from order (soft delete)
   */
  async removeParticipant(shareCode: string, participantId: string): Promise<GroupParticipant | null> {
    // Verify the participant belongs to this order
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
      include: { participants: true },
    })

    if (!order) return null

    const participant = order.participants.find(p => p.id === participantId)
    if (!participant) return null

    const updated = await prisma.groupParticipant.update({
      where: { id: participantId },
      data: { status: 'REMOVED' },
    })

    return mapParticipantFromPrisma(updated)
  },

  /**
   * Update participant checkout status (called when order completes via webhook)
   */
  async updateParticipantCheckoutStatus(
    shareCode: string,
    cartId: string,
    data: {
      shopifyOrderId: string
      shopifyOrderName: string
    }
  ): Promise<GroupParticipant | null> {
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
      include: { participants: true },
    })

    if (!order) return null

    const participant = order.participants.find(p => p.cartId === cartId)
    if (!participant) return null

    const updated = await prisma.groupParticipant.update({
      where: { id: participant.id },
      data: {
        status: 'CHECKED_OUT',
        checkedOutAt: new Date(),
        shopifyOrderId: data.shopifyOrderId,
        shopifyOrderName: data.shopifyOrderName,
      },
    })

    return mapParticipantFromPrisma(updated)
  },

  /**
   * Get checkout stats for a group order
   */
  async getGroupCheckoutStats(shareCode: string): Promise<{
    total: number
    checkedOut: number
    shopping: number
  } | null> {
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
      include: {
        participants: {
          where: { status: { not: 'REMOVED' } },
        },
      },
    })

    if (!order) return null

    const total = order.participants.length
    const checkedOut = order.participants.filter(p => p.status === 'CHECKED_OUT').length
    const shopping = total - checkedOut

    return { total, checkedOut, shopping }
  },

  /**
   * Add items from a completed order (called from webhook)
   */
  async addOrderItems(
    shareCode: string,
    participantId: string,
    items: Array<{
      shopifyLineId: string
      title: string
      variantTitle?: string
      quantity: number
      price: number
      imageUrl?: string
    }>
  ): Promise<void> {
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
    })

    if (!order) return

    await prisma.groupOrderItem.createMany({
      data: items.map(item => ({
        groupOrderId: order.id,
        participantId,
        shopifyLineId: item.shopifyLineId,
        title: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
      })),
    })
  },

  /**
   * Get all items for a group order (aggregated)
   */
  async getGroupOrderItems(shareCode: string): Promise<Array<{
    title: string
    variantTitle?: string
    quantity: number
    totalPrice: number
    imageUrl?: string
  }>> {
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
      include: { items: true },
    })

    if (!order) return []

    // Aggregate items by title + variant
    const aggregated = new Map<string, {
      title: string
      variantTitle?: string
      quantity: number
      totalPrice: number
      imageUrl?: string
    }>()

    for (const item of order.items) {
      const key = `${item.title}|${item.variantTitle || ''}`
      const existing = aggregated.get(key)

      if (existing) {
        existing.quantity += item.quantity
        existing.totalPrice += Number(item.price) * item.quantity
      } else {
        aggregated.set(key, {
          title: item.title,
          variantTitle: item.variantTitle || undefined,
          quantity: item.quantity,
          totalPrice: Number(item.price) * item.quantity,
          imageUrl: item.imageUrl || undefined,
        })
      }
    }

    return Array.from(aggregated.values())
  },

  /**
   * Find participant by email in a group order
   */
  async findParticipantByEmail(shareCode: string, email: string): Promise<GroupParticipant | null> {
    const order = await prisma.groupOrder.findUnique({
      where: { shareCode },
      include: { participants: true },
    })

    if (!order) return null

    const participant = order.participants.find(
      p => p.guestEmail?.toLowerCase() === email.toLowerCase()
    )

    return participant ? mapParticipantFromPrisma(participant) : null
  },
}

/**
 * Map Prisma GroupOrder to our domain type
 */
function mapGroupOrderFromPrisma(order: Prisma.GroupOrderGetPayload<{
  include: { participants: true; items?: true }
}>): GroupOrderWithParticipants {
  const participants = order.participants?.map(mapParticipantFromPrisma) || []
  const totalAmount = participants.reduce((sum, p) => sum + (p.cartTotal || 0), 0)
  const totalItems = participants.reduce((sum, p) => sum + (p.itemCount || 0), 0)

  return {
    id: order.id,
    name: order.name,
    hostCustomerId: order.hostCustomerId,
    hostName: order.hostName || undefined,
    shareCode: order.shareCode,
    status: order.status.toLowerCase() as 'active' | 'locked' | 'closed' | 'completed' | 'cancelled',
    deliveryDate: order.deliveryDate.toISOString(),
    deliveryTime: order.deliveryTime,
    deliveryAddress: order.deliveryAddress as GroupOrder['deliveryAddress'],
    minimumOrderAmount: Number(order.minimumOrderAmount),
    expiresAt: order.expiresAt.toISOString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    participants,
    totalAmount,
    totalItems,
  }
}

/**
 * Map Prisma GroupParticipant to our domain type
 */
function mapParticipantFromPrisma(participant: Prisma.GroupParticipantGetPayload<object>): GroupParticipant {
  return {
    id: participant.id,
    groupOrderId: participant.groupOrderId,
    customerId: participant.customerId || undefined,
    guestName: participant.guestName || undefined,
    guestEmail: participant.guestEmail || undefined,
    cartId: participant.cartId,
    ageVerified: participant.ageVerified,
    status: participant.status.toLowerCase() as 'active' | 'removed' | 'checked_out',
    cartTotal: Number(participant.cartTotal),
    itemCount: participant.itemCount,
    joinedAt: participant.joinedAt.toISOString(),
    checkedOutAt: participant.checkedOutAt?.toISOString(),
    shopifyOrderId: participant.shopifyOrderId || undefined,
    shopifyOrderName: participant.shopifyOrderName || undefined,
  }
}
