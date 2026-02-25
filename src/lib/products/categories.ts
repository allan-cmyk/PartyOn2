/** Product categories and collection configuration */

export const PRODUCT_CATEGORIES = {
  beer: {
    label: 'Beer',
    handle: 'beer',
    productTypes: ['Light Beer', 'Craft Beer'],
    collections: ['light-beer', 'craft-beer']
  },
  seltzersRtds: {
    label: 'Seltzers & RTDs',
    handle: 'seltzers-rtds',
    productTypes: ['Seltzer', 'RTD Cocktail'],
    collections: ['seltzers-rtds']
  },
  wine: {
    label: 'Wine',
    handle: 'wine',
    productTypes: ['Red Wine', 'White Wine', 'Sparkling Wine'],
    collections: ['red-wine', 'white-wine', 'sparkling-wine']
  },
  spirits: {
    label: 'Spirits',
    handle: 'spirits',
    productTypes: ['Tequila', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Liqueur'],
    collections: ['spirits', 'spirits-tequila', 'spirits-whiskey', 'spirits-vodka', 'spirits-rum', 'spirits-gin', 'spirits-liqueurs']
  },
  cocktailKits: {
    label: 'Cocktail Kits',
    handle: 'cocktail-kits',
    productTypes: ['Cocktail Kit'],
    collections: ['cocktail-kits']
  },
  mixers: {
    label: 'Mixers',
    handle: 'mixers',
    productTypes: ['Mixer'],
    collections: ['mixers']
  },
  partySupplies: {
    label: 'Party Supplies',
    handle: 'party-supplies',
    productTypes: ['Weekend Supply', 'Formal Supply'],
    collections: ['weekend-party-supplies', 'formal-event-supplies']
  },
  kegs: {
    label: 'Kegs',
    handle: 'kegs',
    productTypes: ['Keg'],
    collections: ['kegs']
  }
};

export function getProductCategory(product: {
  productType?: string;
  collections?: { edges: Array<{ node: { handle: string } }> };
}): string {
  const productType = product.productType || '';
  const collections = product.collections?.edges.map(e => e.node.handle) || [];

  for (const [key, category] of Object.entries(PRODUCT_CATEGORIES)) {
    if (category.productTypes.some(type => type === productType)) {
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
      textActive: 'text-gray-900',
      border: 'border-brand-yellow hover:border-yellow-500',
      borderActive: 'border-brand-yellow'
    }
  },
  {
    handle: 'cocktail-kits',
    label: 'Cocktail Kits',
    category: 'cocktailKits',
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
    handle: 'light-beer',
    label: 'Light Beer',
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
    handle: 'craft-beer',
    label: 'Craft Beer',
    category: 'beer',
    colors: {
      bg: 'bg-orange-50 hover:bg-orange-100',
      bgActive: 'bg-orange-600',
      text: 'text-orange-700',
      textActive: 'text-white',
      border: 'border-orange-400 hover:border-orange-500',
      borderActive: 'border-orange-600'
    }
  },
  {
    handle: 'seltzers-rtds',
    label: 'Seltzers & RTDs',
    category: 'seltzersRtds',
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
    handle: 'red-wine',
    label: 'Red Wine',
    category: 'wine',
    colors: {
      bg: 'bg-red-50 hover:bg-red-100',
      bgActive: 'bg-red-700',
      text: 'text-red-700',
      textActive: 'text-white',
      border: 'border-red-400 hover:border-red-500',
      borderActive: 'border-red-700'
    }
  },
  {
    handle: 'white-wine',
    label: 'White Wine',
    category: 'wine',
    colors: {
      bg: 'bg-lime-50 hover:bg-lime-100',
      bgActive: 'bg-lime-600',
      text: 'text-lime-700',
      textActive: 'text-white',
      border: 'border-lime-400 hover:border-lime-500',
      borderActive: 'border-lime-600'
    }
  },
  {
    handle: 'sparkling-wine',
    label: 'Sparkling & Rose',
    category: 'wine',
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
    category: 'spirits',
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
    handle: 'mixers',
    label: 'Mixers',
    category: 'mixers',
    colors: {
      bg: 'bg-green-50 hover:bg-green-100',
      bgActive: 'bg-green-600',
      text: 'text-green-700',
      textActive: 'text-white',
      border: 'border-green-400 hover:border-green-500',
      borderActive: 'border-green-600'
    }
  },
  {
    handle: 'weekend-party-supplies',
    label: 'Party Supplies',
    category: 'partySupplies',
    colors: {
      bg: 'bg-violet-50 hover:bg-violet-100',
      bgActive: 'bg-violet-600',
      text: 'text-violet-700',
      textActive: 'text-white',
      border: 'border-violet-400 hover:border-violet-500',
      borderActive: 'border-violet-600'
    }
  },
  {
    handle: 'kegs',
    label: 'Kegs & Equipment',
    category: 'kegs',
    colors: {
      bg: 'bg-stone-50 hover:bg-stone-100',
      bgActive: 'bg-stone-600',
      text: 'text-stone-700',
      textActive: 'text-white',
      border: 'border-stone-400 hover:border-stone-500',
      borderActive: 'border-stone-600'
    }
  },
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
        textActive: 'text-gray-900',
        border: 'border-gray-300 hover:border-brand-yellow',
        borderActive: 'border-brand-yellow'
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
      value: 'seltzers-rtds',
      label: 'Seltzers & RTDs',
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
      value: 'wine',
      label: 'Wine',
      colors: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        bgActive: 'bg-purple-600',
        text: 'text-purple-700',
        textActive: 'text-white',
        border: 'border-purple-300 hover:border-purple-400',
        borderActive: 'border-purple-600'
      }
    },
    {
      value: 'spirits',
      label: 'Spirits',
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
      value: 'cocktail-kits',
      label: 'Cocktail Kits',
      colors: {
        bg: 'bg-rose-50 hover:bg-rose-100',
        bgActive: 'bg-rose-600',
        text: 'text-rose-700',
        textActive: 'text-white',
        border: 'border-rose-300 hover:border-rose-400',
        borderActive: 'border-rose-600'
      }
    },
    {
      value: 'mixers',
      label: 'Mixers',
      colors: {
        bg: 'bg-green-50 hover:bg-green-100',
        bgActive: 'bg-green-600',
        text: 'text-green-700',
        textActive: 'text-white',
        border: 'border-green-300 hover:border-green-400',
        borderActive: 'border-green-600'
      }
    },
    {
      value: 'party-supplies',
      label: 'Party Supplies',
      colors: {
        bg: 'bg-violet-50 hover:bg-violet-100',
        bgActive: 'bg-violet-600',
        text: 'text-violet-700',
        textActive: 'text-white',
        border: 'border-violet-300 hover:border-violet-400',
        borderActive: 'border-violet-600'
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
