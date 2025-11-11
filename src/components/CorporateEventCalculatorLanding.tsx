'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type DrinkingLevel = 'light' | 'normal' | 'heavy';

interface CalculatorResults {
  totalDrinks: number;
  beerCans: number;
  wineBottles: number;
  spiritsBottles: number;
  mixers: number;
  iceLbs: number;
  naDrinks: number;
}

interface CorporateEventCalculatorLandingProps {
  onAddToQuote?: (results: string) => void;
  onScheduleCall?: () => void;
}

export default function CorporateEventCalculatorLanding({
  onAddToQuote,
  onScheduleCall
}: CorporateEventCalculatorLandingProps) {
  const [guests, setGuests] = useState<number>(100);
  const [hours, setHours] = useState<number>(3);
  const [drinkingLevel, setDrinkingLevel] = useState<DrinkingLevel>('normal');

  // Percentages that must add up to 100
  const [beerPercent, setBeerPercent] = useState<number>(40);
  const [winePercent, setWinePercent] = useState<number>(40);
  const [spiritsPercent, setSpiritsPercent] = useState<number>(20);

  const [includeNA, setIncludeNA] = useState<boolean>(false);
  const [includeIce, setIncludeIce] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Calculate total drinks based on drinking level
  const getDrinksMultiplier = (): number => {
    switch (drinkingLevel) {
      case 'light': return 0.8;
      case 'normal': return 1.0;
      case 'heavy': return 1.25;
      default: return 1.0;
    }
  };

  const calculateResults = (): CalculatorResults => {
    if (guests <= 0 || hours <= 0) {
      return { totalDrinks: 0, beerCans: 0, wineBottles: 0, spiritsBottles: 0, mixers: 0, iceLbs: 0, naDrinks: 0 };
    }

    // Base calculation: 1 drink per guest per hour
    const baseDrinks = guests * hours;
    const totalDrinks = Math.ceil(baseDrinks * getDrinksMultiplier());

    // Calculate each category
    const beerDrinks = totalDrinks * (beerPercent / 100);
    const wineDrinks = totalDrinks * (winePercent / 100);
    const spiritsDrinks = totalDrinks * (spiritsPercent / 100);

    // Convert to packages
    const beerCans = Math.ceil(beerDrinks); // 12oz cans = 1 drink each
    const wineBottles = Math.ceil(wineDrinks / 5); // 750mL = 5 drinks
    const spiritsBottles = Math.ceil(spiritsDrinks / 17); // 750mL = 17 drinks (1.5oz pours)
    const mixers = spiritsBottles * 3; // 3 mixers per spirits bottle

    // Calculate ice
    let iceLbs = 0;
    if (includeIce) {
      if (hours >= 5) {
        iceLbs = Math.max(20, Math.ceil(guests * 2.0));
      } else {
        iceLbs = Math.max(20, Math.ceil(guests * 1.5));
      }
    }

    // Calculate NA drinks
    const naDrinks = includeNA ? guests * 2 : 0;

    return {
      totalDrinks,
      beerCans,
      wineBottles,
      spiritsBottles,
      mixers,
      iceLbs,
      naDrinks
    };
  };

  const results = calculateResults();

  // Handle percentage slider changes
  const handleBeerChange = (value: number) => {
    const newBeer = Math.max(0, Math.min(100, value));
    const remaining = 100 - newBeer;
    const ratio = winePercent / (winePercent + spiritsPercent) || 0.5;
    setBeerPercent(newBeer);
    setWinePercent(Math.round(remaining * ratio));
    setSpiritsPercent(remaining - Math.round(remaining * ratio));
  };

  const handleWineChange = (value: number) => {
    const newWine = Math.max(0, Math.min(100, value));
    const remaining = 100 - newWine;
    const ratio = beerPercent / (beerPercent + spiritsPercent) || 0.5;
    setWinePercent(newWine);
    setBeerPercent(Math.round(remaining * ratio));
    setSpiritsPercent(remaining - Math.round(remaining * ratio));
  };

  const handleSpiritsChange = (value: number) => {
    const newSpirits = Math.max(0, Math.min(100, value));
    const remaining = 100 - newSpirits;
    const ratio = beerPercent / (beerPercent + winePercent) || 0.5;
    setSpiritsPercent(newSpirits);
    setBeerPercent(Math.round(remaining * ratio));
    setWinePercent(remaining - Math.round(remaining * ratio));
  };

  const formatResultsForQuote = (): string => {
    return `Corporate Event Calculator Results:
- Guests: ${guests}
- Duration: ${hours} hours
- Drinking Level: ${drinkingLevel.charAt(0).toUpperCase() + drinkingLevel.slice(1)}

Estimated Quantities:
- Beer: ${results.beerCans} cans (${beerPercent}%)
- Wine: ${results.wineBottles} bottles (${winePercent}%)
- Spirits: ${results.spiritsBottles} bottles (${spiritsPercent}%)
- Mixers: ${results.mixers} units${includeNA ? `\n- Non-Alcoholic: ${results.naDrinks} drinks` : ''}${includeIce ? `\n- Ice: ${results.iceLbs} lbs` : ''}

Total estimated drinks: ${results.totalDrinks}`;
  };

  const handleAddToQuote = () => {
    if (onAddToQuote) {
      onAddToQuote(formatResultsForQuote());
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <h3 className="font-serif text-2xl md:text-3xl text-gray-900 mb-2 tracking-[0.1em]">
          Corporate Drink Calculator
        </h3>
        <p className="text-gray-600">
          Get accurate estimates for your company event
        </p>
      </div>

      {/* Basic Inputs */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests
          </label>
          <input
            type="number"
            id="guests"
            min="20"
            max="500"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
            Event Duration (hours)
          </label>
          <input
            type="number"
            id="hours"
            min="1"
            max="8"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Drinking Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Expected Drinking Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'normal', 'heavy'] as DrinkingLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setDrinkingLevel(level)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                drinkingLevel === level
                  ? 'bg-gold-500 text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Drink Mix Percentages */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Drink Mix Preferences
          </label>
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-gold-600 hover:text-gold-700 text-sm"
          >
            ℹ️ Info
          </button>
        </div>

        {showTooltip && (
          <div className="mb-4 p-3 bg-white border border-gray-200 rounded text-sm text-gray-600">
            <strong>Calculator Assumptions:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Beer: 12oz cans = 1 drink each</li>
              <li>• Wine: 750mL bottle = 5 drinks</li>
              <li>• Spirits: 750mL bottle = 17 drinks (1.5oz pours)</li>
              <li>• Mixers: 3 units per spirits bottle</li>
              <li>• Ice: 1.5-2.0 lbs per guest (based on duration)</li>
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Beer</span>
              <span className="font-medium text-gray-900">{beerPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={beerPercent}
              onChange={(e) => handleBeerChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gold"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Wine</span>
              <span className="font-medium text-gray-900">{winePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={winePercent}
              onChange={(e) => handleWineChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gold"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Spirits</span>
              <span className="font-medium text-gray-900">{spiritsPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={spiritsPercent}
              onChange={(e) => handleSpiritsChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gold"
            />
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNA}
            onChange={(e) => setIncludeNA(e.target.checked)}
            className="w-5 h-5 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
          />
          <span className="text-gray-700">Include non-alcoholic options (2 per guest)</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeIce}
            onChange={(e) => setIncludeIce(e.target.checked)}
            className="w-5 h-5 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
          />
          <span className="text-gray-700">Include ice</span>
        </label>
      </div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-gray-200 pt-6"
      >
        <h4 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">
          Estimated Quantities
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gold-600">{results.beerCans}</div>
            <div className="text-sm text-gray-600">Beer Cans</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gold-600">{results.wineBottles}</div>
            <div className="text-sm text-gray-600">Wine Bottles</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gold-600">{results.spiritsBottles}</div>
            <div className="text-sm text-gray-600">Spirit Bottles</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gold-600">{results.mixers}</div>
            <div className="text-sm text-gray-600">Mixers</div>
          </div>

          {includeIce && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gold-600">{results.iceLbs}</div>
              <div className="text-sm text-gray-600">Lbs of Ice</div>
            </div>
          )}

          {includeNA && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gold-600">{results.naDrinks}</div>
              <div className="text-sm text-gray-600">NA Drinks</div>
            </div>
          )}
        </div>

        <div className="mb-6 p-4 bg-gold-50 border border-gold-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-gold-600">ℹ️</span>
            <p className="text-sm text-gray-700">
              <strong>Total estimated drinks: {results.totalDrinks}</strong>
              <br />
              These are estimates only. We&apos;ll finalize exact quantities after a quick consultation call.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddToQuote}
            className="flex-1 bg-gold-500 text-gray-900 px-6 py-3 rounded-md hover:bg-gold-600 transition-colors font-medium tracking-[0.05em]"
          >
            Add to Quote Request
          </button>
          <button
            onClick={onScheduleCall}
            className="flex-1 bg-white text-gold-600 px-6 py-3 rounded-md border-2 border-gold-500 hover:bg-gold-50 transition-colors font-medium tracking-[0.05em]"
          >
            Schedule a Call
          </button>
        </div>
      </motion.div>

      <style jsx>{`
        .slider-gold::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #D4AF37;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider-gold::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #D4AF37;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}
