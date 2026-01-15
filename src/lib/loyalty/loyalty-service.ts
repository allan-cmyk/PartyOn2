/**
 * Loyalty Service
 * Handles loyalty points, tier management, and rewards
 */

import { prisma } from '@/lib/database/client';
import { PointsType } from '@prisma/client';

const POINTS_PER_DOLLAR = 1; // 1 point per $1 spent
const POINTS_REDEMPTION_VALUE = 0.10; // Each point is worth $0.10

interface LoyaltyStatus {
  customerId: string;
  tier: {
    id: string;
    name: string;
    color: string;
    discountPercent: number;
    freeDeliveryMin: number | null;
    benefits: string[];
    pointsMultiplier: number;
  };
  points: number;
  lifetimeSpend: number;
  lifetimePoints: number;
  nextTier: {
    name: string;
    minSpend: number;
    spendNeeded: number;
  } | null;
}

/**
 * Initialize loyalty tiers (run once on setup)
 */
export async function initializeLoyaltyTiers(): Promise<void> {
  const existingTiers = await prisma.loyaltyTier.count();
  if (existingTiers > 0) return;

  const tiers = [
    {
      name: 'Bronze',
      minLifetimeSpend: 0,
      pointsMultiplier: 1.0,
      discountPercent: 0,
      freeDeliveryMin: null,
      benefits: ['Earn 1 point per $1 spent', 'Birthday bonus points'],
      color: '#CD7F32',
      position: 1,
    },
    {
      name: 'Silver',
      minLifetimeSpend: 500,
      pointsMultiplier: 1.25,
      discountPercent: 5,
      freeDeliveryMin: 150,
      benefits: ['1.25x points multiplier', '5% discount on all orders', 'Free delivery on orders over $150'],
      color: '#C0C0C0',
      position: 2,
    },
    {
      name: 'Gold',
      minLifetimeSpend: 1500,
      pointsMultiplier: 1.5,
      discountPercent: 10,
      freeDeliveryMin: 100,
      benefits: ['1.5x points multiplier', '10% discount on all orders', 'Free delivery on orders over $100', 'Priority support'],
      color: '#FFD700',
      position: 3,
    },
    {
      name: 'Platinum',
      minLifetimeSpend: 5000,
      pointsMultiplier: 2.0,
      discountPercent: 15,
      freeDeliveryMin: 0,
      benefits: ['2x points multiplier', '15% discount on all orders', 'Always free delivery', 'VIP support', 'Exclusive offers'],
      color: '#E5E4E2',
      position: 4,
    },
  ];

  for (const tier of tiers) {
    await prisma.loyaltyTier.create({ data: tier });
  }
}

/**
 * Get or create customer loyalty record
 */
export async function getOrCreateLoyalty(customerId: string): Promise<LoyaltyStatus> {
  let loyalty = await prisma.customerLoyalty.findUnique({
    where: { customerId },
    include: { tier: true },
  });

  if (!loyalty) {
    // Get the base tier (Bronze)
    const baseTier = await prisma.loyaltyTier.findFirst({
      orderBy: { position: 'asc' },
    });

    if (!baseTier) {
      // Initialize tiers if not exists
      await initializeLoyaltyTiers();
      const newBaseTier = await prisma.loyaltyTier.findFirst({
        orderBy: { position: 'asc' },
      });
      if (!newBaseTier) throw new Error('Failed to initialize loyalty tiers');

      loyalty = await prisma.customerLoyalty.create({
        data: {
          customerId,
          tierId: newBaseTier.id,
        },
        include: { tier: true },
      });
    } else {
      loyalty = await prisma.customerLoyalty.create({
        data: {
          customerId,
          tierId: baseTier.id,
        },
        include: { tier: true },
      });
    }
  }

  // Get next tier info
  const nextTier = await prisma.loyaltyTier.findFirst({
    where: {
      minLifetimeSpend: { gt: loyalty.tier.minLifetimeSpend },
    },
    orderBy: { minLifetimeSpend: 'asc' },
  });

  return {
    customerId,
    tier: {
      id: loyalty.tier.id,
      name: loyalty.tier.name,
      color: loyalty.tier.color,
      discountPercent: loyalty.tier.discountPercent,
      freeDeliveryMin: loyalty.tier.freeDeliveryMin ? Number(loyalty.tier.freeDeliveryMin) : null,
      benefits: loyalty.tier.benefits,
      pointsMultiplier: loyalty.tier.pointsMultiplier,
    },
    points: loyalty.points,
    lifetimeSpend: Number(loyalty.lifetimeSpend),
    lifetimePoints: loyalty.lifetimePoints,
    nextTier: nextTier
      ? {
          name: nextTier.name,
          minSpend: Number(nextTier.minLifetimeSpend),
          spendNeeded: Number(nextTier.minLifetimeSpend) - Number(loyalty.lifetimeSpend),
        }
      : null,
  };
}

/**
 * Award points after order completion
 */
export async function awardPointsForOrder(
  customerId: string,
  orderId: string,
  orderTotal: number
): Promise<{ pointsEarned: number; newBalance: number; tierUpgrade: boolean }> {
  const loyalty = await getOrCreateLoyalty(customerId);

  // Calculate points with tier multiplier
  const basePoints = Math.floor(orderTotal * POINTS_PER_DOLLAR);
  const pointsEarned = Math.floor(basePoints * loyalty.tier.pointsMultiplier);

  // Check if this spend would trigger a tier upgrade
  const newLifetimeSpend = loyalty.lifetimeSpend + orderTotal;
  const upgradeTier = await prisma.loyaltyTier.findFirst({
    where: {
      minLifetimeSpend: {
        gt: loyalty.tier.pointsMultiplier === 1 ? 0 : Number(
          (await prisma.loyaltyTier.findUnique({ where: { id: loyalty.tier.id } }))?.minLifetimeSpend || 0
        ),
        lte: newLifetimeSpend,
      },
    },
    orderBy: { minLifetimeSpend: 'desc' },
  });

  // Update loyalty record
  await prisma.customerLoyalty.update({
    where: { customerId },
    data: {
      points: { increment: pointsEarned },
      lifetimeSpend: { increment: orderTotal },
      lifetimePoints: { increment: pointsEarned },
      ...(upgradeTier && upgradeTier.id !== loyalty.tier.id && { tierId: upgradeTier.id }),
    },
  });

  // Record the transaction
  await prisma.pointsTransaction.create({
    data: {
      loyaltyId: (await prisma.customerLoyalty.findUnique({ where: { customerId } }))!.id,
      type: 'EARNED',
      points: pointsEarned,
      orderId,
      description: `Earned from order (${loyalty.tier.pointsMultiplier}x multiplier)`,
    },
  });

  const tierUpgrade = upgradeTier !== null && upgradeTier.id !== loyalty.tier.id;

  return {
    pointsEarned,
    newBalance: loyalty.points + pointsEarned,
    tierUpgrade,
  };
}

/**
 * Redeem points for discount
 */
export async function redeemPoints(
  customerId: string,
  pointsToRedeem: number
): Promise<{ success: boolean; discountAmount: number; newBalance: number; error?: string }> {
  const loyalty = await getOrCreateLoyalty(customerId);

  if (pointsToRedeem > loyalty.points) {
    return {
      success: false,
      discountAmount: 0,
      newBalance: loyalty.points,
      error: `Insufficient points. You have ${loyalty.points} points available.`,
    };
  }

  if (pointsToRedeem < 100) {
    return {
      success: false,
      discountAmount: 0,
      newBalance: loyalty.points,
      error: 'Minimum 100 points required for redemption.',
    };
  }

  const discountAmount = pointsToRedeem * POINTS_REDEMPTION_VALUE;

  // Update loyalty record
  await prisma.customerLoyalty.update({
    where: { customerId },
    data: {
      points: { decrement: pointsToRedeem },
    },
  });

  // Record the transaction
  const loyaltyRecord = await prisma.customerLoyalty.findUnique({ where: { customerId } });
  await prisma.pointsTransaction.create({
    data: {
      loyaltyId: loyaltyRecord!.id,
      type: 'REDEEMED',
      points: -pointsToRedeem,
      description: `Redeemed for $${discountAmount.toFixed(2)} discount`,
    },
  });

  return {
    success: true,
    discountAmount,
    newBalance: loyalty.points - pointsToRedeem,
  };
}

/**
 * Award bonus points
 */
export async function awardBonusPoints(
  customerId: string,
  points: number,
  description: string
): Promise<{ newBalance: number }> {
  await prisma.customerLoyalty.update({
    where: { customerId },
    data: {
      points: { increment: points },
      lifetimePoints: { increment: points },
    },
  });

  const loyaltyRecord = await prisma.customerLoyalty.findUnique({ where: { customerId } });
  await prisma.pointsTransaction.create({
    data: {
      loyaltyId: loyaltyRecord!.id,
      type: 'BONUS',
      points,
      description,
    },
  });

  return { newBalance: loyaltyRecord!.points + points };
}

/**
 * Get points transaction history
 */
export async function getPointsHistory(
  customerId: string,
  limit = 20
): Promise<Array<{
  id: string;
  type: PointsType;
  points: number;
  description: string | null;
  createdAt: Date;
}>> {
  const loyalty = await prisma.customerLoyalty.findUnique({
    where: { customerId },
  });

  if (!loyalty) return [];

  return prisma.pointsTransaction.findMany({
    where: { loyaltyId: loyalty.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      points: true,
      description: true,
      createdAt: true,
    },
  });
}

/**
 * Get all loyalty tiers
 */
export async function getLoyaltyTiers() {
  return prisma.loyaltyTier.findMany({
    orderBy: { position: 'asc' },
  });
}

/**
 * Calculate points value
 */
export function calculatePointsValue(points: number): number {
  return points * POINTS_REDEMPTION_VALUE;
}
