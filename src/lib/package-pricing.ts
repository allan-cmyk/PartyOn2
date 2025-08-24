// Package pricing estimates based on average product costs
// These should be updated periodically based on actual product prices

export const AVERAGE_PRODUCT_PRICES = {
  spirits: 35.99,    // Average price per bottle
  wine: 18.99,       // Average price per bottle
  beer: 15.99,       // Average price per pack
  champagne: 24.99,  // Average price per bottle
  mixers: 8.99       // Average price per bottle
};

// Calculate estimated package price
export function calculatePackagePrice(
  categories: Record<string, { count: number }>,
  quantities: Record<string, number>
): number {
  let total = 0;
  
  Object.entries(categories).forEach(([category, config]) => {
    const avgPrice = AVERAGE_PRODUCT_PRICES[category as keyof typeof AVERAGE_PRODUCT_PRICES] || 20;
    const quantity = quantities[category] || config.count;
    total += avgPrice * quantity * config.count;
  });
  
  return total;
}

// Pre-calculated package prices (can be used as overrides)
export const PACKAGE_BASE_PRICES = {
  // Wedding packages
  'signature-soiree': 599,
  'lakeside-luxe': 1299,
  'grand-gala': 2499,
  
  // Boat packages
  'sunset-cruise': 399,
  'lake-life-luxury': 899,
  'regatta-ready': 1899,
  
  // Bach packages
  'squad-essentials': 499,
  'vip-experience': 999,
  'ultimate-celebration': 1999
};

// Get package price with optional override
export function getPackagePrice(
  packageId: string,
  calculatedPrice?: number
): string {
  // Use base price if available and no calculated price provided
  const basePrice = PACKAGE_BASE_PRICES[packageId as keyof typeof PACKAGE_BASE_PRICES];
  
  if (basePrice && !calculatedPrice) {
    return `$${basePrice}`;
  }
  
  // If calculated price is provided, round to nearest $99
  if (calculatedPrice) {
    const rounded = Math.round(calculatedPrice / 100) * 100 - 1;
    return `$${rounded}`;
  }
  
  // Default fallback
  return 'Custom Quote';
}