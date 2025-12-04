'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Partner } from '@/lib/partners/types';
import { getCategoryName } from '@/lib/partners/types';

interface PartnerCardProps {
  partner: Partner;
}

export default function PartnerCard({ partner }: PartnerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gold-300"
    >
      {/* Logo Container */}
      <div className="relative h-40 bg-gray-50 flex items-center justify-center p-6">
        <div className="relative w-full h-full">
          <Image
            src={partner.logo}
            alt={`${partner.name} logo`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain"
            onError={(e) => {
              e.currentTarget.src = '/images/partners/placeholder.svg';
            }}
          />
        </div>
        {partner.featured && (
          <span className="absolute top-3 right-3 bg-gold-600 text-white text-xs px-2 py-1 rounded-full font-medium tracking-wide">
            Featured
          </span>
        )}
      </div>

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
