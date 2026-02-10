/**
 * Product Category Configuration
 * Hierarchical structure for filtering products by type
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
    icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', // Martini glass shape
    subcategories: [
      { label: 'Tequila', productTypes: ['Tequila'] },
      { label: 'Whiskey & Bourbon', productTypes: ['Whiskey', 'Bourbon', 'Scotch'] },
      { label: 'Vodka', productTypes: ['Vodka'] },
      { label: 'Rum', productTypes: ['Rum'] },
      { label: 'Gin', productTypes: ['Gin'] },
      { label: 'Mezcal', productTypes: ['Mezcal'] },
      { label: 'Cognac & Brandy', productTypes: ['Cognac'] },
      { label: 'Liqueurs', productTypes: ['Liqueurs', 'liqueur', 'Cordial'] },
      { label: 'Absinthe', productTypes: ['Absinthe'] },
      { label: 'Other Spirits', productTypes: ['Spirits', 'Liquor & Spirits'] },
    ],
    allProductTypes: [
      'Tequila', 'Whiskey', 'Bourbon', 'Scotch', 'Vodka', 'Rum', 'Gin',
      'Mezcal', 'Cognac', 'Liqueurs', 'liqueur', 'Cordial', 'Absinthe',
      'Spirits', 'Liquor & Spirits'
    ],
  },
  {
    id: 'beer-seltzers',
    label: 'Beer & Seltzers',
    icon: 'M8 2h8l1 9H7l1-9zm0 9v9a2 2 0 002 2h4a2 2 0 002-2v-9', // Beer mug
    subcategories: [
      { label: 'Beer', productTypes: ['Beer', 'beer and seltzers'] },
      { label: 'Hard Seltzers', productTypes: ['Seltzer'] },
      { label: 'Flavored Drinks', productTypes: ['Flavored Alcoholic Beverages'] },
      { label: 'Kegs', productTypes: ['Kegs', 'kegs', 'Keg Equipment'] },
    ],
    allProductTypes: ['Beer', 'beer and seltzers', 'Seltzer', 'Flavored Alcoholic Beverages', 'Kegs', 'kegs', 'Keg Equipment'],
  },
  {
    id: 'wine',
    label: 'Wine & Champagne',
    icon: 'M8 22h8M12 11v11m0-11a4 4 0 01-4-4V3h8v4a4 4 0 01-4 4z', // Wine glass
    subcategories: [
      { label: 'Red Wine', productTypes: ['wine', 'Wine'] },
      { label: 'White Wine', productTypes: ['wine', 'Wine'] },
      { label: 'Champagne & Sparkling', productTypes: ['champagne'] },
    ],
    allProductTypes: ['wine', 'Wine', 'champagne'],
  },
  {
    id: 'cocktails',
    label: 'Cocktails & Mixers',
    icon: 'M5 3l1 5h12l1-5H5zm2 5v13a2 2 0 002 2h6a2 2 0 002-2V8', // Shaker
    subcategories: [
      { label: 'Cocktail Kits', productTypes: ['Cocktail Kits', 'Cocktails', 'Cocktail'] },
      { label: 'Mixers', productTypes: ['Mixers', 'Cocktail Mixes'] },
      { label: 'Bitters & Aromatics', productTypes: ['Bitters', 'Aromatic'] },
      { label: 'Syrups', productTypes: ['Syrup'] },
      { label: 'Bar Tools', productTypes: ['cocktail shaker & tools'] },
    ],
    allProductTypes: ['Cocktail Kits', 'Cocktails', 'Cocktail', 'Mixers', 'Cocktail Mixes', 'Bitters', 'Aromatic', 'Syrup', 'cocktail shaker & tools'],
  },
  {
    id: 'non-alcoholic',
    label: 'Non-Alcoholic',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 5v10m-5-5h10', // Circle with cross
    subcategories: [
      { label: 'Water', productTypes: ['Water', 'water', 'sparkling water'] },
      { label: 'Sodas', productTypes: ['Soda', 'carbonated drink'] },
      { label: 'Juice', productTypes: ['Juice'] },
      { label: 'Energy Drinks', productTypes: ['Sports & Energy Drinks'] },
      { label: 'Non-Alcoholic Spirits', productTypes: ['non alcoholic'] },
      { label: 'Ice', productTypes: ['ice'] },
    ],
    allProductTypes: ['Water', 'water', 'sparkling water', 'Soda', 'carbonated drink', 'Juice', 'Sports & Energy Drinks', 'non alcoholic', 'ice', 'beverages'],
  },
  {
    id: 'thc-cbd',
    label: 'THC & Alternatives',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z',
    subcategories: [
      { label: 'THC Products', productTypes: ['THC'] },
      { label: 'Nicotine', productTypes: ['Nicotine Pouches', 'Nicotine Gum'] },
    ],
    allProductTypes: ['THC', 'Nicotine Pouches', 'Nicotine Gum'],
  },
  {
    id: 'party-supplies',
    label: 'Party Supplies',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', // Party/celebration
    subcategories: [
      { label: 'Decorations', productTypes: ['Party Decoration', 'Party Banner', 'Balloons', 'Tinsel Foil Curtains', 'Bachelorette Party Decoration Set'] },
      { label: 'Tableware', productTypes: ['Paper Napkins', 'Tablecloths', 'tablecloth', 'paper towel'] },
      { label: 'Party Favors', productTypes: ['Party Supplies', 'Photo Booth Props', 'Temporary Tattoos'] },
      { label: 'Bach Party', productTypes: ['Bach Setups', 'Sashes', 'Shot Glass Necklace', 'Necklaces', 'Earrings'] },
      { label: 'Games', productTypes: ['Party games', 'Backyard Parties'] },
    ],
    allProductTypes: [
      'Party Decoration', 'Party Banner', 'Balloons', 'Tinsel Foil Curtains', 'Bachelorette Party Decoration Set',
      'Paper Napkins', 'Tablecloths', 'tablecloth', 'paper towel',
      'Party Supplies', 'Photo Booth Props', 'Temporary Tattoos',
      'Bach Setups', 'Sashes', 'Shot Glass Necklace', 'Necklaces', 'Earrings',
      'Party games', 'Backyard Parties'
    ],
  },
  {
    id: 'drinkware',
    label: 'Drinkware & Bar',
    icon: 'M18 8h2a1 1 0 011 1v2a1 1 0 01-1 1h-2v8H6v-8H4a1 1 0 01-1-1V9a1 1 0 011-1h2V4a2 2 0 012-2h8a2 2 0 012 2v4z', // Cup
    subcategories: [
      { label: 'Glassware', productTypes: ['Glassware', 'drinkware'] },
      { label: 'Cups', productTypes: ['Cup', 'Cup with Straw', 'Mugs'] },
      { label: 'Straws & Stirrers', productTypes: ['Drinking Straws & Stirrers'] },
      { label: 'Coolers & Holders', productTypes: ['Drinkware Holders'] },
    ],
    allProductTypes: ['Glassware', 'drinkware', 'Cup', 'Cup with Straw', 'Mugs', 'Drinking Straws & Stirrers', 'Drinkware Holders'],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
    subcategories: [
      { label: 'Sunglasses', productTypes: ['Sunglasses'] },
      { label: 'Hats', productTypes: ['Hat', 'Hats', 'Mesh Baseball Cap', 'Headbands'] },
      { label: 'Bags', productTypes: ['Burlap Bag', 'bag'] },
      { label: 'Candles', productTypes: ['Candles'] },
      { label: 'Other', productTypes: ['Accessory', 'Household Items/Toiletries'] },
    ],
    allProductTypes: ['Sunglasses', 'Hat', 'Hats', 'Mesh Baseball Cap', 'Headbands', 'Burlap Bag', 'bag', 'Candles', 'Accessory', 'Household Items/Toiletries'],
  },
  {
    id: 'pool-outdoor',
    label: 'Pool & Outdoor',
    icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', // Cloud/outdoor
    subcategories: [
      { label: 'Pool Floats', productTypes: ['Pool Toys'] },
      { label: 'Outdoor Games', productTypes: ['Backyard Parties'] },
    ],
    allProductTypes: ['Pool Toys', 'Backyard Parties'],
  },
  {
    id: 'electronics',
    label: 'Electronics & Rentals',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', // Monitor
    subcategories: [
      { label: 'Projectors & Screens', productTypes: ['Electronics'] },
      { label: 'Cocktail Bars', productTypes: ['Cocktail Bars'] },
    ],
    allProductTypes: ['Electronics', 'Cocktail Bars'],
  },
  {
    id: 'snacks',
    label: 'Snacks & Food',
    icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', // Food/snack
    subcategories: [
      { label: 'Snacks', productTypes: ['Snacks', 'Grocery'] },
      { label: 'Sweeteners & Garnishes', productTypes: ['sweetener', 'mint'] },
    ],
    allProductTypes: ['Snacks', 'Grocery', 'sweetener', 'mint'],
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
    'beer-seltzers': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'wine': 'bg-purple-100 text-purple-800 border-purple-200',
    'cocktails': 'bg-pink-100 text-pink-800 border-pink-200',
    'non-alcoholic': 'bg-blue-100 text-blue-800 border-blue-200',
    'thc-cbd': 'bg-green-100 text-green-800 border-green-200',
    'party-supplies': 'bg-rose-100 text-rose-800 border-rose-200',
    'drinkware': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'accessories': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'pool-outdoor': 'bg-teal-100 text-teal-800 border-teal-200',
    'electronics': 'bg-slate-100 text-slate-800 border-slate-200',
    'snacks': 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colors[categoryId] || 'bg-gray-100 text-gray-800 border-gray-200';
}
