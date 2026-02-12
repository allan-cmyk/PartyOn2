import React from 'react';
import Image from 'next/image';
import ClientLogos from '@/components/ClientLogos';

export default function ProfessionalHomeV2() {
  return (
    <main className="min-h-screen bg-white font-sans">
      {/* Enhanced Hero with Video Background Option */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/80 z-10" />
        <div className="absolute inset-0">
          <Image
            src="/images/hero/luxury-wedding-estate-1.webp"
            alt="Premium Event Service"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="relative z-20 text-center text-white max-w-6xl mx-auto px-6">
          <p className="text-amber-400 uppercase tracking-widest text-sm mb-6 font-medium">
            Austin&apos;s Premier Event Bar Service
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-8 tracking-tight leading-tight">
            Elevate Your
            <span className="block text-amber-400">Corporate Events</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-light text-gray-200 max-w-3xl mx-auto leading-relaxed">
            White-glove alcohol delivery and professional bar services trusted by Fortune 500 companies and luxury venues
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="group bg-amber-500 text-slate-900 px-12 py-5 text-lg font-medium hover:bg-amber-400 transition-all duration-300 transform hover:scale-105">
              <span>Schedule Consultation</span>
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="group border-2 border-white text-white px-12 py-5 text-lg font-medium hover:bg-white hover:text-slate-900 transition-all duration-300">
              <span>View Case Studies</span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Client Logos */}
      <ClientLogos />

      {/* Enhanced Stats with Icons */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-600 text-2xl">🏢</span>
              </div>
              <p className="text-5xl font-light text-slate-800 mb-2">500+</p>
              <p className="text-sm uppercase tracking-wider text-slate-600">Corporate Events</p>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-600 text-2xl">💎</span>
              </div>
              <p className="text-5xl font-light text-slate-800 mb-2">200+</p>
              <p className="text-sm uppercase tracking-wider text-slate-600">Luxury Venues</p>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-600 text-2xl">⭐</span>
              </div>
              <p className="text-5xl font-light text-slate-800 mb-2">98%</p>
              <p className="text-sm uppercase tracking-wider text-slate-600">Client Retention</p>
            </div>
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-600 text-2xl">🛡️</span>
              </div>
              <p className="text-5xl font-light text-slate-800 mb-2">$5M</p>
              <p className="text-sm uppercase tracking-wider text-slate-600">Insurance Coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Service Cards with Hover Effects */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light text-slate-800 mb-6">
              Tailored Solutions for Every Venue
            </h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From intimate board meetings to grand galas, we deliver exceptional bar experiences 
              that reflect your brand&apos;s sophistication
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: 'Corporate Events',
                subtitle: 'Executive Excellence',
                image: '/images/services/corporate/penthouse-suite-setup.webp',
                features: [
                  'C-Suite receptions & board meetings',
                  'Product launches & brand activations',
                  'Conference hospitality suites',
                  'Holiday parties & team celebrations'
                ],
                stat: '10,000+ executives served'
              },
              {
                title: 'Luxury Weddings',
                subtitle: 'Unforgettable Celebrations',
                image: '/images/services/weddings/outdoor-bar-setup.webp',
                features: [
                  'Bespoke cocktail menu creation',
                  'Professional bartending teams',
                  'Premium spirits curation',
                  'Venue partnership programs'
                ],
                stat: '500+ perfect weddings'
              },
              {
                title: 'Private Clubs',
                subtitle: 'Exclusive Service',
                image: '/images/services/boat-parties/luxury-yacht-deck.webp',
                features: [
                  'Country club events',
                  'Yacht club regattas',
                  'Member appreciation events',
                  'Tournament hospitality'
                ],
                stat: '50+ club partnerships'
              }
            ].map((service, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative h-80 mb-8 overflow-hidden bg-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-amber-400 text-sm font-medium mb-2">{service.subtitle}</p>
                    <h3 className="text-3xl font-light mb-3">{service.title}</h3>
                    <p className="text-sm opacity-90">{service.stat}</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start group-hover:translate-x-2 transition-transform duration-300">
                      <span className="text-amber-500 mr-3 text-lg">•</span>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Why Industry Leaders Choose Party On
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our commitment to excellence has earned us partnerships with Austin&apos;s most prestigious organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🏆',
                title: 'Award-Winning Service',
                description: '2023 Austin Business Journal Excellence Award'
              },
              {
                icon: '📜',
                title: 'Fully Licensed',
                description: 'TABC certified with comprehensive insurance'
              },
              {
                icon: '🌟',
                title: '5.0★ Rated',
                description: '1000+ Deliveries, 5.0★ rating from corporate clients'
              },
              {
                icon: '🤝',
                title: 'Dedicated Support',
                description: '24/7 concierge and event coordination'
              }
            ].map((item, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-amber-600 uppercase tracking-wider text-sm mb-4 font-medium">
                Case Study: Dell Technologies
              </p>
              <h2 className="text-4xl font-light text-slate-800 mb-6">
                Elevating the Annual Leadership Summit
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="text-3xl font-light text-amber-600 mr-4">1,200</span>
                  <span className="text-slate-700">Executives served flawlessly</span>
                </div>
                <div className="flex items-center">
                  <span className="text-3xl font-light text-amber-600 mr-4">3</span>
                  <span className="text-slate-700">Days of seamless service</span>
                </div>
                <div className="flex items-center">
                  <span className="text-3xl font-light text-amber-600 mr-4">100%</span>
                  <span className="text-slate-700">Client satisfaction rating</span>
                </div>
              </div>
              <blockquote className="text-lg text-slate-600 italic mb-8 border-l-4 border-amber-500 pl-6">
                &quot;Party On transformed our leadership summit into an unforgettable experience. 
                Their attention to detail and professional service exceeded our highest expectations.&quot;
              </blockquote>
              <p className="text-slate-700 font-medium">Michael Chen, VP of Corporate Events</p>
            </div>
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/images/gallery/headquarters-entrance.webp"
                alt="Dell Technologies Event"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 bg-gradient-to-br from-amber-500 to-amber-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8">
            Ready to Elevate Your Next Event?
          </h2>
          <p className="text-2xl mb-12 text-amber-100 max-w-3xl mx-auto">
            Join Austin&apos;s elite venues and corporations in delivering exceptional experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <button className="bg-white text-amber-600 px-12 py-5 text-xl font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Schedule Executive Consultation
            </button>
            <button className="border-2 border-white text-white px-12 py-5 text-xl font-medium hover:bg-white hover:text-amber-600 transition-all duration-300">
              Download Capabilities Deck
            </button>
          </div>
          <p className="text-amber-100">
            Or call our corporate team directly: 
            <a href="tel:5125550100" className="text-white font-medium ml-2 hover:underline">
              (512) 555-0100
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}