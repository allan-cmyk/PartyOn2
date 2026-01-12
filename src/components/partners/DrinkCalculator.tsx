'use client';

import { useState, useMemo, type ReactElement } from 'react';
import type { DrinkCalculatorResult } from '@/lib/partners/types';

/**
 * Calculate recommended drink quantities based on event parameters
 */
function calculateDrinks(
  guestCount: number,
  eventDuration: number,
  beerPercent: number,
  winePercent: number,
  cocktailPercent: number
): DrinkCalculatorResult {
  // Average drinks per person per hour
  const drinksPerPersonPerHour = 2;
  const totalDrinks = guestCount * eventDuration * drinksPerPersonPerHour;

  // Calculate drinks by type
  const beerDrinks = Math.ceil((totalDrinks * beerPercent) / 100);
  const wineDrinks = Math.ceil((totalDrinks * winePercent) / 100);
  const cocktailDrinks = Math.ceil((totalDrinks * cocktailPercent) / 100);

  // Beer: 12oz per can, 24 per case
  const beerCans = beerDrinks;
  const beerCases = Math.ceil(beerCans / 24);

  // Wine: ~5 glasses per bottle
  const wineBottles = Math.ceil(wineDrinks / 5);

  // Cocktails: ~1.5oz liquor per drink, 750ml bottle = 17 drinks
  const liquorBottles = Math.ceil(cocktailDrinks / 17);

  // Mixers: roughly 1 bottle per 6-8 cocktails
  const mixerBottles = Math.ceil(cocktailDrinks / 7);

  // Ice: 1 bag per 5-6 guests
  const iceBags = Math.ceil(guestCount / 5);

  return {
    beer: { cans: beerCans, cases: beerCases },
    wine: { bottles: wineBottles },
    liquor: { bottles: liquorBottles },
    mixers: { bottles: mixerBottles },
    ice: { bags: iceBags },
  };
}

/**
 * Result card component for displaying calculated quantities
 */
function ResultCard({
  icon,
  label,
  value,
  subvalue,
}: {
  icon: ReactElement;
  label: string;
  value: string;
  subvalue?: string;
}): ReactElement {
  return (
    <div className="bg-white rounded-lg p-4 text-center border border-gray-100 shadow-sm">
      <div className="w-10 h-10 mx-auto mb-2 text-gold-600">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
      {subvalue && <p className="text-xs text-gray-400 mt-1">{subvalue}</p>}
    </div>
  );
}

/**
 * Drink calculator widget for partner pages
 * Helps guests estimate how much alcohol they need for their event
 */
export default function DrinkCalculator(): ReactElement {
  const [guestCount, setGuestCount] = useState(20);
  const [eventDuration, setEventDuration] = useState(4);
  const [beerPercent, setBeerPercent] = useState(40);
  const [winePercent, setWinePercent] = useState(30);
  const [cocktailPercent, setCocktailPercent] = useState(30);

  const results = useMemo(
    () =>
      calculateDrinks(
        guestCount,
        eventDuration,
        beerPercent,
        winePercent,
        cocktailPercent
      ),
    [guestCount, eventDuration, beerPercent, winePercent, cocktailPercent]
  );

  // Ensure percentages add up to 100
  const adjustPercentage = (
    setter: (v: number) => void,
    value: number,
    others: number[]
  ) => {
    const otherSum = others.reduce((a, b) => a + b, 0);
    const maxValue = 100 - otherSum;
    setter(Math.min(Math.max(0, value), maxValue));
  };

  return (
    <section id="drink-calculator" className="py-16 px-6 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 tracking-wide">
            Drink Calculator
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Estimate how much you need for your party. Adjust the sliders to match
            your crowd.
          </p>
        </div>

        {/* Calculator Inputs */}
        <div className="bg-gray-800 rounded-xl p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Guest Count */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Guests
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
                <span className="w-12 text-center text-white font-semibold">
                  {guestCount}
                </span>
              </div>
            </div>

            {/* Event Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Duration (hours)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={eventDuration}
                  onChange={(e) => setEventDuration(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
                <span className="w-12 text-center text-white font-semibold">
                  {eventDuration}h
                </span>
              </div>
            </div>
          </div>

          {/* Drink Type Percentages */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-300 mb-3">
              Drink Preferences
            </p>

            {/* Beer */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-gray-400">Beer</span>
              <input
                type="range"
                min="0"
                max="100"
                value={beerPercent}
                onChange={(e) =>
                  adjustPercentage(setBeerPercent, Number(e.target.value), [
                    winePercent,
                    cocktailPercent,
                  ])
                }
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="w-12 text-center text-white">{beerPercent}%</span>
            </div>

            {/* Wine */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-gray-400">Wine</span>
              <input
                type="range"
                min="0"
                max="100"
                value={winePercent}
                onChange={(e) =>
                  adjustPercentage(setWinePercent, Number(e.target.value), [
                    beerPercent,
                    cocktailPercent,
                  ])
                }
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="w-12 text-center text-white">{winePercent}%</span>
            </div>

            {/* Cocktails */}
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm text-gray-400">Cocktails</span>
              <input
                type="range"
                min="0"
                max="100"
                value={cocktailPercent}
                onChange={(e) =>
                  adjustPercentage(setCocktailPercent, Number(e.target.value), [
                    beerPercent,
                    winePercent,
                  ])
                }
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
              />
              <span className="w-12 text-center text-white">
                {cocktailPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ResultCard
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
            label="Beer Cases"
            value={String(results.beer.cases)}
            subvalue={`${results.beer.cans} cans`}
          />
          <ResultCard
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            label="Wine Bottles"
            value={String(results.wine.bottles)}
          />
          <ResultCard
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
            label="Liquor Bottles"
            value={String(results.liquor.bottles)}
          />
          <ResultCard
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            }
            label="Mixer Bottles"
            value={String(results.mixers.bottles)}
          />
          <ResultCard
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
            label="Bags of Ice"
            value={String(results.ice.bags)}
          />
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <button
            onClick={() =>
              document
                .getElementById('start-order')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-gray-900 font-semibold rounded-lg transition-colors text-lg"
          >
            Start Shopping
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Estimates are approximate. When in doubt, order a little extra!
          </p>
        </div>
      </div>
    </section>
  );
}
