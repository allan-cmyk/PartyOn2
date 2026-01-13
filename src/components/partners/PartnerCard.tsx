'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Partner } from '@/lib/partners/types';
import { getCategoryName } from '@/lib/partners/types';

interface PartnerCardProps {
  partner: Partner;
}

export default function PartnerCard({ partner }: PartnerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Image container content (reused for both linked and non-linked versions)
  const ImageContent = (
    <>
      {/* Hero Image Background */}
      {partner.heroImage && (
        <Image
          src={partner.heroImage}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      {/* Subtle gradient overlay for logo visibility */}
      {partner.heroImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30" />
      )}
      {/* Logo */}
      <div className="relative w-full h-full p-4 flex items-center justify-center">
        <div className="relative" style={{ width: '85%', height: '85%' }}>
          <Image
            src={partner.logo}
            alt={`${partner.name} logo`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-contain ${
              partner.heroImage
                ? `drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                    partner.invertLogo
                      ? 'brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]'
                      : 'brightness-110 contrast-110'
                  }`
                : ''
            }`}
            onError={(e) => {
              e.currentTarget.src = '/images/partners/placeholder.svg';
            }}
          />
        </div>
      </div>
      {partner.featured && (
        <span className="absolute top-3 right-3 bg-gold-600 text-white text-xs px-2 py-1 rounded-full font-medium tracking-wide z-10">
          Featured
        </span>
      )}
    </>
  );

  return (
    <article
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gold-300"
    >
      {/* Logo Container with Hero Background - Clickable if partnerPage exists */}
      {partner.partnerPage ? (
        <Link href={partner.partnerPage} className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden block cursor-pointer">
          {ImageContent}
        </Link>
      ) : (
        <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
          {ImageContent}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <span className="inline-block text-xs text-gold-700 bg-gold-50 px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
          {getCategoryName(partner.category)}
        </span>

        {/* Partner Name */}
        <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.05em] group-hover:text-gold-700 transition-colors">
          {partner.name}
        </h3>

        {/* Expandable Description */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-left w-full mb-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 rounded"
          aria-expanded={isExpanded}
        >
          <p
            className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${
              isExpanded ? '' : 'line-clamp-3'
            }`}
          >
            {partner.description}
          </p>
          <span className="inline-flex items-center text-gold-600 text-xs mt-2 hover:text-gold-700 transition-colors">
            {isExpanded ? 'Show less' : 'Read more'}
            <svg
              className={`w-3 h-3 ml-1 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {/* Website Link */}
        <a
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors group/link"
        >
          Visit Website
          <svg
            className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
      </div>
    </article>
  );
}
