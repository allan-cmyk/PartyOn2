import { prisma, kv, isDatabaseConfigured, isKVConfigured } from '@/lib/database/client'
import { groupOrderStore } from './store'
import { GroupOrder, GroupParticipant } from './types'

// Use Vercel Postgres if configured, otherwise fall back to in-memory store
export const db = {
  async createOrder(order: GroupOrder & { participants: GroupParticipant[] }) {
    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.groupOrder.create({
          data: {
            id: order.id,
            name: order.name,
            hostCustomerId: order.hostCustomerId,
            hostName: order.hostName,
            shareCode: order.shareCode,
            status: order.status.toUpperCase() as never,
            deliveryDate: new Date(order.deliveryDate),
            deliveryTime: order.deliveryTime,
            deliveryAddress: order.deliveryAddress,
            minimumOrderAmount: order.minimumOrderAmount,
            expiresAt: new Date(order.expiresAt),
          },
        })

        // Also store in KV for fast lookups
        if (isKVConfigured()) {
          await kv.set(`share:${order.shareCode}`, order.id, {
            ex: 60 * 60 * 24 * 7, // Expire after 7 days
          })
        }

        return {
          ...order,
          id: created.id,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        }
      } catch (error) {
        console.error('Database error, falling back to in-memory store:', error)
        return groupOrderStore.createOrder(order)
      }
    } else {
      return groupOrderStore.createOrder(order)
    }
  },

  async getOrderByCode(shareCode: string) {
    if (isDatabaseConfigured()) {
      try {
        // Try KV first for fast lookup
        let orderId: string | null = null
        if (isKVConfigured()) {
          orderId = await kv.get(`share:${shareCode}`)
        }

        // Get from Postgres
        const order = await prisma.groupOrder.findUnique({
          where: orderId ? { id: orderId } : { shareCode },
          include: {
            participants: true,
          },
        })

        if (!order) return null

        // Calculate totals
        const totalAmount = order.participants.reduce(
          (sum, p) => sum + Number(p.cartTotal),
          0
        )
        const totalItems = order.participants.reduce(
          (sum, p) => sum + p.itemCount,
          0
        )

        return {
          id: order.id,
          name: order.name,
          hostCustomerId: order.hostCustomerId,
          hostName: order.hostName || undefined,
          shareCode: order.shareCode,
          status: order.status.toLowerCase() as never,
          deliveryDate: order.deliveryDate.toISOString().split('T')[0],
          deliveryTime: order.deliveryTime,
          deliveryAddress: order.deliveryAddress as never,
          minimumOrderAmount: Number(order.minimumOrderAmount),
          expiresAt: order.expiresAt.toISOString(),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          participants: order.participants.map(p => ({
            id: p.id,
            groupOrderId: p.groupOrderId,
            customerId: p.customerId || undefined,
            guestName: p.guestName || undefined,
            guestEmail: p.guestEmail || undefined,
            cartId: p.cartId,
            ageVerified: p.ageVerified,
            status: p.status.toLowerCase() as never,
            cartTotal: Number(p.cartTotal),
            itemCount: p.itemCount,
            joinedAt: p.joinedAt.toISOString(),
          })),
          totalAmount,
          totalItems,
        }
      } catch (error) {
        console.error('Database error, falling back to in-memory store:', error)
        const order = groupOrderStore.getOrderByCode(shareCode)
        if (!order) return null
        
        const totalAmount = order.participants.reduce((sum, p) => sum + (p.cartTotal || 0), 0)
        const totalItems = order.participants.reduce((sum, p) => sum + (p.itemCount || 0), 0)
        
        return { ...order, totalAmount, totalItems }
      }
    } else {
      const order = groupOrderStore.getOrderByCode(shareCode)
      if (!order) return null
      
      const totalAmount = order.participants.reduce((sum, p) => sum + (p.cartTotal || 0), 0)
      const totalItems = order.participants.reduce((sum, p) => sum + (p.itemCount || 0), 0)
      
      return { ...order, totalAmount, totalItems }
    }
  },

  async addParticipant(orderId: string, participant: GroupParticipant) {
    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.groupParticipant.create({
          data: {
            id: participant.id,
            groupOrderId: orderId,
            customerId: participant.customerId,
            guestName: participant.guestName,
            guestEmail: participant.guestEmail,
            cartId: participant.cartId,
            ageVerified: participant.ageVerified,
            status: participant.status.toUpperCase() as never,
            cartTotal: participant.cartTotal || 0,
            itemCount: participant.itemCount || 0,
          },
        })

        // Store active session in KV
        if (isKVConfigured()) {
          await kv.set(
            `cart:sync:${participant.cartId}`,
            {
              groupOrderId: orderId,
              participantId: created.id,
            },
            { ex: 60 * 60 * 24 } // Expire after 24 hours
          )
        }

        return {
          ...participant,
          id: created.id,
          joinedAt: created.joinedAt.toISOString(),
        }
      } catch (error) {
        console.error('Database error, falling back to in-memory store:', error)
        return groupOrderStore.addParticipant(orderId, participant)
      }
    } else {
      return groupOrderStore.addParticipant(orderId, participant)
    }
  },

  async updateParticipantCart(
    orderId: string,
    cartId: string,
    cartTotal: number,
    itemCount: number
  ) {
    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.groupParticipant.updateMany({
          where: {
            groupOrderId: orderId,
            cartId: cartId,
          },
          data: {
            cartTotal,
            itemCount,
          },
        })

        // Update KV cache
        if (isKVConfigured()) {
          const key = `cart:${orderId}:${cartId}`
          await kv.set(key, { cartTotal, itemCount }, { ex: 60 * 60 })
        }

        return updated.count > 0
      } catch (error) {
        console.error('Database error, falling back to in-memory store:', error)
        return groupOrderStore.updateParticipantCart(orderId, cartId, cartTotal, itemCount)
      }
    } else {
      return groupOrderStore.updateParticipantCart(orderId, cartId, cartTotal, itemCount)
    }
  },

  async getHostOrders(hostCustomerId: string) {
    if (isDatabaseConfigured()) {
      try {
        const orders = await prisma.groupOrder.findMany({
          where: {
            hostCustomerId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return orders.map(order => ({
          id: order.id,
          name: order.name,
          hostCustomerId: order.hostCustomerId,
          hostName: order.hostName || undefined,
          shareCode: order.shareCode,
          status: order.status.toLowerCase() as never,
          deliveryDate: order.deliveryDate.toISOString().split('T')[0],
          deliveryTime: order.deliveryTime,
          deliveryAddress: order.deliveryAddress as never,
          minimumOrderAmount: Number(order.minimumOrderAmount),
          expiresAt: order.expiresAt.toISOString(),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        }))
      } catch (error) {
        console.error('Database error, falling back to in-memory store:', error)
        return groupOrderStore.getOrdersByHostId(hostCustomerId)
      }
    } else {
      return groupOrderStore.getOrdersByHostId(hostCustomerId)
    }
  },

  async savePartnerInquiry(inquiry: {
    businessName: string
    businessType?: string
    contactName: string
    email: string
    phone?: string
    numberOfRooms?: string
    monthlyVolume?: string
    currentProvider?: string
    interests: string[]
    message?: string
  }) {
    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.partnerInquiry.create({
          data: inquiry,
        })
        return created
      } catch (error) {
        console.error('Failed to save partner inquiry:', error)
        // Could fall back to sending an email or saving to a different service
        return null
      }
    } else {
      // In development without DB, just log it
      console.log('Partner inquiry (no DB configured):', inquiry)
      return { id: 'demo-' + Date.now(), ...inquiry }
    }
  },
}