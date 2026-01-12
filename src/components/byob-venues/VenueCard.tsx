'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { BYOBVenue } from '@/lib/byob-venues/types';
import { getCategoryName, getPriceLabel, getAreaName } from '@/lib/byob-venues/types';

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
  const isPartner = venue.partnerStatus !== 'none';
  const isPremier = venue.partnerStatus === 'premier';
  const isFeatured = venue.partnerStatus === 'featured';

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

  return (
    <article
      className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isPartner ? 'border-2 border-gold-400 ring-1 ring-gold-200' : 'border border-gray-100 hover:border-gold-300'
      }`}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
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
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-full shadow-lg ${
              isPremier
                ? 'bg-gold-500 text-gray-900'
                : 'bg-gold-400 text-gray-900'
            }`}>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              FREE DELIVERY
            </span>
          </div>
        )}

        {/* Premier Badge */}
        {isPremier && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-block px-2 py-1 bg-gray-900 text-gold-400 text-[10px] font-bold tracking-wider rounded">
              PREMIER
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category & Location */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gold-700 bg-gold-50 px-2 py-0.5 rounded-full tracking-wide">
            {venue.subcategory}
          </span>
          <span className="text-xs text-gray-500">
            {getAreaName(venue.area)}
          </span>
        </div>

        {/* Venue Name */}
        <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-wide group-hover:text-gold-700 transition-colors line-clamp-1">
          {venue.name}
        </h3>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
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

        {/* BYOB Policy */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
          {venue.byobPolicy}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Visit Website
            </a>
          )}

          {isPartner && venue.partnerSlug ? (
            <Link
              href={`/venues/${venue.partnerSlug}`}
              className="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-900 bg-gold-400 hover:bg-gold-500 rounded transition-colors"
            >
              Order Alcohol
            </Link>
          ) : (
            <Link
              href="/products"
              className="flex-1 text-center px-4 py-2 text-sm font-medium text-gold-700 border border-gold-300 hover:bg-gold-50 rounded transition-colors"
            >
              Browse Drinks
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
