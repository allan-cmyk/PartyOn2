'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OldFashionedNavigation from '@/components/OldFashionedNavigation';

export default function OrderPage() {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Event Details
    eventType: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    venue: '',
    venueAddress: '',
    
    // Service Selection
    servicePackage: '',
    bartenderService: false,
    customCocktails: false,
    premiumSpirits: false,
    champagneService: false,
    
    // Additional Notes
    specialRequests: '',
    referralSource: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleNextStep = () => {
    if (formStep < 4) setFormStep(formStep + 1);
  };

  const handlePrevStep = () => {
    if (formStep > 1) setFormStep(formStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="bg-white min-h-screen">
      <OldFashionedNavigation />
      
      {/* Header Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="font-serif font-light text-5xl md:text-6xl text-gray-900 mb-4 tracking-[0.15em]">
            BEGIN YOUR ORDER
          </h1>
          <div className="w-24 h-px bg-gold-600 mx-auto mb-6" />
          <p className="text-gray-600 text-lg tracking-[0.05em]">
            Let us craft the perfect beverage experience for your celebration
          </p>
        </div>
      </section>

      {/* Progress Indicator */}
      <section className="py-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  formStep >= step 
                    ? 'bg-gold-600 border-gold-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <span className="text-sm font-light">{step}</span>
                </div>
                {step < 4 && (
                  <div className={`w-full h-px mx-4 transition-all duration-300 ${
                    formStep > step ? 'bg-gold-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <span>Contact</span>
            <span>Event Details</span>
            <span>Services</span>
            <span>Review</span>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Contact Information */}
            {formStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-serif text-3xl text-gray-900 mb-8 tracking-[0.1em]">
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                      FIRST NAME
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                      LAST NAME
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Event Details */}
            {formStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-serif text-3xl text-gray-900 mb-8 tracking-[0.1em]">
                  Event Details
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                    EVENT TYPE
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                  >
                    <option value="">Select Event Type</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="boat-party">Boat Party</option>
                    <option value="bachelor">Bachelor/Bachelorette</option>
                    <option value="birthday">Birthday Celebration</option>
                    <option value="private">Private Party</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                      EVENT DATE
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      required
                      min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                      EVENT TIME
                    </label>
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                    ESTIMATED GUEST COUNT
                  </label>
                  <select
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                  >
                    <option value="">Select Guest Count</option>
                    <option value="1-25">1-25 Guests</option>
                    <option value="26-50">26-50 Guests</option>
                    <option value="51-100">51-100 Guests</option>
                    <option value="101-200">101-200 Guests</option>
                    <option value="201-300">201-300 Guests</option>
                    <option value="300+">300+ Guests</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                    VENUE NAME
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                    VENUE ADDRESS
                  </label>
                  <input
                    type="text"
                    name="venueAddress"
                    value={formData.venueAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="Full address including city and zip code"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Service Selection */}
            {formStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-serif text-3xl text-gray-900 mb-8 tracking-[0.1em]">
                  Service Selection
                </h2>

                <div className="mb-8">
                  <label className="block text-sm font-light text-gray-700 mb-4 tracking-[0.1em]">
                    SELECT PACKAGE
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'essential', name: 'Essential', price: '$599+' },
                      { value: 'premium', name: 'Premium', price: '$1,299+' },
                      { value: 'luxury', name: 'Luxury', price: '$2,499+' }
                    ].map((pkg) => (
                      <label key={pkg.value} className={`border-2 p-6 cursor-pointer transition-all duration-300 ${
                        formData.servicePackage === pkg.value 
                          ? 'border-gold-600 bg-gold-50' 
                          : 'border-gray-200 hover:border-gold-400'
                      }`}>
                        <input
                          type="radio"
                          name="servicePackage"
                          value={pkg.value}
                          checked={formData.servicePackage === pkg.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <h3 className="font-serif text-xl text-gray-900 mb-2">{pkg.name}</h3>
                          <p className="text-gold-600 font-light">{pkg.price}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-light text-gray-700 mb-4 tracking-[0.1em]">
                    ADDITIONAL SERVICES
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'bartenderService', label: 'Professional Bartender Service', price: '+$250/bartender' },
                      { name: 'customCocktails', label: 'Custom Cocktail Menu', price: '+$150' },
                      { name: 'premiumSpirits', label: 'Ultra-Premium Spirits Upgrade', price: '+$350' },
                      { name: 'champagneService', label: 'Champagne Service', price: '+$200' }
                    ].map((service) => (
                      <label key={service.name} className="flex items-center p-4 border border-gray-200 hover:border-gold-400 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name={service.name}
                          checked={formData[service.name as keyof typeof formData] as boolean}
                          onChange={handleInputChange}
                          className="mr-4 w-5 h-5 text-gold-600 border-gray-300 focus:ring-gold-600"
                        />
                        <div className="flex-1">
                          <span className="text-gray-900">{service.label}</span>
                          <span className="text-gold-600 ml-2 text-sm">{service.price}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                    SPECIAL REQUESTS OR NOTES
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about any special requirements, preferences, or details..."
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Review & Submit */}
            {formStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-serif text-3xl text-gray-900 mb-8 tracking-[0.1em]">
                  Review Your Order
                </h2>

                <div className="bg-gray-50 p-8 mb-8">
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="text-gray-900">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="text-gray-900">{formData.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 mb-8">
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">Event Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Event Type:</span>
                      <p className="text-gray-900 capitalize">{formData.eventType.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date & Time:</span>
                      <p className="text-gray-900">{formData.eventDate} at {formData.eventTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Guest Count:</span>
                      <p className="text-gray-900">{formData.guestCount} guests</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Venue:</span>
                      <p className="text-gray-900">{formData.venue}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-gray-600 text-sm">Address:</span>
                    <p className="text-gray-900 text-sm">{formData.venueAddress}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 mb-8">
                  <h3 className="font-serif text-xl text-gray-900 mb-4 tracking-[0.1em]">Selected Services</h3>
                  <p className="text-gray-900 mb-2 capitalize">{formData.servicePackage} Package</p>
                  {(formData.bartenderService || formData.customCocktails || formData.premiumSpirits || formData.champagneService) && (
                    <div className="mt-4">
                      <p className="text-gray-600 text-sm mb-2">Additional Services:</p>
                      <ul className="space-y-1">
                        {formData.bartenderService && <li className="text-gray-900 text-sm">• Professional Bartender Service</li>}
                        {formData.customCocktails && <li className="text-gray-900 text-sm">• Custom Cocktail Menu</li>}
                        {formData.premiumSpirits && <li className="text-gray-900 text-sm">• Ultra-Premium Spirits Upgrade</li>}
                        {formData.champagneService && <li className="text-gray-900 text-sm">• Champagne Service</li>}
                      </ul>
                    </div>
                  )}
                  {formData.specialRequests && (
                    <div className="mt-4">
                      <p className="text-gray-600 text-sm">Special Requests:</p>
                      <p className="text-gray-900 text-sm mt-1">{formData.specialRequests}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gold-50 border-2 border-gold-600 p-6 mb-8">
                  <p className="text-sm text-gray-700 mb-2">
                    <svg className="w-5 h-5 inline-block mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Important: Orders require 72-hour advance notice. Our team will contact you within 24 hours to confirm details and provide a final quote.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 tracking-[0.1em]">
                    HOW DID YOU HEAR ABOUT US?
                  </label>
                  <select
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-gold-600 focus:outline-none transition-colors"
                  >
                    <option value="">Select Source</option>
                    <option value="google">Google Search</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="friend">Friend/Family</option>
                    <option value="venue">Venue Recommendation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              {formStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-8 py-3 border border-gray-300 text-gray-700 hover:border-gold-600 hover:text-gold-600 transition-colors tracking-[0.1em] text-sm"
                >
                  PREVIOUS
                </button>
              )}
              
              {formStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto px-8 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm"
                >
                  CONTINUE
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-8 py-3 bg-gold-600 text-white hover:bg-gold-700 transition-colors tracking-[0.1em] text-sm"
                >
                  SUBMIT ORDER
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <svg className="w-12 h-12 mx-auto text-gold-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.1em]">Secure & Confidential</h3>
              <p className="text-gray-600 text-sm">Your information is protected and never shared</p>
            </div>
            <div>
              <svg className="w-12 h-12 mx-auto text-gold-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.1em]">72-Hour Notice</h3>
              <p className="text-gray-600 text-sm">Advance booking ensures availability</p>
            </div>
            <div>
              <svg className="w-12 h-12 mx-auto text-gold-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <h3 className="font-serif text-xl text-gray-900 mb-2 tracking-[0.1em]">Personal Service</h3>
              <p className="text-gray-600 text-sm">Our team will contact you within 24 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif text-2xl text-gray-900 mb-4 tracking-[0.15em]">PARTYON</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Austin&apos;s premier alcohol delivery and event service since 2020.
              </p>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">SERVICES</h4>
              <ul className="space-y-2">
                <li><Link href="/weddings" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Weddings</Link></li>
                <li><Link href="/boat-parties" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Boat Parties</Link></li>
                <li><Link href="/bach-parties" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Celebrations</Link></li>
                <li><Link href="/corporate" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Corporate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">COMPANY</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">About</Link></li>
                <li><Link href="/delivery-areas" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Delivery Areas</Link></li>
                <li><Link href="/faqs" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gold-600 text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-gray-900 mb-4 tracking-[0.1em]">CONTACT</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Phone: (737) 371-9700</li>
                <li>Email: hello@partyondelivery.com</li>
                <li>Hours: 10am - 11pm Daily</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 PartyOn Delivery. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gold-600 text-sm transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}