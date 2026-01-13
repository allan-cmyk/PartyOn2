export interface GroupOrder {
  id: string
  name: string
  hostCustomerId: string
  hostName?: string
  shareCode: string
  status: 'active' | 'locked' | 'closed' | 'completed' | 'cancelled'
  deliveryDate: string
  deliveryTime: string
  deliveryAddress: {
    address1: string
    address2?: string
    city: string
    province: string
    zip: string
    country: string
  }
  minimumOrderAmount: number
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface GroupParticipant {
  id: string
  groupOrderId: string
  customerId?: string
  guestName?: string
  guestEmail?: string
  cartId: string
  ageVerified: boolean
  status: 'active' | 'removed' | 'checked_out'
  joinedAt: string
  cartTotal?: number
  itemCount?: number
  // Checkout tracking fields
  checkedOutAt?: string
  shopifyOrderId?: string
  shopifyOrderName?: string
}

export interface GroupOrderWithParticipants extends GroupOrder {
  participants: GroupParticipant[]
  totalAmount: number
  totalItems: number
}

export interface CreateGroupOrderInput {
  name: string
  deliveryDate: string
  deliveryTime: string
  deliveryAddress: {
    address1: string
    address2?: string
    city: string
    province: string
    zip: string
    country: string
  }
  customerId: string
  customerName: string
}

export interface JoinGroupOrderInput {
  cartId: string
  customerId?: string
  guestName?: string
  guestEmail?: string
}

export interface GroupOrderShareData {
  shareCode: string
  shareUrl: string
  qrCodeUrl?: string
}

/**
 * Item purchased within a group order (for visibility to all participants)
 */
export interface GroupOrderItem {
  id: string
  groupOrderId: string
  participantId: string
  shopifyLineId: string
  title: string
  variantTitle?: string
  quantity: number
  price: number
  imageUrl?: string
  createdAt: string
}

/**
 * Aggregated item for display (combines duplicates from different participants)
 */
export interface AggregatedGroupOrderItem {
  title: string
  variantTitle?: string
  quantity: number
  totalPrice: number
  imageUrl?: string
}

/**
 * Checkout stats for a group order
 */
export interface GroupCheckoutStats {
  total: number
  checkedOut: number
  shopping: number
}