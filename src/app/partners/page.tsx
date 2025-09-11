'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';
import Footer from '@/components/Footer';
import LuxuryCard from '@/components/LuxuryCard';

export default function PartnersPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    monthlyVolume: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Partner inquiry submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const partnerTypes = [
    {
      href: '/partners/hotels-resorts',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m4 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "Hotels & Resorts",
      description: "Elevate your guest experience with premium in-room amenities and event services",
      available: true,
      image: '/images/partners/hotel-partner.webp'
    },
    {
      href: '#',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
        </svg>
      ),
      title: "Property Management",
      description: "Offer residents exclusive access to curated spirits and concierge delivery",
      available: false,
      comingSoon: true,
      image: '/images/textures/marble-surface.webp'
    },
    {
      href: '#',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Event Planners",
      description: "Seamless bar services and custom packages for weddings and corporate events",
      available: false,
      comingSoon: true,
      image: '/images/partners/venue-partner.webp'
    },
    {
      href: '#',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h11M3 12h11M3 19h11M16 5l3 3-3 3M16 12h5M16 19l3-3-3-3" />
        </svg>
      ),
      title: "Restaurants & Bars",
      description: "Reliable supply chain and exclusive selections for your establishment",
      available: false,
      comingSoon: true,
      image: '/images/partners/restaurant-partner.webp'
    },
    {
      href: '#',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Corporate Offices",
      description: "Impress clients and reward teams with premium spirits and cocktail experiences",
      available: false,
      comingSoon: true,
      image: '/images/partners/corporate-partner.webp'
    },
    {
      href: '#',
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Country Clubs",
      description: "Exclusive member benefits and tournament sponsorship opportunities",
      available: false,
      comingSoon: true,
      image: '/images/textures/gold-liquid-abstract.webp'
    }
  ];

  const benefits = [
    {
      title: "Volume Discounts",
      percentage: "Up to 25%",
      description: "Tiered pricing based on monthly order volume"
    },
    {
      title: "Custom Storefront",
      percentage: "100%",
      description: "White-labeled ordering portal with your branding"
    },
    {
      title: "Priority Service",
      percentage: "24/7",
      description: "Dedicated account manager and express delivery"
    },
    {
      title: "Revenue Share",
      percentage: "15%",
      description: "Earn commission on referred customers"
    }
  ];

  const tiers = [
    {
      name: "Select Partner",
      volume: "$5,000+/month",
      discount: "10% discount",
      features: [
        "Dedicated account manager",
        "Monthly invoicing",
        "Priority delivery",
        "Event consultation"
      ]
    },
    {
      name: "Premier Partner",
      volume: "$15,000+/month",
      discount: "15% discount",
      features: [
        "Everything in Select",
        "Custom storefront",
        "Co-branded materials",
        "Exclusive allocations",
        "Quarterly business reviews"
      ]
    },
    {
      name: "Elite Partner",
      volume: "$30,000+/month",
      discount: "25% discount",
      features: [
        "Everything in Premier",
        "White-label solution",
        "API integration",
        "Custom product curation",
        "Revenue sharing program",
        "VIP event access"
      ]
    }
  ];

  return (
    <div className="bg-white">
      <OldFashionedNavigation />

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/gallery/headquarters-entrance.webp"
          alt="Partner with PartyOn"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/70" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center text-white z-10 max-w-4xl mx-auto px-8"
        >
          <h1 className="font-serif font-light text-5xl md:text-6xl mb-6 tracking-[0.15em]">
            PARTNER PROGRAM
          </h1>
          <div className="w-24 h-px bg-gold-400 mx-auto mb-6" />
          <p className="text-xl font-light tracking-[0.1em] mb-8 text-gray-200">
            Elevate Your Business with Austin&apos;s Premier Alcohol Delivery Service
          </p>
        </motion.div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Transform Your Hospitality Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join Austin&apos;s most distinguished establishments in offering guests and clients 
              seamless access to premium spirits, craft cocktails, and white-glove delivery service.
            </p>
          </motion.div>

          {/* Partner Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {partnerTypes.map((type, index) => (
              <div key={type.title}>
                {type.available ? (
                  <Link href={type.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <LuxuryCard backgroundImage={type.image}>
                        <div className="p-8">
                          <div className="text-gold-600 mb-4 group-hover:text-gold-700 transition-colors">{type.icon}</div>
                          <h3 className="font-serif text-2xl mb-3 text-gray-900 tracking-wide group-hover:text-gold-600 transition-colors">{type.title}</h3>
                          <p className="text-gray-600">{type.description}</p>
                        </div>
                      </LuxuryCard>
                    </motion.div>
                  </Link>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <LuxuryCard backgroundImage={type.image}>
                      <div className="p-8">
                        <div className="text-gray-400 mb-4">{type.icon}</div>
                        <h3 className="font-serif text-2xl mb-3 text-gray-500 tracking-wide">{type.title}</h3>
                        <p className="text-gray-400">{type.description}</p>
                        {type.comingSoon && (
                          <div className="absolute top-4 right-4 bg-gold-600 text-white text-xs px-3 py-1 tracking-[0.1em]">
                            COMING SOON
                          </div>
                        )}
                      </div>
                    </LuxuryCard>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Partner Benefits
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-serif text-gold-600 mb-3">{benefit.percentage}</div>
                <h3 className="text-xl font-medium mb-2 text-gray-900 tracking-wide">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Partnership Tiers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the partnership level that aligns with your business needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white p-8 border-2 ${
                  index === 1 ? 'border-gold-400 shadow-xl' : 'border-gray-200'
                }`}
              >
                {index === 1 && (
                  <div className="bg-gold-400 text-white text-center py-2 -mt-8 -mx-8 mb-6 tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-serif text-2xl mb-2 text-gray-900">{tier.name}</h3>
                <p className="text-gray-600 mb-2">{tier.volume}</p>
                <p className="text-3xl font-light text-gold-600 mb-6">{tier.discount}</p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg className="w-5 h-5 text-gold-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
                Custom Branded Solutions
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Create a seamless experience for your customers with our white-label platform. 
                Your brand, our expertise.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-gold-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Custom Storefront</h4>
                    <p className="text-gray-600">Fully branded ordering portal matching your visual identity</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-gold-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">API Integration</h4>
                    <p className="text-gray-600">Seamless connection to your existing systems and platforms</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-gold-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Curated Collections</h4>
                    <p className="text-gray-600">Custom product selections tailored to your clientele</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-gold-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Analytics Dashboard</h4>
                    <p className="text-gray-600">Real-time insights into orders, preferences, and trends</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px]"
            >
              <Image
                src="/images/gallery/ai-recommended-setup.webp"
                alt="Custom Solutions"
                fill
                className="object-cover rounded-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Become a Partner
            </h2>
            <p className="text-lg text-gray-600">
              Join Austin&apos;s premier network of distinguished establishments
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white p-8 md:p-12 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
                  BUSINESS NAME
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
                  CONTACT NAME
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
                  BUSINESS TYPE
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors"
                >
                  <option value="">Select Type</option>
                  <option value="hotel">Hotel / Resort</option>
                  <option value="property">Property Management</option>
                  <option value="event">Event Planning</option>
                  <option value="restaurant">Restaurant / Bar</option>
                  <option value="corporate">Corporate Office</option>
                  <option value="club">Country Club</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
                  ESTIMATED MONTHLY VOLUME
                </label>
                <select
                  name="monthlyVolume"
                  value={formData.monthlyVolume}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors"
                >
                  <option value="">Select Volume</option>
                  <option value="under5k">Under $5,000</option>
                  <option value="5k-15k">$5,000 - $15,000</option>
                  <option value="15k-30k">$15,000 - $30,000</option>
                  <option value="over30k">Over $30,000</option>
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wider">
                TELL US ABOUT YOUR NEEDS
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors resize-none"
                placeholder="Share your vision for partnership and any specific requirements..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.15em] text-sm font-medium"
            >
              SUBMIT PARTNERSHIP INQUIRY
            </button>

            <p className="text-sm text-gray-600 mt-6 text-center">
              A partnership specialist will contact you within 24 hours to discuss your needs
            </p>
          </motion.form>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl md:text-5xl text-gray-900 mb-6 tracking-[0.1em]">
              Success Stories
            </h2>
            <div className="w-16 h-px bg-gold-600 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 p-8"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                &quot;PartyOn transformed our resident events. The custom portal makes ordering effortless, 
                and our residents love the exclusive access to premium selections.&quot;
              </p>
              <div className="font-medium text-gray-900">Sarah Chen</div>
              <div className="text-sm text-gray-600">Luxury Property Manager</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-50 p-8"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                &quot;The partnership has elevated our wedding packages. Couples appreciate the 
                sophisticated bar service and the seamless integration with our planning process.&quot;
              </p>
              <div className="font-medium text-gray-900">Michael Torres</div>
              <div className="text-sm text-gray-600">Wedding Venue Director</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-50 p-8"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                &quot;Our corporate clients are impressed by the professional service and curated 
                selections. It&apos;s become a key differentiator for our event offerings.&quot;
              </p>
              <div className="font-medium text-gray-900">Jennifer Park</div>
              <div className="text-sm text-gray-600">Corporate Event Planner</div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}