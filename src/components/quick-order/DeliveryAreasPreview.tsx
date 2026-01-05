/**
 * @fileoverview Delivery areas preview section for local SEO
 * @module components/quick-order/DeliveryAreasPreview
 */

import type { ReactElement } from 'react';

const AUSTIN_AREAS = [
  'Downtown Austin',
  'South Congress',
  'East Austin',
  'Lake Travis',
  'Cedar Park',
  'Round Rock',
  'Westlake',
  'Lakeway',
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {AUSTIN_AREAS.map((area) => (
            <div
              key={area}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center"
            >
              <span className="text-sm font-medium tracking-wide">
                {area}
              </span>
            </div>
          ))}
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
                name: area.replace(' Austin', ''),
              })),
              priceRange: '$$',
            }),
          }}
        />
      </div>
    </section>
  );
}
