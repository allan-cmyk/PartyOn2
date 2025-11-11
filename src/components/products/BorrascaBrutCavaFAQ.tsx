import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { generateFAQSchema } from '@/lib/seo/schemas';
import LuxuryCard from '../LuxuryCard';

/**
 * FAQ section for Borrasca Brut Cava product page
 * Optimized for search queries: "cava austin", "sparkling wine austin", "champagne alternative wedding"
 */
export default function BorrascaBrutCavaFAQ() {
  const faqs = [
    {
      question: "Can I get Borrasca Brut Cava delivered in Austin?",
      answer: "Yes! We deliver Borrasca Brut Cava throughout Austin with same-day delivery. Order online or by phone and we'll bring this elegant Spanish sparkling wine to Downtown Austin, South Austin, East Austin, West Austin, Lake Travis, Round Rock, Cedar Park, and all surrounding areas. Perfect for weddings, celebrations, and special occasions."
    },
    {
      question: "What is Cava and how is it different from Champagne?",
      answer: "Cava is Spanish sparkling wine made using the traditional Champagne method (méthode champenoise) but produced in Spain's Penedès region near Barcelona. While Champagne comes from France, Cava uses different grape varieties and offers similar quality at a more affordable price. Borrasca Brut Cava has fine bubbles, crisp acidity, and elegant flavor - a perfect champagne alternative for toasts and celebrations."
    },
    {
      question: "Is Borrasca Brut Cava good for weddings?",
      answer: "Absolutely! Borrasca Brut Cava is an excellent choice for Austin weddings. It's elegant enough for toasts and ceremony celebrations but more affordable than French Champagne, allowing you to serve high-quality sparkling wine without breaking your budget. Many Austin wedding planners recommend Cava for receptions, cocktail hours, and champagne bars. The brut (dry) style pairs beautifully with wedding foods."
    },
    {
      question: "What does Borrasca Brut Cava taste like?",
      answer: "Borrasca Brut Cava is crisp, dry, and refreshing with fine, persistent bubbles. You'll taste green apple, citrus, white flowers, and subtle almond notes with bright acidity and a clean finish. The brut designation means it's dry (not sweet), making it perfect for toasts, pairing with food, and celebrating special occasions. It's elegant, balanced, and crowd-pleasing."
    },
    {
      question: "How should I serve Borrasca Cava?",
      answer: "Serve Borrasca Brut Cava well-chilled at 42-46°F in champagne flutes or white wine glasses. Chill in the refrigerator for 3-4 hours before serving, or use an ice bucket for quicker chilling. Open carefully by holding the cork and twisting the bottle (not the cork) to preserve bubbles. Pour slowly down the side of the glass to maintain the elegant fizz."
    },
    {
      question: "What food pairs well with Borrasca Brut Cava?",
      answer: "Borrasca Brut Cava pairs beautifully with appetizers, seafood, sushi, fried foods, soft cheeses, fruit, and light desserts. It's perfect for wedding cocktail hours with crostini, shrimp cocktail, oysters, cheese plates, and charcuterie. The crisp acidity cuts through rich foods while the bubbles cleanse the palate. It's also excellent with brunch dishes like eggs benedict and smoked salmon."
    },
    {
      question: "Is Cava a good value compared to Champagne?",
      answer: "Yes! Cava offers exceptional value because it's made using the same traditional method as Champagne but costs significantly less. You get similar quality, elegance, and fine bubbles at a fraction of the price. For weddings and large events, Cava allows you to serve premium sparkling wine to all your guests without the Champagne price tag. Many sommeliers prefer quality Cava over entry-level Champagne."
    },
    {
      question: "Can you deliver Borrasca Cava for New Year's Eve and special events?",
      answer: "Absolutely! We deliver Borrasca Brut Cava for New Year's Eve, anniversaries, birthday parties, engagement celebrations, and all special occasions throughout Austin. For holiday delivery during peak times (New Year's Eve, Valentine's Day), we recommend ordering in advance to ensure availability. We can deliver to homes, event venues, and hotels across the Austin area."
    },
    {
      question: "How many bottles of Cava do I need for my wedding or event?",
      answer: "For toasts only: Plan for 1 bottle per 6-8 people (one glass each). For cocktail hour: 1 bottle per 3-4 people (2-3 glasses each). For full reception bar: 1 bottle per 2-3 people. Example: For 100 wedding guests doing a champagne toast and cocktail hour, order 15-20 bottles of Borrasca Cava. We can help you calculate the right amount based on your event details."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* FAQ Schema Markup */}
      <Script
        id="borrasca-brut-cava-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-8 tracking-[0.15em] text-center">
            BORRASCA BRUT CAVA - FREQUENTLY ASKED QUESTIONS
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

          {/* Wedding CTA */}
          <div className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-lg border border-purple-200">
            <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em] text-center">
              PERFECT FOR AUSTIN WEDDINGS & CELEBRATIONS
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-center">
              Elegant Spanish sparkling wine for toasts, receptions, and special occasions. Champagne quality at better value. Delivered throughout Austin for weddings, anniversaries, and celebrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#add-to-cart"
                className="px-8 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm font-medium rounded text-center"
              >
                ORDER BORRASCA CAVA
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
