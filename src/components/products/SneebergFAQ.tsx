import React from 'react';
import Script from 'next/script';
import { generateFAQSchema } from '@/lib/seo/schemas';
import LuxuryCard from '../LuxuryCard';

/**
 * FAQ section specifically for Schneeberg snuff product page
 * Optimized for search queries: "schneeberg powder", "schneeberg snuff", "schneeberg snuff where to buy"
 */
export default function SneebergFAQ() {
  const faqs = [
    {
      question: 'Where can I buy Schneeberg snuff in Austin?',
      answer: 'Party On Delivery offers fast delivery of Pöschl Schneeberg Weiss nasal snuff throughout Austin, Texas. Order online and receive delivery to Downtown Austin, South Austin, East Austin, Lake Travis, and surrounding areas.'
    },
    {
      question: 'What is Schneeberg powder?',
      answer: 'Schneeberg is a tobacco-free, nicotine-free herbal snuff made by Pöschl. It\'s a refreshing nasal snuff with a peppermint flavor that provides a cooling sensation. Unlike traditional snuff, it contains no tobacco or nicotine.'
    },
    {
      question: 'Is Schneeberg snuff safe?',
      answer: 'Yes, Pöschl Schneeberg Weiss is tobacco-free and nicotine-free, made with herbal ingredients and peppermint. It\'s a safer alternative to traditional tobacco snuff products.'
    },
    {
      question: 'How quickly can I get Schneeberg delivered in Austin?',
      answer: 'We offer same-day delivery of Schneeberg snuff throughout the Austin area. Order online or by phone for convenient delivery to your location.'
    },
    {
      question: 'How do you use Schneeberg nasal snuff?',
      answer: 'Take a small pinch of Schneeberg powder between your thumb and forefinger, hold it near your nostril, and gently inhale. The peppermint provides a refreshing, cooling sensation. Start with a small amount if you\'re new to nasal snuff.'
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* FAQ Schema Markup */}
      <Script
        id="schneeberg-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-8 tracking-[0.15em] text-center">
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <LuxuryCard key={index} index={index}>
                <div className="p-6">
                  <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.05em]">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </LuxuryCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
