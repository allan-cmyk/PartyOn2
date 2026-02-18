import type {
  QuizState,
  QuizResults,
  ProductRecommendation,
  StepId,
  DrinkCategory,
  EventType,
  DrinkingVibe,
  Duration,
  QuizAction,
} from './drinkPlannerTypes';
import { EVENT_TYPE_LABELS, VIBE_LABELS, DURATION_LABELS } from './drinkPlannerTypes';

// Drinks per person per hour based on event type and vibe
const DRINKS_PER_HOUR: Record<EventType, Record<DrinkingVibe, number>> = {
  'bachelor':      { light: 1.5,  social: 2.0,  party: 2.5  },
  'bachelorette':  { light: 1.25, social: 1.75, party: 2.0  },
  'house-party':   { light: 1.25, social: 1.75, party: 2.25 },
  'corporate':     { light: 1.0,  social: 1.5,  party: 1.75 },
  'wedding':       { light: 1.0,  social: 1.5,  party: 2.0  },
  'boat-day':      { light: 1.5,  social: 2.0,  party: 2.5  },
  'weekend-trip':  { light: 1.25, social: 1.75, party: 2.25 },
  'other':         { light: 1.25, social: 1.75, party: 2.0  },
};

const DURATION_HOURS: Record<Duration, number> = {
  '2-3': 2.5,
  '4-5': 4.5,
  '6-8': 7,
  'all-day': 10,
  '2-days': 16,
  '3-days': 24,
};

// Product search queries for the product search API
export const SEARCH_OVERRIDES: Record<string, string> = {
  'Ice Bags': 'ice bag',
  'Miller Lite 24pk': 'Miller Lite 24',
  'Modelo 24pk': 'Modelo Especial 24',
  'Austin Beerworks': 'Austin Beerworks',
  'High Noon Variety': 'High Noon',
  'Surfside Variety': 'Surfside',
  'White Claw Variety': 'White Claw',
  'Ranch Water': 'Ranch Water',
  'Topo Chico Seltzer': 'Topo Chico Hard Seltzer',
  'Austin Rita Kit': 'Austin Rita',
  "Tito's Lemonade Kit": "Tito's Lemonade",
  'Rum Punch Kit': 'Rum Punch',
  'Old-Fashioned Kit': 'Old-Fashioned',
  'Aperol Spritz Kit': 'Aperol Spritz',
  'Espresso Martini Kit': 'Espresso Martini',
  'Margarita Kit': 'Margarita',
  'Dark Horse Pinot Grigio': 'Dark Horse Pinot Grigio',
  'Jam Cellars Chardonnay': 'Jam Cellars',
  'La Marca Prosecco': 'La Marca',
  'Wycliff Brut Rose': 'Wycliff',
  'Andre Brut': 'Andre Brut',
  'Topo Chico Mineral Water': 'Topo Chico Mineral',
  'Liquid Death': 'Liquid Death',
};

export function getSteps(state: QuizState): StepId[] {
  const steps: StepId[] = [
    'welcome',
    'event-type',
    'guest-count',
    'drinking-vibe',
    'duration',
    'drink-types',
  ];

  if (state.drinkCategories.includes('cocktail-kits')) {
    steps.push('cocktail-pick');
  }

  steps.push('extras', 'bartender', 'event-details', 'results');
  return steps;
}

export function getStepIndex(state: QuizState): number {
  const steps = getSteps(state);
  return steps.indexOf(state.currentStep);
}

export function getNextStep(state: QuizState): StepId | null {
  const steps = getSteps(state);
  const idx = steps.indexOf(state.currentStep);
  return idx < steps.length - 1 ? steps[idx + 1] : null;
}

export function getPrevStep(state: QuizState): StepId | null {
  const steps = getSteps(state);
  const idx = steps.indexOf(state.currentStep);
  return idx > 0 ? steps[idx - 1] : null;
}

export function getGuestRange(eventType: EventType | null): { min: number; max: number } {
  if (eventType === 'boat-day' || eventType === 'weekend-trip') {
    return { min: 5, max: 50 };
  }
  return { min: 10, max: 200 };
}

export function getQuickPickValues(eventType: EventType | null): number[] {
  if (eventType === 'boat-day' || eventType === 'weekend-trip') {
    return [5, 10, 15, 20, 30, 40, 50];
  }
  return [10, 20, 30, 50, 75, 100, 150, 200];
}

export function getGuestStep(value: number): number {
  return value >= 100 ? 10 : 5;
}

export function calculateQuizResults(state: QuizState): QuizResults {
  const eventType = state.eventType || 'other';
  const vibe = state.drinkingVibe || 'social';
  const duration = state.duration || '4-5';
  const guests = state.guestCount || 20;
  const isPremium = state.packageTier === 'premium';

  const rate = DRINKS_PER_HOUR[eventType][vibe];
  const hours = DURATION_HOURS[duration];
  const totalDrinks = Math.ceil(guests * hours * rate);

  // Reduce drinks based on cocktail/wine selections
  const hasCocktails = state.drinkCategories.includes('cocktail-kits');
  const hasWine = state.drinkCategories.includes('wine') || state.drinkCategories.includes('champagne');
  let reductionFactor = 1.0;
  if (hasCocktails && hasWine) reductionFactor = 0.65;
  else if (hasCocktails) reductionFactor = 0.75;
  else if (hasWine) reductionFactor = 0.85;

  const adjustedDrinks = Math.ceil(totalDrinks * reductionFactor);
  const premiumMultiplier = isPremium ? 1.25 : 1.0;

  const recommendations: ProductRecommendation[] = [];

  // Beer recommendations
  if (state.drinkCategories.includes('beer')) {
    const beerDrinks = calculateCategoryDrinks(adjustedDrinks, state.drinkCategories);
    const beerTotal = Math.ceil(beerDrinks * premiumMultiplier);

    // Split between two beer brands
    const millerQty = roundToPackSize(Math.ceil(beerTotal * 0.5), 24);
    const modeloQty = roundToPackSize(Math.ceil(beerTotal * 0.5), 24);

    recommendations.push({
      name: 'Miller Lite 24pk',
      searchQuery: 'Miller Lite 24',
      quantity: millerQty / 24,
      unit: '24-pack',
      category: 'beer',
      premiumAlternative: isPremium ? undefined : { name: 'Austin Beerworks', searchQuery: 'Austin Beerworks' },
    });
    recommendations.push({
      name: 'Modelo 24pk',
      searchQuery: 'Modelo Especial 24',
      quantity: modeloQty / 24,
      unit: '24-pack',
      category: 'beer',
    });
  }

  // Seltzers
  if (state.drinkCategories.includes('seltzers')) {
    const seltzerDrinks = calculateCategoryDrinks(adjustedDrinks, state.drinkCategories);
    const seltzerTotal = Math.ceil(seltzerDrinks * premiumMultiplier);

    const highNoonQty = roundToPackSize(Math.ceil(seltzerTotal * 0.4), 12);
    const ranchWaterQty = roundToPackSize(Math.ceil(seltzerTotal * 0.3), 12);
    const whiteClawQty = roundToPackSize(Math.ceil(seltzerTotal * 0.3), 12);

    recommendations.push({
      name: 'High Noon Variety',
      searchQuery: 'High Noon',
      quantity: highNoonQty / 12,
      unit: '12-pack',
      category: 'seltzers',
    });
    recommendations.push({
      name: 'Ranch Water',
      searchQuery: 'Ranch Water',
      quantity: ranchWaterQty / 12,
      unit: '12-pack',
      category: 'seltzers',
    });
    recommendations.push({
      name: 'White Claw Variety',
      searchQuery: 'White Claw',
      quantity: whiteClawQty / 12,
      unit: '12-pack',
      category: 'seltzers',
    });
  }

  // Wine
  if (state.drinkCategories.includes('wine')) {
    const wineServings = Math.ceil(guests * 0.3 * premiumMultiplier);
    const bottles = Math.ceil(wineServings / 5); // 5 glasses per bottle
    const half = Math.ceil(bottles / 2);

    recommendations.push({
      name: 'Dark Horse Pinot Grigio',
      searchQuery: 'Dark Horse Pinot Grigio',
      quantity: half,
      unit: 'bottle',
      category: 'wine',
    });
    recommendations.push({
      name: 'Jam Cellars Chardonnay',
      searchQuery: 'Jam Cellars',
      quantity: bottles - half,
      unit: 'bottle',
      category: 'wine',
    });
  }

  // Champagne
  if (state.drinkCategories.includes('champagne')) {
    const champServings = Math.ceil(guests * 0.25 * premiumMultiplier);
    const bottles = Math.ceil(champServings / 5);
    const half = Math.ceil(bottles / 2);

    recommendations.push({
      name: 'La Marca Prosecco',
      searchQuery: 'La Marca',
      quantity: half,
      unit: 'bottle',
      category: 'champagne',
    });
    recommendations.push({
      name: 'Wycliff Brut Rose',
      searchQuery: 'Wycliff',
      quantity: bottles - half,
      unit: 'bottle',
      category: 'champagne',
    });
  }

  // Cocktail kits
  if (state.drinkCategories.includes('cocktail-kits')) {
    const cocktailKits = getCocktailRecommendations(state, isPremium);
    recommendations.push(...cocktailKits);
  }

  // Ice
  const iceBags = Math.ceil(guests / 4 * premiumMultiplier);
  recommendations.push({
    name: 'Ice Bags',
    searchQuery: 'ice bag',
    quantity: iceBags,
    unit: 'bag',
    category: 'ice',
  });

  // NA/Water extras
  if (state.extras.includes('na-water')) {
    const waterPacks = Math.ceil(guests / 12);
    recommendations.push({
      name: 'Topo Chico Mineral Water',
      searchQuery: 'Topo Chico Mineral',
      quantity: waterPacks,
      unit: '12-pack',
      category: 'extras',
    });
  }

  return {
    recommendations: recommendations.filter(r => r.quantity > 0),
    totalDrinks,
    summary: {
      eventType: EVENT_TYPE_LABELS[eventType],
      guestCount: guests,
      duration: DURATION_LABELS[duration],
      vibe: VIBE_LABELS[vibe].label,
    },
  };
}

function calculateCategoryDrinks(
  totalDrinks: number,
  categories: DrinkCategory[]
): number {
  // Only count beer/seltzer categories for the main drink split
  const mainCategories = categories.filter(c => c === 'beer' || c === 'seltzers');
  if (mainCategories.length === 0) return 0;
  return totalDrinks / mainCategories.length;
}

function roundToPackSize(qty: number, packSize: number): number {
  return Math.max(packSize, Math.ceil(qty / packSize) * packSize);
}

function getCocktailRecommendations(
  state: QuizState,
  isPremium: boolean
): ProductRecommendation[] {
  const kits: ProductRecommendation[] = [];
  const guests = state.guestCount || 20;
  const qtyPerKit = Math.max(1, Math.ceil(guests / 15 * (isPremium ? 1.25 : 1)));

  // Default cocktails based on event type if none selected
  const cocktails = state.selectedCocktails.length > 0
    ? state.selectedCocktails
    : getDefaultCocktails(state.eventType);

  for (const cocktail of cocktails) {
    const mapping = COCKTAIL_SEARCH_MAP[cocktail];
    if (mapping) {
      kits.push({
        name: mapping.name,
        searchQuery: mapping.searchQuery,
        quantity: qtyPerKit,
        unit: 'kit',
        category: 'cocktail-kits',
      });
    }
  }

  return kits;
}

const COCKTAIL_SEARCH_MAP: Record<string, { name: string; searchQuery: string }> = {
  'austin-rita': { name: 'The Classic Austin Rita', searchQuery: 'Austin Rita' },
  'titos-lemonade': { name: "Tito's Lemonade Kit", searchQuery: "Tito's Lemonade" },
  'rum-punch': { name: 'Rum Punch Kit', searchQuery: 'Rum Punch' },
  'old-fashioned': { name: 'The Hill Country Old-Fashioned', searchQuery: 'Old-Fashioned' },
  'aperol-spritz': { name: 'Aperol Spritz Kit', searchQuery: 'Aperol Spritz' },
  'espresso-martini': { name: 'Espresso Martini Kit', searchQuery: 'Espresso Martini' },
  'margarita': { name: 'Margarita Kit', searchQuery: 'Margarita' },
};

function getDefaultCocktails(eventType: EventType | null): string[] {
  switch (eventType) {
    case 'bachelor':
    case 'boat-day':
      return ['austin-rita', 'old-fashioned'];
    case 'bachelorette':
      return ['aperol-spritz', 'espresso-martini'];
    case 'wedding':
      return ['austin-rita', 'aperol-spritz'];
    case 'corporate':
      return ['old-fashioned', 'austin-rita'];
    default:
      return ['austin-rita', 'titos-lemonade'];
  }
}

export const COCKTAIL_OPTIONS = [
  { id: 'austin-rita', name: 'The Classic Austin Rita', description: 'Tequila, lime, agave' },
  { id: 'titos-lemonade', name: "Tito's Lemonade", description: "Tito's vodka, fresh lemonade" },
  { id: 'rum-punch', name: 'Rum Punch', description: 'Tropical rum punch' },
  { id: 'old-fashioned', name: 'The Hill Country Old-Fashioned', description: 'Bourbon, bitters, sugar' },
  { id: 'aperol-spritz', name: 'Aperol Spritz', description: 'Aperol, prosecco, soda' },
  { id: 'espresso-martini', name: 'Espresso Martini', description: 'Vodka, espresso, coffee liqueur' },
];

export const initialQuizState: QuizState = {
  currentStep: 'welcome',
  eventType: null,
  guestCount: 20,
  drinkingVibe: null,
  duration: null,
  drinkCategories: [],
  selectedCocktails: [],
  extras: [],
  bartender: null,
  eventTiming: null,
  deliveryArea: null,
  skipped: false,
  completed: false,
  packageTier: 'standard',
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_EVENT_TYPE': {
      const newState = { ...state, eventType: action.payload };
      // Auto-select no-glass for boat day
      if (action.payload === 'boat-day' && !state.extras.includes('no-glass')) {
        newState.extras = [...state.extras, 'no-glass'];
      }
      // Adjust guest count if out of range
      const range = getGuestRange(action.payload);
      if (newState.guestCount < range.min) newState.guestCount = range.min;
      if (newState.guestCount > range.max) newState.guestCount = range.max;
      return newState;
    }
    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.payload };
    case 'SET_DRINKING_VIBE':
      return { ...state, drinkingVibe: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_DRINK_CATEGORIES':
      return { ...state, drinkCategories: action.payload };
    case 'TOGGLE_DRINK_CATEGORY': {
      const categories = state.drinkCategories.includes(action.payload)
        ? state.drinkCategories.filter(c => c !== action.payload)
        : [...state.drinkCategories, action.payload];
      return { ...state, drinkCategories: categories };
    }
    case 'SET_SELECTED_COCKTAILS':
      return { ...state, selectedCocktails: action.payload };
    case 'SET_EXTRAS':
      return { ...state, extras: action.payload };
    case 'TOGGLE_EXTRA': {
      const extras = state.extras.includes(action.payload)
        ? state.extras.filter(e => e !== action.payload)
        : [...state.extras, action.payload];
      return { ...state, extras: extras };
    }
    case 'SET_BARTENDER':
      return { ...state, bartender: action.payload };
    case 'SET_EVENT_TIMING':
      return { ...state, eventTiming: action.payload };
    case 'SET_DELIVERY_AREA':
      return { ...state, deliveryArea: action.payload };
    case 'SET_PACKAGE_TIER':
      return { ...state, packageTier: action.payload };
    case 'NEXT_STEP': {
      const next = getNextStep(state);
      return next ? { ...state, currentStep: next } : state;
    }
    case 'PREV_STEP': {
      const prev = getPrevStep(state);
      return prev ? { ...state, currentStep: prev } : state;
    }
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'SKIP_QUIZ':
      return { ...state, skipped: true };
    case 'RESET':
      return { ...initialQuizState };
    default:
      return state;
  }
}

