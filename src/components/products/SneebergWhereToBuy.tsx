import React from 'react';
import Link from 'next/link';
import LuxuryCard from '../LuxuryCard';

/**
 * "Where to Buy" section for Schneeberg snuff product page
 * Targets keyword: "schneeberg snuff where to buy"
 */
export default function SneebergWhereToBuy() {
  const deliveryAreas = [
    'Downtown Austin',
    'South Austin (Zilker, South Lamar, South Congress)',
    'East Austin',
    'West Austin (Tarrytown, Clarksville)',
    'North Austin (Hyde Park, Mueller)',
    'Lake Travis',
    'Round Rock',
    'Cedar Park',
    'Pflugerville',
    'Georgetown',
    'Leander',
    'Bee Cave'
  ];

  const benefits = [
    {
      title: '100% Authentic Products',
      description: 'Genuine Pöschl Schneeberg Weiss imported directly from Germany'
    },
    {
      title: 'Fast Austin Delivery',
      description: 'Same-day delivery available throughout the Austin metropolitan area'
    },
    {
      title: 'Competitive Pricing',
      description: 'Great prices on Schneeberg and all herbal snuff products'
    },
    {
      title: 'Easy Ordering',
      description: 'Order online, by phone, or by text message for your convenience'
    },
    {
      title: 'Wide Selection',
      description: 'Large selection of herbal and traditional snuffs beyond Schneeberg'
    }
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.15em] text-center">
          WHERE TO BUY SCHNEEBERG SNUFF IN AUSTIN
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Looking for Schneeberg powder near you? Party On Delivery is Austin&apos;s premier source for Pöschl Schneeberg
          Weiss tobacco-free snuff.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Austin Delivery Service */}
          <LuxuryCard>
            <div className="p-8">
              <div className="flex items-center mb-6">
                <svg className="w-8 h-8 text-gold-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="font-serif text-2xl text-gray-900 tracking-[0.1em]">
                  Austin Delivery Service
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                We deliver Schneeberg snuff throughout the Austin area, including:
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {deliveryAreas.map((area, index) => (
                  <li key={index} className="text-gray-700 flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </LuxuryCard>

          {/* Why Buy from Us */}
          <LuxuryCard>
            <div className="p-8">
              <div className="flex items-center mb-6">
                <svg className="w-8 h-8 text-gold-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="font-serif text-2xl text-gray-900 tracking-[0.1em]">
                  Why Buy from Party On Delivery?
                </h3>
              </div>
              <ul className="space-y-6">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="text-gray-900 text-base block">{benefit.title}</strong>
                      <span className="text-gray-600 text-sm">{benefit.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </LuxuryCard>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            Ready to order Schneeberg snuff for delivery in Austin?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium rounded">
              ADD TO CART
            </button>
            <Link
              href="/contact"
              className="px-8 py-4 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors tracking-[0.1em] text-sm font-medium rounded inline-block"
            >
              CONTACT US
            </Link>
          </div>

          {/* Additional SEO-rich content */}
          <div className="mt-12 max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg">
            <p className="text-gray-600 leading-relaxed text-left">
              <strong className="text-gray-900">Can&apos;t find Schneeberg snuff at local stores in Austin?</strong> Skip the search and order directly from Party On Delivery. We stock authentic Pöschl Schneeberg Weiss and other premium herbal snuffs for convenient delivery throughout the Austin metropolitan area. Whether you&apos;re in downtown high-rises, South Congress shops, East Austin neighborhoods, or Lake Travis waterfront homes, we deliver Schneeberg powder right to your door. Our tobacco-free, nicotine-free herbal snuff selection includes hard-to-find imported products that local Austin retailers rarely carry. Order the refreshing peppermint Schneeberg snuff today and experience why it&apos;s become one of our most popular specialty products for Austin customers seeking tobacco alternatives.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
