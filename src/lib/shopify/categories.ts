// Product categorization based on actual Shopify data structure

export const PRODUCT_CATEGORIES = {
  // Main categories matching order.partyondelivery.com
  seltzersChamps: {
    label: 'Seltzers & Champs',
    handle: 'seltzers-champs',
    productTypes: ['Seltzer', 'champagne', 'Prosecco', 'Sparkling Wine'],
    collections: ['seltzer-collection', 'seltzers-wine-champagne', 'champagne'],
    keywords: ['seltzer', 'hard seltzer', 'champagne', 'prosecco', 'sparkling', 'cava', 'brut']
  },
  beer: {
    label: 'Beer',
    handle: 'beer',
    productTypes: ['beer and seltzers', 'Beer', 'Lager', 'IPA', 'Ale', 'Stout'],
    collections: ['beer', 'beer-collection'],
    keywords: ['beer', 'lager', 'ipa', 'ale', 'stout', 'pilsner', 'porter', 'wheat beer']
  },
  cocktails: {
    label: 'Cocktails',
    handle: 'cocktails',
    productTypes: ['Cocktail', 'Cocktail Kits', 'Ready to Drink', 'RTD', 'Canned Cocktails'],
    collections: ['cocktails', 'ready-to-drink', 'canned-cocktails'],
    keywords: ['cocktail', 'mixed drink', 'ready to drink', 'rtd', 'canned', 'margarita', 'mojito', 'manhattan']
  },
  liquor: {
    label: 'Liquor',
    handle: 'liquor',
    productTypes: ['Vodka', 'Tequila', 'Whiskey', 'Bourbon', 'Gin', 'Rum', 'Liquor & Spirits', 'Cognac', 'Brandy', 'Scotch', 'Rye'],
    collections: ['spirits', 'gin-rum', 'tequila-mezcal', 'bourbon-rye', 'vodka', 'whiskey'],
    keywords: ['vodka', 'tequila', 'whiskey', 'bourbon', 'gin', 'rum', 'scotch', 'cognac', 'brandy', 'mezcal', 'rye']
  },
  mixersNA: {
    label: 'Mixers/NA',
    handle: 'mixers-na',
    productTypes: ['Cocktail Mixes', 'non alcoholic', 'sparkling water', 'water', 'Juice', 'ice', 'Mixer', 'Tonic', 'Soda'],
    collections: ['mixers-non-alcoholic', 'liqueurs-cordials-cocktail-ingredients', 'mixers'],
    keywords: ['mixer', 'tonic', 'soda', 'juice', 'ginger beer', 'club soda', 'water', 'ice', 'non-alcoholic', 'margarita mix', 'bloody mary mix']
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
      'Tablecloths', 'Hat', 'sweetener', 'Chill Supplies'
    ],
    collections: [
      'party-supplies', 'all-party-supplies', 'decorations', 'costumes',
      'hats-sunglasses', 'bachelorette-supplies', 'drinkware-bartending-tools',
      'disco-collection', 'chill-supplies'
    ],
    keywords: ['cup', 'straw', 'napkin', 'decoration', 'party', 'supplies', 'accessories', 'drinkware']
  }
};

// Helper function to categorize a product
export function getProductCategory(product: {
  productType?: string;
  collections?: { edges: Array<{ node: { handle: string } }> };
  tags?: string[];
  title?: string;
}): string {
  const productType = product.productType?.toLowerCase() || '';
  const collections = product.collections?.edges.map(e => e.node.handle) || [];
  const title = product.title?.toLowerCase() || '';
  const tags = product.tags?.map(t => t.toLowerCase()) || [];
  
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
    
    // Check keywords in title
    if (category.keywords && category.keywords.some(keyword => title.includes(keyword))) {
      return key;
    }
    
    // Check keywords in tags
    if (category.keywords && tags.some(tag => category.keywords.some(keyword => tag.includes(keyword)))) {
      return key;
    }
  }
  
  // Default fallback - check title for common liquor types
  if (title.includes('vodka') || title.includes('tequila') || 
      title.includes('whiskey') || title.includes('bourbon') ||
      title.includes('gin') || title.includes('rum') ||
      title.includes('scotch') || title.includes('cognac')) {
    return 'liquor';
  }
  
  if (title.includes('seltzer') || title.includes('champagne') || 
      title.includes('prosecco') || title.includes('sparkling')) {
    return 'seltzersChamps';
  }
  
  if (title.includes('beer') || title.includes('lager') || 
      title.includes('ipa') || title.includes('ale')) {
    return 'beer';
  }
  
  if (title.includes('cocktail') || title.includes('margarita') || 
      title.includes('mojito')) {
    return 'cocktails';
  }
  
  if (title.includes('mix') || title.includes('juice') || 
      title.includes('water') || title.includes('tonic') ||
      title.includes('soda') || title.includes('non-alcoholic')) {
    return 'mixersNA';
  }
  
  // Default to party supplies for everything else
  return 'partySupplies';
}

// Check if a product belongs to a specific collection
export function isInCollection(product: {
  collections?: { edges: Array<{ node: { handle: string } }> };
}, collectionHandle: string): boolean {
  const collections = product.collections?.edges.map(e => e.node.handle) || [];
  return collections.includes(collectionHandle);
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

// Actual Shopify collections for quick filters with color schemes
export const SHOPIFY_COLLECTIONS = [
  { 
    handle: 'beer-collection', 
    label: 'Tailgate & Beer', 
    category: 'beer',
    colors: {
      bg: 'bg-amber-50 hover:bg-amber-100',
      bgActive: 'bg-amber-600',
      text: 'text-amber-700',
      textActive: 'text-white',
      border: 'border-amber-400 hover:border-amber-500',
      borderActive: 'border-amber-600'
    }
  },
  { 
    handle: 'seltzers-wine-champagne', 
    label: 'Bubbles & Celebration', 
    category: 'seltzersChamps',
    colors: {
      bg: 'bg-pink-50 hover:bg-pink-100',
      bgActive: 'bg-pink-600',
      text: 'text-pink-700',
      textActive: 'text-white',
      border: 'border-pink-400 hover:border-pink-500',
      borderActive: 'border-pink-600'
    }
  },
  { 
    handle: 'spirits', 
    label: 'Premium Spirits', 
    category: 'liquor',
    colors: {
      bg: 'bg-slate-50 hover:bg-slate-100',
      bgActive: 'bg-slate-700',
      text: 'text-slate-700',
      textActive: 'text-white',
      border: 'border-slate-400 hover:border-slate-500',
      borderActive: 'border-slate-700'
    }
  },
  { 
    handle: 'ready-to-drink', 
    label: 'Ready to Drink', 
    category: 'cocktails',
    colors: {
      bg: 'bg-teal-50 hover:bg-teal-100',
      bgActive: 'bg-teal-600',
      text: 'text-teal-700',
      textActive: 'text-white',
      border: 'border-teal-400 hover:border-teal-500',
      borderActive: 'border-teal-600'
    }
  },
  { 
    handle: 'bachelorette-supplies', 
    label: 'Bachelorette Party', 
    category: 'partySupplies',
    colors: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      bgActive: 'bg-purple-600',
      text: 'text-purple-700',
      textActive: 'text-white',
      border: 'border-purple-400 hover:border-purple-500',
      borderActive: 'border-purple-600'
    }
  },
  { 
    handle: 'disco-collection', 
    label: 'Disco Party', 
    category: 'partySupplies',
    colors: {
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      bgActive: 'bg-indigo-600',
      text: 'text-indigo-700',
      textActive: 'text-white',
      border: 'border-indigo-400 hover:border-indigo-500',
      borderActive: 'border-indigo-600'
    }
  }
];

// Filter configuration for the UI with color schemes
export const FILTER_OPTIONS = {
  mainCategories: [
    { 
      value: 'all', 
      label: 'All Products',
      colors: {
        bg: 'bg-gray-50 hover:bg-gray-100',
        bgActive: 'bg-gold-600',
        text: 'text-gray-700',
        textActive: 'text-white',
        border: 'border-gray-300 hover:border-gold-400',
        borderActive: 'border-gold-600'
      }
    },
    { 
      value: 'seltzers-champs', 
      label: 'Seltzers & Champs',
      colors: {
        bg: 'bg-pink-50 hover:bg-pink-100',
        bgActive: 'bg-pink-600',
        text: 'text-pink-700',
        textActive: 'text-white',
        border: 'border-pink-300 hover:border-pink-400',
        borderActive: 'border-pink-600'
      }
    },
    { 
      value: 'beer', 
      label: 'Beer',
      colors: {
        bg: 'bg-amber-50 hover:bg-amber-100',
        bgActive: 'bg-amber-600',
        text: 'text-amber-700',
        textActive: 'text-white',
        border: 'border-amber-300 hover:border-amber-400',
        borderActive: 'border-amber-600'
      }
    },
    { 
      value: 'cocktails', 
      label: 'Cocktails',
      colors: {
        bg: 'bg-teal-50 hover:bg-teal-100',
        bgActive: 'bg-teal-600',
        text: 'text-teal-700',
        textActive: 'text-white',
        border: 'border-teal-300 hover:border-teal-400',
        borderActive: 'border-teal-600'
      }
    },
    { 
      value: 'liquor', 
      label: 'Liquor',
      colors: {
        bg: 'bg-slate-50 hover:bg-slate-100',
        bgActive: 'bg-slate-700',
        text: 'text-slate-700',
        textActive: 'text-white',
        border: 'border-slate-300 hover:border-slate-400',
        borderActive: 'border-slate-700'
      }
    },
    { 
      value: 'mixers-na', 
      label: 'Mixers/NA',
      colors: {
        bg: 'bg-cyan-50 hover:bg-cyan-100',
        bgActive: 'bg-cyan-600',
        text: 'text-cyan-700',
        textActive: 'text-white',
        border: 'border-cyan-300 hover:border-cyan-400',
        borderActive: 'border-cyan-600'
      }
    },
    { 
      value: 'party-supplies', 
      label: 'Party Supplies',
      colors: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        bgActive: 'bg-purple-600',
        text: 'text-purple-700',
        textActive: 'text-white',
        border: 'border-purple-300 hover:border-purple-400',
        borderActive: 'border-purple-600'
      }
    }
  ],
  spiritTypes: [
    { value: 'all', label: 'All Liquor' },
    { value: 'Vodka', label: 'Vodka' },
    { value: 'Tequila', label: 'Tequila' },
    { value: 'Whiskey', label: 'Whiskey' },
    { value: 'Bourbon', label: 'Bourbon' },
    { value: 'Gin', label: 'Gin' },
    { value: 'Rum', label: 'Rum' },
    { value: 'Cognac', label: 'Cognac' },
    { value: 'Scotch', label: 'Scotch' }
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