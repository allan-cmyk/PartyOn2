/**
 * Product Category Configuration
 * Hierarchical structure for filtering products by type in the admin (/ops/products)
 */

export interface ProductSubcategory {
  label: string;
  productTypes: string[]; // Maps to productType field in database
}

export interface ProductCategory {
  id: string;
  label: string;
  icon: string; // SVG path for icon
  subcategories: ProductSubcategory[];
  // All product types that belong to this category (including subcategories)
  allProductTypes: string[];
}

// Define the category hierarchy
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'spirits',
    label: 'Spirits',
    icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    subcategories: [
      { label: 'Tequila', productTypes: ['Tequila'] },
      { label: 'Whiskey & Bourbon', productTypes: ['Whiskey'] },
      { label: 'Vodka', productTypes: ['Vodka'] },
      { label: 'Rum', productTypes: ['Rum'] },
      { label: 'Gin', productTypes: ['Gin'] },
      { label: 'Liqueurs', productTypes: ['Liqueur'] },
    ],
    allProductTypes: ['Tequila', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Liqueur'],
  },
  {
    id: 'beer',
    label: 'Beer',
    icon: 'M8 2h8l1 9H7l1-9zm0 9v9a2 2 0 002 2h4a2 2 0 002-2v-9',
    subcategories: [
      { label: 'Light Beer', productTypes: ['Light Beer'] },
      { label: 'Craft Beer', productTypes: ['Craft Beer'] },
    ],
    allProductTypes: ['Light Beer', 'Craft Beer'],
  },
  {
    id: 'seltzers-rtds',
    label: 'Seltzers & RTDs',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z',
    subcategories: [
      { label: 'Hard Seltzers', productTypes: ['Seltzer'] },
      { label: 'RTD Cocktails', productTypes: ['RTD Cocktail'] },
    ],
    allProductTypes: ['Seltzer', 'RTD Cocktail'],
  },
  {
    id: 'wine',
    label: 'Wine',
    icon: 'M8 22h8M12 11v11m0-11a4 4 0 01-4-4V3h8v4a4 4 0 01-4 4z',
    subcategories: [
      { label: 'Red Wine', productTypes: ['Red Wine'] },
      { label: 'White Wine', productTypes: ['White Wine'] },
      { label: 'Sparkling & Rose', productTypes: ['Sparkling Wine'] },
    ],
    allProductTypes: ['Red Wine', 'White Wine', 'Sparkling Wine'],
  },
  {
    id: 'cocktail-kits',
    label: 'Cocktail Kits',
    icon: 'M5 3l1 5h12l1-5H5zm2 5v13a2 2 0 002 2h6a2 2 0 002-2V8',
    subcategories: [
      { label: 'Cocktail Kits', productTypes: ['Cocktail Kit'] },
    ],
    allProductTypes: ['Cocktail Kit'],
  },
  {
    id: 'mixers',
    label: 'Mixers',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 5v10m-5-5h10',
    subcategories: [
      { label: 'Mixers', productTypes: ['Mixer'] },
    ],
    allProductTypes: ['Mixer'],
  },
  {
    id: 'party-supplies',
    label: 'Party Supplies',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    subcategories: [
      { label: 'Weekend Party', productTypes: ['Weekend Supply'] },
    ],
    allProductTypes: ['Weekend Supply'],
  },
  {
    id: 'kegs',
    label: 'Kegs & Equipment',
    icon: 'M18 8h2a1 1 0 011 1v2a1 1 0 01-1 1h-2v8H6v-8H4a1 1 0 01-1-1V9a1 1 0 011-1h2V4a2 2 0 012-2h8a2 2 0 012 2v4z',
    subcategories: [
      { label: 'Kegs', productTypes: ['Keg'] },
    ],
    allProductTypes: ['Keg'],
  },
  {
    id: 'chill-supplies',
    label: 'Chill Supplies',
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707',
    subcategories: [
      { label: 'Chill Supplies', productTypes: ['Chill Supply'] },
    ],
    allProductTypes: ['Chill Supply'],
  },
  {
    id: 'food',
    label: 'Food',
    icon: 'M3 3h18v18H3V3zm3 6h12M3 15h18',
    subcategories: [
      { label: 'Food', productTypes: ['Food'] },
    ],
    allProductTypes: ['Food'],
  },
  {
    id: 'rentals',
    label: 'Rentals',
    icon: 'M4 4h16v12H4V4zm0 12l4-4h8l4 4',
    subcategories: [
      { label: 'Rentals', productTypes: ['Rental'] },
    ],
    allProductTypes: ['Rental'],
  },
];

// Helper function to get all product types in a category
export function getCategoryProductTypes(categoryId: string): string[] {
  const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
  return category?.allProductTypes || [];
}

// Helper function to get subcategory product types
export function getSubcategoryProductTypes(categoryId: string, subcategoryLabel: string): string[] {
  const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
  const subcategory = category?.subcategories.find(s => s.label === subcategoryLabel);
  return subcategory?.productTypes || [];
}

// Get category by product type
export function getCategoryByProductType(productType: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find(c => c.allProductTypes.includes(productType));
}

// Get the category badge color
export function getCategoryColor(categoryId: string): string {
  const colors: Record<string, string> = {
    'spirits': 'bg-amber-100 text-amber-800 border-amber-200',
    'beer': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'seltzers-rtds': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'wine': 'bg-purple-100 text-purple-800 border-purple-200',
    'cocktail-kits': 'bg-pink-100 text-pink-800 border-pink-200',
    'mixers': 'bg-green-100 text-green-800 border-green-200',
    'party-supplies': 'bg-rose-100 text-rose-800 border-rose-200',
    'kegs': 'bg-stone-100 text-stone-800 border-stone-200',
    'chill-supplies': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'food': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'rentals': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  return colors[categoryId] || 'bg-gray-100 text-gray-800 border-gray-200';
}
