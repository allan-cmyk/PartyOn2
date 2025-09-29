/**
 * Shopify Query Language Builder
 * Constructs filter queries for Shopify Storefront API
 * Documentation: https://shopify.dev/docs/api/usage/search-syntax
 */

export interface ProductFilters {
  productType?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  vendor?: string;
  available?: boolean;
  searchTerm?: string;
}

/**
 * Builds a Shopify query string from filter parameters
 * @param filters - Filter parameters
 * @returns Shopify query string
 */
export function buildShopifyQuery(filters: ProductFilters): string {
  const queryParts: string[] = [];

  // Search term (searches title, description, tags, etc.)
  if (filters.searchTerm) {
    queryParts.push(`title:*${filters.searchTerm}* OR tag:*${filters.searchTerm}*`);
  }

  // Product type filter
  if (filters.productType) {
    queryParts.push(`product_type:"${filters.productType}"`);
  }

  // Tag filters (AND logic - product must have all tags)
  if (filters.tags && filters.tags.length > 0) {
    const tagQueries = filters.tags.map(tag => `tag:"${tag}"`);
    queryParts.push(`(${tagQueries.join(' AND ')})`);
  }

  // Price range filter
  if (filters.priceMin !== undefined && filters.priceMin > 0) {
    queryParts.push(`variants.price:>=${filters.priceMin}`);
  }

  if (filters.priceMax !== undefined && filters.priceMax < 10000) {
    queryParts.push(`variants.price:<=${filters.priceMax}`);
  }

  // Vendor filter
  if (filters.vendor) {
    queryParts.push(`vendor:"${filters.vendor}"`);
  }

  // Availability filter
  if (filters.available !== undefined) {
    queryParts.push(`available:${filters.available}`);
  }

  // Combine all parts with AND logic
  return queryParts.length > 0 ? queryParts.join(' AND ') : '';
}

/**
 * Maps category filter to Shopify product types
 * @param category - UI category filter
 * @returns Array of Shopify product types
 */
export function getCategoryProductTypes(category: string): string[] {
  const categoryMap: Record<string, string[]> = {
    'seltzers-champs': ['Seltzer', 'champagne', 'Prosecco', 'Sparkling Wine'],
    'beer': ['beer and seltzers', 'Beer', 'Lager', 'IPA', 'Ale', 'Stout'],
    'cocktails': ['Cocktail', 'Cocktail Kits', 'Ready to Drink', 'RTD', 'Canned Cocktails'],
    'liquor': ['Vodka', 'Tequila', 'Whiskey', 'Bourbon', 'Gin', 'Rum', 'Liquor & Spirits', 'Cognac', 'Brandy', 'Scotch', 'Rye'],
    'mixers-na': ['Cocktail Mixes', 'non alcoholic', 'sparkling water', 'water', 'Juice', 'ice', 'Mixer', 'Tonic', 'Soda'],
    'party-supplies': ['Cup', 'Cup with Straw', 'drinkware', 'Drinking Straws & Stirrers', 'Party Decoration'],
  };

  return categoryMap[category] || [];
}

/**
 * Builds a query for category filtering
 * @param category - UI category filter
 * @returns Shopify query string for the category
 */
export function buildCategoryQuery(category: string): string {
  if (category === 'all') return '';

  const productTypes = getCategoryProductTypes(category);
  if (productTypes.length === 0) return '';

  // Create OR query for all product types in this category
  const typeQueries = productTypes.map(type => `product_type:"${type}"`);
  return `(${typeQueries.join(' OR ')})`;
}

/**
 * Combines multiple query strings
 * @param queries - Array of query strings
 * @returns Combined query string
 */
export function combineQueries(...queries: string[]): string {
  const validQueries = queries.filter(q => q && q.trim().length > 0);
  return validQueries.length > 0 ? validQueries.join(' AND ') : '';
}

/**
 * Builds sort key for Shopify API
 * @param sortBy - UI sort option
 * @returns Shopify sort key
 */
export function getSortKey(sortBy: string): string {
  const sortMap: Record<string, string> = {
    'featured': 'COLLECTION_DEFAULT',
    'bestsellers': 'BEST_SELLING',
    'price-asc': 'PRICE',
    'price-desc': 'PRICE',
    'name-asc': 'TITLE',
    'name-desc': 'TITLE',
  };

  return sortMap[sortBy] || 'COLLECTION_DEFAULT';
}

/**
 * Determines if sort should be reversed
 * @param sortBy - UI sort option
 * @returns Whether to reverse sort
 */
export function getSortReverse(sortBy: string): boolean {
  return sortBy === 'price-desc' || sortBy === 'name-desc';
}