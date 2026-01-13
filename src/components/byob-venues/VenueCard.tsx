'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BYOBVenue } from '@/lib/byob-venues/types';
import { getPriceLabel, getAreaName } from '@/lib/byob-venues/types';
import VenueDetailModal from './VenueDetailModal';

interface VenueCardProps {
  venue: BYOBVenue;
}

// Setting icons
const SettingIcon = ({ setting }: { setting: string }) => {
  if (setting === 'indoor') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (setting === 'outdoor') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
};

const settingLabels: Record<string, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  both: 'Both',
};

export default function VenueCard({ venue }: VenueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPartner = venue.partnerStatus !== 'none';
  const isPremier = venue.partnerStatus === 'premier';

  // Default placeholder image based on category
  const placeholderImages: Record<string, string> = {
    'historic-cultural': '/images/venues/historic-placeholder.webp',
    'gardens-outdoor': '/images/venues/garden-placeholder.webp',
    'barns-ranches': '/images/venues/barn-placeholder.webp',
    'modern-industrial': '/images/venues/industrial-placeholder.webp',
    'public-community': '/images/venues/community-placeholder.webp',
    'entertainment': '/images/venues/entertainment-placeholder.webp',
    'hill-country': '/images/venues/hillcountry-placeholder.webp',
  };

  const venueImage = venue.image || placeholderImages[venue.category] || '/images/venues/default-venue.webp';

  // Use description if available, otherwise fall back to byobPolicy
  const displayText = venue.description || venue.byobPolicy;

  // Image wrapper - clickable link to website if available
  const ImageWrapper = ({ children }: { children: React.ReactNode }) => {
    if (venue.website) {
      return (
        <a
          href={venue.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative h-32 sm:h-48 bg-gray-100 overflow-hidden cursor-pointer"
          aria-label={`Visit ${venue.name} website`}
        >
          {children}
        </a>
      );
    }
    return <div className="relative h-32 sm:h-48 bg-gray-100 overflow-hidden">{children}</div>;
  };

  return (
    <article
      className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isPartner ? 'border-2 border-gold-400 ring-1 ring-gold-200' : 'border border-gray-100 hover:border-gold-300'
      }`}
    >
      {/* Image Container - Clickable link to venue website */}
      <ImageWrapper>
        <Image
          src={venueImage}
          alt={`${venue.name} - ${venue.subcategory} in ${getAreaName(venue.area)}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = '/images/venues/default-venue.webp';
          }}
        />

        {/* Partner Badge */}
        {isPartner && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
            <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-xs font-semibold tracking-wide rounded-full shadow-lg ${
              isPremier
                ? 'bg-gold-500 text-gray-900'
                : 'bg-gold-400 text-gray-900'
            }`}>
              <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">FREE DELIVERY</span>
              <span className="sm:hidden">FREE</span>
            </span>
          </div>
        )}

        {/* Premier Badge */}
        {isPremier && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
            <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-900 text-gold-400 text-[8px] sm:text-[10px] font-bold tracking-wider rounded">
              PREMIER
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* External link indicator for non-partners with website */}
        {venue.website && !isPartner && (
          <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded shadow">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Site
            </span>
          </div>
        )}
      </ImageWrapper>

      {/* Content */}
      <div className="p-3 sm:p-5">
        {/* Category & Location */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
          <span className="text-[10px] sm:text-xs text-gold-700 bg-gold-50 px-1.5 sm:px-2 py-0.5 rounded-full tracking-wide truncate max-w-[80%]">
            {venue.subcategory}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">
            {getAreaName(venue.area)}
          </span>
        </div>

        {/* Venue Name */}
        <h3 className="font-serif text-sm sm:text-xl text-gray-900 mb-1 sm:mb-2 tracking-wide group-hover:text-gold-700 transition-colors line-clamp-2 sm:line-clamp-1">
          {venue.name}
        </h3>

        {/* Quick Stats - Hidden on mobile for space */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1" title={settingLabels[venue.setting]}>
            <SettingIcon setting={venue.setting} />
            <span>{settingLabels[venue.setting]}</span>
          </div>
          <div className="flex items-center gap-1" title="Price Range">
            <span className="text-gold-600 font-medium">
              {getPriceLabel(venue.priceRange)}
            </span>
          </div>
        </div>

        {/* Mobile-only: Compact stats row */}
        <div className="flex sm:hidden items-center gap-2 text-[10px] text-gray-500 mb-2">
          <span>{settingLabels[venue.setting]}</span>
          <span>•</span>
          <span className="text-gold-600">{getPriceLabel(venue.priceRange)}</span>
        </div>

        {/* Mobile-only: Read Description button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="sm:hidden w-full mb-2 px-2 py-1.5 text-[10px] font-medium text-gold-700 bg-gold-50 hover:bg-gold-100 rounded transition-colors"
        >
          Read Description
        </button>

        {/* Description (or BYOB Policy as fallback) - Hidden on mobile */}
        <div className="hidden sm:block mb-4">
          <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {displayText}
          </p>
          {displayText && displayText.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gold-600 hover:text-gold-700 mt-1 font-medium"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>

        {/* Action Button - Only for partners */}
        {isPartner && venue.partnerSlug && (
          <Link
            href={`/venues/${venue.partnerSlug}`}
            className="block w-full text-center px-2 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-900 bg-gold-400 hover:bg-gold-500 rounded transition-colors"
          >
            Order Alcohol
          </Link>
        )}
      </div>

      {/* Venue Detail Modal (Mobile) */}
      <VenueDetailModal
        venue={venue}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </article>
  );
}
