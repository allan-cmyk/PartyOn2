'use client';

import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

/**
 * Service areas component for keg delivery
 * Shows where we deliver and don't deliver
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

const NOT_SERVED_AREAS = [
  'Round Rock',
  'Cedar Park',
  'Dripping Springs',
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
            <div className="bg-white rounded-lg p-6 shadow-lg border border-green-200">
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

          {/* Not Served Areas */}
          <ScrollRevealCSS duration={800} y={20} delay={200}>
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-gray-900 tracking-[0.05em]">
                  Outside Delivery Zone
                </h3>
              </div>
              <div className="space-y-2 mb-4">
                {NOT_SERVED_AREAS.map((area) => (
                  <div key={area} className="flex items-center gap-2 py-1">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-500 text-sm">{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs">
                Live in one of these areas?{' '}
                <Link href="/contact" className="text-gold-600 hover:text-gold-700 underline">
                  Contact us
                </Link>{' '}
                for potential special arrangements.
              </p>
            </div>
          </ScrollRevealCSS>
        </div>

        {/* Lake Travis Callout */}
        <ScrollRevealCSS duration={800} y={20} delay={300} className="mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8 text-center border border-blue-200 max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
              Lake Travis Dock Delivery
            </h3>
            <p className="text-gray-600 mb-4">
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
    </section>
  );
}
