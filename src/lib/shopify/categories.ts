// Product categorization based on actual Shopify data structure

export const PRODUCT_CATEGORIES = {
  // Main categories based on collections
  spirits: {
    label: 'Spirits',
    handle: 'spirits',
    productTypes: ['Vodka', 'Tequila', 'Whiskey', 'Bourbon', 'Gin', 'Rum', 'Liquor & Spirits'],
    collections: ['spirits', 'gin-rum', 'tequila-mezcal', 'bourbon-rye']
  },
  wine: {
    label: 'Wine & Champagne',
    handle: 'wine-champagne',
    productTypes: ['wine', 'champagne'],
    collections: ['champagne', 'seltzers-wine-champagne']
  },
  beer: {
    label: 'Beer & Seltzers',
    handle: 'beer-seltzers',
    productTypes: ['beer and seltzers', 'Seltzer'],
    collections: ['seltzer-collection', 'seltzers-wine-champagne']
  },
  mixers: {
    label: 'Mixers & Non-Alcoholic',
    handle: 'mixers',
    productTypes: ['Cocktail Mixes', 'non alcoholic', 'sparkling water', 'water', 'Juice', 'ice'],
    collections: ['mixers-non-alcoholic', 'liqueurs-cordials-cocktail-ingredients']
  },
  partySupplies: {
    label: 'Party Supplies',
    handle: 'party-supplies',
    productTypes: [
      'Cup', 'Cup with Straw', 'drinkware', 'Drinking Straws & Stirrers',
      'Earrings', 'Headbands', 'Hats', 'Mesh Baseball Cap', 'Sunglasses',
      'Necklaces', 'Shot Glass Necklace', 'Sashes', 'Temporary Tattoos',
      'Photo Booth Props', 'Tinsel Foil Curtains', 'Party Decoration',
      'Bachelorette Party Decoration Set', 'bag', 'cocktail shaker & tools',
      'Tablecloths', 'Hat', 'sweetener', 'Cocktail', 'Cocktail Kits',
      'Chill Supplies'
    ],
    collections: [
      'party-supplies', 'all-party-supplies', 'decorations', 'costumes',
      'hats-sunglasses', 'bachelorette-supplies', 'drinkware-bartending-tools',
      'disco-collection', 'chill-supplies'
    ]
  },
  liqueurs: {
    label: 'Liqueurs & Cordials',
    handle: 'liqueurs',
    productTypes: ['Liqueurs', 'Cordials'],
    collections: ['liqueurs-cordials-cocktail-ingredients']
  }
};

// Helper function to categorize a product
export function getProductCategory(product: {
  productType?: string;
  collections?: { edges: Array<{ node: { handle: string } }> };
  tags?: string[];
}): string {
  const productType = product.productType?.toLowerCase() || '';
  const collections = product.collections?.edges.map(e => e.node.handle) || [];
  
  // Check each category
  for (const [key, category] of Object.entries(PRODUCT_CATEGORIES)) {
    // Check if product type matches
    if (category.productTypes.some(type => type.toLowerCase() === productType)) {
      return key;
    }
    
    // Check if product is in any of the category's collections
    if (collections.some(c => category.collections.includes(c))) {
      return key;
    }
  }
  
  // Default fallback based on product type keywords
  if (productType.includes('vodka') || productType.includes('tequila') || 
      productType.includes('whiskey') || productType.includes('bourbon') ||
      productType.includes('gin') || productType.includes('rum')) {
    return 'spirits';
  }
  
  if (productType.includes('wine') || productType.includes('champagne')) {
    return 'wine';
  }
  
  if (productType.includes('beer') || productType.includes('seltzer')) {
    return 'beer';
  }
  
  if (productType.includes('mix') || productType.includes('non') || 
      productType.includes('water') || productType.includes('juice')) {
    return 'mixers';
  }
  
  // Default to party supplies for everything else
  return 'partySupplies';
}

// Get unique brands from products
export function getUniqueBrands(products: Array<{ vendor?: string }>): string[] {
  const brands = new Set<string>();
  products.forEach(p => {
    if (p.vendor) brands.add(p.vendor);
  });
  return Array.from(brands).sort();
}

// Get unique product types
export function getUniqueProductTypes(products: Array<{ productType?: string }>): string[] {
  const types = new Set<string>();
  products.forEach(p => {
    if (p.productType) types.add(p.productType);
  });
  return Array.from(types).sort();
}

// Filter configuration for the UI
export const FILTER_OPTIONS = {
  mainCategories: [
    { value: 'all', label: 'All Products' },
    { value: 'spirits', label: 'Spirits' },
    { value: 'wine', label: 'Wine & Champagne' },
    { value: 'beer', label: 'Beer & Seltzers' },
    { value: 'mixers', label: 'Mixers & Non-Alcoholic' },
    { value: 'liqueurs', label: 'Liqueurs & Cordials' },
    { value: 'party-supplies', label: 'Party Supplies' }
  ],
  spiritTypes: [
    { value: 'all', label: 'All Spirits' },
    { value: 'Vodka', label: 'Vodka' },
    { value: 'Tequila', label: 'Tequila' },
    { value: 'Whiskey', label: 'Whiskey' },
    { value: 'Bourbon', label: 'Bourbon' },
    { value: 'Gin', label: 'Gin' },
    { value: 'Rum', label: 'Rum' }
  ],
  sortOptions: [
    { value: 'featured', label: 'Featured' },
    { value: 'bestsellers', label: 'Best Sellers' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' }
  ]
};