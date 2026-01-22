export interface GroupOrder {
  id: string
  name: string
  hostCustomerId: string | null  // null when Shopify customer ID doesn't exist in local Customer table
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
  // Multi-payment fields
  multiPaymentEnabled?: boolean
  paymentDeadline?: string | null
  hostDecision?: 'PROCEED_PARTIAL' | 'CANCEL_REFUND_ALL' | 'EXTEND_DEADLINE' | null
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

/**
 * Payment status response from API for multi-payment group orders
 */
export interface GroupPaymentStatus {
  payment: {
    totalExpected: number
    totalPaid: number
    totalPending: number
    isFullyPaid: boolean
    meetsMinimum: boolean
  }
  participants: {
    total: number
    paid: number
    pending: number
    failed: number
  }
  payments: Array<{
    participantId: string
    participantName: string
    amount: number
    status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED'
    paidAt: string | null
  }>
  deadline: {
    deadline: string | null
    passed: boolean
    needsHostDecision: boolean
  }
}