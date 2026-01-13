'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import type { BYOBVenue } from '@/lib/byob-venues/types';
import { getPriceLabel, getAreaName } from '@/lib/byob-venues/types';

interface VenueDetailModalProps {
  venue: BYOBVenue;
  isOpen: boolean;
  onClose: () => void;
}

const settingLabels: Record<string, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  both: 'Indoor & Outdoor',
};

export default function VenueDetailModal({ venue, isOpen, onClose }: VenueDetailModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const venueImage = venue.image || '/images/venues/default-venue.webp';
  const displayText = venue.description || venue.byobPolicy;
  const isPartner = venue.partnerStatus !== 'none';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image - Clickable to venue website */}
        {venue.website ? (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative h-56 bg-gray-100 cursor-pointer group"
          >
            <Image
              src={venueImage}
              alt={venue.name}
              fill
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Hover overlay with "Visit Website" */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Website
              </span>
            </div>
            {/* Partner Badge */}
            {isPartner && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-full shadow-lg bg-gold-500 text-gray-900">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  FREE DELIVERY
                </span>
              </div>
            )}
          </a>
        ) : (
          <div className="relative h-56 bg-gray-100">
            <Image
              src={venueImage}
              alt={venue.name}
              fill
              sizes="(max-width: 512px) 100vw, 512px"
              className="object-cover"
            />
            {isPartner && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide rounded-full shadow-lg bg-gold-500 text-gray-900">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  FREE DELIVERY
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-224px)]">
          {/* Category Badge & Location */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gold-700 bg-gold-50 px-2 py-0.5 rounded-full tracking-wide">
              {venue.subcategory}
            </span>
            <span className="text-xs text-gray-500">
              {getAreaName(venue.area)}
            </span>
          </div>

          {/* Venue Name */}
          <h2 className="font-serif text-2xl text-gray-900 mb-3 tracking-wide">
            {venue.name}
          </h2>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{settingLabels[venue.setting]}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gold-600 font-medium">
                {getPriceLabel(venue.priceRange)}
              </span>
            </div>
          </div>

          {/* Full Description */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {displayText}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-gray-900 bg-gold-400 hover:bg-gold-500 rounded transition-colors"
              >
                Visit Website
              </a>
            )}
            {isPartner && venue.partnerSlug && (
              <a
                href={`/venues/${venue.partnerSlug}`}
                className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded transition-colors"
              >
                Order Alcohol
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
