/**
 * Discount Engine
 * Handles discount calculation, validation, and application
 */

import { prisma } from '@/lib/database/client';
import { Discount, AutomaticDiscount, DiscountType, AutoDiscountTrigger } from '@prisma/client';

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  categoryId?: string;
}

interface CartContext {
  items: CartItem[];
  subtotal: number;
  customerId?: string;
  isFirstOrder?: boolean;
}

interface DiscountResult {
  success: boolean;
  discountAmount: number;
  discountCode?: string;
  discountType?: DiscountType;
  message?: string;
  error?: string;
}

interface AppliedDiscount {
  id: string;
  name: string;
  code?: string;
  type: DiscountType;
  amount: number;
  isAutomatic: boolean;
}

/**
 * Validate a discount code for the given cart context
 */
export async function validateDiscountCode(
  code: string,
  context: CartContext
): Promise<DiscountResult> {
  const discount = await prisma.discount.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      usageHistory: context.customerId
        ? { where: { customerId: context.customerId } }
        : undefined,
    },
  });

  if (!discount) {
    return { success: false, discountAmount: 0, error: 'Invalid discount code' };
  }

  // Check if active
  if (!discount.isActive) {
    return { success: false, discountAmount: 0, error: 'This discount code is no longer active' };
  }

  // Check date validity
  const now = new Date();
  if (discount.startsAt > now) {
    return { success: false, discountAmount: 0, error: 'This discount code is not yet valid' };
  }
  if (discount.expiresAt && discount.expiresAt < now) {
    return { success: false, discountAmount: 0, error: 'This discount code has expired' };
  }

  // Check total usage limit
  if (discount.maxUsageCount && discount.usageCount >= discount.maxUsageCount) {
    return { success: false, discountAmount: 0, error: 'This discount code has reached its usage limit' };
  }

  // Check per-customer usage limit
  if (context.customerId && discount.usagePerCustomer) {
    const customerUsage = discount.usageHistory?.length || 0;
    if (customerUsage >= discount.usagePerCustomer) {
      return { success: false, discountAmount: 0, error: 'You have already used this discount code' };
    }
  }

  // Check minimum order amount
  if (discount.minOrderAmount && context.subtotal < Number(discount.minOrderAmount)) {
    return {
      success: false,
      discountAmount: 0,
      error: `Minimum order of $${Number(discount.minOrderAmount).toFixed(2)} required`,
    };
  }

  // Check minimum quantity
  if (discount.minQuantity) {
    const totalQuantity = context.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity < discount.minQuantity) {
      return {
        success: false,
        discountAmount: 0,
        error: `Minimum of ${discount.minQuantity} items required`,
      };
    }
  }

  // Calculate discount amount
  const discountAmount = calculateDiscountAmount(discount, context);

  return {
    success: true,
    discountAmount,
    discountCode: discount.code,
    discountType: discount.type,
    message: `Discount "${discount.name}" applied!`,
  };
}

/**
 * Calculate discount amount based on type and context
 */
function calculateDiscountAmount(
  discount: Discount,
  context: CartContext
): number {
  const eligibleItems = getEligibleItems(discount, context.items);
  const eligibleSubtotal = eligibleItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  switch (discount.type) {
    case 'PERCENTAGE':
      return Math.round(eligibleSubtotal * (Number(discount.value) / 100) * 100) / 100;

    case 'FIXED_AMOUNT':
      return Math.min(Number(discount.value), eligibleSubtotal);

    case 'BUY_X_GET_Y':
      return calculateBuyXGetYDiscount(discount, eligibleItems);

    case 'FREE_SHIPPING':
      // Free shipping handled separately in checkout
      return 0;

    default:
      return 0;
  }
}

/**
 * Get items eligible for the discount
 */
function getEligibleItems(discount: Discount, items: CartItem[]): CartItem[] {
  if (discount.appliesToAll) {
    return items;
  }

  return items.filter((item) => {
    const inProducts =
      discount.applicableProducts.length === 0 ||
      discount.applicableProducts.includes(item.productId);
    const inCategories =
      discount.applicableCategories.length === 0 ||
      (item.categoryId && discount.applicableCategories.includes(item.categoryId));
    return inProducts || inCategories;
  });
}

/**
 * Calculate Buy X Get Y discount
 */
function calculateBuyXGetYDiscount(discount: Discount, items: CartItem[]): number {
  if (!discount.buyQuantity || !discount.getQuantity) {
    return 0;
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const sets = Math.floor(totalQuantity / (discount.buyQuantity + discount.getQuantity));

  // Get the cheapest items for the free ones
  const sortedByPrice = [...items]
    .flatMap((item) => Array(item.quantity).fill(item.price))
    .sort((a, b) => a - b);

  const freeItemsCount = sets * discount.getQuantity;
  const freeItemsValue = sortedByPrice.slice(0, freeItemsCount).reduce((sum, price) => sum + price, 0);

  return Math.round(freeItemsValue * 100) / 100;
}

/**
 * Get all applicable automatic discounts for the cart
 */
export async function getAutomaticDiscounts(
  context: CartContext
): Promise<AppliedDiscount[]> {
  const now = new Date();

  const automaticDiscounts = await prisma.automaticDiscount.findMany({
    where: {
      isActive: true,
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { priority: 'desc' },
  });

  const appliedDiscounts: AppliedDiscount[] = [];
  let hasNonStackable = false;

  for (const autoDiscount of automaticDiscounts) {
    if (hasNonStackable && !autoDiscount.stackable) {
      continue;
    }

    const isEligible = checkAutomaticDiscountEligibility(autoDiscount, context);
    if (!isEligible) {
      continue;
    }

    const amount = calculateAutomaticDiscountAmount(autoDiscount, context);
    if (amount > 0) {
      appliedDiscounts.push({
        id: autoDiscount.id,
        name: autoDiscount.name,
        type: autoDiscount.type,
        amount,
        isAutomatic: true,
      });

      if (!autoDiscount.stackable) {
        hasNonStackable = true;
      }
    }
  }

  return appliedDiscounts;
}

/**
 * Check if automatic discount is eligible
 */
function checkAutomaticDiscountEligibility(
  discount: AutomaticDiscount,
  context: CartContext
): boolean {
  switch (discount.triggerType) {
    case 'CART_TOTAL':
      return context.subtotal >= Number(discount.triggerValue || 0);

    case 'PRODUCT_COUNT':
      const totalQuantity = context.items.reduce((sum, item) => sum + item.quantity, 0);
      return totalQuantity >= Number(discount.triggerValue || 0);

    case 'FIRST_ORDER':
      return context.isFirstOrder === true;

    case 'SPECIFIC_PRODUCT':
      if (discount.applicableProducts.length === 0) {
        return false;
      }
      return context.items.some((item) =>
        discount.applicableProducts.includes(item.productId)
      );

    default:
      return false;
  }
}

/**
 * Calculate automatic discount amount
 */
function calculateAutomaticDiscountAmount(
  discount: AutomaticDiscount,
  context: CartContext
): number {
  const eligibleItems = discount.appliesToAll
    ? context.items
    : context.items.filter((item) => discount.applicableProducts.includes(item.productId));

  const eligibleSubtotal = eligibleItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  switch (discount.type) {
    case 'PERCENTAGE':
      return Math.round(eligibleSubtotal * (Number(discount.value) / 100) * 100) / 100;

    case 'FIXED_AMOUNT':
      return Math.min(Number(discount.value), eligibleSubtotal);

    case 'FREE_SHIPPING':
      return 0; // Handled separately

    default:
      return 0;
  }
}

/**
 * Record discount usage after order completion
 */
export async function recordDiscountUsage(
  discountCode: string,
  orderId: string,
  customerId: string | null,
  amountSaved: number
): Promise<void> {
  const discount = await prisma.discount.findUnique({
    where: { code: discountCode.toUpperCase() },
  });

  if (!discount) {
    return;
  }

  await prisma.$transaction([
    prisma.discountUsage.create({
      data: {
        discountId: discount.id,
        orderId,
        customerId,
        amountSaved,
      },
    }),
    prisma.discount.update({
      where: { id: discount.id },
      data: {
        usageCount: { increment: 1 },
        totalDiscountGiven: { increment: amountSaved },
      },
    }),
  ]);
}

/**
 * Check if free shipping should be applied
 */
export async function shouldApplyFreeShipping(
  discountCode: string | null,
  context: CartContext
): Promise<boolean> {
  // Check manual discount code
  if (discountCode) {
    const discount = await prisma.discount.findUnique({
      where: { code: discountCode.toUpperCase() },
    });
    if (discount?.type === 'FREE_SHIPPING' && discount.isActive) {
      const now = new Date();
      if (
        discount.startsAt <= now &&
        (!discount.expiresAt || discount.expiresAt > now)
      ) {
        // Check minimum order amount
        if (!discount.minOrderAmount || context.subtotal >= Number(discount.minOrderAmount)) {
          return true;
        }
      }
    }
  }

  // Check automatic free shipping discounts
  const now = new Date();
  const autoFreeShipping = await prisma.automaticDiscount.findFirst({
    where: {
      type: 'FREE_SHIPPING',
      isActive: true,
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });

  if (autoFreeShipping) {
    return checkAutomaticDiscountEligibility(autoFreeShipping, context);
  }

  return false;
}
