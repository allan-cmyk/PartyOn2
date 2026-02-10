/**
 * @fileoverview FAQ accordion section for Quick Order SEO
 * @module components/quick-order/QuickOrderFAQs
 */

'use client';

import { useState, type ReactElement } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'What is the minimum order for alcohol delivery in Austin?',
    answer: 'Our minimum order is $100 for most Austin areas. Some locations like Lake Travis may have a higher minimum of $150. There is no minimum for express delivery orders.',
  },
  {
    question: 'How fast can you deliver alcohol in Austin?',
    answer: 'We offer scheduled delivery with 2-hour windows, available 7 days a week from 10am-9pm. For last-minute needs, our express delivery option can get your order to you within 2-3 hours for an additional fee.',
  },
  {
    question: 'What areas do you deliver to in Austin?',
    answer: 'We deliver throughout the Greater Austin area including Downtown, South Congress, East Austin, Lake Travis, Cedar Park, Round Rock, and surrounding neighborhoods. Enter your zip code at checkout to confirm we deliver to your location.',
  },
  {
    question: 'Do I need to be 21 to order alcohol delivery?',
    answer: 'Yes, you must be 21 or older to order alcohol. A valid government-issued ID is required at the time of delivery. Our TABC-certified drivers will verify your age before handing over your order.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, Apple Pay, Google Pay, and Shop Pay for a seamless checkout experience. Payment is processed securely through Shopify.',
  },
  {
    question: 'Can I schedule a delivery for a party or event?',
    answer: 'Absolutely! We specialize in party and event deliveries. Schedule your delivery up to 30 days in advance and we will arrive at your specified time. For large orders or special events, contact us for custom arrangements.',
  },
];

/**
 * FAQ accordion component with expand/collapse functionality
 */
export default function QuickOrderFAQs(): ReactElement {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-heading text-2xl md:text-3xl text-center text-gray-900 tracking-[0.1em] mb-2">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div className="w-16 h-px bg-brand-yellow mx-auto mb-10" />

        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-yellow-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-5 py-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Schema.org FAQ structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
