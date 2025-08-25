export type Database = {
  public: {
    Tables: {
      group_orders: {
        Row: {
          id: string
          name: string
          host_customer_id: string
          host_name: string | null
          share_code: string
          status: 'active' | 'locked' | 'completed' | 'cancelled'
          delivery_date: string
          delivery_time: string
          delivery_address: {
            address1: string
            address2?: string
            city: string
            province: string
            zip: string
            country: string
          }
          minimum_order_amount: number
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          host_customer_id: string
          host_name?: string | null
          share_code: string
          status?: 'active' | 'locked' | 'completed' | 'cancelled'
          delivery_date: string
          delivery_time: string
          delivery_address: {
            address1: string
            address2?: string
            city: string
            province: string
            zip: string
            country: string
          }
          minimum_order_amount?: number
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          host_customer_id?: string
          host_name?: string | null
          share_code?: string
          status?: 'active' | 'locked' | 'completed' | 'cancelled'
          delivery_date?: string
          delivery_time?: string
          delivery_address?: {
            address1: string
            address2?: string
            city: string
            province: string
            zip: string
            country: string
          }
          minimum_order_amount?: number
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      group_participants: {
        Row: {
          id: string
          group_order_id: string
          customer_id: string | null
          guest_name: string | null
          guest_email: string | null
          cart_id: string
          age_verified: boolean
          status: 'active' | 'removed'
          cart_total: number
          item_count: number
          joined_at: string
        }
        Insert: {
          id?: string
          group_order_id: string
          customer_id?: string | null
          guest_name?: string | null
          guest_email?: string | null
          cart_id: string
          age_verified?: boolean
          status?: 'active' | 'removed'
          cart_total?: number
          item_count?: number
          joined_at?: string
        }
        Update: {
          id?: string
          group_order_id?: string
          customer_id?: string | null
          guest_name?: string | null
          guest_email?: string | null
          cart_id?: string
          age_verified?: boolean
          status?: 'active' | 'removed'
          cart_total?: number
          item_count?: number
          joined_at?: string
        }
      }
      group_messages: {
        Row: {
          id: string
          group_order_id: string
          participant_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          group_order_id: string
          participant_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          group_order_id?: string
          participant_id?: string
          message?: string
          created_at?: string
        }
      }
    }
  }
}