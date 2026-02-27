// Partner types for Austin Partners Directory

export type PartnerCategory =
  | 'event-planning'
  | 'mobile-bartending'
  | 'venues'
  | 'catering'
  | 'boats'
  | 'transportation'
  | 'experiences'
  | 'places-to-stay';

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
  partnerPage?: string; // Internal partner page URL (e.g., '/partners/premier-party-cruises')
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
  {
    id: 'experiences',
    name: 'Experiences',
    description: 'Unique party experiences and entertainment',
    icon: 'sparkles',
  },
  {
    id: 'places-to-stay',
    name: 'Places to Stay',
    description: 'Hotels, vacation rentals, and lodging for your Austin trip',
    icon: 'bed',
  },
];

export function getCategoryById(id: PartnerCategory): CategoryInfo | undefined {
  return PARTNER_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryName(id: PartnerCategory): string {
  return getCategoryById(id)?.name || id;
}

// ============================================
// Partner Landing Page Types
// For reusable partner landing pages like Premier Party Cruises
// ============================================

/**
 * Link object for FAQs and other content
 */
export interface PartnerLink {
  text: string;
  url: string;
  external?: boolean;
}

/**
 * FAQ item for partner landing pages
 */
export interface PartnerFAQ {
  question: string;
  answer: string;
  link?: PartnerLink;
}

/**
 * Order type option (e.g., Boat Order, Airbnb Order)
 */
export interface OrderType {
  id: string;
  label: string;
  description: string;
  icon?: string;
}

/**
 * Hero bullet point with optional icon
 */
export interface BulletPoint {
  text: string;
  icon?: 'delivery' | 'group' | 'perks' | 'check';
}

/**
 * Partner landing page data structure
 * Used for dedicated partner pages with ordering functionality
 */
export interface PartnerLandingPage {
  /** URL slug (e.g., 'premier-party-cruises') */
  slug: string;
  /** Display name */
  name: string;
  /** Short tagline for hero section */
  tagline: string;
  /** Longer description for SEO/meta */
  description: string;
  /** YouTube video URL for hero background */
  heroVideoUrl?: string;
  /** YouTube video ID extracted from URL */
  heroVideoId?: string;
  /** Fallback hero image if video unavailable */
  heroImageUrl?: string;
  /** Hero bullet points */
  bulletPoints: BulletPoint[];
  /** Price indicator ($, $$, or $$$) */
  priceIndicator: '$' | '$$' | '$$$';
  /** Partner's external website */
  websiteUrl: string;
  /** Available order types */
  orderTypes: OrderType[];
  /** FAQ items */
  faqs: PartnerFAQ[];
  /** Partner logo URL (optional) */
  logoUrl?: string;
  /** Contact email (optional) */
  contactEmail?: string;
  /** Service area description */
  serviceArea?: string;
  /** Whether partner page is active */
  isActive: boolean;
}

/**
 * Form data for creating a new group order
 */
export interface CreateOrderFormData {
  orderName: string;
  hostEmail: string;
  orderType: string;
  partnerId: string;
}

/**
 * Drink calculator input
 */
export interface DrinkCalculatorInput {
  guestCount: number;
  eventDuration: number; // hours
  beerDrinkers: number; // percentage 0-100
  wineDrinkers: number; // percentage 0-100
  cocktailDrinkers: number; // percentage 0-100
}

/**
 * Drink calculator output
 */
export interface DrinkCalculatorResult {
  beer: {
    cans: number;
    cases: number;
  };
  wine: {
    bottles: number;
  };
  liquor: {
    bottles: number;
  };
  mixers: {
    bottles: number;
  };
  ice: {
    bags: number;
  };
}
