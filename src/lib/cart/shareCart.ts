// Note: fs imports moved to server-only functions to avoid client-side bundle issues

export interface SharedCartVariant {
  id: string;        // Shopify variant ID
  quantity: number;
}

export interface SharedCartData {
  variants: SharedCartVariant[];
  timestamp: number;   // When cart was shared
  expiresAt?: number;  // Optional expiration (60 days)
}

export interface CartShareRecord {
  id: string;          // Short ID (A1B2C3)
  cartData: SharedCartData;
  createdAt: number;
}

/**
 * Generate a unique 6-character alphanumeric short ID
 */
export function generateShortId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Server-side storage functions are implemented in the API routes
// These are separated to avoid importing Node.js modules in client-side code

/**
 * Extract numeric variant ID from Shopify GID
 */
function extractVariantId(gid: string): string {
  // Extract numeric ID from gid://shopify/ProductVariant/12345
  const match = gid.match(/\/ProductVariant\/(\d+)/);
  return match ? match[1] : gid;
}

/**
 * Reconstruct Shopify GID from numeric ID
 */
function reconstructGid(id: string): string {
  // If already a full GID, return as-is
  if (id.startsWith('gid://')) {
    return id;
  }
  // Otherwise, reconstruct from numeric ID
  return `gid://shopify/ProductVariant/${id}`;
}

/**
 * Generate the complete shareable URL with compressed cart data
 */
export function generateShareUrl(cartData: SharedCartData, customBaseUrl?: string): string {
  const baseUrl = customBaseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

  // Compress cart data: extract variant IDs and encode compactly
  // Format: ID1,QTY1|ID2,QTY2|ID3,QTY3
  const compactData = cartData.variants
    .map(v => `${extractVariantId(v.id)},${v.quantity}`)
    .join('|');

  // Base64 encode for URL safety (browser-compatible)
  let encoded: string;
  if (typeof window !== 'undefined') {
    // Browser environment
    encoded = btoa(compactData)
      .replace(/\+/g, '-')  // URL-safe replacements
      .replace(/\//g, '_')
      .replace(/=+$/, '');  // Remove padding
  } else {
    // Node.js environment (API routes)
    encoded = Buffer.from(compactData).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const params = new URLSearchParams();
  params.append('c', encoded);  // 'c' for cart

  // Add timestamp (convert to shorter format: seconds instead of milliseconds)
  params.append('t', Math.floor(cartData.timestamp / 1000).toString(36)); // Base36 for shorter string

  return `${baseUrl}/cart/shared?${params.toString()}`;
}

/**
 * Parse cart data from URL parameters (supports both old and new formats)
 */
export function parseCartFromUrl(searchParams: URLSearchParams): SharedCartData | null {
  try {
    const variants: SharedCartVariant[] = [];

    // Check for new compressed format (c parameter)
    const compressed = searchParams.get('c');
    if (compressed) {
      // Decode base64 (browser-compatible)
      const decoded = compressed
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      // Add padding if needed
      const padding = (4 - (decoded.length % 4)) % 4;
      const padded = decoded + '='.repeat(padding);

      // Decode using browser or Node.js API
      let compactData: string;
      if (typeof window !== 'undefined') {
        // Browser environment
        compactData = atob(padded);
      } else {
        // Node.js environment
        compactData = Buffer.from(padded, 'base64').toString('utf-8');
      }

      // Parse format: ID1,QTY1|ID2,QTY2|ID3,QTY3
      const items = compactData.split('|');
      for (const item of items) {
        const [id, qtyStr] = item.split(',');
        const quantity = parseInt(qtyStr, 10);

        if (id && !isNaN(quantity) && quantity > 0) {
          variants.push({
            id: reconstructGid(id),
            quantity
          });
        }
      }

      // Parse timestamp from base36
      const timestampStr = searchParams.get('t');
      const timestamp = timestampStr
        ? parseInt(timestampStr, 36) * 1000  // Convert back to milliseconds
        : Date.now();

      return {
        variants,
        timestamp,
        expiresAt: timestamp + (60 * 24 * 60 * 60 * 1000), // 60 days
      };
    }

    // Fallback: Parse old format (v0, v1, v2, etc.)
    let index = 0;
    while (searchParams.has(`v${index}`)) {
      const variantData = searchParams.get(`v${index}`);
      if (variantData) {
        // Split from the right side since Shopify GIDs contain colons
        const lastColonIndex = variantData.lastIndexOf(':');
        const id = variantData.substring(0, lastColonIndex);
        const quantityStr = variantData.substring(lastColonIndex + 1);
        const quantity = parseInt(quantityStr, 10);

        if (id && !isNaN(quantity) && quantity > 0) {
          variants.push({ id, quantity });
        }
      }
      index++;
    }

    if (variants.length === 0) {
      return null;
    }

    const timestamp = parseInt(searchParams.get('t') || '0', 10);
    const expiresAt = searchParams.get('e') ? parseInt(searchParams.get('e')!, 10) : undefined;

    return {
      variants,
      timestamp: timestamp || Date.now(),
      expiresAt
    };
  } catch (error) {
    console.error('Failed to parse cart from URL:', error);
    return null;
  }
}


/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern clipboard API
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}