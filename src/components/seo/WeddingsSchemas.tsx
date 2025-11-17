import { generateFAQSchema, generateEventSchema } from '@/lib/seo/schemas';

/**
 * Server-side schemas for weddings page
 * Uses regular script tags (not Next.js Script component) to ensure schemas
 * are in initial HTML for search engine crawlers
 */
export default function WeddingsSchemas() {
  // FAQ Data for Schema
  const faqs = [
    {
      question: "Can you provide bartenders for our wedding?",
      answer: "Yes! All our bartenders are TABC-certified and experienced with weddings. Packages start at $250 for 4 hours and include setup, service, and cleanup."
    },
    {
      question: "Do you handle champagne service for toasts?",
      answer: "Absolutely. We coordinate champagne service timing with your wedding planner or venue coordinator to ensure perfect toast moments."
    },
    {
      question: "What's included in a signature cocktail package?",
      answer: "Our signature cocktail packages include custom recipe development, all ingredients, garnishes, specialty glassware, and a dedicated bartender to make them."
    },
    {
      question: "How far in advance should we book?",
      answer: "We recommend booking 2-3 months in advance for peak wedding season (April-October). For off-season weddings, 4-6 weeks is usually sufficient."
    },
    {
      question: "Can you accommodate dietary restrictions?",
      answer: "Yes! We offer non-alcoholic signature mocktails, low-sugar options, and can work with specific dietary requirements. Just let us know during planning."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);
  const eventSchema = generateEventSchema('wedding');

  return (
    <>
      {/* FAQ Schema - static HTML for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Event Schema - static HTML for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
    </>
  );
}
