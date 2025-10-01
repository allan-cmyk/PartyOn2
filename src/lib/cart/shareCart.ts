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
 * Generate the complete shareable URL with cart data as URL parameters
 */
export function generateShareUrl(cartData: SharedCartData): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://partyondelivery.com';

  // Convert cart data to URL parameters
  const params = new URLSearchParams();

  // Add each variant as a parameter
  cartData.variants.forEach((variant, index) => {
    params.append(`v${index}`, `${variant.id}:${variant.quantity}`);
  });

  // Add timestamp
  params.append('t', cartData.timestamp.toString());

  // Add expiration if present
  if (cartData.expiresAt) {
    params.append('e', cartData.expiresAt.toString());
  }

  return `${baseUrl}/cart/shared?${params.toString()}`;
}

/**
 * Parse cart data from URL parameters
 */
export function parseCartFromUrl(searchParams: URLSearchParams): SharedCartData | null {
  try {
    const variants: SharedCartVariant[] = [];

    // Parse all variant parameters
    let index = 0;
    while (searchParams.has(`v${index}`)) {
      const variantData = searchParams.get(`v${index}`);
      if (variantData) {
        const [id, quantityStr] = variantData.split(':');
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