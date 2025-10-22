'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import CorporateEventCalculatorLanding from '@/components/CorporateEventCalculatorLanding';

export default function CorporateLandingPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    location: '',
    eventType: '',
    notes: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  // Auto-verify age for B2B corporate page
  useEffect(() => {
    localStorage.setItem('age_verified', 'true');
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCalculatorAddToQuote = (results: string) => {
    setFormData(prev => ({
      ...prev,
      notes: results
    }));
    scrollToForm();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // {{FORM_ACTION}} - Configure this with your form endpoint
      // Options: Zapier webhook, Shopify, email service, etc.
      console.log('Form submitted:', formData);

      // Placeholder for actual submission
      setSubmitMessage('Thank you! We\'ll contact you within 24 hours to discuss your event.');

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        phone: '',
        eventDate: '',
        guestCount: '',
        location: '',
        eventType: '',
        notes: '',
        consent: false
      });
    } catch (error) {
      setSubmitMessage('There was an error submitting your request. Please call us at (737) 371-9700.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'serviceType': 'Corporate Event Alcohol Delivery',
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'Party On Delivery',
      'description': 'Premium alcohol delivery service for corporate events in Austin, Texas',
      'telephone': '(737) 371-9700',
      'email': 'info@partyondelivery.com',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Austin',
        'addressRegion': 'TX',
        'addressCountry': 'US'
      },
      'areaServed': {
        '@type': 'City',
        'name': 'Austin',
        'state': 'Texas'
      }
    },
    'offers': {
      '@type': 'Offer',
      'description': 'Corporate event alcohol delivery packages',
      'priceRange': 'Starting at $500'
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What areas of Austin do you serve?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We deliver throughout the Austin metro area, including downtown, East Austin, South Congress, Lake Travis, and surrounding communities.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How far in advance do I need to order?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We require a 72-hour minimum notice for all corporate orders. For larger events (100+ guests) or peak seasons, we recommend booking 2-4 weeks in advance.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Are you licensed and compliant?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'We are fully licensed by TABC (Texas Alcoholic Beverage Commission) and verify ID for every delivery. We maintain all required insurance and compliance standards.'
        }
      }
    ]
  };

  return (
    <>
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-white min-h-screen">
        <OldFashionedNavigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 tracking-[0.1em] leading-tight">
                Austin's Easiest Way to Stock the Bar for Company Parties
              </h1>
              {/* Alt H1 options in comments:
                - "Corporate Events, Simplified."
                - "Cold Drinks. Zero Stress. Perfect for Every Office Event."
              */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                From 20 to 200+ guests, we deliver premium beer, wine, spirits, mixers, and ice—cold, on-time, and ready for your team. One vendor. Zero stress. Perfect for every corporate gathering.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToForm}
                  className="bg-gold-500 text-white px-8 py-4 rounded-md hover:bg-gold-600 transition-colors font-medium tracking-[0.05em] text-lg"
                >
                  Schedule a Call
                </button>
                <button
                  onClick={scrollToForm}
                  className="bg-white text-gold-600 px-8 py-4 rounded-md border-2 border-gold-500 hover:bg-gold-50 transition-colors font-medium tracking-[0.05em] text-lg"
                >
                  Get a Quote
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-2xl"
            >
              <Image
                src="/images/corporate/corporate-hero.png"
                alt="Professional corporate event with elegant bar setup in Austin"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Companies Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              Why Austin Companies Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional service, reliable delivery, and the quality your team deserves
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'One Vendor, Everything You Need',
                description: 'Beer, wine, spirits, mixers, ice, and disposables—all from a single trusted source.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              },
              {
                title: 'Delivered Cold, Right on Schedule',
                description: 'Precise delivery windows to your office or venue, everything chilled and ready to serve.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: 'Stress-Free Planning',
                description: 'One quick call or online quote. We handle the details so you can focus on your event.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: 'Local & Licensed',
                description: 'Austin-based team with full TABC compliance and ID-verified delivery every time.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: 'Scales from 20 to 200+ Guests',
                description: 'Whether it's a team lunch or a company-wide celebration, we've got you covered.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                title: 'Reliable Support',
                description: 'Last-minute changes? Questions? Our Austin team responds fast with clear communication.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 border border-gray-200 rounded-lg hover:border-gold-500 hover:shadow-lg transition-all"
              >
                <div className="text-gold-500 mb-4">{benefit.icon}</div>
                <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.05em]">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Four simple steps to a perfect company event</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Tell Us About the Event', description: 'Share your date, guest count, and location via our form or a quick call.' },
              { step: '2', title: 'We Propose a Custom Drink Plan', description: 'Get the right mix of beer, wine, spirits, mixers, and ice for your group.' },
              { step: '3', title: 'We Deliver Cold & On-Time', description: 'Everything arrives chilled and ready for your bar staff or self-serve setup.' },
              { step: '4', title: 'Enjoy Your Event', description: 'No store runs, no stress. Just a seamless, professional experience.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gold-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.05em]">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              Perfect For Every Corporate Occasion
            </h2>
            <p className="text-xl text-gray-600">From team offsites to client appreciation events</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Team Offsites', image: '/images/corporate/team-offsite.png', outcome: 'Build camaraderie with quality drinks and zero logistics stress' },
              { title: 'Holiday Parties', image: '/images/corporate/holiday-party.png', outcome: 'Create memorable celebrations your team will talk about all year' },
              { title: 'Launch Celebrations', image: '/images/corporate/launch-celebration.png', outcome: 'Toast milestones with premium service that matches the moment' },
              { title: 'Corporate Retreats', image: '/images/corporate/corporate-retreat.png', outcome: 'Elevate multi-day events with seamless beverage coordination' },
              { title: 'Networking Mixers', image: '/images/corporate/networking-mixer.png', outcome: 'Impress attendees and keep conversations flowing effortlessly' },
              { title: 'Client Appreciation', image: '/images/corporate/client-appreciation.png', outcome: 'Show clients you value quality in every detail' }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="relative h-64">
                  <Image
                    src={useCase.image}
                    alt={useCase.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-serif text-2xl mb-2 tracking-[0.05em]">{useCase.title}</h3>
                  <p className="text-sm text-gray-200">{useCase.outcome}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              Trusted by Austin Businesses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Party On Delivery made our company holiday party seamless. Professional service, perfect timing, and our team loved the drink selection.",
                author: "Jennifer Martinez",
                title: "HR Coordinator"
              },
              {
                quote: "We use them for all our client events. Reliable, professional, and they always deliver exactly what we need—cold and on time.",
                author: "David Chen",
                title: "Office Manager"
              },
              {
                quote: "From corporate retreats to launch parties, they've never let us down. Makes my job as an event planner so much easier.",
                author: "Rachel Thompson",
                title: "Event Planner"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="text-gold-500 text-4xl mb-4">"</div>
                <p className="text-gray-700 mb-4 italic">{testimonial.quote}</p>
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              Estimate Your Event Needs
            </h2>
            <p className="text-xl text-gray-600">
              Get accurate drink quantities for your corporate gathering
            </p>
          </div>

          <CorporateEventCalculatorLanding
            onAddToQuote={handleCalculatorAddToQuote}
            onScheduleCall={scrollToForm}
          />
        </div>
      </section>

      {/* Blog Link Section */}
      <section className="py-20 bg-gradient-to-br from-gold-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-xl p-8 md:p-12 border border-gold-200"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 text-gold-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-2xl md:text-3xl text-gray-900 mb-3 tracking-[0.1em]">
                  The Complete Guide to Corporate Events in Austin
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Planning a company event? Read our comprehensive guide covering venue selection, catering, budgets, team building activities, and professional bar service for corporate gatherings of any size.
                </p>
                <Link
                  href="/blog/corporate-events-austin-guide"
                  className="inline-flex items-center text-gold-600 hover:text-gold-700 font-medium tracking-[0.05em]"
                >
                  Read the Full Guide
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-serif text-2xl md:text-3xl text-gray-900 mb-4 tracking-[0.1em]">
            Simple, Transparent Pricing
          </h3>
          <p className="text-lg text-gray-600 mb-2">
            Packages starting at <span className="font-bold text-gold-600">$500 for groups of 20+</span>
          </p>
          <p className="text-gray-600 mb-4">
            Mixers, ice, cups & disposables available • Custom quotes for larger events
          </p>
          <button
            onClick={scrollToForm}
            className="bg-gold-500 text-white px-8 py-3 rounded-md hover:bg-gold-600 transition-colors font-medium tracking-[0.05em]"
          >
            Get Your Custom Quote
          </button>
        </div>
      </section>

      {/* Lead Form - Main */}
      <section ref={formRef} className="py-20 bg-white scroll-mt-20" id="contact-form">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              Request Your Quote
            </h2>
            <p className="text-xl text-gray-600">
              Tell us about your event and we'll create a custom proposal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  required
                  value={formData.eventDate}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Count *
                </label>
                <input
                  type="number"
                  id="guestCount"
                  name="guestCount"
                  required
                  min="20"
                  value={formData.guestCount}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Venue/Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleFormChange}
                placeholder="Office address or venue name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                id="eventType"
                name="eventType"
                required
                value={formData.eventType}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              >
                <option value="">Select event type...</option>
                <option value="holiday-party">Holiday Party</option>
                <option value="team-offsite">Team Offsite</option>
                <option value="client-event">Client Event</option>
                <option value="launch-party">Launch Party</option>
                <option value="networking-event">Networking Event</option>
                <option value="corporate-retreat">Corporate Retreat</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={6}
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Tell us about your event, drink preferences, or any special requirements..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  checked={formData.consent}
                  onChange={handleFormChange}
                  className="mt-1 w-5 h-5 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
                />
                <span className="text-sm text-gray-600">
                  I consent to Party On Delivery contacting me about my event. View our <Link href="/privacy" className="text-gold-600 hover:text-gold-700">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            {submitMessage && (
              <div className={`mb-6 p-4 rounded-md ${submitMessage.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {submitMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gold-500 text-white px-8 py-4 rounded-md hover:bg-gold-600 transition-colors font-medium tracking-[0.05em] text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>

            <p className="mt-4 text-sm text-gray-600 text-center">
              Or call us directly at <a href="tel:7373719700" className="text-gold-600 hover:text-gold-700 font-medium">(737) 371-9700</a>
            </p>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 tracking-[0.1em]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'What areas of Austin do you serve?',
                answer: 'We deliver throughout the Austin metro area, including downtown, East Austin, South Congress, Lake Travis, and surrounding communities. Contact us to confirm service to your specific location.'
              },
              {
                question: 'How far in advance do I need to order?',
                answer: 'We require a 72-hour minimum notice for all corporate orders. For larger events (100+ guests) or peak seasons, we recommend booking 2-4 weeks in advance.'
              },
              {
                question: 'Can you handle last-minute changes?',
                answer: 'Yes! We understand corporate events can be dynamic. Contact our team and we'll do our best to accommodate changes to guest counts or drink selections.'
              },
              {
                question: 'What types of alcohol do you provide?',
                answer: 'We offer a full selection of beer, wine, and spirits from premium brands. We can customize your package based on your team's preferences and budget.'
              },
              {
                question: 'Do you include mixers, ice, and disposables?',
                answer: 'Yes! We provide mixers and ice as needed. Cups, napkins, and other disposables can be added to any order.'
              },
              {
                question: 'What are your delivery windows?',
                answer: 'We coordinate precise delivery windows to match your event schedule. For office deliveries, we typically deliver 1-2 hours before your event start time.'
              },
              {
                question: 'Are you licensed and compliant?',
                answer: 'Absolutely. We're fully licensed by TABC (Texas Alcoholic Beverage Commission) and verify ID for every delivery. We maintain all required insurance and compliance standards.'
              },
              {
                question: 'How does payment work?',
                answer: 'We accept all major credit cards and can set up invoicing for corporate accounts. Payment is typically due at the time of delivery or can be arranged in advance for larger contracts.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.05em]">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gradient-to-br from-gold-500 to-gold-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-6 tracking-[0.1em]">
            Ready to Make Planning Painless?
          </h2>
          <p className="text-xl mb-8 text-gold-50">
            Let's create a seamless beverage experience for your next corporate event.
          </p>
          <button
            onClick={scrollToForm}
            className="bg-white text-gold-600 px-8 py-4 rounded-md hover:bg-gray-100 transition-colors font-medium tracking-[0.05em] text-lg shadow-lg"
          >
            Schedule Your Call Now
          </button>
        </div>
      </section>

      <Footer />

      {/*
        IMPLEMENTATION CHECKLIST:

        [ ] Replace {{FORM_ACTION}} with actual form submission endpoint
            Options: Zapier webhook, Shopify form, email service, GoHighLevel

        [ ] Add tracking pixels (Google Analytics, Meta Pixel, etc.)
            Location: Add to <head> or after <body>

        [ ] Upload generated images to CDN/Shopify and update src paths
            Images: corporate-hero.png, team-offsite.png, holiday-party.png,
                   launch-celebration.png, corporate-retreat.png, networking-mixer.png,
                   client-appreciation.png

        [ ] Test calculator math with various inputs
            - Guest counts: 20, 50, 100, 200
            - Duration: 2hrs, 4hrs, 8hrs
            - All drinking levels
            - Percentage sliders

        [ ] Test form pre-fill from calculator "Add to Quote" button

        [ ] Test smooth scrolling to form from all CTAs

        [ ] Mobile responsiveness check (320px, 768px, 1024px)

        [ ] Accessibility audit:
            - All images have alt text
            - Form labels properly associated
            - Keyboard navigation works
            - Focus states visible
            - Color contrast meets WCAG AA

        [ ] SEO check:
            - Meta title and description added to layout.tsx
            - JSON-LD schemas validate at schema.org
            - Open Graph tags added

        [ ] Performance:
            - Run Lighthouse audit
            - Images optimized
            - No console errors

        [ ] Content review:
            - Phone number correct throughout
            - Email addresses correct
            - All links working
            - Testimonials approved (currently placeholders)
      */}
      </div>
    </>
  );
}
