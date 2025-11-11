import React from 'react';
import Script from 'next/script';
import { generateFAQSchema } from '@/lib/seo/schemas';
import LuxuryCard from '../LuxuryCard';

/**
 * FAQ section for Miller Lite Keg product page
 * Optimized for search queries: "miller lite keg austin", "miller lite keg delivery", "how many beers in a keg"
 */
export default function MillerLiteKegFAQ() {
  const faqs = [
    {
      question: "How quickly can I get a Miller Lite keg delivered in Austin?",
      answer: "We offer same-day delivery of Miller Lite kegs throughout Austin based on availability. For guaranteed delivery at a specific time (such as for weddings or events), we recommend scheduling your order in advance. We deliver to Downtown Austin, South Austin, Lake Travis, Round Rock, Cedar Park, and all surrounding areas."
    },
    {
      question: "How many people does a 1/2 barrel Miller Lite keg serve?",
      answer: "A 1/2 barrel keg (15.5 gallons) serves approximately 165 twelve-ounce beers. This is typically enough for a party of 50-80 people, assuming each person has 2-3 beers throughout the event. For larger events or longer parties, we recommend ordering multiple kegs to ensure you don't run out."
    },
    {
      question: "Do you provide taps and other keg equipment?",
      answer: "Yes! We offer tap rentals, ice tubs, and cups for all keg orders. You can add these items to your cart when ordering your Miller Lite keg. We'll deliver everything you need to serve beer at your Austin event. Standard party taps, CO2 systems, and jockey boxes are all available for rent."
    },
    {
      question: "Is Miller Lite a good choice for weddings and events?",
      answer: "Absolutely! Miller Lite is one of the most popular choices for Austin weddings, corporate events, and parties because of its light, approachable flavor that appeals to a wide range of guests. It's an affordable option that doesn't sacrifice quality. Many Austin wedding planners specifically recommend Miller Lite for reception bars."
    },
    {
      question: "What areas of Austin do you deliver Miller Lite kegs to?",
      answer: "We deliver Miller Lite kegs throughout the greater Austin area including Downtown, South Austin, East Austin, West Austin, North Austin, Lake Travis, Round Rock, Cedar Park, and Pflugerville. We also deliver to event venues, wedding locations, hotels, and outdoor spaces (where alcohol is permitted)."
    },
    {
      question: "How long does a keg stay fresh after tapping?",
      answer: "Once tapped with a standard party pump, a keg will stay fresh for about 8-12 hours. If you're using a CO2 system (available for rental), the keg will stay fresh for several weeks when properly stored in a refrigerator. For parties, we recommend consuming the keg the same day it's tapped for best quality and carbonation."
    },
    {
      question: "How much does a Miller Lite keg cost to serve my party?",
      answer: "A Miller Lite 1/2 barrel keg is one of the most cost-effective ways to serve beer at parties and events. When you calculate the per-serving cost (approximately 165 beers per keg), it's significantly cheaper than buying cases of bottles or cans. Add in tap and tub rental, and you still save money while impressing your guests with fresh draft beer."
    },
    {
      question: "Can you deliver Miller Lite kegs to outdoor venues and parks?",
      answer: "Yes, we can deliver Miller Lite kegs to outdoor venues, private properties, and permitted locations throughout Austin. However, please check local regulations - many Austin parks prohibit alcohol. We frequently deliver to backyards, private lake houses, ranch venues, and permitted outdoor event spaces. For Lake Travis boat parties, we deliver to docks and lakefront properties."
    },
    {
      question: "What's the difference between 1/2 barrel, 1/4 barrel, and 1/6 barrel kegs?",
      answer: "A 1/2 barrel (full-size keg) holds 15.5 gallons and serves about 165 beers. A 1/4 barrel (pony keg) holds 7.75 gallons and serves about 82 beers - perfect for smaller parties of 25-40 people. A 1/6 barrel (sixtel) holds 5.16 gallons and serves about 55 beers - ideal for intimate gatherings of 15-25 people. We carry all sizes of Miller Lite kegs."
    },
    {
      question: "Do I need to refrigerate my Miller Lite keg?",
      answer: "Yes! Keep your Miller Lite keg cold from delivery until serving. We recommend ice tubs (available for rental) filled with ice to keep the keg at proper temperature (38-40°F). A warm keg will foam excessively and beer won't taste as good. Plan for 40-60 pounds of ice for a 1/2 barrel keg, refreshing ice as needed throughout your event."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* FAQ Schema Markup */}
      <Script
        id="miller-lite-keg-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-8 tracking-[0.15em] text-center">
            MILLER LITE KEG - FREQUENTLY ASKED QUESTIONS
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

          {/* Keg Calculator Helper */}
          <div className="mt-12 bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em] text-center">
              HOW MUCH BEER DO I NEED?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Small Party (20-30 people)</h4>
                <p className="text-gray-600 text-sm">1/4 barrel or 1/6 barrel keg</p>
              </div>
              <div className="text-center p-4 bg-gold-50 rounded border border-gold-200">
                <h4 className="font-medium text-gray-900 mb-2">Medium Party (40-60 people)</h4>
                <p className="text-gray-600 text-sm">1/2 barrel keg (most popular)</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Large Party (80-100 people)</h4>
                <p className="text-gray-600 text-sm">Two 1/2 barrel kegs</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mb-6">
              <strong>Pro tip:</strong> Plan for 2 drinks per person in the first hour, then 1 drink per hour after that.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#add-to-cart"
                className="px-8 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium rounded text-center"
              >
                ORDER MILLER LITE KEG
              </a>
              <a
                href="/contact"
                className="px-8 py-3 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors tracking-[0.1em] text-sm font-medium rounded text-center"
              >
                CONTACT US
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
