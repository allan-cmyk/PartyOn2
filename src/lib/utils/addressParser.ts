/**
 * Address parser for converting single-line addresses into Shopify checkout components
 * Optimized for Austin/Texas addresses
 */

export interface ParsedAddress {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}

/**
 * Parse a single address string into components for Shopify checkout
 * @param fullAddress - Complete address string (e.g., "123 Main St, Apt 4B, Austin, TX 78701")
 * @param zipCode - Zip code (passed separately from form)
 * @returns Parsed address components
 */
export function parseAddress(fullAddress: string, zipCode: string): ParsedAddress {
  // Clean up the input
  const cleanAddress = fullAddress.trim();
  
  // Extract zip code from address if it's included
  const zipRegex = /\b(\d{5})(?:-\d{4})?\b$/;
  const zipMatch = cleanAddress.match(zipRegex);
  const extractedZip = zipMatch ? zipMatch[1] : zipCode;
  
  // Remove zip from address for easier parsing
  const addressWithoutZip = cleanAddress.replace(zipRegex, '').trim();
  
  // Remove state abbreviation if present at the end
  const stateRegex = /,?\s*\b(TX|Texas)\b\s*$/i;
  const addressWithoutState = addressWithoutZip.replace(stateRegex, '').trim();
  
  // Remove city if it's explicitly "Austin" at the end
  const cityRegex = /,?\s*\b(Austin)\b\s*$/i;
  const addressWithoutCity = addressWithoutState.replace(cityRegex, '').trim();
  
  // Split remaining address by commas
  const parts = addressWithoutCity.split(',').map(s => s.trim()).filter(s => s);
  
  // Determine address1 and address2
  let address1 = '';
  let address2 = '';
  
  if (parts.length === 0) {
    // If nothing left after removing city/state/zip, use the original
    address1 = cleanAddress;
  } else if (parts.length === 1) {
    // Just street address
    address1 = parts[0];
  } else if (parts.length === 2) {
    // Street address and apartment/suite
    address1 = parts[0];
    address2 = parts[1];
  } else {
    // Multiple parts - first is street, rest is apartment/suite
    address1 = parts[0];
    address2 = parts.slice(1).join(', ');
  }
  
  // Common apartment/suite patterns to move to address2
  const aptPatterns = [
    /\b(apt|apartment|suite|ste|unit|#)\s*\.?\s*\w+/i,
    /\b(floor|fl)\s*\.?\s*\w+/i,
    /\b(building|bldg)\s*\.?\s*\w+/i,
  ];
  
  // Check if apartment info is in address1
  for (const pattern of aptPatterns) {
    const match = address1.match(pattern);
    if (match) {
      // Move apartment info to address2
      if (!address2) {
        address2 = match[0];
        address1 = address1.replace(pattern, '').trim();
      }
      break;
    }
  }
  
  // Clean up any trailing commas or spaces
  address1 = address1.replace(/[,\s]+$/, '').trim();
  address2 = address2?.replace(/[,\s]+$/, '').trim();
  
  return {
    address1,
    ...(address2 && { address2 }),
    city: 'Austin', // Default to Austin for local delivery
    province: 'TX',
    country: 'US',
    zip: extractedZip
  };
}

/**
 * Format phone number for Shopify checkout
 * @param phone - Phone number in any format
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing
  const withCountryCode = cleaned.length === 10 ? '1' + cleaned : cleaned;
  
  // Format as +1 (XXX) XXX-XXXX
  if (withCountryCode.length === 11 && withCountryCode.startsWith('1')) {
    const areaCode = withCountryCode.slice(1, 4);
    const firstPart = withCountryCode.slice(4, 7);
    const secondPart = withCountryCode.slice(7, 11);
    return `+1 (${areaCode}) ${firstPart}-${secondPart}`;
  }
  
  // Return original if can't format
  return phone;
}

/**
 * Validate if zip code is in Texas
 * @param zipCode - 5-digit zip code
 * @returns true if zip is in Texas
 */
export function isTexasZipCode(zipCode: string): boolean {
  const zip = parseInt(zipCode, 10);
  
  // Texas zip code ranges
  const texasRanges = [
    [75001, 75507],
    [75550, 76958],
    [77001, 77995],
    [78001, 78963],
    [79001, 79999],
    [88510, 88589] // El Paso area
  ];
  
  return texasRanges.some(([min, max]) => zip >= min && zip <= max);
}