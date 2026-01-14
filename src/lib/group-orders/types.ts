export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'EXPIRED' | 'CANCELLED'
export type HostDecision = 'PROCEED_PARTIAL' | 'CANCEL_REFUND_ALL' | 'EXTEND_DEADLINE'

export interface GroupOrderPayment {
  id: string
  groupOrderId: string
  participantId: string
  stripeCheckoutSessionId?: string
  stripePaymentIntentId?: string
  subtotal: number
  taxAmount: number
  deliveryContribution: number
  total: number
  status: PaymentStatus
  paidAt?: string | null
  expiresAt?: string | null
  refundedAmount: number
  refundedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface GroupOrder {
  id: string
  name: string
  hostCustomerId: string
  hostName?: string
  shareCode: string
  status: 'active' | 'locked' | 'completed' | 'cancelled'
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
  paymentDeadline?: string | null
  multiPaymentEnabled?: boolean
  hostDecision?: HostDecision | null
  hostDecisionAt?: string | null
  totalPaid?: number
  totalPending?: number
}

export interface GroupParticipant {
  id: string
  groupOrderId: string
  customerId?: string
  guestName?: string
  guestEmail?: string
  cartId: string
  ageVerified: boolean
  status: 'active' | 'removed'
  joinedAt: string
  cartTotal?: number
  itemCount?: number
  // Payment tracking
  payment?: GroupOrderPayment | null
  paymentStatus?: PaymentStatus
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