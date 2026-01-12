// BYOB Venue types for Austin BYOB Venues Directory

export type VenueCategory =
  | 'historic-cultural'
  | 'gardens-outdoor'
  | 'barns-ranches'
  | 'modern-industrial'
  | 'public-community'
  | 'entertainment'
  | 'hill-country';

export type EventType =
  | 'wedding'
  | 'corporate'
  | 'party'
  | 'bachelor'
  | 'social';

export type Setting = 'indoor' | 'outdoor' | 'both';

export type PriceRange = 1 | 2 | 3 | 4;

export type PartnerTier = 'premier' | 'featured' | 'listed' | 'none';

export type LocationArea =
  | 'downtown'
  | 'central'
  | 'east'
  | 'south'
  | 'north'
  | 'west'
  | 'lake-travis'
  | 'lake-austin'
  | 'dripping-springs'
  | 'hill-country'
  | 'georgetown'
  | 'kyle'
  | 'buda'
  | 'lockhart'
  | 'manor'
  | 'bee-cave'
  | 'lago-vista'
  | 'driftwood'
  | 'mueller'
  | 'zilker'
  | 'ut-campus';

export interface BYOBVenue {
  id: number;
  name: string;
  slug: string;
  category: VenueCategory;
  subcategory: string;
  byobPolicy: string;
  description?: string;
  partnerStatus: PartnerTier;
  partnerSlug?: string;
  website?: string;
  image?: string;
  eventTypes: EventType[];
  setting: Setting;
  capacityMin?: number;
  capacityMax?: number;
  priceRange: PriceRange;
  area: LocationArea;
}

export interface VenueCategoryInfo {
  id: VenueCategory;
  name: string;
  description: string;
  count?: number;
}

export const VENUE_CATEGORIES: VenueCategoryInfo[] = [
  {
    id: 'historic-cultural',
    name: 'Historic & Cultural',
    description: 'Museums, historic homes, and cultural centers',
  },
  {
    id: 'gardens-outdoor',
    name: 'Gardens & Outdoor',
    description: 'Botanical gardens, parks, and outdoor venues',
  },
  {
    id: 'barns-ranches',
    name: 'Barns & Ranches',
    description: 'Rustic barns, ranches, and country estates',
  },
  {
    id: 'modern-industrial',
    name: 'Modern & Industrial',
    description: 'Warehouses, lofts, and contemporary spaces',
  },
  {
    id: 'public-community',
    name: 'Public & Community',
    description: 'City facilities and community centers',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Activity',
    description: 'Party boats, art studios, and unique experiences',
  },
  {
    id: 'hill-country',
    name: 'Hill Country',
    description: 'Venues in Dripping Springs, Georgetown, and beyond',
  },
];

export const EVENT_TYPES: { id: EventType; name: string }[] = [
  { id: 'wedding', name: 'Weddings' },
  { id: 'corporate', name: 'Corporate' },
  { id: 'party', name: 'Parties' },
  { id: 'bachelor', name: 'Bachelor/ette' },
  { id: 'social', name: 'Social' },
];

export const PRICE_RANGES: { value: PriceRange; label: string; range: string }[] = [
  { value: 1, label: '$', range: 'Under $2,000' },
  { value: 2, label: '$$', range: '$2,000 - $5,000' },
  { value: 3, label: '$$$', range: '$5,000 - $10,000' },
  { value: 4, label: '$$$$', range: '$10,000+' },
];

export const GUEST_RANGES = [
  { id: 'intimate', label: 'Under 50', min: 0, max: 49 },
  { id: 'small', label: '50-100', min: 50, max: 100 },
  { id: 'medium', label: '100-200', min: 100, max: 200 },
  { id: 'large', label: '200-300', min: 200, max: 300 },
  { id: 'xlarge', label: '300+', min: 300, max: 9999 },
];

export const LOCATION_AREAS: { id: LocationArea; name: string }[] = [
  { id: 'downtown', name: 'Downtown Austin' },
  { id: 'central', name: 'Central Austin' },
  { id: 'east', name: 'East Austin' },
  { id: 'south', name: 'South Austin' },
  { id: 'north', name: 'North Austin' },
  { id: 'west', name: 'West Austin' },
  { id: 'lake-travis', name: 'Lake Travis' },
  { id: 'lake-austin', name: 'Lake Austin' },
  { id: 'dripping-springs', name: 'Dripping Springs' },
  { id: 'hill-country', name: 'Hill Country' },
  { id: 'georgetown', name: 'Georgetown' },
];

export function getCategoryName(id: VenueCategory): string {
  return VENUE_CATEGORIES.find((cat) => cat.id === id)?.name || id;
}

export function getPriceLabel(price: PriceRange): string {
  return PRICE_RANGES.find((p) => p.value === price)?.label || '';
}

export function getAreaName(id: LocationArea): string {
  return LOCATION_AREAS.find((a) => a.id === id)?.name || id;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
