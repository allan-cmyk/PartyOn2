import { generateShortId, type SharedCartData, type CartShareRecord } from './shareCart';

// In-memory storage for shared carts (works on Vercel serverless)
// Note: This will reset when the serverless function cold starts, but that's acceptable
// for temporary cart sharing. For persistent storage, we'd need a database.
const sharedCarts = new Map<string, CartShareRecord>();


/**
 * Save shared cart to in-memory storage
 */
async function saveCartRecord(id: string, cart: CartShareRecord): Promise<void> {
  sharedCarts.set(id, cart);
}

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
  } while (sharedCarts.has(shortId));

  // Create cart record
  const cartRecord: CartShareRecord = {
    id: shortId,
    cartData,
    createdAt: Date.now(),
  };

  // Save to in-memory storage
  await saveCartRecord(shortId, cartRecord);

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

  // Check if expired (optional - 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  if (cartRecord.createdAt < thirtyDaysAgo) {
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
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  let removedCount = 0;
  for (const [shortId, cartRecord] of sharedCarts.entries()) {
    if (cartRecord.createdAt < thirtyDaysAgo) {
      sharedCarts.delete(shortId);
      removedCount++;
    }
  }

  return removedCount;
}