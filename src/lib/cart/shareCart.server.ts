import fs from 'fs/promises';
import path from 'path';
import { generateShortId, type SharedCartData, type CartShareRecord } from './shareCart';

// Storage file path
const STORAGE_FILE = path.join(process.cwd(), 'data', 'shared-carts.json');

/**
 * Ensure the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  const dataDir = path.dirname(STORAGE_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

/**
 * Load all shared carts from storage
 */
async function loadSharedCarts(): Promise<Record<string, CartShareRecord>> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist or is invalid, return empty object
    return {};
  }
}

/**
 * Save all shared carts to storage
 */
async function saveSharedCarts(carts: Record<string, CartShareRecord>): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(STORAGE_FILE, JSON.stringify(carts, null, 2));
}

/**
 * Save a shared cart and return the short ID
 */
export async function saveSharedCart(cartData: SharedCartData): Promise<string> {
  const allCarts = await loadSharedCarts();

  // Generate unique ID (check for collisions)
  let shortId: string;
  let attempts = 0;
  do {
    shortId = generateShortId();
    attempts++;
    if (attempts > 10) {
      throw new Error('Unable to generate unique cart ID');
    }
  } while (allCarts[shortId]);

  // Create cart record
  const cartRecord: CartShareRecord = {
    id: shortId,
    cartData,
    createdAt: Date.now(),
  };

  // Save to storage
  allCarts[shortId] = cartRecord;
  await saveSharedCarts(allCarts);

  return shortId;
}

/**
 * Retrieve a shared cart by short ID
 */
export async function getSharedCart(shortId: string): Promise<SharedCartData | null> {
  const allCarts = await loadSharedCarts();
  const cartRecord = allCarts[shortId];

  if (!cartRecord) {
    return null;
  }

  // Check if expired (optional - 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  if (cartRecord.createdAt < thirtyDaysAgo) {
    // Cart is expired, remove it and return null
    delete allCarts[shortId];
    await saveSharedCarts(allCarts);
    return null;
  }

  return cartRecord.cartData;
}

/**
 * Clean up expired shared carts (can be called periodically)
 */
export async function cleanupExpiredCarts(): Promise<number> {
  const allCarts = await loadSharedCarts();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  let removedCount = 0;
  for (const [shortId, cartRecord] of Object.entries(allCarts)) {
    if (cartRecord.createdAt < thirtyDaysAgo) {
      delete allCarts[shortId];
      removedCount++;
    }
  }

  if (removedCount > 0) {
    await saveSharedCarts(allCarts);
  }

  return removedCount;
}