'use client';

import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

/**
 * Service areas component for keg delivery
 * Shows delivery zones and Lake Travis dock delivery option
 */

const SERVED_AREAS = [
  'Downtown Austin',
  'South Austin',
  'East Austin',
  'Lake Travis',
  'Westlake',
  'The Domain',
  'Bee Cave',
  'Lakeway',
  'Mueller',
  'Spicewood',
];

export default function KegServiceAreas() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-8">
        <ScrollRevealCSS duration={800} y={20} className="text-center mb-12">
          <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
            Keg Delivery Areas
          </h2>
          <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We deliver cold kegs throughout Austin and the surrounding Hill Country.
          </p>
        </ScrollRevealCSS>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Served Areas */}
          <ScrollRevealCSS duration={800} y={20} delay={100}>
            <div className="bg-white rounded-lg p-6 shadow-lg border border-green-200 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-gray-900 tracking-[0.05em]">
                  We Deliver To
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SERVED_AREAS.map((area) => (
                  <div key={area} className="flex items-center gap-2 py-1">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollRevealCSS>

          {/* Lake Travis Dock Delivery */}
          <ScrollRevealCSS duration={800} y={20} delay={200}>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 shadow-lg border border-blue-200 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-gray-900 tracking-[0.05em]">
                  Lake Travis Dock Delivery
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Planning a boat party? We deliver kegs directly to Lake Travis
                marinas including Lakeway Marina, Point Venture, Volente Beach,
                and Hudson Bend.
              </p>
              <Link
                href="/boat-parties"
                className="inline-block text-gold-600 hover:text-gold-700 font-medium tracking-[0.1em] text-sm"
              >
                LEARN ABOUT BOAT PARTY DELIVERY →
              </Link>
            </div>
          </ScrollRevealCSS>
        </div>
      </div>
    </section>
  );
}
