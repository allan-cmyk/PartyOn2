/** Product categories and collection configuration */

export const PRODUCT_CATEGORIES = {
  seltzersChamps: {
    label: 'Seltzers & Champs',
    handle: 'seltzers-champs',
    productTypes: ['Seltzer', 'champagne', 'Prosecco', 'Sparkling Wine'],
    collections: ['seltzer-collection', 'seltzers-wine-champagne', 'champagne']
  },
  beer: {
    label: 'Beer',
    handle: 'beer',
    productTypes: ['beer and seltzers', 'Beer', 'Lager', 'IPA', 'Ale', 'Stout'],
    collections: ['beer', 'beer-collection']
  },
  cocktails: {
    label: 'Cocktails',
    handle: 'cocktails',
    productTypes: ['Cocktail', 'Cocktail Kits', 'Ready to Drink', 'RTD', 'Canned Cocktails'],
    collections: ['cocktails', 'ready-to-drink', 'canned-cocktails']
  },
  liquor: {
    label: 'Liquor',
    handle: 'liquor',
    productTypes: ['Vodka', 'Tequila', 'Whiskey', 'Bourbon', 'Gin', 'Rum', 'Liquor & Spirits', 'Cognac', 'Brandy', 'Scotch', 'Rye'],
    collections: ['spirits', 'gin-rum', 'tequila-mezcal', 'bourbon-rye', 'vodka', 'whiskey']
  },
  mixersNA: {
    label: 'Mixers/NA',
    handle: 'mixers-na',
    productTypes: ['Cocktail Mixes', 'non alcoholic', 'sparkling water', 'water', 'Juice', 'ice', 'Mixer', 'Tonic', 'Soda'],
    collections: ['mixers-non-alcoholic', 'liqueurs-cordials-cocktail-ingredients', 'mixers']
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
    ]
  }
};

export function getProductCategory(product: {
  productType?: string;
  collections?: { edges: Array<{ node: { handle: string } }> };
}): string {
  const productType = product.productType?.toLowerCase() || '';
  const collections = product.collections?.edges.map(e => e.node.handle) || [];

  for (const [key, category] of Object.entries(PRODUCT_CATEGORIES)) {
    if (category.productTypes.some(type => type.toLowerCase() === productType)) {
      return key;
    }
    if (collections.some(c => category.collections.includes(c))) {
      return key;
    }
  }

  return 'other';
}

export function isInCollection(product: {
  collections?: { edges: Array<{ node: { handle: string } }> };
}, collectionHandle: string): boolean {
  const collections = product.collections?.edges.map(e => e.node.handle) || [];
  return collections.includes(collectionHandle);
}

export function getUniqueTags(products: Array<{ tags?: string[] }>): string[] {
  const tags = new Set<string>();
  products.forEach(p => {
    p.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function getUniqueProductTypes(products: Array<{ productType?: string }>): string[] {
  const types = new Set<string>();
  products.forEach(p => {
    if (p.productType) types.add(p.productType);
  });
  return Array.from(types).sort();
}

export const SHOPIFY_COLLECTIONS = [
  {
    handle: 'favorites-home-page',
    label: "Austin's Favorites",
    category: 'featured',
    colors: {
      bg: 'bg-yellow-50 hover:bg-yellow-100',
      bgActive: 'bg-brand-yellow',
      text: 'text-yellow-600',
      textActive: 'text-white',
      border: 'border-brand-yellow hover:border-yellow-500',
      borderActive: 'border-brand-yellow'
    }
  },
  {
    handle: 'cocktail-kits',
    label: 'Cocktail Kits',
    category: 'cocktails',
    colors: {
      bg: 'bg-rose-50 hover:bg-rose-100',
      bgActive: 'bg-rose-600',
      text: 'text-rose-700',
      textActive: 'text-white',
      border: 'border-rose-400 hover:border-rose-500',
      borderActive: 'border-rose-600'
    }
  },
  {
    handle: 'bachelor-favorites',
    label: 'Bachelor Favorites',
    category: 'partySupplies',
    colors: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      bgActive: 'bg-blue-600',
      text: 'text-blue-700',
      textActive: 'text-white',
      border: 'border-blue-400 hover:border-blue-500',
      borderActive: 'border-blue-600'
    }
  },
  {
    handle: 'bachelorette-booze',
    label: 'Bachelorette Favorites',
    category: 'partySupplies',
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
    handle: 'tailgate-beer',
    label: 'Beers',
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
    handle: 'seltzer-collection',
    label: 'Seltzers',
    category: 'seltzersChamps',
    colors: {
      bg: 'bg-cyan-50 hover:bg-cyan-100',
      bgActive: 'bg-cyan-600',
      text: 'text-cyan-700',
      textActive: 'text-white',
      border: 'border-cyan-400 hover:border-cyan-500',
      borderActive: 'border-cyan-600'
    }
  },
  {
    handle: 'champagne',
    label: 'Wine and Champagne',
    category: 'seltzersChamps',
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
    handle: 'spirits',
    label: 'Spirits',
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
    handle: 'mixers-non-alcoholic',
    label: 'Mixers & Non-Alcoholic',
    category: 'mixersNA',
    colors: {
      bg: 'bg-green-50 hover:bg-green-100',
      bgActive: 'bg-green-600',
      text: 'text-green-700',
      textActive: 'text-white',
      border: 'border-green-400 hover:border-green-500',
      borderActive: 'border-green-600'
    }
  }
];

export const FILTER_OPTIONS = {
  mainCategories: [
    {
      value: 'all',
      label: 'All Products',
      colors: {
        bg: 'bg-gray-50 hover:bg-gray-100',
        bgActive: 'bg-brand-yellow',
        text: 'text-gray-700',
        textActive: 'text-white',
        border: 'border-gray-300 hover:border-brand-yellow',
        borderActive: 'border-brand-yellow'
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
  sortOptions: [
    { value: 'featured', label: 'Featured' },
    { value: 'bestsellers', label: 'Best Sellers' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' }
  ]
};
