export type EventType =
  | 'bachelor'
  | 'bachelorette'
  | 'house-party'
  | 'corporate'
  | 'wedding'
  | 'boat-day'
  | 'weekend-trip'
  | 'other';

export type DrinkingVibe = 'light' | 'social' | 'party';

export type Duration = '2-3' | '4-5' | '6-8' | 'all-day' | '2-days' | '3-days';

export type DrinkCategory =
  | 'beer'
  | 'seltzers'
  | 'wine'
  | 'champagne'
  | 'cocktail-kits'
  | 'spirits';

export type Extra =
  | 'na-water'
  | 'budget-friendly'
  | 'premium'
  | 'no-glass'
  | 'ice-cups';

export type BartenderChoice = 'yes' | 'no' | 'tell-me-more';

export type EventTiming = 'this-weekend' | 'next-weekend' | '2-weeks-out' | 'just-browsing';
export type DeliveryArea = 'austin' | 'lake-travis' | 'round-rock' | 'other';

export type StepId =
  | 'welcome'
  | 'event-type'
  | 'guest-count'
  | 'drinking-vibe'
  | 'duration'
  | 'drink-types'
  | 'cocktail-pick'
  | 'extras'
  | 'bartender'
  | 'event-details'
  | 'results';

export interface QuizState {
  currentStep: StepId;
  eventType: EventType | null;
  guestCount: number;
  drinkingVibe: DrinkingVibe | null;
  duration: Duration | null;
  drinkCategories: DrinkCategory[];
  selectedCocktails: string[]; // product handles
  extras: Extra[];
  bartender: BartenderChoice | null;
  eventTiming: EventTiming | null;
  deliveryArea: DeliveryArea | null;
  skipped: boolean;
  completed: boolean;
  packageTier: 'standard' | 'premium';
}

export interface ProductRecommendation {
  name: string;
  searchQuery: string;
  quantity: number;
  unit: string;
  category: DrinkCategory | 'ice' | 'extras';
  premiumAlternative?: {
    name: string;
    searchQuery: string;
  };
}

export interface QuizResults {
  recommendations: ProductRecommendation[];
  totalDrinks: number;
  summary: {
    eventType: string;
    guestCount: number;
    duration: string;
    vibe: string;
  };
}

export type QuizAction =
  | { type: 'SET_EVENT_TYPE'; payload: EventType }
  | { type: 'SET_GUEST_COUNT'; payload: number }
  | { type: 'SET_DRINKING_VIBE'; payload: DrinkingVibe }
  | { type: 'SET_DURATION'; payload: Duration }
  | { type: 'SET_DRINK_CATEGORIES'; payload: DrinkCategory[] }
  | { type: 'TOGGLE_DRINK_CATEGORY'; payload: DrinkCategory }
  | { type: 'SET_SELECTED_COCKTAILS'; payload: string[] }
  | { type: 'SET_EXTRAS'; payload: Extra[] }
  | { type: 'TOGGLE_EXTRA'; payload: Extra }
  | { type: 'SET_BARTENDER'; payload: BartenderChoice }
  | { type: 'SET_EVENT_TIMING'; payload: EventTiming }
  | { type: 'SET_DELIVERY_AREA'; payload: DeliveryArea }
  | { type: 'SET_PACKAGE_TIER'; payload: 'standard' | 'premium' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: StepId }
  | { type: 'SKIP_QUIZ' }
  | { type: 'RESET' };

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'bachelor': 'Bachelor Party',
  'bachelorette': 'Bachelorette Party',
  'house-party': 'House Party',
  'corporate': 'Corporate Event',
  'wedding': 'Wedding',
  'boat-day': 'Boat Day',
  'weekend-trip': 'Weekend Trip',
  'other': 'Other',
};

export const VIBE_LABELS: Record<DrinkingVibe, { label: string; description: string }> = {
  'light': { label: 'Light Sippers', description: 'A drink or two' },
  'social': { label: 'Social Drinkers', description: 'Keeping it going' },
  'party': { label: 'Here to Party', description: "Let's go!" },
};

export const DURATION_LABELS: Record<Duration, string> = {
  '2-3': '2-3 hours',
  '4-5': '4-5 hours',
  '6-8': '6-8 hours',
  'all-day': 'All day/night',
  '2-days': '2 days',
  '3-days': '3 days',
};

export const DRINK_CATEGORY_LABELS: Record<DrinkCategory, string> = {
  'beer': 'Beer',
  'seltzers': 'Seltzers / RTDs',
  'wine': 'Wine',
  'champagne': 'Champagne / Bubbles',
  'cocktail-kits': 'Cocktail Kits',
  'spirits': 'Spirits',
};
