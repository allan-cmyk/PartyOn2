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
 * Generate the complete shareable URL for a short ID
 */
export function generateShareUrl(shortId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';
  return `${baseUrl}/cart/shared/${shortId}`;
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