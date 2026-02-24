/**
 * Draft Order Types
 * Types for the invoicing system
 */

import { Prisma } from '@prisma/client';

export interface DraftOrderItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface CreateDraftOrderInput {
  // Customer info
  customerEmail: string;
  customerName: string;
  customerPhone?: string;

  // Delivery info
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState?: string;
  deliveryZip: string;
  deliveryDate: Date;
  deliveryTime: string;
  deliveryNotes?: string;

  // Items
  items: DraftOrderItem[];

  // Amounts
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  originalDeliveryFee?: number | null;
  discountAmount?: number;
  discountCode?: string;

  // Admin
  createdBy?: string;
  adminNotes?: string;

  // Group order (optional)
  groupOrderId?: string;

  // Affiliate attribution (optional)
  affiliateId?: string;
  affiliateCode?: string;

  // Expiration (optional)
  expiresAt?: Date;
}

export interface UpdateDraftOrderInput {
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string | null;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  deliveryDate?: Date;
  deliveryTime?: string;
  deliveryNotes?: string | null;
  items?: DraftOrderItem[];
  subtotal?: number;
  taxAmount?: number;
  deliveryFee?: number;
  originalDeliveryFee?: number | null;
  discountAmount?: number;
  discountCode?: string | null;
  adminNotes?: string | null;
  affiliateId?: string | null;
  affiliateCode?: string | null;
  expiresAt?: Date | null;
}

export interface DraftOrderWithTotal {
  id: string;
  token: string;
  status: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  deliveryDate: Date;
  deliveryTime: string;
  deliveryNotes: string | null;
  items: DraftOrderItem[];
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  deliveryFee: Prisma.Decimal;
  originalDeliveryFee: Prisma.Decimal | null;
  discountAmount: Prisma.Decimal;
  discountCode: string | null;
  total: Prisma.Decimal;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: Date | null;
  sentAt: Date | null;
  viewedAt: Date | null;
  expiresAt: Date | null;
  convertedOrderId: string | null;
  createdBy: string | null;
  adminNotes: string | null;
  groupOrderId: string | null;
  affiliateId: string | null;
  affiliateCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendInvoiceResult {
  success: boolean;
  invoiceUrl: string;
  emailSent: boolean;
  error?: string;
}
