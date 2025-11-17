import { generateFAQSchema, generateEventSchema } from '@/lib/seo/schemas';

/**
 * Server-side schemas for boat-parties page
 * Uses regular script tags (not Next.js Script component) to ensure schemas
 * are in initial HTML for search engine crawlers
 */
export default function BoatPartiesSchemas() {
  // FAQ Data for Schema
  const faqs = [
    {
      question: "Can you deliver to our boat at the marina?",
      answer: "Yes! We deliver to all Lake Travis marinas and can coordinate with your rental company. Just provide the dock number and boat name when ordering."
    },
    {
      question: "How do we handle drinks in the Texas heat?",
      answer: "All deliveries include insulated coolers and ice packs. For longer trips, add our Ice Replenishment service ($49) for a second cooler delivery mid-day."
    },
    {
      question: "What's the minimum order for Lake Travis delivery?",
      answer: "Lake Travis deliveries have a $200 minimum due to distance. Most boat parties order $300-500 worth for 8-12 people."
    },
    {
      question: "Can you deliver to Devil's Cove?",
      answer: "We deliver to marinas only, not open water. Most groups get delivery at the marina before departure or arrange a mid-day dock meetup."
    },
    {
      question: "What if our boat rental gets canceled?",
      answer: "Cancel or modify your delivery up to 24 hours before your scheduled time for a full refund. We understand weather happens on the lake!"
    }
  ];

  const faqSchema = generateFAQSchema(faqs);
  const eventSchema = generateEventSchema('boat');

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
