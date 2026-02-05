'use client';

import { PARTNER_CATEGORIES, type PartnerCategory } from '@/lib/partners/types';

interface CategoryFilterProps {
  activeCategory: PartnerCategory | 'all';
  onCategoryChange: (category: PartnerCategory | 'all') => void;
  partnerCounts: Record<PartnerCategory | 'all', number>;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
  partnerCounts,
}: CategoryFilterProps) {
  return (
    <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {/* All Button */}
          <button
            onClick={() => onCategoryChange('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-brand-yellow text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
            <span className="ml-1.5 text-xs opacity-75">
              ({partnerCounts.all})
            </span>
          </button>

          {/* Category Buttons */}
          {PARTNER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-brand-yellow text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
              <span className="ml-1.5 text-xs opacity-75">
                ({partnerCounts[category.id] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
