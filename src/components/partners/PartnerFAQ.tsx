'use client';

import { useState, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PartnerFAQ as PartnerFAQType } from '@/lib/partners/types';

interface PartnerFAQProps {
  faqs: PartnerFAQType[];
  title?: string;
}

interface FAQItemProps {
  faq: PartnerFAQType;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Single FAQ accordion item
 */
function FAQItem({ faq, isOpen, onToggle }: FAQItemProps): ReactElement {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 group-hover:text-gold-700 transition-colors pr-4">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-gray-600 leading-relaxed">
              <p>{faq.answer}</p>
              {faq.link && (
                <a
                  href={faq.link.url}
                  target={faq.link.external ? '_blank' : undefined}
                  rel={faq.link.external ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-1 mt-3 text-gold-600 hover:text-gold-700 font-medium transition-colors"
                >
                  {faq.link.text}
                  {faq.link.external && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                  {!faq.link.external && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * FAQ section for partner pages
 * Displays an accordion-style list of FAQs
 */
export default function PartnerFAQ({
  faqs,
  title = 'Frequently Asked Questions',
}: PartnerFAQProps): ReactElement {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-wide">
            {title}
          </h2>
          <div className="w-20 h-px bg-gold-500 mx-auto" />
        </div>

        {/* FAQ List */}
        <div className="bg-gray-50 rounded-xl p-6 md:p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
