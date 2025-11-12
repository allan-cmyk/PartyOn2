import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { generateFAQSchema, generateBreadcrumbSchema, generateServiceSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Chair Rentals Austin | White Folding Chairs - Same Day Delivery',
  description: 'Rent white folding chairs in Austin with same-day delivery. Perfect for weddings, events & parties. Serving Downtown, Lake Travis & more. Professional setup available. Order online now.',
  keywords: 'chair rentals austin, white folding chairs, event chair rental, wedding chair rental, chair rental near me, austin party chair rental',
  openGraph: {
    title: 'Chair Rentals Austin | White Folding Chairs',
    description: 'Rent white folding chairs with same-day delivery in Austin. Professional setup available.',
    url: 'https://partyondelivery.com/rentals/chair-rentals-austin',
    type: 'website',
    images: ['/images/hero/lake-travis-sunset.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chair Rentals Austin | Same-Day Delivery',
    description: 'White folding chairs delivered throughout Austin for weddings and events.',
    images: ['/images/hero/lake-travis-sunset.webp'],
  },
  alternates: {
    canonical: '/rentals/chair-rentals-austin',
  },
};

export default function ChairRentalsAustinPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://partyondelivery.com/' },
    { name: 'Rentals', url: 'https://partyondelivery.com/rentals' },
    { name: 'Chair Rentals Austin', url: 'https://partyondelivery.com/rentals/chair-rentals-austin' },
  ];

  const faqs = [
    {
      question: 'Do you offer same-day chair delivery in Austin?',
      answer: 'Yes! We offer same-day delivery for chair rentals throughout Austin based on availability. For guaranteed delivery at a specific time (such as for weddings or events), we recommend scheduling your order 72 hours in advance. We deliver to Downtown Austin, South Austin, Lake Travis, Round Rock, Cedar Park, and all surrounding areas.',
    },
    {
      question: 'How many white folding chairs do I need for my event?',
      answer: 'For seated dinners, plan for one chair per guest plus 5-10% extra for replacements. For cocktail parties, estimate chairs for 60-70% of guests. Wedding ceremonies typically need chairs for 100% of guests, while receptions may need fewer if you have standing cocktail areas. Our team can help you determine the perfect quantity.',
    },
    {
      question: 'Do you provide chair setup service in Austin?',
      answer: 'Yes! We offer professional chair setup service for an additional fee. Our team will arrange chairs in your preferred configuration—ceremony rows, banquet style, theater seating, or custom layouts. Setup service is especially popular for weddings at venues like The Allan House, Laguna Gloria, and Mercury Hall.',
    },
    {
      question: 'What areas of Austin do you deliver chairs to?',
      answer: 'We deliver white folding chairs throughout the greater Austin area including Downtown, South Austin, East Austin, West Austin, North Austin, Lake Travis, Westlake Hills, Round Rock, Cedar Park, Pflugerville, and Bee Cave. We also deliver to wedding venues, event spaces, hotels, Airbnbs, and outdoor locations where permitted.',
    },
    {
      question: 'Can you deliver chairs to outdoor venues and parks?',
      answer: 'Yes, we can deliver white folding chairs to outdoor venues, private properties, and permitted outdoor locations throughout Austin. Popular outdoor venues include Zilker Park pavilions, private lake houses, ranch venues, and backyard events. Please verify that your venue or park allows outside rentals before booking.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const serviceSchema = generateServiceSchema();

  return (
    <>
      {/* Structured Data */}
      <Script
        id="chair-rentals-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="chair-rentals-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="chair-rentals-service-schema"
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
                <span className="text-gray-500 font-medium">Chair Rentals Austin</span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-6 tracking-[0.15em]">
              CHAIR RENTALS AUSTIN
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
              Premium white folding chairs delivered throughout Austin for weddings, corporate events,
              and special occasions. Professional setup available. Same-day delivery based on availability.
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

        {/* Pricing Table */}
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl text-gray-900 mb-12 tracking-[0.15em] text-center">
              CHAIR RENTAL PRICING
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="py-4 px-6 text-left font-serif tracking-[0.1em]">QUANTITY</th>
                    <th className="py-4 px-6 text-left font-serif tracking-[0.1em]">PRICE PER CHAIR</th>
                    <th className="py-4 px-6 text-left font-serif tracking-[0.1em]">TOTAL</th>
                    <th className="py-4 px-6 text-left font-serif tracking-[0.1em]">BEST FOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">10-25 chairs</td>
                    <td className="py-4 px-6 text-gray-700">$3.50</td>
                    <td className="py-4 px-6 text-gray-700">$35 - $88</td>
                    <td className="py-4 px-6 text-gray-600">Small gatherings, backyard parties</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">25-50 chairs</td>
                    <td className="py-4 px-6 text-gray-700">$3.25</td>
                    <td className="py-4 px-6 text-gray-700">$81 - $163</td>
                    <td className="py-4 px-6 text-gray-600">Birthday parties, small weddings</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">50-100 chairs</td>
                    <td className="py-4 px-6 text-gold-600 font-bold">$3.00</td>
                    <td className="py-4 px-6 text-gray-700">$150 - $300</td>
                    <td className="py-4 px-6 text-gray-600">Weddings, corporate events</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gold-50 border-2 border-gold-600">
                    <td className="py-4 px-6 font-bold">100+ chairs</td>
                    <td className="py-4 px-6 text-gold-600 font-bold">$2.75</td>
                    <td className="py-4 px-6 text-gray-700">$275+</td>
                    <td className="py-4 px-6 text-gray-600">Large weddings, festivals, corporate</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700">
                <strong>Setup Service:</strong> Add professional chair setup for $75-$150 depending on quantity and configuration.
                Our team arranges chairs exactly how you need them—ceremony rows, banquet style, or custom layouts.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Our Chairs */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl text-gray-900 mb-12 tracking-[0.15em] text-center">
              WHY AUSTIN CHOOSES OUR CHAIRS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Clean & Professional
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Every white folding chair is professionally cleaned and inspected before delivery.
                  No scuffs, no stains—just pristine chairs ready for your Austin event.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Fast Austin Delivery
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Same-day delivery available throughout Austin. We deliver to Downtown, Lake Travis,
                  South Congress, and all surrounding areas. Setup service available.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Sturdy & Reliable
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Commercial-grade white folding chairs that support up to 300 lbs. Stable on grass,
                  concrete, and indoor surfaces. Perfect for weddings and corporate events.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Venues */}
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl text-gray-900 mb-12 tracking-[0.15em] text-center">
              WE DELIVER TO AUSTIN VENUES
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.05em]">
                  Downtown & Central Austin
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• The Allan House</li>
                  <li>• Mercury Hall</li>
                  <li>• Laguna Gloria</li>
                  <li>• Hotel Van Zandt</li>
                  <li>• Fairmont Austin</li>
                  <li>• Rainey Street venues</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.05em]">
                  Lake Travis & Hill Country
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Lake Travis waterfront venues</li>
                  <li>• Vista West Ranch</li>
                  <li>• Kindred Oaks</li>
                  <li>• Ma Maison</li>
                  <li>• Private lake houses</li>
                  <li>• Hill Country ranches</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl text-gray-900 mb-12 tracking-[0.15em] text-center">
              FREQUENTLY ASKED QUESTIONS
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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
              BOOK CHAIR RENTALS TODAY
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Get a quote in minutes • Same-day Austin delivery • Professional setup available
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
