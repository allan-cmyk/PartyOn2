/**
 * Draft Order Service
 * Handles creating, managing, and converting draft orders (invoices)
 */

import { prisma } from '@/lib/database/client';
import { Prisma, DraftOrderStatus } from '@prisma/client';
import { CreateDraftOrderInput, UpdateDraftOrderInput, DraftOrderItem, DraftOrderWithTotal } from './types';
import { calculateCartTax } from '@/lib/tax';

/**
 * Create a new draft order
 */
export async function createDraftOrder(input: CreateDraftOrderInput): Promise<DraftOrderWithTotal> {
  const {
    customerEmail,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryCity,
    deliveryState = 'TX',
    deliveryZip,
    deliveryDate,
    deliveryTime,
    deliveryNotes,
    items,
    subtotal,
    taxAmount,
    deliveryFee,
    discountAmount = 0,
    discountCode,
    createdBy,
    adminNotes,
    groupOrderId,
    expiresAt,
  } = input;

  // Calculate total
  const total = subtotal - discountAmount + taxAmount + deliveryFee;

  const draftOrder = await prisma.draftOrder.create({
    data: {
      customerEmail,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZip,
      deliveryDate,
      deliveryTime,
      deliveryNotes,
      items: items as unknown as Prisma.InputJsonValue,
      subtotal: new Prisma.Decimal(subtotal),
      taxAmount: new Prisma.Decimal(taxAmount),
      deliveryFee: new Prisma.Decimal(deliveryFee),
      discountAmount: new Prisma.Decimal(discountAmount),
      discountCode,
      total: new Prisma.Decimal(total),
      createdBy,
      adminNotes,
      groupOrderId,
      expiresAt,
      status: 'PENDING',
    },
  });

  return {
    ...draftOrder,
    items: draftOrder.items as unknown as DraftOrderItem[],
  } as DraftOrderWithTotal;
}

/**
 * Get draft order by ID
 */
export async function getDraftOrderById(id: string): Promise<DraftOrderWithTotal | null> {
  const draftOrder = await prisma.draftOrder.findUnique({
    where: { id },
  });

  if (!draftOrder) return null;

  return {
    ...draftOrder,
    items: draftOrder.items as unknown as DraftOrderItem[],
  } as DraftOrderWithTotal;
}

/**
 * Get draft order by token (for customer invoice view)
 */
export async function getDraftOrderByToken(token: string): Promise<DraftOrderWithTotal | null> {
  const draftOrder = await prisma.draftOrder.findUnique({
    where: { token },
  });

  if (!draftOrder) return null;

  return {
    ...draftOrder,
    items: draftOrder.items as unknown as DraftOrderItem[],
  } as DraftOrderWithTotal;
}

/**
 * Update draft order
 */
export async function updateDraftOrder(
  id: string,
  input: UpdateDraftOrderInput
): Promise<DraftOrderWithTotal> {
  // Get current draft order to recalculate total if needed
  const current = await prisma.draftOrder.findUnique({ where: { id } });
  if (!current) throw new Error('Draft order not found');

  // Build update data
  const updateData: Prisma.DraftOrderUpdateInput = {};

  if (input.customerEmail) updateData.customerEmail = input.customerEmail;
  if (input.customerName) updateData.customerName = input.customerName;
  if (input.customerPhone !== undefined) updateData.customerPhone = input.customerPhone;
  if (input.deliveryAddress) updateData.deliveryAddress = input.deliveryAddress;
  if (input.deliveryCity) updateData.deliveryCity = input.deliveryCity;
  if (input.deliveryState) updateData.deliveryState = input.deliveryState;
  if (input.deliveryZip) updateData.deliveryZip = input.deliveryZip;
  if (input.deliveryDate) updateData.deliveryDate = input.deliveryDate;
  if (input.deliveryTime) updateData.deliveryTime = input.deliveryTime;
  if (input.deliveryNotes !== undefined) updateData.deliveryNotes = input.deliveryNotes;
  if (input.adminNotes !== undefined) updateData.adminNotes = input.adminNotes;
  if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
  if (input.items) updateData.items = input.items as unknown as Prisma.InputJsonValue;
  if (input.discountCode !== undefined) updateData.discountCode = input.discountCode;

  // Handle amount updates
  const subtotal = input.subtotal ?? Number(current.subtotal);
  const taxAmount = input.taxAmount ?? Number(current.taxAmount);
  const deliveryFee = input.deliveryFee ?? Number(current.deliveryFee);
  const discountAmount = input.discountAmount ?? Number(current.discountAmount);

  if (input.subtotal !== undefined) updateData.subtotal = new Prisma.Decimal(input.subtotal);
  if (input.taxAmount !== undefined) updateData.taxAmount = new Prisma.Decimal(input.taxAmount);
  if (input.deliveryFee !== undefined) updateData.deliveryFee = new Prisma.Decimal(input.deliveryFee);
  if (input.discountAmount !== undefined) updateData.discountAmount = new Prisma.Decimal(input.discountAmount);

  // Recalculate total
  const total = subtotal - discountAmount + taxAmount + deliveryFee;
  updateData.total = new Prisma.Decimal(total);

  const draftOrder = await prisma.draftOrder.update({
    where: { id },
    data: updateData,
  });

  return {
    ...draftOrder,
    items: draftOrder.items as unknown as DraftOrderItem[],
  } as DraftOrderWithTotal;
}

/**
 * Delete draft order
 */
export async function deleteDraftOrder(id: string): Promise<void> {
  await prisma.draftOrder.delete({ where: { id } });
}

/**
 * Update draft order status
 */
export async function updateDraftOrderStatus(
  id: string,
  status: DraftOrderStatus,
  additionalData?: Partial<{
    sentAt: Date;
    viewedAt: Date;
    paidAt: Date;
    convertedOrderId: string;
    stripeCheckoutSessionId: string;
    stripePaymentIntentId: string;
  }>
): Promise<DraftOrderWithTotal> {
  const draftOrder = await prisma.draftOrder.update({
    where: { id },
    data: {
      status,
      ...additionalData,
    },
  });

  return {
    ...draftOrder,
    items: draftOrder.items as unknown as DraftOrderItem[],
  } as DraftOrderWithTotal;
}

/**
 * Mark draft order as viewed (when customer opens invoice link)
 */
export async function markDraftOrderViewed(token: string): Promise<DraftOrderWithTotal | null> {
  const draftOrder = await prisma.draftOrder.findUnique({
    where: { token },
  });

  if (!draftOrder) return null;

  // Only update if not already viewed/paid
  if (draftOrder.status === 'SENT') {
    const updated = await prisma.draftOrder.update({
      where: { token },
      data: {
        status: 'VIEWED',
        viewedAt: new Date(),
      },
    });
    return {
      ...updated,
      items: updated.items as unknown as DraftOrderItem[],
    } as DraftOrderWithTotal;
  }

  return {
    ...draftOrder,
    items: draftOrder.items as unknown as DraftOrderItem[],
  } as DraftOrderWithTotal;
}

/**
 * List draft orders with filtering
 */
export async function listDraftOrders(options?: {
  status?: DraftOrderStatus;
  customerEmail?: string;
  groupOrderId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'deliveryDate';
  order?: 'asc' | 'desc';
}): Promise<{ draftOrders: DraftOrderWithTotal[]; total: number }> {
  const {
    status,
    customerEmail,
    groupOrderId,
    limit = 50,
    offset = 0,
    orderBy = 'createdAt',
    order = 'desc',
  } = options || {};

  const where: Prisma.DraftOrderWhereInput = {};
  if (status) where.status = status;
  if (customerEmail) where.customerEmail = { contains: customerEmail, mode: 'insensitive' };
  if (groupOrderId) where.groupOrderId = groupOrderId;

  const [draftOrders, total] = await Promise.all([
    prisma.draftOrder.findMany({
      where,
      orderBy: { [orderBy]: order },
      take: limit,
      skip: offset,
    }),
    prisma.draftOrder.count({ where }),
  ]);

  return {
    draftOrders: draftOrders.map((d) => ({
      ...d,
      items: d.items as unknown as DraftOrderItem[],
    })) as DraftOrderWithTotal[],
    total,
  };
}

/**
 * Calculate draft order amounts from items
 */
export function calculateDraftOrderAmounts(
  items: DraftOrderItem[],
  deliveryZip: string,
  deliveryFee: number,
  discountAmount: number = 0
): {
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
} {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate tax
  const taxResult = calculateCartTax({
    subtotal,
    discountAmount,
    zipCode: deliveryZip,
  });

  const total = subtotal - discountAmount + taxResult.taxAmount + deliveryFee;

  return {
    subtotal,
    taxAmount: taxResult.taxAmount,
    deliveryFee,
    discountAmount,
    total,
  };
}

/**
 * Check if draft order is expired
 */
export function isDraftOrderExpired(draftOrder: DraftOrderWithTotal): boolean {
  if (!draftOrder.expiresAt) return false;
  return new Date() > draftOrder.expiresAt;
}

/**
 * Check if draft order can be paid
 */
export function canDraftOrderBePaid(draftOrder: DraftOrderWithTotal): {
  canPay: boolean;
  reason?: string;
} {
  if (draftOrder.status === 'PAID') {
    return { canPay: false, reason: 'This invoice has already been paid' };
  }
  if (draftOrder.status === 'CONVERTED') {
    return { canPay: false, reason: 'This invoice has been converted to an order' };
  }
  if (draftOrder.status === 'CANCELLED') {
    return { canPay: false, reason: 'This invoice has been cancelled' };
  }
  if (draftOrder.status === 'EXPIRED' || isDraftOrderExpired(draftOrder)) {
    return { canPay: false, reason: 'This invoice has expired' };
  }
  return { canPay: true };
}
