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