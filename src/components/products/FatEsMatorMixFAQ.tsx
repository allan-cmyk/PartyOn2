import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { generateFAQSchema } from '@/lib/seo/schemas';
import LuxuryCard from '../LuxuryCard';

/**
 * FAQ section for Fat E's Spicy Mator Mix product page
 * Optimized for search queries: "fat e bloody mary mix", "bloody mary mix austin", "spicy bloody mary mix"
 */
export default function FatEsMatorMixFAQ() {
  const faqs = [
    {
      question: "How quickly can I get Fat E's Spicy Mator Mix delivered in Austin?",
      answer: "We offer same-day delivery of Fat E's Spicy Mator Mix throughout Austin. Order online or by phone and we'll deliver to Downtown Austin, South Austin, East Austin, West Austin, Lake Travis, Round Rock, Cedar Park, and all surrounding areas. Perfect for last-minute brunch parties and events."
    },
    {
      question: "What makes Fat E's Spicy Mator Mix special?",
      answer: "Fat E's Spicy Mator Mix is a premium bloody mary mix with bold, authentic spicy flavor. Unlike watered-down store brands, Fat E's uses high-quality tomato juice and a perfect blend of spices including horseradish, Worcestershire, hot sauce, and celery salt. It's thick, flavorful, and has the perfect kick for serious bloody mary lovers."
    },
    {
      question: "How spicy is Fat E's Mator Mix?",
      answer: "Fat E's Spicy Mator Mix has a medium-high spice level with great flavor balance. It's got a nice kick from hot sauce and horseradish but won't overwhelm you. The heat builds gradually and complements the savory umami flavors. If you want extra heat, it's easy to add more hot sauce. If you prefer mild, stick with the original Fat E's Mator Mix."
    },
    {
      question: "Is Fat E's Spicy Mator Mix good for brunch parties and weddings?",
      answer: "Absolutely! Fat E's Spicy Mator Mix is perfect for Austin brunch parties, wedding receptions, corporate events, and bloody mary bars. The bold flavor impresses guests and pairs excellently with premium vodka or tequila. Many Austin wedding planners and caterers specifically request Fat E's for bloody mary bars because of its authentic taste and thick consistency."
    },
    {
      question: "What vodka pairs best with Fat E's Spicy Mator Mix?",
      answer: "Fat E's pairs beautifully with premium vodkas like Tito's Handmade Vodka (a Texas favorite), Grey Goose, or Ketel One. For a twist, try it with tequila for a spicy bloody maria, or with gin for a red snapper. The mix is flavorful enough to complement top-shelf spirits without being overpowered."
    },
    {
      question: "How do I create a bloody mary bar with Fat E's?",
      answer: "For an amazing bloody mary bar, start with Fat E's Spicy Mator Mix and premium vodka. Add garnishes: celery sticks, pickles, olives, lemon wedges, lime wedges, hot sauce, Worcestershire, bacon strips, shrimp, cheese cubes, and pepperoni. Rim glasses with celery salt or Old Bay seasoning. For parties of 20-30 people, order 3-4 bottles of Fat E's mix and 2 bottles of vodka."
    },
    {
      question: "Can I get Fat E's delivered to my Austin wedding venue?",
      answer: "Yes! We deliver Fat E's Spicy Mator Mix to wedding venues, hotels, private homes, and event spaces throughout Austin. We work with wedding planners and caterers to ensure timely delivery. Many Austin couples create bloody mary bars for morning-after brunch or daytime receptions using Fat E's mix."
    },
    {
      question: "What areas of Austin do you deliver Fat E's to?",
      answer: "We deliver Fat E's Spicy Mator Mix throughout the greater Austin area including Downtown, South Austin (Zilker, South Lamar, South Congress), East Austin, West Austin (Tarrytown, Westlake), North Austin, Lake Travis, Round Rock, Cedar Park, Pflugerville, Georgetown, Leander, and Bee Cave. We also deliver to event venues, wedding locations, and hotels."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* FAQ Schema Markup */}
      <Script
        id="fat-es-mator-mix-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-8 tracking-[0.15em] text-center">
            FAT E&apos;S SPICY MATOR MIX - FREQUENTLY ASKED QUESTIONS
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

          {/* Austin Delivery CTA */}
          <div className="mt-12 text-center bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
              READY TO ORDER FAT E&apos;S IN AUSTIN?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get Fat E&apos;s Spicy Mator Mix delivered throughout Austin for your brunch party, wedding bloody mary bar, or special event. Same-day delivery available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#add-to-cart"
                className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium rounded"
              >
                ADD TO CART
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors tracking-[0.1em] text-sm font-medium rounded"
              >
                CONTACT US
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
