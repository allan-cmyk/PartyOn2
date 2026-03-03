'use client';

import { useRef, useState, useEffect } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
    };

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <div className="sticky top-14 md:top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-2 sm:gap-2 pb-1 scrollbar-hide"
          >
            {/* All Button */}
            <button
              onClick={() => onCategoryChange('all')}
              className={`flex-shrink-0 px-5 py-2.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-sm font-medium tracking-wide transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-brand-yellow text-gray-900 shadow-md'
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
                className={`flex-shrink-0 px-5 py-2.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-sm font-medium tracking-wide transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-brand-yellow text-gray-900 shadow-md'
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

          {/* Right fade indicator */}
          <div
            className={`absolute right-0 top-0 bottom-1 w-12 pointer-events-none transition-opacity duration-300 bg-gradient-to-l from-white via-white/80 to-transparent sm:hidden ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
