'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function UltraCleanHome() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div
          className="fixed inset-0 bg-white z-50 flex items-center justify-center animate-fade-out"
          style={{ animation: isLoading ? 'none' : 'fade-out 0.5s ease-out forwards' }}
        >
          <style>{`
            @keyframes fade-out {
              from { opacity: 1; }
              to { opacity: 0; }
            }
            @keyframes scale-in {
              from { transform: scale(0.8); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .loading-spinner {
              animation: scale-in 0.5s ease-out forwards;
            }
          `}</style>
          <div className="text-center loading-spinner">
            <h1 className="text-4xl font-display text-royal-800 mb-4">PARTYON</h1>
            <div className="w-20 h-1 bg-gold-500 mx-auto animate-pulse"></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes hero-fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        @keyframes parallax-bg {
          0% { transform: translateY(0); }
          100% { transform: translateY(150px); }
        }
        .hero-content {
          animation: hero-fade-in 1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
        .hero-buttons {
          animation: fade-in-delay 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
        .scroll-indicator {
          animation: fade-in-delay 1s ease-out 1s forwards;
          opacity: 0;
        }
        .scroll-arrow {
          animation: scroll-bounce 2s ease-in-out infinite;
        }
      `}</style>

      <main className="min-h-screen bg-white overflow-x-hidden cursor-none">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Parallax Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/services/corporate/penthouse-suite-setup.webp"
            alt="Premium Event Service"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-royal-900/80 via-royal-900/60 to-royal-900/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <div className="hero-content">
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl mb-6 leading-tight">
              Elevate Your
              <span className="block text-gold-400">Events</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 font-light max-w-2xl mx-auto">
              Premium bar services for Fortune 500 companies and luxury venues
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
                <button className="px-10 py-4 bg-gold-500 hover:bg-gold-600 text-royal-900 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Schedule Consultation
                </button>
              </Link>
              <Link href="/services">
                <button className="px-10 py-4 border-2 border-white/80 text-white hover:bg-white hover:text-royal-900 font-semibold rounded-full transition-all duration-300">
                  Explore Services
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 scroll-indicator">
          <div className="scroll-arrow">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Clean Stats Section */}
      <section className="py-20 bg-gray-50">
        <style>{`
          @keyframes ScrollRevealCSS {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .stat-item {
            animation: ScrollRevealCSS 0.5s ease-out forwards;
            opacity: 0;
          }
          .stat-item:nth-child(1) { animation-delay: 0s; }
          .stat-item:nth-child(2) { animation-delay: 0.1s; }
          .stat-item:nth-child(3) { animation-delay: 0.2s; }
          .stat-item:nth-child(4) { animation-delay: 0.3s; }
        `}</style>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Events' },
              { value: '$5M', label: 'Insurance' },
              { value: '98%', label: 'Retention' },
              { value: '24/7', label: 'Support' }
            ].map((stat) => (
              <div
                key={stat.label}
                className="stat-item text-center"
              >
                <div className="text-4xl font-light text-royal-800 mb-2">{stat.value}</div>
                <div className="text-sm uppercase tracking-wider text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services with Parallax Cards */}
      <section className="py-24">
        <style>{`
          @keyframes service-card-reveal {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .services-heading {
            animation: ScrollRevealCSS 0.8s ease-out forwards;
            opacity: 0;
          }
          .service-card {
            animation: service-card-reveal 0.6s ease-out forwards;
            opacity: 0;
          }
          .service-card:nth-child(1) { animation-delay: 0s; }
          .service-card:nth-child(2) { animation-delay: 0.2s; }
          .service-card:nth-child(3) { animation-delay: 0.4s; }
          .service-card:hover {
            transform: translateY(-10px);
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="services-heading text-center mb-16"
          >
            <h2 className="font-display text-5xl text-royal-800 mb-4">Our Services</h2>
            <div className="w-20 h-1 bg-gold-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Corporate Events',
                description: 'Executive meetings and conferences with premium bar service',
                image: '/images/services/corporate/penthouse-suite-setup.webp'
              },
              {
                title: 'Luxury Weddings',
                description: 'Bespoke bar experiences for unforgettable celebrations',
                image: '/images/services/weddings/outdoor-bar-setup.webp'
              },
              {
                title: 'Private Venues',
                description: 'Exclusive service for country clubs and yacht clubs',
                image: '/images/services/boat-parties/luxury-yacht-deck.webp'
              }
            ].map((service) => (
              <div
                key={service.title}
                className="service-card group cursor-pointer transition-transform duration-500"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-8">
                    <h3 className="font-display text-2xl text-royal-800 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <span className="text-royal-600 font-medium group-hover:text-royal-700">
                      Learn More
                      <span className="inline-block ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial with Parallax Background */}
      <section className="relative py-32 overflow-hidden">
        <style>{`
          @keyframes testimonial-reveal {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .testimonial-content {
            animation: testimonial-reveal 0.8s ease-out forwards;
            opacity: 0;
          }
        `}</style>
        <div className="absolute inset-0">
          <Image
            src="/images/backgrounds/rooftop-terrace-elegant-1.webp"
            alt="Elegant Event"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-royal-900/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <div className="testimonial-content">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-gold-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <blockquote className="text-3xl font-light mb-8 leading-relaxed">
              &quot;PartyOn transformed our corporate events with their exceptional service and attention to detail.&quot;
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold">JM</span>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold">Jennifer Martinez</p>
                <p className="text-gold-300">Director of Events, Oracle</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 bg-gradient-to-br from-royal-800 to-royal-900">
        <style>{`
          @keyframes cta-reveal {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .cta-content {
            animation: cta-reveal 0.8s ease-out forwards;
            opacity: 0;
          }
        `}</style>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="cta-content">
            <h2 className="font-display text-5xl text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gold-200 mb-10">
              Let&apos;s discuss how we can elevate your next event
            </p>
            <Link href="/consultation">
              <button className="px-12 py-5 bg-gold-500 hover:bg-gold-600 text-royal-900 font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl">
                Schedule Your Consultation
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}