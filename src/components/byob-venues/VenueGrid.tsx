'use client';

import { useState, useMemo } from 'react';
import VenueCard from './VenueCard';
import type { BYOBVenue, VenueCategory, EventType } from '@/lib/byob-venues/types';

interface VenueGridProps {
  venues: BYOBVenue[];
  activeCategory: VenueCategory | 'all';
  activeEventType: EventType | 'all';
  searchQuery: string;
  showPartnersOnly: boolean;
}

export default function VenueGrid({
  venues,
  activeCategory,
  activeEventType,
  searchQuery,
  showPartnersOnly,
}: VenueGridProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredVenues = useMemo(() => {
    let filtered = [...venues];

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((v) => v.category === activeCategory);
    }

    // Filter by event type
    if (activeEventType !== 'all') {
      filtered = filtered.filter((v) => v.eventTypes.includes(activeEventType));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.subcategory.toLowerCase().includes(query) ||
          v.byobPolicy.toLowerCase().includes(query) ||
          v.area.toLowerCase().includes(query)
      );
    }

    // Filter by partner status
    if (showPartnersOnly) {
      filtered = filtered.filter((v) => v.partnerStatus !== 'none');
    }

    // Sort: Partners first (premier > featured > listed), then alphabetical
    filtered.sort((a, b) => {
      const tierOrder = { premier: 0, featured: 1, listed: 2, none: 3 };
      const aTier = tierOrder[a.partnerStatus];
      const bTier = tierOrder[b.partnerStatus];

      if (aTier !== bTier) return aTier - bTier;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [venues, activeCategory, activeEventType, searchQuery, showPartnersOnly]);

  const visibleVenues = filteredVenues.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVenues.length;

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 12, filteredVenues.length));
  };

  if (filteredVenues.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="text-xl font-serif text-gray-900 mb-2">No venues found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <p className="text-sm text-gray-600 mb-6">
        Showing {visibleVenues.length} of {filteredVenues.length} venues
      </p>

      {/* Venue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded tracking-wide"
          >
            Load More Venues
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {filteredVenues.length - visibleCount} more venues
          </p>
        </div>
      )}
    </div>
  );
}
