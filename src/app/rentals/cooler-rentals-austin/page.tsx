import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { generateFAQSchema, generateBreadcrumbSchema, generateServiceSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Cooler Rentals Austin | Ice Tubs & Large Coolers - Lake Travis Delivery',
  description: 'Rent large coolers and ice tubs in Austin for Lake Travis boat parties, outdoor weddings & events. Keep drinks ice cold. Same-day delivery available. Perfect for Texas summer.',
  keywords: 'cooler rentals austin, ice tub rental, large cooler rental, lake travis cooler, boat party cooler, wedding cooler rental austin',
  openGraph: {
    title: 'Cooler Rentals Austin | Lake Travis Ice Tub Delivery',
    description: 'Large coolers and ice tubs delivered to Lake Travis and throughout Austin for boat parties and outdoor events.',
    url: 'https://partyondelivery.com/rentals/cooler-rentals-austin',
    type: 'website',
    images: ['/images/hero/lake-travis-sunset.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cooler Rentals Austin | Ice Tubs',
    description: 'Large coolers delivered for Lake Travis boat parties and Austin outdoor events.',
    images: ['/images/hero/lake-travis-sunset.webp'],
  },
  alternates: {
    canonical: '/rentals/cooler-rentals-austin',
  },
};

export default function CoolerRentalsAustinPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://partyondelivery.com/' },
    { name: 'Rentals', url: 'https://partyondelivery.com/rentals' },
    { name: 'Cooler Rentals Austin', url: 'https://partyondelivery.com/rentals/cooler-rentals-austin' },
  ];

  const faqs = [
    {
      question: 'What size coolers do you rent in Austin?',
      answer: 'We rent large 100-quart coolers (holds 120+ cans with ice), 50-gallon ice tubs for kegs, and specialty beverage tubs. Perfect for Lake Travis boat parties, outdoor weddings, and summer events. All coolers are commercial-grade and keep drinks ice cold for 8+ hours in Texas heat.',
    },
    {
      question: 'Do you deliver coolers to Lake Travis marinas and docks?',
      answer: 'Yes! We specialize in Lake Travis delivery including marinas, docks, lakefront properties, and boat launch areas. Popular delivery locations include Just for Fun Watercraft Rental, Lakeway Marina, Carlos n Charlies, Gnarly Gar, and Emerald Point Marina. We coordinate timing with your boat rental or party departure.',
    },
    {
      question: 'How much ice do I need for my cooler?',
      answer: 'Plan for 1-2 bags of ice per cooler (20-40 lbs). For a 100-quart cooler, use 2 bags of ice. For ice tubs holding kegs, plan for 40-60 lbs of ice. Ice delivery can be coordinated with cooler rental for Lake Travis and Austin area events. Refresh ice every 4-6 hours in Texas summer heat.',
    },
    {
      question: 'Can I use coolers for beer kegs at my Austin event?',
      answer: 'Absolutely! Our 50-gallon ice tubs are specifically designed for half-barrel and quarter-barrel kegs. They keep kegs at perfect serving temperature for weddings, corporate events, and parties. Popular for outdoor Austin weddings at venues like Vista West Ranch and private properties.',
    },
    {
      question: 'What is the rental period for coolers in Austin?',
      answer: 'Standard rental is 24 hours. Weekend rentals (Friday pickup, Monday return) are popular for Lake Travis boat parties and multi-day events. Extended rentals available for Austin weddings and corporate retreats. Same-day delivery available based on location and inventory.',
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const serviceSchema = generateServiceSchema();

  return (
    <>
      {/* Structured Data */}
      <Script
        id="cooler-rentals-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="cooler-rentals-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="cooler-rentals-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <main className="bg-white">
        {/* Breadcrumb Navigation */}
        <nav className="py-4 px-8 bg-gray-50" aria-label="Breadcrumb">
          <div className="max-w-7xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-700 hover:text-brand-yellow transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">›</span>
              </li>
              <li>
                <Link href="/rentals" className="text-gray-700 hover:text-brand-yellow transition-colors">
                  Rentals
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">›</span>
              </li>
              <li>
                <span className="text-gray-500 font-medium">Cooler Rentals Austin</span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-5xl md:text-6xl text-gray-900 mb-6 tracking-[0.08em]">
              COOLER RENTALS AUSTIN
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
              Large coolers and ice tubs delivered to Lake Travis marinas, boat parties, outdoor weddings,
              and summer events throughout Austin. Keep drinks ice cold in Texas heat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <button className="px-8 py-4 bg-brand-yellow text-gray-900 hover:bg-yellow-600 transition-colors tracking-[0.08em] text-sm font-medium">
                  REQUEST QUOTE
                </button>
              </Link>
              <a href="tel:7373719700">
                <button className="px-8 py-4 border-2 border-brand-yellow text-gray-900 hover:bg-brand-yellow hover:text-white transition-all duration-300 tracking-[0.08em] text-sm font-medium">
                  CALL (737) 371-9700
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Cooler Options */}
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-4xl text-gray-900 mb-12 tracking-[0.08em] text-center">
              COOLER & ICE TUB OPTIONS
            </h2>

            <div className="overflow-x-auto mb-12">
              <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="py-4 px-6 text-left font-heading tracking-[0.1em]">SIZE</th>
                    <th className="py-4 px-6 text-left font-heading tracking-[0.1em]">CAPACITY</th>
                    <th className="py-4 px-6 text-left font-heading tracking-[0.1em]">RENTAL PRICE</th>
                    <th className="py-4 px-6 text-left font-heading tracking-[0.1em]">BEST FOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">50-Quart Cooler</td>
                    <td className="py-4 px-6 text-gray-700">60 cans + ice</td>
                    <td className="py-4 px-6 text-gray-700">$15 / day</td>
                    <td className="py-4 px-6 text-gray-600">Small parties, picnics</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">100-Quart Cooler</td>
                    <td className="py-4 px-6 text-gray-700">120+ cans + ice</td>
                    <td className="py-4 px-6 text-brand-yellow font-bold">$25 / day</td>
                    <td className="py-4 px-6 text-gray-600">Lake Travis boat parties</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">50-Gallon Ice Tub</td>
                    <td className="py-4 px-6 text-gray-700">Half-barrel keg + ice</td>
                    <td className="py-4 px-6 text-brand-yellow font-bold">$35 / day</td>
                    <td className="py-4 px-6 text-gray-600">Weddings, keg parties</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-yellow-50 border-2 border-brand-yellow">
                    <td className="py-4 px-6 font-bold">Party Package</td>
                    <td className="py-4 px-6 text-gray-700">2 large coolers + ice tub</td>
                    <td className="py-4 px-6 text-brand-yellow font-bold">$65 / day</td>
                    <td className="py-4 px-6 text-gray-600">Large events, multi-day parties</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-heading text-xl text-gray-900 mb-3 tracking-[0.05em]">
                  Weekend Rentals
                </h3>
                <p className="text-gray-700">
                  Pick up Friday, return Monday for just 1.5x daily rate. Perfect for Lake Travis
                  weekend boat parties and multi-day Austin events.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-heading text-xl text-gray-900 mb-3 tracking-[0.05em]">
                  Ice Delivery Available
                </h3>
                <p className="text-gray-700">
                  Add ice delivery to your cooler rental. We deliver bagged ice directly to
                  Lake Travis marinas, docks, and Austin event venues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lake Travis Focus */}
        <section className="py-24 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-4xl text-gray-900 mb-12 tracking-[0.08em] text-center">
              LAKE TRAVIS COOLER DELIVERY
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h3 className="font-heading text-3xl text-gray-900 mb-6 tracking-[0.1em]">
                  Boat Party Specialists
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We deliver coolers directly to Lake Travis marinas and docks for boat parties,
                  yacht rentals, and waterfront celebrations. Our team coordinates with marina staff
                  and boat rental companies for seamless handoffs.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-brand-yellow mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Pre-filled with ice upon delivery</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-brand-yellow mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Waterproof and floating design</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-brand-yellow mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Keeps drinks cold 8+ hours in Texas heat</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-brand-yellow mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Return pickup at dock after party</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-100 rounded-lg p-8">
                <h4 className="font-heading text-2xl text-gray-900 mb-6 tracking-[0.1em]">
                  Popular Lake Travis Delivery Locations
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li>• Just for Fun Watercraft Rental</li>
                  <li>• Lakeway Marina</li>
                  <li>• Carlos n Charlies</li>
                  <li>• Gnarly Gar Marina</li>
                  <li>• Emerald Point Marina</li>
                  <li>• VIP Marina</li>
                  <li>• Private docks & lake houses</li>
                  <li>• Hula Hut & waterfront venues</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-4xl text-gray-900 mb-12 tracking-[0.08em] text-center">
              WHY RENT COOLERS FROM PARTY ON
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Premium Quality
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Commercial-grade Yeti-style coolers with superior insulation.
                  Keeps drinks ice cold for 8+ hours in Texas summer heat.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Lake Travis Experts
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We know Lake Travis marinas, boat rental companies, and dock logistics.
                  Coordinated delivery and pickup at your preferred location.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl text-gray-900 mb-4 tracking-[0.1em]">
                  Flexible Rentals
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Daily, weekend, and extended rentals available. Same-day delivery
                  to Austin and Lake Travis based on availability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-4xl text-gray-900 mb-12 tracking-[0.08em] text-center">
              FREQUENTLY ASKED QUESTIONS
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-heading text-xl text-gray-900 mb-3 tracking-[0.05em]">
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
            <h2 className="font-heading text-4xl md:text-5xl mb-6 tracking-[0.08em]">
              RENT COOLERS FOR LAKE TRAVIS
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Large coolers delivered to marinas & docks • Ice delivery available • Weekend rentals
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/contact">
                <button className="px-10 py-4 bg-brand-yellow text-gray-900 hover:bg-yellow-600 transition-colors tracking-[0.08em] text-sm font-medium">
                  REQUEST QUOTE
                </button>
              </Link>
              <Link href="/rentals">
                <button className="px-10 py-4 border-2 border-brand-yellow text-white hover:bg-brand-yellow hover:text-gray-900 transition-all duration-300 tracking-[0.08em] text-sm font-medium">
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
