/**
 * @fileoverview Sticky horizontal category tabs for Quick Order page
 * @module components/quick-order/CategoryTabs
 */

'use client';

import { useRef, useEffect, type ReactElement } from 'react';
import { QUICK_ORDER_CATEGORIES } from '@/hooks/useQuickOrderProducts';

interface CategoryTabsProps {
  /** Currently active category ID */
  activeCategory: string;
  /** Callback when category changes */
  onCategoryChange: (categoryId: string) => void;
}

/**
 * Horizontal scrollable category tabs with sticky positioning
 *
 * @example
 * ```tsx
 * <CategoryTabs
 *   activeCategory="beer"
 *   onCategoryChange={setActiveCategory}
 * />
 * ```
 */
export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps): ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view when category changes
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Calculate if button is outside visible area
      const isOutOfView =
        buttonRect.left < containerRect.left ||
        buttonRect.right > containerRect.right;

      if (isOutOfView) {
        button.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 py-3 gap-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {QUICK_ORDER_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              ref={isActive ? activeButtonRef : null}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-pressed={isActive}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
