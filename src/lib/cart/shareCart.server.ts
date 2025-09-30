import { generateShortId, type SharedCartData, type CartShareRecord } from './shareCart';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// Fallback in-memory storage for when file operations fail
const sharedCarts = new Map<string, CartShareRecord>();

// File-based storage directory (uses tmpdir which persists longer on Vercel)
const STORAGE_DIR = path.join(tmpdir(), 'shared-carts');

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }
}

/**
 * Save shared cart to file storage with fallback to memory
 */
async function saveCartRecord(id: string, cart: CartShareRecord): Promise<void> {
  try {
    await ensureStorageDir();
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(cart), 'utf8');
  } catch (error) {
    console.warn('File storage failed, using memory fallback:', error);
    // Fallback to in-memory storage
    sharedCarts.set(id, cart);
  }
}

/**
 * Load shared cart from file storage with fallback to memory
 */
async function loadCartRecord(id: string): Promise<CartShareRecord | null> {
  try {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as CartShareRecord;
  } catch {
    // File not found or error, try memory fallback
    return sharedCarts.get(id) || null;
  }
}

/**
 * Delete shared cart from file storage
 */
async function deleteCartRecord(id: string): Promise<void> {
  try {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    await fs.unlink(filePath);
  } catch {
    // File might not exist, ignore error
  }
  // Also remove from memory
  sharedCarts.delete(id);
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
    // Check both file storage and memory for collisions
    const existing = await loadCartRecord(shortId);
    if (!existing) break;
  } while (attempts <= 10);

  // Create cart record
  const cartRecord: CartShareRecord = {
    id: shortId,
    cartData,
    createdAt: Date.now(),
  };

  // Save to file storage with memory fallback
  await saveCartRecord(shortId, cartRecord);

  return shortId;
}

/**
 * Retrieve a shared cart by short ID
 */
export async function getSharedCart(shortId: string): Promise<SharedCartData | null> {
  const cartRecord = await loadCartRecord(shortId);

  if (!cartRecord) {
    return null;
  }

  // Check if expired (optional - 60 days)
  const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
  if (cartRecord.createdAt < sixtyDaysAgo) {
    // Cart is expired, remove it and return null
    await deleteCartRecord(shortId);
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

  try {
    await ensureStorageDir();
    const files = await fs.readdir(STORAGE_DIR);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const shortId = file.replace('.json', '');
        const cartRecord = await loadCartRecord(shortId);

        if (cartRecord && cartRecord.createdAt < sixtyDaysAgo) {
          await deleteCartRecord(shortId);
          removedCount++;
        }
      }
    }
  } catch (error) {
    console.warn('File cleanup failed, cleaning memory only:', error);
    // Fallback: clean memory storage
    for (const [shortId, cartRecord] of sharedCarts.entries()) {
      if (cartRecord.createdAt < sixtyDaysAgo) {
        sharedCarts.delete(shortId);
        removedCount++;
      }
    }
  }

  return removedCount;
}