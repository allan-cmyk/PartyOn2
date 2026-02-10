'use client';

import React from 'react';
import Image from 'next/image';
import ScrollRevealCSS from '@/components/ui/ScrollRevealCSS';
import Link from 'next/link';

export default function FinalHome() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/images/services/corporate/penthouse-suite-setup.webp"
            alt="Premium Corporate Event"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
          <div className="max-w-3xl hero-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-white/90 text-sm font-medium tracking-wide uppercase">
                Austin&apos;s Premier Bar Service • Est. 2016
              </span>
            </div>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
              Elevate Your
              <span className="block text-brand-yellow">Corporate Events</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl">
              Premium bar services and alcohol delivery for Fortune 500 companies,
              luxury weddings, and exclusive venues across Austin.
            </p>

            <div className="flex flex-wrap gap-6 mb-10">
              {['Licensed & Insured', '24/7 Support', 'White Glove Service'].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-white/80">
                  <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/consultation">
                <button className="px-10 py-4 bg-yellow-500 hover:bg-brand-yellow text-gray-900 font-semibold rounded-full transition-all duration-300 transform hover:scale-105">
                  Schedule Consultation
                </button>
              </Link>
              <Link href="/services">
                <button className="px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold rounded-full transition-all duration-300">
                  View Services
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Corporate Events' },
              { number: '200+', label: 'Wedding Venues' },
              { number: '$5M', label: 'Insurance Coverage' },
              { number: '98%', label: 'Client Retention' }
            ].map((stat, index) => (
              <ScrollRevealCSS key={stat.label} delay={index * 100}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-600">{stat.label}</div>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollRevealCSS duration={800}>
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl text-gray-900 mb-4">
                Tailored Bar Solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From intimate board meetings to grand celebrations, we deliver exceptional service
              </p>
            </div>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Corporate Events',
                description: 'Executive meetings, conferences, and company celebrations with professional bartenders and premium selections.',
                image: '/images/services/corporate/penthouse-suite-setup.webp'
              },
              {
                title: 'Luxury Weddings',
                description: 'Bespoke bar experiences for Austin\'s most elegant celebrations, from intimate gatherings to grand receptions.',
                image: '/images/services/weddings/outdoor-bar-setup.webp'
              },
              {
                title: 'Private Venues',
                description: 'Exclusive partnerships with country clubs, yacht clubs, and premier event spaces across Austin.',
                image: '/images/services/boat-parties/luxury-yacht-deck.webp'
              }
            ].map((service, index) => (
              <ScrollRevealCSS key={service.title} delay={index * 200} duration={800}>
                <div className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                    </div>
                    <div className="p-8">
                      <h3 className="font-heading text-2xl text-gray-900 mb-3">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <span className="text-brand-blue font-medium group-hover:text-blue-700 transition-colors">
                        Learn More
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollRevealCSS duration={800}>
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl mb-4">
                Why Industry Leaders Choose PartyOn
              </h2>
              <p className="text-xl text-brand-yellow max-w-2xl mx-auto">
                Trusted by Austin&apos;s most prestigious organizations
              </p>
            </div>
          </ScrollRevealCSS>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Fully Licensed',
                description: 'TABC certified with comprehensive permits',
                icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
              },
              {
                title: '$5M Insurance',
                description: 'Complete coverage for peace of mind',
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
              },
              {
                title: 'Award-Winning',
                description: '2023 Austin Business Journal Excellence',
                icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
              },
              {
                title: '24/7 Support',
                description: 'Dedicated team always available',
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              }
            ].map((item, index) => (
              <ScrollRevealCSS key={item.title} delay={index * 100} duration={800}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </ScrollRevealCSS>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollRevealCSS duration={800}>
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <blockquote className="text-2xl font-light text-gray-700 mb-8 leading-relaxed">
                &ldquo;PartyOn has transformed our corporate events. Their professionalism,
                attention to detail, and flawless execution make them our exclusive partner.&rdquo;
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-blue font-semibold text-xl">SC</span>
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-900">Sarah Chen</p>
                  <p className="text-gray-600">VP of Corporate Events, Dell Technologies</p>
                </div>
              </div>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollRevealCSS duration={800}>
            <div>
              <h2 className="font-heading text-4xl md:text-5xl mb-6">
                Ready to Elevate Your Next Event?
              </h2>
              <p className="text-xl text-yellow-200 mb-10 max-w-2xl mx-auto">
                Join Austin&apos;s premier venues in delivering exceptional experiences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/consultation">
                  <button className="px-12 py-5 bg-yellow-500 hover:bg-brand-yellow text-gray-900 font-semibold rounded-full text-xl transition-all duration-300 transform hover:scale-105">
                    Schedule Consultation
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="px-12 py-5 border-2 border-yellow-500 text-brand-yellow hover:bg-yellow-500 hover:text-gray-900 font-semibold rounded-full text-xl transition-all duration-300">
                    Contact Us
                  </button>
                </Link>
              </div>
              <p className="mt-10 text-brand-yellow">
                Or call:
                <a href="tel:5125550100" className="text-white font-semibold ml-2 hover:text-brand-yellow transition-colors">
                  (512) 555-0100
                </a>
              </p>
            </div>
          </ScrollRevealCSS>
        </div>
      </section>
    </main>
  );
}
