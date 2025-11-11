import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { generateFAQSchema } from '@/lib/seo/schemas';
import LuxuryCard from '../LuxuryCard';

/**
 * FAQ section for Pinthouse Electric Jellyfish IPA product page
 * Optimized for search queries: "electric jellyfish beer", "pinthouse beer austin", "local austin ipa"
 */
export default function PinthouseElectricJellyfishFAQ() {
  const faqs = [
    {
      question: "Can I get Pinthouse Electric Jellyfish IPA delivered in Austin?",
      answer: "Yes! We deliver Pinthouse Electric Jellyfish IPA throughout Austin with same-day delivery. Order online or by phone and we'll bring this award-winning local Austin beer to Downtown, South Austin, East Austin, West Austin, Lake Travis, Round Rock, Cedar Park, and all surrounding areas. Support local Austin breweries with convenient delivery."
    },
    {
      question: "What makes Pinthouse Electric Jellyfish special?",
      answer: "Electric Jellyfish is Pinthouse Brewing's flagship IPA and one of Austin's most beloved local beers. It's a well-balanced American IPA with tropical fruit flavors, citrus notes, and a smooth finish. Brewed right here in Austin, it's won multiple awards and is a favorite among craft beer enthusiasts. The 16oz cans are perfect for parties, tailgates, and supporting local Austin breweries."
    },
    {
      question: "Is Pinthouse Electric Jellyfish good for parties and events?",
      answer: "Absolutely! Electric Jellyfish is perfect for Austin events, parties, and celebrations where you want to showcase local craft beer. The 16oz 4-pack cans are ideal for sharing, and the balanced flavor appeals to both IPA lovers and craft beer newcomers. Many Austin wedding planners and event coordinators specifically request Pinthouse beers to support local businesses and impress guests."
    },
    {
      question: "Where is Pinthouse Brewing located?",
      answer: "Pinthouse Brewing has multiple locations in Austin, including their original brewpub on Burnet Road and their production facility in South Austin. They're one of Austin's premier craft breweries, known for Electric Jellyfish and other award-winning beers. When you order from Party On Delivery, you're supporting this beloved local Austin business."
    },
    {
      question: "What does Electric Jellyfish taste like?",
      answer: "Electric Jellyfish is a medium-bodied American IPA with tropical fruit flavors (pineapple, mango), citrus notes (grapefruit, orange), and a pleasant hop bitterness that's not overwhelming. It has a smooth, slightly sweet malt backbone and a clean finish. The ABV is around 6.5%, making it sessionable for parties. It's hop-forward but balanced - perfect for IPA fans and approachable for craft beer newcomers."
    },
    {
      question: "Can I order Pinthouse Electric Jellyfish for my Austin wedding?",
      answer: "Yes! We deliver Pinthouse Electric Jellyfish to Austin wedding venues, hotels, and event spaces. Many couples choose Electric Jellyfish for their reception bars or rehearsal dinners because it's a high-quality local beer that showcases Austin's craft brewing scene. We can deliver multiple 4-packs for weddings of any size throughout the Austin area."
    },
    {
      question: "What food pairs well with Pinthouse Electric Jellyfish?",
      answer: "Electric Jellyfish pairs beautifully with BBQ (brisket, ribs, pulled pork), burgers, pizza, spicy foods (Thai, Indian, Mexican), fried chicken, grilled fish, and cheese plates. The hop bitterness cuts through rich, fatty foods while the citrus and tropical notes complement spicy and savory flavors. It's an excellent all-purpose beer for Austin parties and events."
    },
    {
      question: "How quickly can I get Electric Jellyfish delivered?",
      answer: "We offer same-day delivery of Pinthouse Electric Jellyfish throughout the Austin area. Order in the morning for afternoon/evening delivery, or schedule delivery in advance for events and parties. We deliver to homes, offices, event venues, and hotels across Austin, including Downtown, South Lamar, East Austin, Lake Travis, and surrounding areas."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* FAQ Schema Markup */}
      <Script
        id="pinthouse-electric-jellyfish-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-8 tracking-[0.15em] text-center">
            PINTHOUSE ELECTRIC JELLYFISH - FREQUENTLY ASKED QUESTIONS
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

          {/* Support Local CTA */}
          <div className="mt-12 bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em] text-center">
              SUPPORT LOCAL AUSTIN BREWERIES
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-center">
              Order Pinthouse Electric Jellyfish IPA delivered throughout Austin. Award-winning local craft beer perfect for parties, weddings, and events. Same-day delivery available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#add-to-cart"
                className="px-8 py-3 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium rounded text-center"
              >
                ORDER ELECTRIC JELLYFISH
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors tracking-[0.1em] text-sm font-medium rounded text-center"
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
