import Script from 'next/script';
import { generateFAQSchema, generateEventSchema } from '@/lib/seo/schemas';

/**
 * Server-side schemas for bach-parties page
 * Must be a server component to ensure schemas are in initial HTML for crawlers
 */
export default function BachPartiesSchemas() {
  // FAQ Data for Schema
  const faqs = [
    {
      question: "Can you deliver to our Airbnb AND the party bus?",
      answer: "Yes! We coordinate multi-location deliveries all the time. Add our Multi-Stop Coordination service (+$150) and we'll handle timing between locations."
    },
    {
      question: "What if we run out of alcohol during the party?",
      answer: "Book our Emergency Backup Order (+$99) and we'll have extra bottles on standby for same-day delivery. Most bach groups add this for peace of mind."
    },
    {
      question: "How cold will the drinks be when delivered?",
      answer: "Ice cold. We use insulated coolers and deliver within 30 minutes of leaving our facility. Add Ice + Cooler service (+$49) to keep everything cold all night."
    },
    {
      question: "Can we split payment among the group?",
      answer: "One person books and pays, then you sort out splitting costs yourselves. This actually reduces group drama according to our customers."
    },
    {
      question: "What if weather ruins our Lake Travis plans?",
      answer: "We'll coordinate with you to redirect delivery to your backup location at no extra charge. Just give us 4+ hours notice for location changes."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);
  const eventSchema = generateEventSchema('party');

  return (
    <>
      {/* FAQ Schema */}
      <Script
        id="bach-parties-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        strategy="beforeInteractive"
      />

      {/* Event Schema */}
      <Script
        id="bach-parties-event-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        strategy="beforeInteractive"
      />
    </>
  );
}
