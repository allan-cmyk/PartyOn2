import React from 'react';
import Image from 'next/image';

export default function ProfessionalHome() {
  return (
    <main className="min-h-screen bg-white">
      {/* Sophisticated Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/hero/luxury-wedding-estate-1.webp"
            alt="Luxury Event Service"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="relative z-20 text-center text-white max-w-5xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-wide">
            Elevated Event Services
          </h1>
          <div className="w-24 h-0.5 bg-amber-500 mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl mb-12 font-light text-gray-200 max-w-3xl mx-auto">
            Premium alcohol delivery and bar services for Austin&apos;s most distinguished venues and events
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-amber-500 text-slate-900 px-10 py-4 text-lg font-medium hover:bg-amber-400 transition-all duration-300">
              Schedule Consultation
            </button>
            <button className="border border-white text-white px-10 py-4 text-lg font-medium hover:bg-white hover:text-slate-900 transition-all duration-300">
              View Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-slate-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 text-slate-600">
            <div className="text-center">
              <p className="text-3xl font-light text-slate-800">500+</p>
              <p className="text-sm uppercase tracking-wider">Corporate Events</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-light text-slate-800">200+</p>
              <p className="text-sm uppercase tracking-wider">Wedding Venues</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-light text-slate-800">98%</p>
              <p className="text-sm uppercase tracking-wider">Client Retention</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-light text-slate-800">24/7</p>
              <p className="text-sm uppercase tracking-wider">Concierge Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories for B2B */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-slate-800 mb-4">
              Tailored Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive bar services designed for your unique venue and clientele
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Corporate Events */}
            <div className="group">
              <div className="relative h-72 mb-8 overflow-hidden bg-slate-100">
                <Image
                  src="/images/services/corporate/penthouse-suite-setup.webp"
                  alt="Corporate Events"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-light mb-2">Corporate Events</h3>
                  <p className="text-sm text-gray-200">Executive gatherings & conferences</p>
                </div>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Board meetings & executive retreats</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Product launches & brand activations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Holiday parties & team celebrations</span>
                </li>
              </ul>
            </div>

            {/* Wedding Venues */}
            <div className="group">
              <div className="relative h-72 mb-8 overflow-hidden bg-slate-100">
                <Image
                  src="/images/services/weddings/outdoor-bar-setup.webp"
                  alt="Wedding Services"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-light mb-2">Wedding Venues</h3>
                  <p className="text-sm text-gray-200">Full-service bar solutions</p>
                </div>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Venue-exclusive partnerships</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Custom cocktail menu creation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Professional bartending teams</span>
                </li>
              </ul>
            </div>

            {/* Private Clubs */}
            <div className="group">
              <div className="relative h-72 mb-8 overflow-hidden bg-slate-100">
                <Image
                  src="/images/services/boat-parties/luxury-yacht-deck.webp"
                  alt="Private Clubs"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-light mb-2">Private Clubs</h3>
                  <p className="text-sm text-gray-200">Yacht clubs & country clubs</p>
                </div>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Member events & tournaments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Seasonal menu programs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-3">•</span>
                  <span>Exclusive spirits selection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-light text-slate-800 mb-8">
                Why Leading Venues Choose Party On
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-amber-500/10 rounded flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-amber-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-slate-800 mb-2">Licensed & Insured</h3>
                    <p className="text-slate-600">Full TABC licensing and comprehensive insurance coverage for complete peace of mind</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-amber-500/10 rounded flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-amber-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-slate-800 mb-2">White Glove Service</h3>
                    <p className="text-slate-600">Dedicated account management and 24/7 support for seamless event execution</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-amber-500/10 rounded flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-amber-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-slate-800 mb-2">Premium Selection</h3>
                    <p className="text-slate-600">Curated spirits portfolio featuring top-shelf brands and craft selections</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="/images/products/premium-spirits-wall.webp"
                alt="Premium Bar Service"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-500 text-2xl">★</span>
              ))}
            </div>
            <blockquote className="text-2xl font-light text-slate-700 mb-8 leading-relaxed">
              &quot;Party On has been our exclusive bar service partner for three years. Their professionalism, 
              attention to detail, and ability to execute flawlessly under pressure has made them 
              indispensable to our venue&apos;s success.&quot;
            </blockquote>
            <div>
              <p className="text-lg font-medium text-slate-800">Jennifer Martinez</p>
              <p className="text-slate-600">Director of Events, The Driskill Hotel</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-light mb-6">
            Elevate Your Venue&apos;s Bar Service
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join Austin&apos;s premier venues in delivering exceptional beverage experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-amber-500 text-slate-900 px-10 py-4 text-lg font-medium hover:bg-amber-400 transition-all duration-300">
              Schedule Partnership Meeting
            </button>
            <button className="border border-gray-600 text-white px-10 py-4 text-lg font-medium hover:bg-gray-800 transition-all duration-300">
              Download Service Guide
            </button>
          </div>
          <p className="mt-8 text-gray-400">
            Or call our corporate team: <span className="text-white">(512) 555-0100</span>
          </p>
        </div>
      </section>
    </main>
  );
}