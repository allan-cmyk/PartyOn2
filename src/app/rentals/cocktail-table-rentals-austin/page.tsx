import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { generateFAQSchema, generateBreadcrumbSchema, generateServiceSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Cocktail Table Rentals Austin | High-Top Tables - Same Day Delivery',
  description: 'Rent cocktail tables in Austin for weddings, corporate events & parties. High-top tables, banquet tables, specialty tables delivered. Professional setup available. Order online.',
  keywords: 'cocktail table rentals austin, high top table rental, banquet table rental austin, event table rental, wedding table rental austin',
  openGraph: {
    title: 'Cocktail Table Rentals Austin | Event Table Delivery',
    description: 'Cocktail tables, banquet tables, and specialty tables delivered throughout Austin for weddings and events.',
    url: 'https://partyondelivery.com/rentals/cocktail-table-rentals-austin',
    type: 'website',
    images: ['/images/hero/lake-travis-sunset.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cocktail Table Rentals Austin',
    description: 'High-top cocktail tables and banquet tables delivered in Austin.',
    images: ['/images/hero/lake-travis-sunset.webp'],
  },
  alternates: {
    canonical: '/rentals/cocktail-table-rentals-austin',
  },
};

export default function CocktailTableRentalsAustinPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://partyondelivery.com/' },
    { name: 'Rentals', url: 'https://partyondelivery.com/rentals' },
    { name: 'Cocktail Table Rentals Austin', url: 'https://partyondelivery.com/rentals/cocktail-table-rentals-austin' },
  ];

  const faqs = [
    {
      question: 'What types of tables do you rent in Austin?',
      answer: 'We rent cocktail tables (high-top tables), 6-foot banquet tables, 8-foot banquet tables, and specialty tables for Austin events. Cocktail tables are 30" or 36" diameter and 42" tall—perfect for standing receptions, networking events, and wedding cocktail hours. Banquet tables seat 6-10 guests and are ideal for seated dinners.',
    },
    {
      question: 'Do you provide table linens and setup?',
      answer: 'We can coordinate table linen rentals through our Austin vendor partners. Setup service is available for an additional fee—our team will position tables according to your floor plan and event layout. This is especially helpful for weddings at venues like The Driskill, Barr Mansion, and Treaty Oak.',
    },
    {
      question: 'How many cocktail tables do I need for my Austin event?',
      answer: 'For cocktail receptions, plan 1 cocktail table per 6-8 standing guests. For a 100-person cocktail hour, you would need 12-15 high-top tables. If you are combining cocktail tables with food stations or a bar, you may need fewer tables. Our team can help you determine the right quantity based on your Austin venue layout.',
    },
    {
      question: 'Can you deliver tables to outdoor Austin venues?',
      answer: 'Yes! We deliver cocktail tables and banquet tables to outdoor venues throughout Austin including Zilker Park pavilions, Lady Bird Lake venues, private ranches, lakefront properties, and backyard events. Tables are stable on grass, concrete, and gravel surfaces. We also deliver to Lake Travis waterfront venues.',
    },
    {
      question: 'Do you offer same-day table delivery in Austin?',
      answer: 'Same-day delivery is available based on inventory and location. For weddings and large corporate events, we recommend booking 72 hours in advance to ensure availability. Rush delivery may be available for an additional fee to Downtown Austin, South Congress, and nearby areas.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const serviceSchema = generateServiceSchema();

  return (
    <>
      {/* Structured Data */}
      <Script
        id="table-rentals-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="table-rentals-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="table-rentals-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <main className="bg-white">
        {/* Breadcrumb Navigation */}
        <nav className="py-4 px-8 bg-gray-50" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-700 hover:text-gold-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">›</span>
              </li>
              <li>
                <Link href="/rentals" className="text-gray-700 hover:text-gold-600 transition-colors">
                  Rentals
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">›</span>
              </li>
              <li>
                <span className="text-gray-500 font-medium">Cocktail Table Rentals Austin</span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-6 tracking-[0.15em]">
              COCKTAIL TABLE RENTALS AUSTIN
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
              Premium cocktail tables, banquet tables, and specialty tables delivered throughout Austin
              for weddings, corporate events, and receptions. Professional setup available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <button className="px-8 py-4 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm font-medium">
                  REQUEST QUOTE
                </button>
              </Link>
              <a href="tel:7373719700">
                <button className="px-8 py-4 border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-white transition-all duration-300 tracking-[0.15em] text-sm font-medium">
                  CALL (737) 371-9700
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Table Options */}
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl text-gray-900 mb-12 tracking-[0.15em] text-center">
              TABLE RENTAL OPTIONS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <h3 className="font-serif text-3xl text-gray-900 mb-4 tracking-[0.1em]">
                  Cocktail Tables
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  High-top cocktail tables (42" tall) perfect for standing receptions, networking events,
                  and wedding cocktail hours. Available in 30" and 36" diameter.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>30" diameter: $12 per table</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>36" diameter: $15 per table</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Seats 3-4 standing guests</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Perfect for cocktail receptions</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <h3 className="font-serif text-3xl text-gray-900 mb-4 tracking-[0.1em]">
                  Banquet Tables
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Standard 30" height rectangular tables for seated dinners, buffets, and displays.
                  Sturdy and professional for Austin weddings and corporate events.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>6-foot table: $18 per table (seats 6)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>8-foot table: $22 per table (seats 8-10)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Folding design for easy setup</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Ideal for weddings and dinners</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700">
                <strong>Bulk Discounts:</strong> Order 10+ tables and save 10%. Order 20+ tables and save 15%.
                Setup service available for $100-$200 depending on quantity and venue location.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl text-gray-900 mb-12 tracking-[0.15em] text-center">
              PERFECT FOR AUSTIN EVENTS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Wedding Receptions
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Cocktail tables for pre-reception drinks and banquet tables for seated dinners.
                  Popular at The Driskill, Barr Mansion, and Laguna Gloria.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Corporate Events
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  High-top cocktail tables perfect for networking mixers, trade shows, and
                  corporate receptions in Downtown Austin.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Private Parties
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Birthday parties, anniversary celebrations, and backyard gatherings.
                  Perfect for Lake Travis boat parties and outdoor events.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl text-gray-900 mb-12 tracking-[0.15em] text-center">
              FREQUENTLY ASKED QUESTIONS
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="font-serif text-xl text-gray-900 mb-3 tracking-[0.05em]">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl mb-6 tracking-[0.15em]">
              RENT TABLES FOR YOUR EVENT
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Cocktail tables & banquet tables delivered throughout Austin • Setup available
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/contact">
                <button className="px-10 py-4 bg-gold-600 text-gray-900 hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm font-medium">
                  REQUEST QUOTE
                </button>
              </Link>
              <Link href="/rentals">
                <button className="px-10 py-4 border-2 border-gold-600 text-white hover:bg-gold-600 hover:text-gray-900 transition-all duration-300 tracking-[0.15em] text-sm font-medium">
                  VIEW ALL RENTALS
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
