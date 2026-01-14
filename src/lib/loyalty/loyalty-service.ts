/**
 * Loyalty Service
 * Note: Loyalty models not in Prisma schema - temporarily disabled
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

const POINTS_PER_DOLLAR = 1; // 1 point per $1 spent
const POINTS_REDEMPTION_VALUE = 0.10; // Each point is worth $0.10

// Local type since Prisma PointsType doesn't exist
export type PointsType = 'EARNED' | 'REDEEMED' | 'BONUS' | 'EXPIRED' | 'ADJUSTMENT';

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

const NOT_IMPLEMENTED = 'Loyalty system temporarily disabled - models not in Prisma schema';

// Default tier for stub responses
const DEFAULT_TIER = {
  id: 'bronze',
  name: 'Bronze',
  color: '#CD7F32',
  discountPercent: 0,
  freeDeliveryMin: null,
  benefits: ['Earn 1 point per $1 spent', 'Birthday bonus points'],
  pointsMultiplier: 1.0,
};

/**
 * Initialize loyalty tiers (stub - no-op)
 */
export async function initializeLoyaltyTiers(): Promise<void> {
  // No-op - loyalty system disabled
}

/**
 * Get or create customer loyalty record (stub)
 */
export async function getOrCreateLoyalty(_customerId: string): Promise<LoyaltyStatus> {
  return {
    customerId: _customerId,
    tier: DEFAULT_TIER,
    points: 0,
    lifetimeSpend: 0,
    lifetimePoints: 0,
    nextTier: {
      name: 'Silver',
      minSpend: 500,
      spendNeeded: 500,
    },
  };
}

/**
 * Award points after order completion (stub)
 */
export async function awardPointsForOrder(
  _customerId: string,
  _orderId: string,
  _orderTotal: number
): Promise<{ pointsEarned: number; newBalance: number; tierUpgrade: boolean }> {
  return {
    pointsEarned: 0,
    newBalance: 0,
    tierUpgrade: false,
  };
}

/**
 * Redeem points for discount (stub)
 */
export async function redeemPoints(
  _customerId: string,
  _pointsToRedeem: number
): Promise<{ success: boolean; discountAmount: number; newBalance: number; error?: string }> {
  return {
    success: false,
    discountAmount: 0,
    newBalance: 0,
    error: NOT_IMPLEMENTED,
  };
}

/**
 * Award bonus points (stub)
 */
export async function awardBonusPoints(
  _customerId: string,
  _points: number,
  _description: string
): Promise<{ newBalance: number }> {
  return { newBalance: 0 };
}

/**
 * Get points transaction history (stub)
 */
export async function getPointsHistory(
  _customerId: string,
  _limit = 20
): Promise<Array<{
  id: string;
  type: PointsType;
  points: number;
  description: string | null;
  createdAt: Date;
}>> {
  return [];
}

/**
 * Get all loyalty tiers (stub)
 */
export async function getLoyaltyTiers() {
  return [
    {
      id: 'bronze',
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
      id: 'silver',
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
      id: 'gold',
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
      id: 'platinum',
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
}

/**
 * Calculate points value
 */
export function calculatePointsValue(points: number): number {
  return points * POINTS_REDEMPTION_VALUE;
}
