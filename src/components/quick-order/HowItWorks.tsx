/**
 * @fileoverview How It Works section for Quick Order SEO
 * @module components/quick-order/HowItWorks
 */

import type { ReactElement } from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Browse & Add',
    description: 'Tap the green + button to add items to your cart. No sign-up required.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Schedule Delivery',
    description: 'Choose your delivery date and 2-hour time window. We deliver 7 days a week.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'We Deliver',
    description: 'Our TABC-certified team delivers to your door. ID required at delivery.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
];

/**
 * How It Works section - 3-step process for SEO and user trust
 */
export default function HowItWorks(): ReactElement {
  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl text-center text-gray-900 tracking-[0.1em] mb-2">
          HOW IT WORKS
        </h2>
        <div className="w-16 h-px bg-gold-400 mx-auto mb-10" />

        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full border-2 border-gold-400 flex items-center justify-center text-gold-600">
                {step.icon}
              </div>
              <div className="text-green-600 font-serif text-sm tracking-[0.2em] mb-2">
                STEP {step.number}
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.05em]">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
