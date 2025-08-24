// Consumption rates per person for a 4-hour event
export const CONSUMPTION_RATES = {
  spirits: 0.15,   // bottles per person (750ml bottles, ~3-4 drinks)
  wine: 0.5,       // bottles per person (750ml bottles)
  beer: 3,         // cans/bottles per person
  champagne: 0.25, // bottles per person (for toasts)
  mixers: 0.25     // bottles per person
};

// Adjust consumption based on event type
export const EVENT_MULTIPLIERS = {
  wedding: {
    spirits: 0.8,    // More conservative for formal events
    wine: 1.2,       // Wine is popular at weddings
    beer: 0.7,       // Less beer at formal events
    champagne: 1.5,  // Toasts and celebrations
    mixers: 1.0
  },
  boat: {
    spirits: 0.7,    // Safety consideration on water
    wine: 0.8,       // Less wine on boats
    beer: 1.3,       // Beer is popular on boats
    champagne: 0.5,  // Less champagne on boats
    mixers: 1.2      // More mixers for hydration
  },
  bach: {
    spirits: 1.2,    // Party atmosphere
    wine: 0.9,       // Moderate wine
    beer: 1.1,       // Higher beer consumption
    champagne: 1.3,  // Celebration drinks
    mixers: 1.1      // Party cocktails
  }
};

// Duration multipliers (base is 4 hours)
export function getDurationMultiplier(hours: number): number {
  if (hours <= 4) return 1.0;
  if (hours <= 6) return 1.4;
  if (hours <= 8) return 1.7;
  if (hours <= 12) return 2.0;
  if (hours <= 24) return 2.5;
  return 3.0; // 48+ hour events
}

// Calculate quantities for packages
export function calculatePackageQuantity(
  category: string,
  guestCount: number,
  eventType: 'wedding' | 'boat' | 'bach',
  eventHours: number = 4,
  unitSize: number = 1
): number {
  const baseRate = CONSUMPTION_RATES[category as keyof typeof CONSUMPTION_RATES] || 1;
  const eventMultiplier = EVENT_MULTIPLIERS[eventType][category as keyof typeof EVENT_MULTIPLIERS[typeof eventType]] || 1;
  const durationMultiplier = getDurationMultiplier(eventHours);
  
  // Calculate total individual units needed
  const individualUnits = guestCount * baseRate * eventMultiplier * durationMultiplier;
  
  // Convert to package quantity (e.g., if beer comes in 6-packs, divide by 6)
  const packageQuantity = Math.ceil(individualUnits / unitSize);
  
  // Apply minimums based on package type
  const minimums: Record<string, number> = {
    spirits: 2,    // 2 bottles minimum
    wine: 3,       // 3 bottles minimum
    beer: 2,       // 2 packs minimum
    champagne: 2,  // 2 bottles minimum
    mixers: 2      // 2 bottles minimum
  };
  
  return Math.max(packageQuantity, minimums[category] || 1);
}

// Get unit size from product title or variant
export function getUnitSize(product: any): number {
  const title = product.title.toLowerCase();
  const variantTitle = product.variants?.edges?.[0]?.node?.title?.toLowerCase() || '';
  const combinedTitle = `${title} ${variantTitle}`;
  
  // Check for pack sizes in title
  if (combinedTitle.includes('24 pack') || combinedTitle.includes('24-pack')) return 24;
  if (combinedTitle.includes('18 pack') || combinedTitle.includes('18-pack')) return 18;
  if (combinedTitle.includes('12 pack') || combinedTitle.includes('12-pack')) return 12;
  if (combinedTitle.includes('6 pack') || combinedTitle.includes('6-pack')) return 6;
  if (combinedTitle.includes('4 pack') || combinedTitle.includes('4-pack')) return 4;
  
  // Wine and spirits typically sold individually
  return 1;
}

// Get recommended product counts for a package
export function getRecommendedCounts(guestCount: number, eventType: 'wedding' | 'boat' | 'bach') {
  const baseCounts = {
    spirits: Math.ceil(guestCount / 25),    // 1 type per 25 guests
    wine: Math.ceil(guestCount / 20),       // More wine variety
    beer: Math.ceil(guestCount / 30),       // Fewer beer types
    champagne: Math.ceil(guestCount / 40),  // 1-2 champagne types
    mixers: Math.ceil(guestCount / 15)      // Good mixer variety
  };
  
  // Adjust for event type
  if (eventType === 'boat') {
    baseCounts.spirits = Math.max(2, Math.ceil(baseCounts.spirits * 0.8));
    baseCounts.wine = Math.max(2, Math.ceil(baseCounts.wine * 0.7));
  }
  
  if (eventType === 'bach') {
    baseCounts.spirits = Math.max(3, Math.ceil(baseCounts.spirits * 1.2));
    baseCounts.mixers = Math.max(4, Math.ceil(baseCounts.mixers * 1.3));
  }
  
  return baseCounts;
}