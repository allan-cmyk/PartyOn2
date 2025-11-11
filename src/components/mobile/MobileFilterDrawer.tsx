'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  categories: Array<{ value: string; label: string; count: number }>;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  categories
}: MobileFilterDrawerProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  const sortOptions = [
    { value: 'bestsellers', label: 'Best Sellers' },
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
  ];

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const handleApplyFilters = () => {
    onPriceRangeChange(localPriceRange);
    onClose();
  };

  const handleReset = () => {
    onCategoryChange('all');
    onSortChange('featured');
    setLocalPriceRange([0, 500]);
    onPriceRangeChange([0, 500]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[90] max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200">
              <h2 className="font-serif text-xl tracking-[0.1em]">FILTERS</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] pb-20">
              {/* Categories */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-medium tracking-[0.1em] text-gray-900 mb-3">CATEGORY</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => onCategoryChange(category.value)}
                      className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-gold-50 text-gold-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">{category.label}</span>
                      <span className="text-xs text-gray-500">({category.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-medium tracking-[0.1em] text-gray-900 mb-3">SORT BY</h3>
                <div className="space-y-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => onSortChange(option.value)}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
                        sortBy === option.value
                          ? 'bg-gold-50 text-gold-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium tracking-[0.1em] text-gray-900 mb-3">PRICE RANGE</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">MIN</label>
                      <input
                        type="number"
                        value={localPriceRange[0]}
                        onChange={(e) => setLocalPriceRange([Number(e.target.value), localPriceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        max={localPriceRange[1]}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">MAX</label>
                      <input
                        type="number"
                        value={localPriceRange[1]}
                        onChange={(e) => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min={localPriceRange[0]}
                      />
                    </div>
                  </div>
                  
                  {/* Price Range Slider */}
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={localPriceRange[1]}
                      onChange={(e) => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex space-x-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium tracking-[0.1em]"
              >
                RESET
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-3 bg-gold-600 text-gray-900 rounded-lg text-sm font-medium tracking-[0.1em]"
              >
                APPLY FILTERS
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}