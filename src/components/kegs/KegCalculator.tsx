'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

/**
 * Interactive keg calculator component
 * Helps customers determine how many kegs they need for their party
 */

export default function KegCalculator() {
  const [guests, setGuests] = useState(50);
  const [hours, setHours] = useState(4);
  const [drinkingLevel, setDrinkingLevel] = useState<'light' | 'moderate' | 'heavy'>('moderate');

  // Calculate drinks per person based on drinking level
  const drinksPerPersonPerHour = {
    light: 0.75,
    moderate: 1,
    heavy: 1.5,
  };

  // Calculate total drinks and kegs needed
  const drinksFirstHour = guests * 2;
  const drinksRemainingHours = guests * drinksPerPersonPerHour[drinkingLevel] * (hours - 1);
  const totalDrinks = Math.ceil(drinksFirstHour + drinksRemainingHours);
  const kegsNeeded = Math.ceil(totalDrinks / 165);

  // Determine recommendation based on total drinks
  const getRecommendation = () => {
    if (totalDrinks < 55) {
      return { size: '1/6 Barrel', servings: 55, note: 'A sixtel should be plenty!' };
    } else if (totalDrinks < 80) {
      return { size: '1/4 Barrel', servings: 82, note: 'A pony keg is perfect for your group.' };
    } else if (totalDrinks <= 165) {
      return { size: '1/2 Barrel', servings: 165, note: 'One full keg will do the trick!' };
    } else {
      return {
        size: `${kegsNeeded} x 1/2 Barrels`,
        servings: kegsNeeded * 165,
        note: `For ${guests} guests over ${hours} hours, we recommend ${kegsNeeded} full kegs.`,
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-8">
        <ScrollRevealCSS duration={800} y={20} className="text-center mb-12">
          <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
            How Many Kegs Do I Need?
          </h2>
          <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
          <p className="text-gray-600 text-lg">
            Use our calculator to find the perfect amount of beer for your party.
          </p>
        </ScrollRevealCSS>

        <ScrollRevealCSS duration={800} y={20} delay={100}>
          <div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Guest Count */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 tracking-[0.05em]">
                  Number of Guests
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-600"
                />
                <div className="text-center mt-2">
                  <span className="text-3xl font-medium text-gold-600">{guests}</span>
                  <span className="text-gray-600 ml-1">guests</span>
                </div>
              </div>

              {/* Event Duration */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 tracking-[0.05em]">
                  Event Duration
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-600"
                />
                <div className="text-center mt-2">
                  <span className="text-3xl font-medium text-gold-600">{hours}</span>
                  <span className="text-gray-600 ml-1">hours</span>
                </div>
              </div>

              {/* Drinking Level */}
              <div>
                <label className="block text-gray-900 font-medium mb-2 tracking-[0.05em]">
                  Drinking Level
                </label>
                <div className="flex gap-2">
                  {(['light', 'moderate', 'heavy'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDrinkingLevel(level)}
                      className={`flex-1 py-2 px-3 text-sm rounded transition-all duration-300 ${
                        drinkingLevel === level
                          ? 'bg-gold-600 text-gray-900'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {drinkingLevel === 'light' && '~1 drink per hour'}
                  {drinkingLevel === 'moderate' && '~1.5 drinks per hour'}
                  {drinkingLevel === 'heavy' && '~2 drinks per hour'}
                </p>
              </div>
            </div>

            {/* Result */}
            <div className="bg-gold-50 rounded-lg p-6 text-center border border-gold-200">
              <p className="text-gray-600 mb-2">Our Recommendation</p>
              <p className="text-3xl font-serif text-gray-900 mb-2 tracking-[0.1em]">
                {recommendation.size}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                {recommendation.note}
              </p>
              <p className="text-xs text-gray-500">
                Estimated {totalDrinks} drinks for {guests} guests over {hours} hours
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/contact"
                className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium text-center rounded"
              >
                REQUEST A QUOTE
              </Link>
              <a
                href="tel:7373719700"
                className="px-8 py-3 border border-gold-600 text-gray-900 hover:bg-gold-600 transition-colors tracking-[0.1em] text-sm font-medium text-center rounded"
              >
                CALL (737) 371-9700
              </a>
            </div>
          </div>
        </ScrollRevealCSS>
      </div>
    </section>
  );
}
