import { supabase } from '@/lib/supabase/client'
import { groupOrderStore } from './store'
import { GroupOrder, GroupParticipant } from './types'

// Check if Supabase is configured
const isSupabaseConfigured = !!(
  supabase &&
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-project-url.supabase.co'
)

export const db = {
  async createOrder(order: GroupOrder & { participants: GroupParticipant[] }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('group_orders')
        .insert({
          id: order.id,
          name: order.name,
          host_customer_id: order.hostCustomerId,
          host_name: order.hostName,
          share_code: order.shareCode,
          status: order.status,
          delivery_date: order.deliveryDate,
          delivery_time: order.deliveryTime,
          delivery_address: order.deliveryAddress,
          minimum_order_amount: order.minimumOrderAmount,
          expires_at: order.expiresAt,
        })
        .select()
        .single()

      if (error) throw error
      return { ...data, participants: [] }
    } else {
      return groupOrderStore.createOrder(order)
    }
  },

  async getOrderByCode(shareCode: string) {
    if (isSupabaseConfigured && supabase) {
      // Get order
      const { data: order, error: orderError } = await supabase
        .from('group_orders')
        .select('*')
        .eq('share_code', shareCode)
        .single()

      if (orderError) return null

      // Get participants
      const { data: participants, error: participantsError } = await supabase
        .from('group_participants')
        .select('*')
        .eq('group_order_id', order.id)

      if (participantsError) return null

      // Calculate totals from participants
      const totalAmount = participants.reduce((sum, p) => sum + (p.cart_total || 0), 0)
      const totalItems = participants.reduce((sum, p) => sum + (p.item_count || 0), 0)

      return {
        id: order.id,
        name: order.name,
        hostCustomerId: order.host_customer_id,
        hostName: order.host_name,
        shareCode: order.share_code,
        status: order.status,
        deliveryDate: order.delivery_date,
        deliveryTime: order.delivery_time,
        deliveryAddress: order.delivery_address,
        minimumOrderAmount: order.minimum_order_amount,
        expiresAt: order.expires_at,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        participants: participants.map(p => ({
          id: p.id,
          groupOrderId: p.group_order_id,
          customerId: p.customer_id,
          guestName: p.guest_name,
          guestEmail: p.guest_email,
          cartId: p.cart_id,
          ageVerified: p.age_verified,
          status: p.status,
          cartTotal: p.cart_total,
          itemCount: p.item_count,
          joinedAt: p.joined_at,
        })),
        totalAmount,
        totalItems,
      }
    } else {
      const order = groupOrderStore.getOrderByCode(shareCode)
      if (!order) return null
      
      const totalAmount = order.participants.reduce((sum, p) => sum + (p.cartTotal || 0), 0)
      const totalItems = order.participants.reduce((sum, p) => sum + (p.itemCount || 0), 0)
      
      return { ...order, totalAmount, totalItems }
    }
  },

  async getOrderById(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('group_orders')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return null
      
      return {
        id: data.id,
        name: data.name,
        hostCustomerId: data.host_customer_id,
        hostName: data.host_name,
        shareCode: data.share_code,
        status: data.status,
        deliveryDate: data.delivery_date,
        deliveryTime: data.delivery_time,
        deliveryAddress: data.delivery_address,
        minimumOrderAmount: data.minimum_order_amount,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        participants: [],
      }
    } else {
      return groupOrderStore.getOrderById(id)
    }
  },

  async addParticipant(orderId: string, participant: GroupParticipant) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('group_participants')
        .insert({
          id: participant.id,
          group_order_id: orderId,
          customer_id: participant.customerId,
          guest_name: participant.guestName,
          guest_email: participant.guestEmail,
          cart_id: participant.cartId,
          age_verified: participant.ageVerified,
          status: participant.status,
          cart_total: participant.cartTotal,
          item_count: participant.itemCount,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      return groupOrderStore.addParticipant(orderId, participant)
    }
  },

  async getHostOrders(hostCustomerId: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('group_orders')
        .select('*')
        .eq('host_customer_id', hostCustomerId)
        .order('created_at', { ascending: false })

      if (error) return []
      
      return data.map(order => ({
        id: order.id,
        name: order.name,
        hostCustomerId: order.host_customer_id,
        hostName: order.host_name,
        shareCode: order.share_code,
        status: order.status,
        deliveryDate: order.delivery_date,
        deliveryTime: order.delivery_time,
        deliveryAddress: order.delivery_address,
        minimumOrderAmount: order.minimum_order_amount,
        expiresAt: order.expires_at,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }))
    } else {
      return groupOrderStore.getOrdersByHostId(hostCustomerId)
    }
  }
}