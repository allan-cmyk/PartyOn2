/**
 * Group Orders V2 - Service Layer
 * Core CRUD + business logic for tab-based group ordering
 */

import { prisma } from '@/lib/database/client';
import { calculateDeliveryFee } from '@/lib/delivery/rates';
import {
  generateShareCode,
  computeOrderDeadline,
  defaultExpiresAt,
  findEarliestDeadline,
  findEarliestDelivery,
  computeCountdownTarget,
} from './utils';
import type {
  GroupOrderV2Full,
  SubOrderFull,
  ParticipantSummary,
  DraftCartItemView,
  PurchasedItemView,
  DeliveryInvoiceView,
  TabTotals,
  TimerInfo,
  CreateGroupOrderV2Input,
  CreateTabInput,
  UpdateTabInput,
  JoinGroupOrderInput,
  AddDraftItemInput,
} from './types';

const toNum = (val: unknown): number => {
  if (val === null || val === undefined) return 0;
  return typeof val === 'number' ? val : Number(val);
};

// ==========================================
// Full includes for nested queries
// ==========================================

const fullGroupIncludes = {
  tabs: {
    orderBy: { position: 'asc' as const },
    include: {
      draftItems: {
        include: {
          addedBy: true,
        },
      },
      purchasedItems: {
        include: {
          participant: true,
          payment: true,
        },
      },
      deliveryInvoice: true,
    },
  },
  participants: {
    orderBy: { joinedAt: 'asc' as const },
  },
};

// ==========================================
// Serialization helpers
// ==========================================

function serializeParticipant(p: {
  id: string;
  guestName: string | null;
  guestEmail: string | null;
  isHost: boolean;
  ageVerified: boolean;
  status: string;
  joinedAt: Date;
}): ParticipantSummary {
  return {
    id: p.id,
    name: p.guestName || 'Unknown',
    email: p.guestEmail,
    isHost: p.isHost,
    ageVerified: p.ageVerified,
    status: p.status as 'ACTIVE' | 'REMOVED',
    joinedAt: p.joinedAt.toISOString(),
  };
}

function serializeParticipantInfo(p: {
  id: string;
  guestName: string | null;
  isHost: boolean;
}) {
  return {
    id: p.id,
    name: p.guestName || 'Unknown',
    isHost: p.isHost,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function serializeTab(tab: any): SubOrderFull {
  const draftItems: DraftCartItemView[] = (tab.draftItems || []).map((item: any) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    title: item.title,
    variantTitle: item.variantTitle,
    price: toNum(item.price),
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    addedBy: serializeParticipantInfo(item.addedBy),
  }));

  const purchasedItems: PurchasedItemView[] = (tab.purchasedItems || []).map((item: any) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    title: item.title,
    variantTitle: item.variantTitle,
    price: toNum(item.price),
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    purchaser: serializeParticipantInfo(item.participant),
    paidAt: item.payment?.paidAt?.toISOString() || item.createdAt?.toISOString() || '',
  }));

  const draftSubtotal = draftItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const purchasedSubtotal = purchasedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fee = toNum(tab.deliveryFee);

  const invoice: DeliveryInvoiceView | null = tab.deliveryInvoice
    ? {
        id: tab.deliveryInvoice.id,
        deliveryFee: toNum(tab.deliveryInvoice.deliveryFee),
        discountCode: tab.deliveryInvoice.discountCode,
        discountAmount: toNum(tab.deliveryInvoice.discountAmount),
        total: toNum(tab.deliveryInvoice.total),
        status: tab.deliveryInvoice.status,
        paidAt: tab.deliveryInvoice.paidAt?.toISOString() || null,
      }
    : null;

  const totals: TabTotals = { draftSubtotal, purchasedSubtotal, deliveryFee: fee };

  return {
    id: tab.id,
    name: tab.name,
    position: tab.position,
    status: tab.status,
    orderType: tab.orderType ?? null,
    deliveryDate: tab.deliveryDate.toISOString(),
    deliveryTime: tab.deliveryTime,
    deliveryAddress: tab.deliveryAddress as any,
    deliveryPhone: tab.deliveryPhone,
    deliveryNotes: tab.deliveryNotes,
    orderDeadline: tab.orderDeadline.toISOString(),
    deliveryFee: fee,
    deliveryFeeWaived: tab.deliveryFeeWaived,
    draftItems,
    purchasedItems,
    deliveryInvoice: invoice,
    totals,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeGroup(group: Record<string, any>): GroupOrderV2Full {
  const tabs = (group.tabs || []).map(serializeTab);
  const participants = (group.participants || []).map(serializeParticipant);

  const deadlines = tabs
    .filter((t: SubOrderFull) => t.status === 'OPEN')
    .map((t: SubOrderFull) => new Date(t.orderDeadline));
  const deliveries = tabs
    .filter((t: SubOrderFull) => t.status !== 'CANCELLED')
    .map((t: SubOrderFull) => new Date(t.deliveryDate));

  const earliestDeadline = findEarliestDeadline(deadlines);
  const earliestDelivery = findEarliestDelivery(deliveries);
  const countdownTarget = computeCountdownTarget(earliestDeadline, earliestDelivery);

  const timer: TimerInfo = {
    earliestDeadline: earliestDeadline?.toISOString() || null,
    earliestDelivery: earliestDelivery?.toISOString() || null,
    countdownTarget: countdownTarget?.toISOString() || null,
  };

  return {
    id: group.id,
    name: group.name,
    shareCode: group.shareCode,
    status: group.status,
    hostName: group.hostName,
    hostEmail: group.hostEmail,
    hostPhone: group.hostPhone,
    expiresAt: group.expiresAt.toISOString(),
    createdAt: group.createdAt.toISOString(),
    tabs,
    participants,
    timer,
  };
}

// ==========================================
// Group Order CRUD
// ==========================================

export async function createGroupOrder(
  input: CreateGroupOrderV2Input
): Promise<GroupOrderV2Full> {
  // Generate unique share code (retry on collision)
  let shareCode = generateShareCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.groupOrderV2.findUnique({
      where: { shareCode },
    });
    if (!existing) break;
    shareCode = generateShareCode();
    attempts++;
  }

  const group = await prisma.groupOrderV2.create({
    data: {
      name: input.name,
      hostName: input.hostName,
      hostEmail: input.hostEmail || null,
      hostPhone: input.hostPhone || null,
      hostCustomerId: input.hostCustomerId || null,
      shareCode,
      expiresAt: defaultExpiresAt(),
      tabs: {
        create: input.tabs.map((tab, idx) => {
          const deliveryDate = new Date(tab.deliveryDate);
          const zip = tab.deliveryAddress.zip;
          const feeResult = calculateDeliveryFee(zip, 0, false);
          return {
            name: tab.name,
            position: idx,
            orderType: tab.orderType ?? null,
            deliveryDate,
            deliveryTime: tab.deliveryTime,
            deliveryAddress: tab.deliveryAddress as unknown as Record<string, string>,
            deliveryPhone: tab.deliveryPhone || null,
            deliveryNotes: tab.deliveryNotes || null,
            orderDeadline: computeOrderDeadline(deliveryDate),
            deliveryFee: feeResult.originalFee,
          };
        }),
      },
      participants: {
        create: {
          guestName: input.hostName,
          guestEmail: input.hostEmail || null,
          customerId: input.hostCustomerId || null,
          isHost: true,
          ageVerified: true,
          status: 'ACTIVE',
        },
      },
    },
    include: fullGroupIncludes,
  });

  return serializeGroup(group);
}

export async function getGroupOrderByCode(
  shareCode: string
): Promise<GroupOrderV2Full | null> {
  const group = await prisma.groupOrderV2.findUnique({
    where: { shareCode },
    include: fullGroupIncludes,
  });
  if (!group) return null;
  return serializeGroup(group);
}

export async function getGroupOrderById(
  id: string
): Promise<GroupOrderV2Full | null> {
  const group = await prisma.groupOrderV2.findUnique({
    where: { id },
    include: fullGroupIncludes,
  });
  if (!group) return null;
  return serializeGroup(group);
}

export async function updateGroupOrderStatus(
  shareCode: string,
  status: 'ACTIVE' | 'CLOSED' | 'COMPLETED' | 'CANCELLED',
  name?: string
): Promise<void> {
  await prisma.groupOrderV2.update({
    where: { shareCode },
    data: {
      ...(name ? { name } : {}),
      status,
    },
  });
}

export async function cancelGroupOrder(
  shareCode: string,
  hostParticipantId: string
): Promise<void> {
  // Verify host
  const group = await prisma.groupOrderV2.findUnique({
    where: { shareCode },
    include: { participants: { where: { id: hostParticipantId, isHost: true } } },
  });
  if (!group || group.participants.length === 0) {
    throw new Error('Only the host can cancel a group order');
  }
  await prisma.groupOrderV2.update({
    where: { shareCode },
    data: { status: 'CANCELLED' },
  });
}

export async function getMyGroupOrders(
  customerId: string
): Promise<GroupOrderV2Full[]> {
  const participations = await prisma.groupParticipantV2.findMany({
    where: { customerId, status: 'ACTIVE' },
    select: { groupOrderId: true },
  });
  const ids = participations.map((p) => p.groupOrderId);
  if (ids.length === 0) return [];

  const groups = await prisma.groupOrderV2.findMany({
    where: { id: { in: ids } },
    include: fullGroupIncludes,
    orderBy: { createdAt: 'desc' },
  });
  return groups.map(serializeGroup);
}

// ==========================================
// Tab CRUD
// ==========================================

export async function createTab(
  groupOrderId: string,
  input: CreateTabInput
): Promise<SubOrderFull> {
  const maxPos = await prisma.subOrder.aggregate({
    where: { groupOrderId },
    _max: { position: true },
  });
  const nextPos = (maxPos._max.position ?? -1) + 1;
  const deliveryDate = new Date(input.deliveryDate);
  const zip = input.deliveryAddress.zip;
  const feeResult = calculateDeliveryFee(zip, 0, false);

  const tab = await prisma.subOrder.create({
    data: {
      groupOrderId,
      name: input.name,
      position: nextPos,
      orderType: input.orderType ?? null,
      deliveryDate,
      deliveryTime: input.deliveryTime,
      deliveryAddress: input.deliveryAddress as unknown as Record<string, string>,
      deliveryPhone: input.deliveryPhone || null,
      deliveryNotes: input.deliveryNotes || null,
      orderDeadline: computeOrderDeadline(deliveryDate),
      deliveryFee: feeResult.originalFee,
    },
    include: {
      draftItems: { include: { addedBy: true } },
      purchasedItems: { include: { participant: true, payment: true } },
      deliveryInvoice: true,
    },
  });

  return serializeTab(tab);
}

export async function updateTab(
  tabId: string,
  input: UpdateTabInput
): Promise<SubOrderFull> {
  const existing = await prisma.subOrder.findUnique({ where: { id: tabId } });
  if (!existing) throw new Error('Tab not found');

  const data: Record<string, unknown> = {};
  if (input.name) data.name = input.name;
  if (input.orderType !== undefined) data.orderType = input.orderType || null;
  if (input.status) data.status = input.status;
  if (input.deliveryTime) data.deliveryTime = input.deliveryTime;
  if (input.deliveryAddress) {
    data.deliveryAddress = input.deliveryAddress as unknown as Record<string, string>;
    const zip = input.deliveryAddress.zip;
    const feeResult = calculateDeliveryFee(zip, 0, false);
    data.deliveryFee = feeResult.originalFee;
  }
  if (input.deliveryPhone !== undefined) data.deliveryPhone = input.deliveryPhone || null;
  if (input.deliveryNotes !== undefined) data.deliveryNotes = input.deliveryNotes || null;
  if (input.deliveryDate) {
    const deliveryDate = new Date(input.deliveryDate);
    data.deliveryDate = deliveryDate;
    data.orderDeadline = computeOrderDeadline(deliveryDate);
  }

  const tab = await prisma.subOrder.update({
    where: { id: tabId },
    data,
    include: {
      draftItems: { include: { addedBy: true } },
      purchasedItems: { include: { participant: true, payment: true } },
      deliveryInvoice: true,
    },
  });

  return serializeTab(tab);
}

export async function deleteTab(tabId: string): Promise<void> {
  await prisma.subOrder.delete({ where: { id: tabId } });
}

// ==========================================
// Participants
// ==========================================

export async function joinGroupOrder(
  shareCode: string,
  input: JoinGroupOrderInput
): Promise<ParticipantSummary> {
  const group = await prisma.groupOrderV2.findUnique({
    where: { shareCode },
  });
  if (!group) throw new Error('Group order not found');
  if (group.status !== 'ACTIVE') throw new Error('Group order is not accepting new participants');

  // Check for existing participant (idempotent join)
  const existingByEmail = await prisma.groupParticipantV2.findUnique({
    where: {
      groupOrderId_guestEmail: {
        groupOrderId: group.id,
        guestEmail: input.guestEmail,
      },
    },
  });
  if (existingByEmail) {
    if (existingByEmail.status === 'REMOVED') {
      // Re-activate removed participant
      const reactivated = await prisma.groupParticipantV2.update({
        where: { id: existingByEmail.id },
        data: { status: 'ACTIVE', ageVerified: input.ageVerified },
      });
      return serializeParticipant(reactivated);
    }
    return serializeParticipant(existingByEmail);
  }

  const participant = await prisma.groupParticipantV2.create({
    data: {
      groupOrderId: group.id,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      customerId: input.customerId || null,
      ageVerified: input.ageVerified,
      isHost: false,
      status: 'ACTIVE',
    },
  });

  return serializeParticipant(participant);
}

export async function removeParticipant(
  groupOrderId: string,
  participantId: string
): Promise<void> {
  // Delete their draft items across all tabs
  await prisma.draftCartItem.deleteMany({
    where: { addedByParticipantId: participantId },
  });

  // Set status to REMOVED (purchased items remain)
  await prisma.groupParticipantV2.update({
    where: { id: participantId },
    data: { status: 'REMOVED' },
  });
}

// ==========================================
// Draft Cart Items
// ==========================================

export async function addDraftItem(
  subOrderId: string,
  input: AddDraftItemInput
): Promise<DraftCartItemView> {
  // Check tab is open
  const tab = await prisma.subOrder.findUnique({ where: { id: subOrderId } });
  if (!tab) throw new Error('Tab not found');
  if (tab.status !== 'OPEN') throw new Error('Tab is locked or closed');

  // Check deadline
  if (new Date() > tab.orderDeadline) {
    throw new Error('Order deadline has passed');
  }

  // Upsert: if same variant exists for this participant, increment qty
  const existing = await prisma.draftCartItem.findUnique({
    where: {
      subOrderId_addedByParticipantId_variantId: {
        subOrderId,
        addedByParticipantId: input.participantId,
        variantId: input.variantId,
      },
    },
  });

  let item;
  if (existing) {
    item = await prisma.draftCartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + input.quantity },
      include: { addedBy: true },
    });
  } else {
    item = await prisma.draftCartItem.create({
      data: {
        subOrderId,
        addedByParticipantId: input.participantId,
        productId: input.productId,
        variantId: input.variantId,
        title: input.title,
        variantTitle: input.variantTitle || null,
        price: input.price,
        imageUrl: input.imageUrl || null,
        quantity: input.quantity,
      },
      include: { addedBy: true },
    });
  }

  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    title: item.title,
    variantTitle: item.variantTitle,
    price: toNum(item.price),
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    addedBy: serializeParticipantInfo(item.addedBy),
  };
}

export async function updateDraftItem(
  itemId: string,
  participantId: string,
  quantity: number,
  isHost: boolean
): Promise<DraftCartItemView> {
  const item = await prisma.draftCartItem.findUnique({
    where: { id: itemId },
    include: { addedBy: true, subOrder: true },
  });
  if (!item) throw new Error('Item not found');
  if (!isHost && item.addedByParticipantId !== participantId) {
    throw new Error('Only the item owner or host can update this item');
  }
  if (item.subOrder.status !== 'OPEN') throw new Error('Tab is locked or closed');

  const updated = await prisma.draftCartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { addedBy: true },
  });

  return {
    id: updated.id,
    productId: updated.productId,
    variantId: updated.variantId,
    title: updated.title,
    variantTitle: updated.variantTitle,
    price: toNum(updated.price),
    imageUrl: updated.imageUrl,
    quantity: updated.quantity,
    addedBy: serializeParticipantInfo(updated.addedBy),
  };
}

export async function removeDraftItem(
  itemId: string,
  participantId: string,
  isHost: boolean
): Promise<void> {
  const item = await prisma.draftCartItem.findUnique({
    where: { id: itemId },
    include: { subOrder: true },
  });
  if (!item) throw new Error('Item not found');
  if (!isHost && item.addedByParticipantId !== participantId) {
    throw new Error('Only the item owner or host can remove this item');
  }
  if (item.subOrder.status !== 'OPEN') throw new Error('Tab is locked or closed');

  await prisma.draftCartItem.delete({ where: { id: itemId } });
}

// ==========================================
// Payment Flow
// ==========================================

export async function moveDraftToPurchased(
  subOrderId: string,
  participantId: string,
  paymentId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const draftItems = await tx.draftCartItem.findMany({
      where: { subOrderId, addedByParticipantId: participantId },
    });

    if (draftItems.length === 0) return;

    // Create purchased items from drafts
    await tx.purchasedItem.createMany({
      data: draftItems.map((item) => ({
        subOrderId,
        participantId,
        paymentId,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        variantTitle: item.variantTitle,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
      })),
    });

    // Delete the draft items
    await tx.draftCartItem.deleteMany({
      where: { subOrderId, addedByParticipantId: participantId },
    });
  });
}

/**
 * Get participant's draft items for a specific tab (used for checkout)
 */
export async function getParticipantDraftItems(
  subOrderId: string,
  participantId: string
) {
  return prisma.draftCartItem.findMany({
    where: { subOrderId, addedByParticipantId: participantId },
  });
}

/**
 * Get host participant for a group order
 */
export async function getHostParticipant(groupOrderId: string) {
  return prisma.groupParticipantV2.findFirst({
    where: { groupOrderId, isHost: true },
  });
}

/**
 * Check if a participant is host of the group
 */
export async function isParticipantHost(
  participantId: string,
  groupOrderId: string
): Promise<boolean> {
  const p = await prisma.groupParticipantV2.findFirst({
    where: { id: participantId, groupOrderId, isHost: true },
  });
  return !!p;
}

/**
 * Get participant by ID
 */
export async function getParticipantById(participantId: string) {
  return prisma.groupParticipantV2.findUnique({
    where: { id: participantId },
  });
}
