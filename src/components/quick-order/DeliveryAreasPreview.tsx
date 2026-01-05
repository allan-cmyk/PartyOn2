/**
 * @fileoverview Delivery areas preview section for local SEO
 * @module components/quick-order/DeliveryAreasPreview
 */

import Link from 'next/link';
import type { ReactElement } from 'react';

const AUSTIN_AREAS = [
  { name: 'Downtown Austin', href: '/areas/downtown' },
  { name: 'South Congress', href: '/areas/south-congress' },
  { name: 'East Austin', href: '/areas/east-austin' },
  { name: 'Lake Travis', href: '/areas/lake-travis' },
  { name: 'Cedar Park', href: '/areas/cedar-park' },
  { name: 'Round Rock', href: '/areas/round-rock' },
  { name: 'Westlake', href: '/areas/westlake' },
  { name: 'Lakeway', href: '/areas/lakeway' },
];

/**
 * Compact delivery areas section with local SEO keywords
 */
export default function DeliveryAreasPreview(): ReactElement {
  return (
    <section className="bg-navy-900 py-12 md:py-16 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl tracking-[0.1em] mb-2">
            AUSTIN ALCOHOL DELIVERY
          </h2>
          <div className="w-16 h-px bg-gold-400 mx-auto mb-4" />
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Premium spirits, beer, wine, and mixers delivered to your door across the Greater Austin area
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {AUSTIN_AREAS.map((area) => (
            <Link
              key={area.name}
              href={area.href}
              className="bg-white/10 hover:bg-gold-500/20 border border-white/20 hover:border-gold-400 rounded-lg px-4 py-3 text-center transition-all duration-200"
            >
              <span className="text-sm font-medium tracking-wide">
                {area.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/delivery-areas"
            className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium tracking-[0.1em] text-sm transition-colors"
          >
            VIEW ALL DELIVERY AREAS
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* LocalBusiness schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'Party On Delivery',
              description: 'Austin alcohol delivery service for parties, events, and everyday occasions',
              url: 'https://partyondelivery.com',
              telephone: '+1-512-555-0123',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Austin',
                addressRegion: 'TX',
                addressCountry: 'US',
              },
              areaServed: AUSTIN_AREAS.map((area) => ({
                '@type': 'City',
                name: area.name.replace(' Austin', ''),
              })),
              priceRange: '$$',
            }),
          }}
        />
      </div>
    </section>
  );
}
