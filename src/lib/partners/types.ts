// Partner types for Austin Partners Directory

export type PartnerCategory =
  | 'event-planning'
  | 'mobile-bartending'
  | 'venues'
  | 'catering'
  | 'boats'
  | 'transportation';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo: string;
  heroImage?: string;
  invertLogo?: boolean; // Invert dark logos to white for dark backgrounds
  category: PartnerCategory;
  featured?: boolean;
  order?: number;
}

export interface CategoryInfo {
  id: PartnerCategory;
  name: string;
  description: string;
  icon: string;
}

export const PARTNER_CATEGORIES: CategoryInfo[] = [
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Professional event coordinators and wedding planners',
    icon: 'calendar',
  },
  {
    id: 'mobile-bartending',
    name: 'Mobile Bartending',
    description: 'TABC-certified bartenders and mixologists',
    icon: 'cocktail',
  },
  {
    id: 'venues',
    name: 'Venues',
    description: 'Unique event spaces across Austin',
    icon: 'building',
  },
  {
    id: 'catering',
    name: 'Catering',
    description: 'Food trucks, caterers, and personal chefs',
    icon: 'utensils',
  },
  {
    id: 'boats',
    name: 'Boats',
    description: 'Lake Travis boats and yacht charters',
    icon: 'anchor',
  },
  {
    id: 'transportation',
    name: 'Transportation',
    description: 'Party buses, limos, and shuttles',
    icon: 'car',
  },
];

export function getCategoryById(id: PartnerCategory): CategoryInfo | undefined {
  return PARTNER_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryName(id: PartnerCategory): string {
  return getCategoryById(id)?.name || id;
}
