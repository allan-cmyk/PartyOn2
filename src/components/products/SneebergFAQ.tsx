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
      answer: 'Party On Delivery offers fast, convenient delivery of Pöschl Schneeberg Weiss nasal snuff throughout Austin, Texas. Order online and receive same-day delivery to Downtown Austin, South Austin, East Austin, West Austin, Lake Travis, Round Rock, Cedar Park, Pflugerville, and all surrounding areas. We\'re Austin\'s premier source for Schneeberg powder and other herbal snuff products.'
    },
    {
      question: 'What is Schneeberg powder?',
      answer: 'Schneeberg is a tobacco-free, nicotine-free herbal snuff made by Pöschl in Germany. It\'s a finely milled powder infused with refreshing peppermint that\'s designed for nasal use. Unlike traditional snuff, Schneeberg contains no tobacco leaves or nicotine, making it a safer alternative for those who enjoy the experience of nasal snuff without the harmful effects of tobacco.'
    },
    {
      question: 'Is Schneeberg snuff safe?',
      answer: 'Yes, Pöschl Schneeberg Weiss is tobacco-free and nicotine-free, made with herbal ingredients and peppermint essential oil. Because it contains no tobacco or nicotine, it doesn\'t carry the same health risks as traditional tobacco snuff products. However, as with any nasal product, use moderately and discontinue if irritation occurs.'
    },
    {
      question: 'Does Schneeberg contain tobacco or nicotine?',
      answer: 'No! Schneeberg Weiss is completely tobacco-free and nicotine-free. It\'s made from natural herbs and peppermint, making it a popular choice for people who want the snuff experience without tobacco\'s addictive and harmful properties.'
    },
    {
      question: 'How do you use Schneeberg nasal snuff?',
      answer: 'To use Schneeberg: Take a small pinch between your thumb and forefinger, hold it near your nostril, and gently inhale. The peppermint provides a refreshing, cooling sensation. If you\'re new to nasal snuff, start with a very small amount - you can always use more, but you can\'t use less once you\'ve inhaled it!'
    },
    {
      question: 'What does Schneeberg smell/taste like?',
      answer: 'Schneeberg Weiss has a strong, refreshing peppermint aroma and flavor. The peppermint provides a cool, invigorating sensation that many users find clears their sinuses and provides a mental boost. It\'s similar to the sensation of smelling peppermint oil or menthol, but more intense.'
    },
    {
      question: 'How quickly can I get Schneeberg delivered in Austin?',
      answer: 'We offer same-day delivery of Schneeberg snuff throughout the Austin area. Order online or by phone, and we\'ll deliver to your location in Austin, typically within a few hours depending on your location and our delivery schedule.'
    },
    {
      question: 'Is Schneeberg good for beginners?',
      answer: 'Yes! Schneeberg Weiss is an excellent choice for people new to nasal snuff. Because it\'s tobacco-free and nicotine-free, it provides the snuff experience without the intensity of traditional tobacco snuff. The peppermint flavor is also generally more pleasant for beginners than traditional tobacco snuff varieties.'
    },
    {
      question: 'What\'s the difference between Schneeberg and regular snuff?',
      answer: 'Traditional snuff contains tobacco and nicotine, while Schneeberg is completely tobacco-free and nicotine-free. Schneeberg is made from herbs and peppermint oil, making it non-addictive and safer than tobacco snuff. It provides a similar nasal experience with the refreshing sensation of peppermint rather than tobacco.'
    },
    {
      question: 'How long does a tin of Schneeberg last?',
      answer: 'A 10g tin of Schneeberg can last anywhere from a few days to several weeks, depending on how frequently you use it and how much you take each time. Most users find that a small pinch is sufficient, so a single tin lasts quite a while with moderate use.'
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
          <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-8 tracking-[0.08em] text-center">
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <LuxuryCard key={index} index={index}>
                <div className="p-6">
                  <h3 className="font-heading text-xl text-gray-900 mb-3 tracking-[0.05em]">
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
