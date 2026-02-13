'use client';

import { useState, useMemo, useCallback, useEffect, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';

// ============================================
// Types
// ============================================

type DrinkingLevel = 'light' | 'average' | 'heavy';
type PartyType = 'bachelor' | 'bachelorette' | 'other';
type DrinkPreference = 'mostly_beer' | 'mostly_seltzers' | 'good_mix';
type Stage = 'calculate' | 'preferences' | 'results';

interface ProductRecommendation {
  name: string;
  quantity: number;
  unit: string;
  imageUrl?: string;
  productTitle?: string;
}

// ============================================
// Constants
// ============================================

const DRINKS_PER_HOUR: Record<PartyType, Record<DrinkingLevel, number>> = {
  bachelor: { light: 1.5, average: 2.0, heavy: 2.5 },
  bachelorette: { light: 1.25, average: 1.75, heavy: 2.0 },
  other: { light: 1.5, average: 2.0, heavy: 2.5 }, // Use bachelor rates as default
};

// Use bachelor rates as default for stage 1 (higher = safer to overestimate)
const DEFAULT_DRINKS_PER_HOUR: Record<DrinkingLevel, number> = DRINKS_PER_HOUR.bachelor;

// Search query overrides for products whose display name
// doesn't match well with a simple search
const SEARCH_OVERRIDES: Record<string, string> = {
  'Ice Bags': 'ice bag',
  // Beer
  'Miller Lite': 'Miller Lite 24',
  'Modelo Especial': 'Modelo Especial 24',
  'Austin Beerworks Variety': 'Austin Beerworks Variety Pack',
  // Seltzers
  'High Noon Variety': 'High Noon Variety 8',
  'Surfside Variety': 'Surfside Lemonade Variety',
  'White Claw Variety': 'White Claw Variety 24',
  // Cocktail kits
  'The Classic Austin Rita': 'Austin Rita',
  "Tito's Lemonade Party Pitcher Kit": 'Tito Lemonade Party Pitcher',
  'Rum Punch Gallon Dispenser Kit': 'Rum Punch Gallon',
  'The Hill Country Old-Fashioned': 'Hill Country Old-Fashioned',
  // Wine
  'Dark Horse Pinot Grigio': 'Dark Horse Pinot Grigio',
  'Jam Cellars Chardonnay': 'Jam Cellars Chardonnay',
  // Sparkling
  'Wycliff Brut Rose': 'Wycliff Brut Rose',
  'La Marca Prosecco': 'La Marca Prosecco Extra Dry 750ml Bottle',
  // Champagne
  'Andre Brut Champagne': 'Andre Brut',
  'Domaine Ste Michelle Brut': 'Domaine Ste Michelle',
};

// ============================================
// Calculation Logic
// ============================================

function calculateTotalDrinks(
  guests: number,
  hours: number,
  level: DrinkingLevel,
  partyType?: PartyType
): number {
  const rate = partyType
    ? DRINKS_PER_HOUR[partyType][level]
    : DEFAULT_DRINKS_PER_HOUR[level];
  return Math.ceil(guests * hours * rate);
}

function generateRecommendations(
  totalDrinks: number,
  partyType: PartyType,
  preference: DrinkPreference,
  wineTypes: string[],
  cocktailSpirits: string[],
  guestCount: number
): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];

  // Reduce total drinks if cocktail kits or wine/champagne are selected
  const hasCocktails = cocktailSpirits.length > 0;
  const hasWine = wineTypes.length > 0;
  let reductionFactor = 1;
  if (hasCocktails && hasWine) reductionFactor = 0.65;
  else if (hasCocktails) reductionFactor = 0.75;
  else if (hasWine) reductionFactor = 0.85;
  const adjustedDrinks = Math.ceil(totalDrinks * reductionFactor);

  // ----------------------------------------
  // MAIN DRINK RECOMMENDATIONS (beer/seltzers)
  // Works the same for all party types
  // ----------------------------------------
  if (preference === 'mostly_beer') {
    // 40% Miller Lite, 40% Modelo, 20% Austin Beerworks
    const millerLite = Math.ceil(adjustedDrinks * 0.4);
    const modelo = Math.ceil(adjustedDrinks * 0.4);
    const austinBeerworks = Math.ceil(adjustedDrinks * 0.2);

    recommendations.push({ name: 'Miller Lite', quantity: Math.ceil(millerLite / 24), unit: 'cases' });
    recommendations.push({ name: 'Modelo Especial', quantity: Math.ceil(modelo / 24), unit: 'cases' });
    recommendations.push({ name: 'Austin Beerworks Variety', quantity: Math.ceil(austinBeerworks / 12), unit: 'packs' });

    // Add seltzers for variety
    recommendations.push({ name: 'High Noon Variety', quantity: 1, unit: 'pack' });
    if (guestCount >= 8) {
      recommendations.push({ name: 'Surfside Variety', quantity: 1, unit: 'pack' });
    }
  } else if (preference === 'mostly_seltzers') {
    // Seltzers distributed across brands
    const perBrand = Math.ceil(adjustedDrinks / 3);
    const packs = Math.ceil(perBrand / 8);

    recommendations.push({ name: 'High Noon Variety', quantity: packs, unit: 'packs' });
    recommendations.push({ name: 'Surfside Variety', quantity: packs, unit: 'packs' });
    recommendations.push({ name: 'White Claw Variety', quantity: Math.ceil(perBrand / 24), unit: 'packs' });

    // Add some beer for variety
    recommendations.push({ name: 'Miller Lite', quantity: 1, unit: 'case' });
  } else {
    // Good mix: 50% beer, 50% seltzers
    const beerDrinks = Math.ceil(adjustedDrinks * 0.5);
    const seltzerDrinks = Math.ceil(adjustedDrinks * 0.5);

    // Beer split
    const millerLite = Math.ceil(beerDrinks * 0.4);
    const modelo = Math.ceil(beerDrinks * 0.4);
    const austinBeerworks = Math.ceil(beerDrinks * 0.2);

    recommendations.push({ name: 'Miller Lite', quantity: Math.ceil(millerLite / 24), unit: 'cases' });
    recommendations.push({ name: 'Modelo Especial', quantity: Math.ceil(modelo / 24), unit: 'cases' });
    recommendations.push({ name: 'Austin Beerworks Variety', quantity: Math.ceil(austinBeerworks / 12), unit: 'packs' });

    // Seltzer split
    const perBrand = Math.ceil(seltzerDrinks / 3);
    recommendations.push({ name: 'High Noon Variety', quantity: Math.ceil(perBrand / 8), unit: 'packs' });
    recommendations.push({ name: 'Surfside Variety', quantity: Math.ceil(perBrand / 8), unit: 'packs' });
    recommendations.push({ name: 'White Claw Variety', quantity: Math.ceil(perBrand / 24), unit: 'packs' });
  }

  // ----------------------------------------
  // COCKTAIL KITS (1 kit per spirit selected)
  // ----------------------------------------
  if (cocktailSpirits.includes('tequila')) {
    recommendations.push({ name: 'The Classic Austin Rita', quantity: 1, unit: 'kit' });
  }
  if (cocktailSpirits.includes('vodka')) {
    recommendations.push({ name: "Tito's Lemonade Party Pitcher Kit", quantity: 1, unit: 'kit' });
  }
  if (cocktailSpirits.includes('rum')) {
    recommendations.push({ name: 'Rum Punch Gallon Dispenser Kit', quantity: 1, unit: 'kit' });
  }
  if (cocktailSpirits.includes('whiskey')) {
    recommendations.push({ name: 'The Hill Country Old-Fashioned', quantity: 1, unit: 'kit' });
  }
  // Gin: not yet mapped to a product

  // ----------------------------------------
  // WINE & CHAMPAGNE (2 bottles per type for variety)
  // ----------------------------------------
  if (wineTypes.includes('white')) {
    recommendations.push({ name: 'Dark Horse Pinot Grigio', quantity: 1, unit: 'bottle' });
    recommendations.push({ name: 'Jam Cellars Chardonnay', quantity: 1, unit: 'bottle' });
  }
  if (wineTypes.includes('sparkling')) {
    recommendations.push({ name: 'Wycliff Brut Rose', quantity: 1, unit: 'bottle' });
    recommendations.push({ name: 'La Marca Prosecco', quantity: 1, unit: 'bottle' });
  }
  if (wineTypes.includes('champagne')) {
    recommendations.push({ name: 'Andre Brut Champagne', quantity: 1, unit: 'bottle' });
    recommendations.push({ name: 'Domaine Ste Michelle Brut', quantity: 1, unit: 'bottle' });
  }

  // ----------------------------------------
  // ICE: 1 bag per 4 guests
  // ----------------------------------------
  const iceBags = Math.ceil(guestCount / 4);
  recommendations.push({ name: 'Ice Bags', quantity: iceBags, unit: 'bags' });

  // Filter out zero quantities
  return recommendations.filter(r => r.quantity > 0);
}

// ============================================
// Sub-components
// ============================================

function DrinkingLevelButton({
  level,
  selected,
  onClick,
}: {
  level: DrinkingLevel;
  selected: boolean;
  onClick: () => void;
}): ReactElement {
  const labels: Record<DrinkingLevel, string> = {
    light: 'Light',
    average: 'Average',
    heavy: 'Heavy',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-base ${
        selected
          ? 'bg-yellow-500 text-gray-900'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {labels[level]}
    </button>
  );
}

function PartyTypeButton({
  type,
  selected,
  onClick,
}: {
  type: PartyType;
  selected: boolean;
  onClick: () => void;
}): ReactElement {
  const config: Record<PartyType, { label: string; accent: string }> = {
    bachelor: { label: 'Bachelor', accent: 'blue' },
    bachelorette: { label: 'Bachelorette', accent: 'pink' },
    other: { label: 'Other', accent: 'gold' },
  };

  const { label, accent } = config[type];

  const getSelectedClasses = () => {
    if (accent === 'blue') return 'bg-blue-600 border-blue-500 text-white';
    if (accent === 'pink') return 'bg-pink-600 border-pink-500 text-white';
    return 'bg-yellow-500 border-brand-yellow text-gray-900';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all border-2 text-base ${
        selected
          ? getSelectedClasses()
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );
}

function PreferenceOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 px-4 rounded-lg font-medium transition-all text-left text-base ${
        selected
          ? 'bg-yellow-500 text-gray-900'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

function ProductCard({ product }: { product: ProductRecommendation }): ReactElement {
  return (
    <div className="bg-white rounded-lg p-3 text-center border border-gray-100 shadow-sm flex flex-col items-center gap-1">
      {product.imageUrl && (
        <div className="w-16 h-16 md:w-20 md:h-20 relative flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={product.productTitle ?? product.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <p className="text-2xl font-bold text-gray-900">{product.quantity}</p>
      <p className="text-xs text-gray-600 leading-tight">{product.productTitle ?? product.name}</p>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function DrinkCalculator(): ReactElement {
  // Stage 1 state
  const [guestCount, setGuestCount] = useState(12);
  const [hours, setHours] = useState(4);
  const [drinkingLevel, setDrinkingLevel] = useState<DrinkingLevel>('average');

  // Stage 2 state
  const [partyType, setPartyType] = useState<PartyType>('bachelor');
  const [drinkPreference, setDrinkPreference] = useState<DrinkPreference>('good_mix');
  const [addCocktailKits, setAddCocktailKits] = useState(false);
  const [cocktailSpirits, setCocktailSpirits] = useState<string[]>([]);
  const [addWineChampagne, setAddWineChampagne] = useState(false);
  const [wineTypes, setWineTypes] = useState<string[]>([]);

  // Cart state
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState('');
  const [unresolvedItems, setUnresolvedItems] = useState<string[]>([]);

  // Flow state
  const [stage, setStage] = useState<Stage>('calculate');

  // Cart integration
  const { addToCart, openCart } = useCartContext();

  // Calculate total drinks
  const totalDrinks = useMemo(
    () => calculateTotalDrinks(
      guestCount,
      hours,
      drinkingLevel,
      stage === 'calculate' ? undefined : partyType
    ),
    [guestCount, hours, drinkingLevel, partyType, stage]
  );

  // Generate recommendations
  const recommendations = useMemo(
    () => generateRecommendations(
      totalDrinks,
      partyType,
      drinkPreference,
      wineTypes,
      cocktailSpirits,
      guestCount
    ),
    [totalDrinks, partyType, drinkPreference, wineTypes, cocktailSpirits, guestCount]
  );

  // Enriched recommendations with product images
  const [enrichedRecs, setEnrichedRecs] = useState<ProductRecommendation[]>([]);

  useEffect(() => {
    if (stage !== 'results') return;

    let cancelled = false;

    async function enrichWithImages() {
      const enriched = await Promise.all(
        recommendations.map(async (rec) => {
          const searchQuery = SEARCH_OVERRIDES[rec.name] ?? rec.name;
          try {
            const res = await fetch(
              `/api/v1/products/search?q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            if (!res.ok) return rec;
            const { success, data } = await res.json();
            if (!success || !data?.length) return rec;
            const product = data[0];
            return {
              ...rec,
              imageUrl: product.images?.[0]?.url ?? undefined,
              productTitle: product.title,
            };
          } catch {
            return rec;
          }
        })
      );
      if (!cancelled) setEnrichedRecs(enriched);
    }

    enrichWithImages();
    return () => { cancelled = true; };
  }, [stage, recommendations]);

  // Use enriched recs for display, fall back to raw recs
  const displayRecs = stage === 'results' && enrichedRecs.length > 0
    ? enrichedRecs
    : recommendations;

  // Drink preference options (same for all party types)
  const preferenceOptions = [
    { value: 'mostly_beer', label: 'Mostly Beer' },
    { value: 'mostly_seltzers', label: 'Mostly Seltzers' },
    { value: 'good_mix', label: 'Good Mix' },
  ];

  // Handle party type change
  const handlePartyTypeChange = (type: PartyType) => {
    setPartyType(type);
  };

  // Handle adding all recommendations to cart
  const handleAddAllToCart = useCallback(async () => {
    setIsAddingToCart(true);
    setCartError('');
    setCartSuccess(false);
    setUnresolvedItems([]);

    const unresolved: string[] = [];

    try {
      for (const rec of recommendations) {
        const searchQuery = SEARCH_OVERRIDES[rec.name] ?? rec.name;
        const res = await fetch(
          `/api/v1/products/search?q=${encodeURIComponent(searchQuery)}&limit=1`
        );

        if (!res.ok) {
          unresolved.push(rec.name);
          continue;
        }

        const { success, data } = await res.json();

        if (!success || !data?.length || !data[0].variants?.length) {
          unresolved.push(rec.name);
          continue;
        }

        const variantId = data[0].variants[0].id;
        await addToCart(variantId, rec.quantity);
      }

      setUnresolvedItems(unresolved);
      setCartSuccess(true);
      openCart();
    } catch {
      setCartError('Something went wrong adding items to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  }, [recommendations, addToCart, openCart]);

  return (
    <section id="drink-calculator" className="relative py-8 md:py-12 px-4 md:px-6 bg-gray-100 overflow-hidden">

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-2 tracking-wide">
            Drink Calculator and Recs
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Plan the perfect party bar. Get personalized recommendations.
          </p>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Stage 1: Basic Calculations */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="space-y-4">
              {/* Guest Count */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-2 text-center">
                  How many people?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <span className="w-12 text-center text-gray-900 font-semibold text-lg md:text-xl">
                    {guestCount}
                  </span>
                </div>
              </div>

              {/* Hours */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-2 text-center">
                  How long is your party?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <span className="w-16 text-center text-gray-900 font-semibold text-lg md:text-xl">
                    {hours} hrs
                  </span>
                </div>
              </div>

              {/* Drinking Level */}
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700 mb-2 text-center">
                  How hard does your crew drink?
                </label>
                <div className="flex gap-2">
                  {(['light', 'average', 'heavy'] as DrinkingLevel[]).map((level) => (
                    <DrinkingLevelButton
                      key={level}
                      level={level}
                      selected={drinkingLevel === level}
                      onClick={() => setDrinkingLevel(level)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Total Drinks Display */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-base">You&apos;ll need approximately</p>
              <p className="text-5xl md:text-6xl font-bold text-gray-900 my-2">{totalDrinks}</p>
              <p className="text-gray-600 text-base">drinks for your party</p>
            </div>

            {/* Stage 1 CTA - only on mobile when stage 2 not visible */}
            {stage === 'calculate' && (
              <div className="mt-4 lg:hidden">
                <button
                  type="button"
                  onClick={() => setStage('preferences')}
                  className="w-full px-6 py-4 bg-yellow-500 hover:bg-brand-yellow text-gray-900 font-semibold rounded-lg transition-colors text-lg"
                >
                  Get a recommendation →
                </button>
              </div>
            )}
          </div>

          {/* Stage 2: Preferences - Always visible on desktop, animated on mobile */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl p-4 md:p-6 h-full shadow-lg">
              <div className="space-y-4">
                {/* Party Type */}
                <div>
                  <label className="block text-base md:text-lg font-medium text-gray-700 mb-2 text-center">
                    What kind of party?
                  </label>
                  <div className="flex gap-2">
                    {(['bachelor', 'bachelorette', 'other'] as PartyType[]).map((type) => (
                      <PartyTypeButton
                        key={type}
                        type={type}
                        selected={partyType === type}
                        onClick={() => handlePartyTypeChange(type)}
                      />
                    ))}
                  </div>
                </div>

                {/* Drink Preference */}
                <div>
                  <label className="block text-base md:text-lg font-medium text-gray-700 mb-2 text-center">
                    Drink preference
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {preferenceOptions.map((option) => (
                      <PreferenceOption
                        key={option.value}
                        label={option.label}
                        selected={drinkPreference === option.value}
                        onClick={() => setDrinkPreference(option.value as DrinkPreference)}
                      />
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <label className="block text-base md:text-lg font-medium text-gray-700 mb-3 text-center">
                    Add-ons
                  </label>
                  <div className="space-y-3">
                    {/* Fresh Cocktail Kits Button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddCocktailKits(!addCocktailKits);
                          if (addCocktailKits) setCocktailSpirits([]);
                        }}
                        className={`w-full py-3.5 px-4 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 text-base ${
                          addCocktailKits
                            ? 'bg-yellow-500 border-brand-yellow text-gray-900'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-yellow-500'
                        }`}
                      >
                        <span>Fresh Cocktail Kits</span>
                        <span className={`transition-transform ${addCocktailKits ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      <AnimatePresence>
                        {addCocktailKits && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-3 mt-2 justify-center">
                              {['Tequila', 'Vodka', 'Rum', 'Gin', 'Whiskey'].map((spirit) => (
                                <label key={spirit} className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value={spirit.toLowerCase()}
                                    checked={cocktailSpirits.includes(spirit.toLowerCase())}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setCocktailSpirits([...cocktailSpirits, spirit.toLowerCase()]);
                                      } else {
                                        setCocktailSpirits(cocktailSpirits.filter(s => s !== spirit.toLowerCase()));
                                      }
                                    }}
                                    className="w-4 h-4 rounded text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500"
                                  />
                                  <span className="text-gray-700 text-sm">{spirit}</span>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Wine & Champagne Button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddWineChampagne(!addWineChampagne);
                          if (addWineChampagne) setWineTypes([]);
                        }}
                        className={`w-full py-3.5 px-4 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 text-base ${
                          addWineChampagne
                            ? 'bg-yellow-500 border-brand-yellow text-gray-900'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-yellow-500'
                        }`}
                      >
                        <span>Wine & Champagne</span>
                        <span className={`transition-transform ${addWineChampagne ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      <AnimatePresence>
                        {addWineChampagne && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-3 mt-2 justify-center">
                              {['White', 'Sparkling', 'Champagne'].map((type) => (
                                <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value={type.toLowerCase()}
                                    checked={wineTypes.includes(type.toLowerCase())}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setWineTypes([...wineTypes, type.toLowerCase()]);
                                      } else {
                                        setWineTypes(wineTypes.filter(t => t !== type.toLowerCase()));
                                      }
                                    }}
                                    className="w-4 h-4 rounded text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500"
                                  />
                                  <span className="text-gray-700 text-sm">{type}</span>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop CTA */}
              {stage !== 'results' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStage('results')}
                    className="w-full px-6 py-4 bg-yellow-500 hover:bg-brand-yellow text-gray-900 font-semibold rounded-lg transition-colors text-lg"
                  >
                    Get my recommendation →
                  </button>
                  <p className="text-gray-500 text-xs text-center mt-2">
                    You can add, edit, anything before checkout
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Stage 2: Preferences (animated reveal) */}
          <AnimatePresence>
            {(stage === 'preferences' || stage === 'results') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden bg-white rounded-xl p-4 overflow-hidden shadow-lg"
              >
                <div className="space-y-4">
                  {/* Party Type */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 text-center">
                      What kind of party?
                    </label>
                    <div className="flex gap-2">
                      {(['bachelor', 'bachelorette', 'other'] as PartyType[]).map((type) => (
                        <PartyTypeButton
                          key={type}
                          type={type}
                          selected={partyType === type}
                          onClick={() => handlePartyTypeChange(type)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Drink Preference */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2 text-center">
                      Drink preference
                    </label>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {preferenceOptions.map((option) => (
                        <PreferenceOption
                          key={option.value}
                          label={option.label}
                          selected={drinkPreference === option.value}
                          onClick={() => setDrinkPreference(option.value as DrinkPreference)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-3 text-center">
                      Add-ons
                    </label>
                    <div className="space-y-3">
                      {/* Fresh Cocktail Kits Button */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setAddCocktailKits(!addCocktailKits);
                            if (addCocktailKits) setCocktailSpirits([]);
                          }}
                          className={`w-full py-3.5 px-4 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 text-base ${
                            addCocktailKits
                              ? 'bg-yellow-500 border-brand-yellow text-gray-900'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-yellow-500'
                          }`}
                        >
                          <span>Fresh Cocktail Kits</span>
                          <span className={`transition-transform ${addCocktailKits ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        <AnimatePresence>
                          {addCocktailKits && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                                {['Tequila', 'Vodka', 'Rum', 'Gin', 'Whiskey'].map((spirit) => (
                                  <label key={spirit} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      value={spirit.toLowerCase()}
                                      checked={cocktailSpirits.includes(spirit.toLowerCase())}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setCocktailSpirits([...cocktailSpirits, spirit.toLowerCase()]);
                                        } else {
                                          setCocktailSpirits(cocktailSpirits.filter(s => s !== spirit.toLowerCase()));
                                        }
                                      }}
                                      className="w-4 h-4 rounded text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500"
                                    />
                                    <span className="text-gray-700 text-sm">{spirit}</span>
                                  </label>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Wine & Champagne Button */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setAddWineChampagne(!addWineChampagne);
                            if (addWineChampagne) setWineTypes([]);
                          }}
                          className={`w-full py-3.5 px-4 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 text-base ${
                            addWineChampagne
                              ? 'bg-yellow-500 border-brand-yellow text-gray-900'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-yellow-500'
                          }`}
                        >
                          <span>Wine & Champagne</span>
                          <span className={`transition-transform ${addWineChampagne ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        <AnimatePresence>
                          {addWineChampagne && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                                {['White', 'Sparkling', 'Champagne'].map((type) => (
                                  <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      value={type.toLowerCase()}
                                      checked={wineTypes.includes(type.toLowerCase())}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setWineTypes([...wineTypes, type.toLowerCase()]);
                                        } else {
                                          setWineTypes(wineTypes.filter(t => t !== type.toLowerCase()));
                                        }
                                      }}
                                      className="w-4 h-4 rounded text-yellow-500 bg-gray-100 border-gray-300 focus:ring-yellow-500"
                                    />
                                    <span className="text-gray-700 text-sm">{type}</span>
                                  </label>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Stage 2 CTA */}
                {stage === 'preferences' && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setStage('results')}
                      className="w-full px-6 py-4 bg-yellow-500 hover:bg-brand-yellow text-gray-900 font-semibold rounded-lg transition-colors text-lg"
                    >
                      Get my recommendation →
                    </button>
                    <p className="text-gray-500 text-xs text-center mt-2">
                      You can add, edit, anything before checkout
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <AnimatePresence>
          {stage === 'results' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-4"
            >
              <div className="bg-white rounded-xl p-4 md:p-6 mb-4 shadow-lg">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 text-center">
                  Your Personalized Recommendations
                </h3>
                <p className="text-gray-600 text-center text-base mb-4">
                  For {guestCount} guests over {hours} hours
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {displayRecs.map((product, index) => (
                    <ProductCard key={`${product.name}-${index}`} product={product} />
                  ))}
                </div>
              </div>

              {/* Add All to Cart CTA */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  disabled={isAddingToCart || cartSuccess}
                  className={`px-8 py-4 font-semibold rounded-lg transition-colors text-lg ${
                    cartSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-brand-yellow hover:bg-yellow-400 text-gray-900 disabled:opacity-60'
                  }`}
                >
                  {isAddingToCart
                    ? `Adding ${recommendations.length} items...`
                    : cartSuccess
                      ? 'Items added to your cart!'
                      : 'Add All to Cart'}
                </button>

                {cartError && (
                  <p className="text-red-500 text-sm mt-2">{cartError}</p>
                )}

                {unresolvedItems.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {unresolvedItems.map((item) => (
                      <p key={item} className="text-amber-600 text-sm">
                        {item} couldn&apos;t be added — browse the shop to find it
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-600 mt-2">
                  Estimates are approximate. When in doubt, order extra!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
