/**
 * Server-side in-memory storage for short cart URLs
 * This runs only on the server and provides persistence for cart share links
 */

import { SharedCartData } from './shareCart';

interface StoredCart {
  id: string;
  data: SharedCartData;
  createdAt: number;
}

// In-memory storage (persists during server runtime)
const cartStorage = new Map<string, StoredCart>();

// Cleanup interval to remove expired carts (runs every hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_AGE = 60 * 24 * 60 * 60 * 1000; // 60 days

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupExpiredCarts();
  }, CLEANUP_INTERVAL);
}

/**
 * Generate a unique 6-character short ID
 */
function generateShortId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars (0,O,1,I)
  let id: string;
  let attempts = 0;

  do {
    id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
  } while (cartStorage.has(id) && attempts < 10);

  return id;
}

/**
 * Store cart data with a short ID
 */
export function storeCart(cartData: SharedCartData): string {
  const shortId = generateShortId();

  cartStorage.set(shortId, {
    id: shortId,
    data: cartData,
    createdAt: Date.now(),
  });

  return shortId;
}

/**
 * Retrieve cart data by short ID
 */
export function getCart(shortId: string): SharedCartData | null {
  const stored = cartStorage.get(shortId.toUpperCase());

  if (!stored) {
    return null;
  }

  // Check if expired
  if (stored.data.expiresAt && Date.now() > stored.data.expiresAt) {
    cartStorage.delete(shortId);
    return null;
  }

  return stored.data;
}

/**
 * Remove expired carts from storage
 */
function cleanupExpiredCarts(): void {
  const now = Date.now();

  for (const [id, cart] of cartStorage.entries()) {
    // Remove if expired or older than 60 days
    const isExpired = cart.data.expiresAt && now > cart.data.expiresAt;
    const isTooOld = now - cart.createdAt > MAX_AGE;

    if (isExpired || isTooOld) {
      cartStorage.delete(id);
    }
  }
}

/**
 * Get storage statistics (for debugging)
 */
export function getStorageStats() {
  return {
    totalCarts: cartStorage.size,
    oldestCart: Math.min(...Array.from(cartStorage.values()).map(c => c.createdAt)),
    newestCart: Math.max(...Array.from(cartStorage.values()).map(c => c.createdAt)),
  };
}
