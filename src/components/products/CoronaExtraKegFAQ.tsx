import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { generateFAQSchema } from '@/lib/seo/schemas';
import LuxuryCard from '../LuxuryCard';

/**
 * FAQ section for Corona Extra Keg product page
 * Optimized for search queries: "corona keg austin", "corona keg lake travis", "corona keg delivery"
 */
export default function CoronaExtraKegFAQ() {
  const faqs = [
    {
      question: "Can you deliver Corona Extra kegs to Lake Travis?",
      answer: "Yes! We deliver Corona Extra kegs throughout the Lake Travis area including lakefront properties, vacation rentals, boat docks, and lake houses. Corona is perfect for Lake Travis boat parties, summer gatherings, and waterfront events. We deliver to Lakeway, Spicewood, Volente, Jonestown, and all Lake Travis communities."
    },
    {
      question: "How many drinks does a Corona Extra keg serve?",
      answer: "A Corona Extra 1/2 barrel keg holds 15.5 gallons and serves approximately 165 twelve-ounce servings. This is enough for a party of 50-80 people with 2-3 beers each. Perfect for Lake Travis boat parties, tailgates, beach-themed events, and summer celebrations. For larger parties, order multiple kegs."
    },
    {
      question: "Do you provide limes and garnishes with Corona kegs?",
      answer: "While we don't provide produce, we can deliver everything else you need: taps, ice tubs, cups, and other party supplies. For the authentic Corona experience, pick up fresh limes from your local grocery store. Pro tip: Plan for 1-2 limes per person for a proper Corona party with lime wedges in every beer."
    },
    {
      question: "Is Corona Extra good for summer parties and lake events?",
      answer: "Absolutely! Corona Extra is THE classic summer party beer and a Lake Travis favorite. Its light, crisp flavor is perfect for hot Austin days, boat parties, pool parties, and outdoor gatherings. The iconic beach-beer vibe makes it ideal for tropical-themed parties, Cinco de Mayo celebrations, and summer weddings."
    },
    {
      question: "What areas of Austin do you deliver Corona kegs to?",
      answer: "We deliver Corona Extra kegs throughout Austin including Downtown, South Austin, East Austin, West Austin, North Austin, and especially Lake Travis areas. We also deliver to Round Rock, Cedar Park, Pflugerville, Lakeway, and Bee Cave. Popular delivery locations include lake houses, boat docks, outdoor venues, and backyard parties."
    },
    {
      question: "Do you rent taps and ice tubs for Corona kegs?",
      answer: "Yes! We offer complete keg packages including tap rentals, ice tubs, and cups. You can add these items when ordering your Corona keg. We'll deliver everything needed for your party. CO2 systems and jockey boxes are also available for multi-day events or if you want to keep the keg fresh longer."
    },
    {
      question: "How do I keep a Corona keg cold at outdoor events?",
      answer: "Use an ice tub (available for rent) filled with ice to keep your Corona keg at 38-40°F. For Lake Travis and outdoor parties, plan for 40-60 pounds of ice and refresh as needed, especially in hot Texas weather. A cold keg pours better, tastes better, and stays carbonated. Consider a shaded area for the keg to minimize ice melting."
    },
    {
      question: "Can you deliver Corona kegs for tailgates and game day parties?",
      answer: "Absolutely! Corona kegs are perfect for UT football tailgates, Austin FC watch parties, and game day celebrations. We deliver to homes, parking lots (check venue rules), and permitted tailgate areas throughout Austin. Schedule your delivery the day before big games to ensure availability during peak demand."
    },
    {
      question: "How quickly can I get a Corona keg delivered?",
      answer: "We offer same-day delivery of Corona Extra kegs throughout Austin and Lake Travis based on availability. For weekend parties, lake events, or holiday celebrations, we recommend ordering in advance to guarantee delivery at your preferred time. We can coordinate delivery times for events and parties."
    },
    {
      question: "What's the best way to serve Corona from a keg?",
      answer: "Serve Corona Extra from a keg at 38-40°F in chilled glasses or cups with lime wedges on the side. While bottled Corona is traditionally served with lime stuffed in the neck, keg Corona is poured into glasses - provide a bowl of lime wedges for guests to add to their drinks. The fresh draft Corona actually tastes even better than bottles!"
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* FAQ Schema Markup */}
      <Script
        id="corona-extra-keg-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-8 tracking-[0.15em] text-center">
            CORONA EXTRA KEG - FREQUENTLY ASKED QUESTIONS
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

          {/* Lake Travis CTA */}
          <div className="mt-12 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-lg border border-blue-200">
            <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em] text-center">
              PERFECT FOR LAKE TRAVIS PARTIES
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-center">
              Corona Extra kegs delivered to Lake Travis, Austin, and surrounding areas. Perfect for boat parties, summer celebrations, and outdoor events. Order with tap and tub rental for the complete party setup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#add-to-cart"
                className="px-8 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium rounded text-center"
              >
                ORDER CORONA KEG
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white text-gray-900 hover:bg-gray-100 transition-colors tracking-[0.1em] text-sm font-medium rounded text-center border border-gray-300"
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
