'use client';

import Link from 'next/link';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';

/**
 * Equipment rentals section for keg accessories
 * Taps, tubs, CO2 systems, and jockey boxes
 */

interface Equipment {
  name: string;
  description: string;
  price: string;
  icon: 'tap' | 'tub' | 'co2' | 'jockey';
}

const EQUIPMENT: Equipment[] = [
  {
    name: 'Standard Party Tap',
    description: 'Manual pump tap for single-day events. Easy to use, no electricity needed.',
    price: '$15/day',
    icon: 'tap',
  },
  {
    name: 'Ice Tub',
    description: 'Large insulated tub that fits a 1/2 barrel keg. Keeps beer cold all day.',
    price: '$25/day',
    icon: 'tub',
  },
  {
    name: 'CO2 Dispensing System',
    description: 'Professional draft system. Keeps keg fresh for weeks. Includes tank & regulator.',
    price: '$50/day',
    icon: 'co2',
  },
  {
    name: 'Jockey Box',
    description: 'Portable refrigerated tap system. Perfect for outdoor events without power.',
    price: '$75/day',
    icon: 'jockey',
  },
];

function EquipmentIcon({ type }: { type: Equipment['icon'] }) {
  const iconClass = 'w-8 h-8 text-gold-600';

  switch (type) {
    case 'tap':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case 'tub':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'co2':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    case 'jockey':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
  }
}

export default function EquipmentRentals() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-8">
        <ScrollRevealCSS duration={800} y={20} className="text-center mb-16">
          <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.1em]">
            Equipment Rentals
          </h2>
          <div className="w-16 h-px bg-gold-600 mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to tap and serve your keg. Rent separately or
            bundle with your keg order.
          </p>
        </ScrollRevealCSS>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EQUIPMENT.map((item, index) => (
            <ScrollRevealCSS
              key={item.name}
              duration={800}
              y={20}
              delay={index * 100}
            >
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-gold-300 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 bg-gold-50 rounded-full flex items-center justify-center mb-4">
                  <EquipmentIcon type={item.icon} />
                </div>
                <h3 className="font-serif text-lg text-gray-900 mb-2 tracking-[0.05em]">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {item.description}
                </p>
                <p className="text-2xl font-medium text-gold-600">
                  {item.price}
                </p>
              </div>
            </ScrollRevealCSS>
          ))}
        </div>

        {/* Deposit Notice */}
        <ScrollRevealCSS duration={800} y={20} delay={500} className="mt-12">
          <div className="bg-white rounded-lg p-6 border border-gray-200 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-900">About Deposits</span>
            </div>
            <p className="text-gray-600 text-sm">
              <strong>$50 keg deposit</strong> refunded when empty keg is
              returned within 7 days. Equipment deposits vary.{' '}
              <Link href="/contact" className="text-gold-600 hover:text-gold-700 underline">
                Contact us
              </Link>{' '}
              for details.
            </p>
          </div>
        </ScrollRevealCSS>
      </div>
    </section>
  );
}
