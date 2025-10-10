'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type DrinkingLevel = 'light' | 'average' | 'crazy';

export default function WeddingDrinkCalculator() {
  const [guests, setGuests] = useState<number>(100);
  const [hours, setHours] = useState<number>(5);
  const [drinkingLevel, setDrinkingLevel] = useState<DrinkingLevel>('average');
  const [champagneToast, setChampagneToast] = useState<boolean>(true);

  // Percentages that must add up to 100
  const [liquorPercent, setLiquorPercent] = useState<number>(30);
  const [winePercent, setWinePercent] = useState<number>(40);
  const [beerPercent, setBeerPercent] = useState<number>(30);

  // Calculate total drinks based on drinking level
  const getTotalDrinks = (): number => {
    if (guests <= 0 || hours <= 0) return 0;

    switch (drinkingLevel) {
      case 'light':
        return guests * hours;
      case 'average':
        return guests * (hours + 1);
      case 'crazy':
        return guests * (hours + 2);
      default:
        return 0;
    }
  };

  // Calculate bottle quantities
  const totalDrinks = getTotalDrinks();
  const wineBottles = Math.ceil((totalDrinks * winePercent / 100) / 4);
  const liquorBottles = Math.ceil((totalDrinks * liquorPercent / 100) / 12);
  const beers = Math.ceil(totalDrinks * beerPercent / 100);
  const champagneBottles = champagneToast ? Math.ceil(guests / 5) : 0;

  // Handle slider changes with locking mechanism
  const handleLiquorChange = (value: number) => {
    const newLiquor = Math.max(0, Math.min(100, value));
    setLiquorPercent(newLiquor);

    // Distribute remaining percentage between wine and beer proportionally
    const remaining = 100 - newLiquor;
    const currentOthers = winePercent + beerPercent;

    if (currentOthers > 0) {
      const wineRatio = winePercent / currentOthers;
      const beerRatio = beerPercent / currentOthers;
      setWinePercent(Math.round(remaining * wineRatio));
      setBeerPercent(Math.round(remaining * beerRatio));
    } else {
      setWinePercent(Math.round(remaining / 2));
      setBeerPercent(remaining - Math.round(remaining / 2));
    }
  };

  const handleWineChange = (value: number) => {
    const newWine = Math.max(0, Math.min(100, value));
    setWinePercent(newWine);

    // Distribute remaining percentage between liquor and beer proportionally
    const remaining = 100 - newWine;
    const currentOthers = liquorPercent + beerPercent;

    if (currentOthers > 0) {
      const liquorRatio = liquorPercent / currentOthers;
      const beerRatio = beerPercent / currentOthers;
      setLiquorPercent(Math.round(remaining * liquorRatio));
      setBeerPercent(Math.round(remaining * beerRatio));
    } else {
      setLiquorPercent(Math.round(remaining / 2));
      setBeerPercent(remaining - Math.round(remaining / 2));
    }
  };

  const handleBeerChange = (value: number) => {
    const newBeer = Math.max(0, Math.min(100, value));
    setBeerPercent(newBeer);

    // Distribute remaining percentage between liquor and wine proportionally
    const remaining = 100 - newBeer;
    const currentOthers = liquorPercent + winePercent;

    if (currentOthers > 0) {
      const liquorRatio = liquorPercent / currentOthers;
      const wineRatio = winePercent / currentOthers;
      setLiquorPercent(Math.round(remaining * liquorRatio));
      setWinePercent(Math.round(remaining * wineRatio));
    } else {
      setLiquorPercent(Math.round(remaining / 2));
      setWinePercent(remaining - Math.round(remaining / 2));
    }
  };

  // Verify percentages total 100
  const totalPercent = liquorPercent + winePercent + beerPercent;
  const isValid = totalPercent === 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
      <div className="text-center mb-12">
        <h2 className="font-serif font-light text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
          Wedding Drink Calculator
        </h2>
        <div className="w-16 h-px bg-gold-600 mx-auto mb-4" />
        <p className="text-gray-600 tracking-[0.05em] max-w-2xl mx-auto">
          Get an estimate of how much alcohol you&apos;ll need for your celebration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Number of Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 tracking-[0.05em]">
              Number of Guests
            </label>
            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-600 focus:border-transparent"
            />
          </div>

          {/* Hours of Event */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 tracking-[0.05em]">
              Hours of Event
            </label>
            <input
              type="number"
              min="1"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-600 focus:border-transparent"
            />
          </div>

          {/* Drinking Level */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3 tracking-[0.05em]">
              Who are your people?
            </label>
            <div className="space-y-2">
              {[
                { value: 'light', label: 'Light Drinkers' },
                { value: 'average', label: 'Average' },
                { value: 'crazy', label: 'We\'re Crazy' }
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="drinkingLevel"
                    value={option.value}
                    checked={drinkingLevel === option.value}
                    onChange={(e) => setDrinkingLevel(e.target.value as DrinkingLevel)}
                    className="w-4 h-4 text-gold-600 border-gray-300 focus:ring-gold-600"
                  />
                  <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Champagne Toast */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3 tracking-[0.05em]">
              Champagne Toast?
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setChampagneToast(true)}
                className={`px-6 py-2 rounded-md transition-all ${
                  champagneToast
                    ? 'bg-gold-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setChampagneToast(false)}
                className={`px-6 py-2 rounded-md transition-all ${
                  !champagneToast
                    ? 'bg-gold-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Drink Mix Sliders */}
          <div className="pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-900 mb-4 tracking-[0.05em]">
              Drink Mix {!isValid && <span className="text-red-600 text-xs">(Must equal 100%)</span>}
            </label>

            {/* Liquor Slider */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">Liquor</span>
                <span className="text-sm font-medium text-gray-900">{liquorPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={liquorPercent}
                onChange={(e) => handleLiquorChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-600"
              />
            </div>

            {/* Wine Slider */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">Wine</span>
                <span className="text-sm font-medium text-gray-900">{winePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={winePercent}
                onChange={(e) => handleWineChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-600"
              />
            </div>

            {/* Beer Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-700">Beer</span>
                <span className="text-sm font-medium text-gray-900">{beerPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beerPercent}
                onChange={(e) => handleBeerChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-600"
              />
            </div>

            {/* Total Percentage Display */}
            <div className="mt-4 text-center">
              <span className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                Total: {totalPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gradient-to-br from-gold-50 to-gray-50 rounded-lg p-8">
          <h3 className="font-serif text-2xl text-gray-900 mb-6 tracking-[0.1em] text-center">
            Estimated Quantities
          </h3>

          <div className="space-y-6">
            {/* Total Drinks Info */}
            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Drinks Needed</p>
              <p className="text-3xl font-semibold text-gold-600">{totalDrinks}</p>
            </div>

            {/* Wine Bottles */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Wine Bottles</p>
                  <p className="text-xs text-gray-500">750ml each</p>
                </div>
                <p className="text-4xl font-semibold text-gray-900">{wineBottles}</p>
              </div>
            </motion.div>

            {/* Liquor Bottles */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Liquor Bottles</p>
                  <p className="text-xs text-gray-500">750ml each</p>
                </div>
                <p className="text-4xl font-semibold text-gray-900">{liquorBottles}</p>
              </div>
            </motion.div>

            {/* Beer Cans */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Beer Cans</p>
                  <p className="text-xs text-gray-500">12oz each</p>
                </div>
                <p className="text-4xl font-semibold text-gray-900">{beers}</p>
              </div>
            </motion.div>

            {/* Champagne Bottles */}
            {champagneToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-6 shadow-sm border-2 border-gold-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Champagne Bottles</p>
                    <p className="text-xs text-gray-500">For toast (750ml each)</p>
                  </div>
                  <p className="text-4xl font-semibold text-gold-600">{champagneBottles}</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              *Estimates based on standard serving sizes. Actual needs may vary based on guest preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
