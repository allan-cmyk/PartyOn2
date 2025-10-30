'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PremiumHome() {
  return (
    <main className="min-h-screen bg-ivory-300">
      {/* Sophisticated Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-ivory-300 via-ivory-200 to-ivory-300 overflow-hidden pt-20">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Section */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gold-100/50 backdrop-blur-sm px-4 py-2 rounded-full mb-8 hero-fade-in">
                <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                <span className="text-royal-700 text-sm font-medium tracking-wide">AUSTIN&apos;S PREMIER • EST. 2016</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-royal-800 mb-6 leading-[1.1] hero-fade-in">
                Elevate Your
                <span className="block text-gold-500">Corporate Events</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-xl mx-auto lg:mx-0 font-light hero-fade-in">
                Premium bar services and alcohol delivery for Austin&apos;s most distinguished venues and Fortune 500 companies.
              </p>

              {/* Service Highlights */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10 hero-fade-in">
                <div className="flex items-center gap-2 text-slate-700">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 Concierge</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>White Glove Service</span>
                </div>
              </div>

              {/* Primary CTA */}
              <div className="space-y-4 hero-fade-in">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/consultation">
                    <button className="group bg-royal-500 hover:bg-royal-600 text-white px-10 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg font-medium">
                      Schedule Executive Consultation
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </Link>
                  <Link href="/portfolio">
                    <button className="border-2 border-royal-500 text-royal-500 hover:bg-royal-50 px-10 py-5 rounded-full transition-all duration-300 text-lg font-medium">
                      View Portfolio
                    </button>
                  </Link>
                </div>
                
                {/* Secondary option */}
                <p className="text-center lg:text-left">
                  <Link href="/download" className="text-royal-600 hover:text-royal-700 text-sm underline">
                    Download capabilities deck
                  </Link>
                </p>
              </div>

              {/* Social Proof */}
              <div className="mt-10 pt-10 border-t border-gold-200 hero-fade-in">
                <div className="flex items-center justify-center lg:justify-start gap-8">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-gold-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">5.0 Client Rating</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold text-royal-800">500+</span> Corporate Events
                  </div>
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="relative lg:ml-12 hero-fade-in">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gold-100">
                <Image 
                  src="/images/services/corporate/penthouse-suite-setup.webp"
                  alt="Premium Corporate Event Service"
                  fill
                  className="object-cover"
                  priority
                  quality={90}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-royal-900/20 via-transparent to-transparent" />

                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl hero-fade-in">
                  <p className="text-royal-600 font-semibold text-lg mb-2">Next Day Availability</p>
                  <p className="text-slate-600 text-sm mb-3">Full bar service for your executive meetings</p>
                  <Link href="/book" className="text-sm text-gold-600 hover:text-gold-700 inline-flex items-center gap-1 font-medium">
                    Check Availability
                  </Link>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-100 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-30" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center hero-fade-in">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-slate-500 font-medium tracking-wide">DISCOVER MORE</span>
            <div className="animate-bounce">
              <svg className="w-5 h-5 text-royal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm uppercase tracking-wider text-slate-500 mb-8">
            Trusted by Austin&apos;s Leading Organizations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
            {['Four Seasons', 'Dell Technologies', 'Oracle', 'Tesla', 'Whole Foods', 'Indeed', 'The Driskill', 'W Hotel'].map((client, index) => (
              <div
                key={index}
                className="text-center text-slate-400 font-light text-sm hover:text-slate-600 transition-colors hero-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-white to-ivory-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 hero-fade-in">
            <h2 className="font-display text-5xl md:text-6xl text-royal-800 mb-4">
              Tailored Solutions
            </h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-6"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From intimate board meetings to grand galas, we deliver exceptional experiences that reflect your brand&apos;s sophistication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Corporate Events',
                subtitle: 'Executive Excellence',
                description: 'Full bar service for conferences, galas, and C-suite gatherings',
                image: '/images/services/corporate/penthouse-suite-setup.webp',
                features: ['Professional bartenders', 'Custom cocktail menus', 'Premium spirits', 'Complete setup & cleanup']
              },
              {
                title: 'Luxury Weddings',
                subtitle: 'Unforgettable Moments',
                description: 'Bespoke bar experiences for Austin&apos;s most elegant celebrations',
                image: '/images/services/weddings/outdoor-bar-setup.webp',
                features: ['Signature cocktails', 'Champagne service', 'Venue partnerships', 'Day-of coordination']
              },
              {
                title: 'Private Clubs',
                subtitle: 'Member Excellence',
                description: 'Exclusive service for country clubs and private venues',
                image: '/images/services/boat-parties/luxury-yacht-deck.webp',
                features: ['Member events', 'Tournament service', 'Seasonal programs', 'VIP experiences']
              }
            ].map((service, index) => (
              <div
                key={index}
                className="group hero-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-900/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-gold-400 text-sm font-medium mb-1">{service.subtitle}</p>
                      <h3 className="text-white text-2xl font-display">{service.title}</h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-slate-600 mb-6">{service.description}</p>
                    <ul className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-slate-700">
                          <svg className="w-4 h-4 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/services/${service.title.toLowerCase().replace(/ /g, '-')}`}>
                      <button className="mt-6 text-royal-600 hover:text-royal-700 font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                        Learn More
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 bg-royal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 hero-fade-in">
            <h2 className="font-display text-5xl md:text-6xl mb-4">
              The PartyOn Difference
            </h2>
            <p className="text-xl text-gold-400 max-w-3xl mx-auto">
              Why industry leaders choose us for their most important events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: 'award',
                title: 'Award-Winning Service',
                description: '2023 Austin Business Journal Excellence in Hospitality Award'
              },
              {
                icon: 'shield',
                title: '$5M Insurance',
                description: 'Comprehensive coverage for complete peace of mind'
              },
              {
                icon: 'certificate',
                title: 'Fully Licensed',
                description: 'TABC certified with all required permits and certifications'
              },
              {
                icon: 'star',
                title: '98% Retention',
                description: 'Our clients return year after year for exceptional service'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="text-center hero-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon === 'award' && (
                    <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )}
                  {item.icon === 'shield' && (
                    <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {item.icon === 'certificate' && (
                    <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )}
                  {item.icon === 'star' && (
                    <svg className="w-8 h-8 text-gold-600 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-medium mb-3 text-gold-400">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center hero-fade-in">
            <Link href="/about">
              <button className="bg-gold-500 hover:bg-gold-600 text-royal-900 px-10 py-4 rounded-full font-medium transition-all duration-300">
                Learn About Our Story
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-gradient-to-b from-ivory-200 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center hero-fade-in">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-gold-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <blockquote className="text-2xl font-light text-slate-700 mb-8 leading-relaxed">
              &quot;PartyOn has been our exclusive bar service partner for three years. Their attention to detail,
              professionalism, and ability to execute flawlessly at scale has made them indispensable to our
              corporate events program.&quot;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-royal-100 rounded-full" />
              <div className="text-left">
                <p className="text-lg font-medium text-royal-800">Sarah Chen</p>
                <p className="text-slate-600">VP of Corporate Events, Dell Technologies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-royal-800 to-royal-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-500/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="hero-fade-in">
            <h2 className="font-display text-5xl md:text-6xl mb-8">
              Ready to Elevate Your Next Event?
            </h2>
            <p className="text-2xl mb-12 text-gold-200 font-light">
              Join Austin&apos;s premier venues in delivering exceptional experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/consultation">
                <button className="bg-gold-500 hover:bg-gold-600 text-royal-900 px-12 py-5 rounded-full text-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-xl">
                  Schedule Executive Consultation
                </button>
              </Link>
              <Link href="/download">
                <button className="border-2 border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-royal-900 px-12 py-5 rounded-full text-xl font-medium transition-all duration-300">
                  Download Capabilities
                </button>
              </Link>
            </div>
            <p className="mt-10 text-gold-300">
              Or call our executive team:
              <a href="tel:5125550100" className="text-white font-medium ml-2 hover:text-gold-400 transition-colors">
                (512) 555-0100
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}