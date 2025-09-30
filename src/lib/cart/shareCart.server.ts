import { generateShortId, type SharedCartData, type CartShareRecord } from './shareCart';

// Global storage that persists across requests in the same Node.js process
// This is more reliable than files on Vercel serverless
declare global {
  var __SHARED_CARTS: Map<string, CartShareRecord> | undefined;
}

// Initialize global storage if it doesn't exist
if (!global.__SHARED_CARTS) {
  global.__SHARED_CARTS = new Map<string, CartShareRecord>();
}

const sharedCarts = global.__SHARED_CARTS;

/**
 * Save a shared cart and return the short ID
 */
export async function saveSharedCart(cartData: SharedCartData): Promise<string> {
  // Generate unique ID (check for collisions)
  let shortId: string;
  let attempts = 0;
  do {
    shortId = generateShortId();
    attempts++;
    if (attempts > 10) {
      throw new Error('Unable to generate unique cart ID');
    }
  } while (sharedCarts.has(shortId) && attempts <= 10);

  // Create cart record
  const cartRecord: CartShareRecord = {
    id: shortId,
    cartData,
    createdAt: Date.now(),
  };

  // Save to global storage
  sharedCarts.set(shortId, cartRecord);

  return shortId;
}

/**
 * Retrieve a shared cart by short ID
 */
export async function getSharedCart(shortId: string): Promise<SharedCartData | null> {
  const cartRecord = sharedCarts.get(shortId);

  if (!cartRecord) {
    return null;
  }

  // Check if expired (optional - 60 days)
  const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
  if (cartRecord.createdAt < sixtyDaysAgo) {
    // Cart is expired, remove it and return null
    sharedCarts.delete(shortId);
    return null;
  }

  return cartRecord.cartData;
}

/**
 * Clean up expired shared carts (can be called periodically)
 */
export async function cleanupExpiredCarts(): Promise<number> {
  const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
  let removedCount = 0;

  for (const [shortId, cartRecord] of sharedCarts.entries()) {
    if (cartRecord.createdAt < sixtyDaysAgo) {
      sharedCarts.delete(shortId);
      removedCount++;
    }
  }

  return removedCount;
}