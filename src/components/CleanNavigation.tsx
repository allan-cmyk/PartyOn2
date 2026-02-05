'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CleanNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { name: 'Corporate Events', href: '/services/corporate' },
    { name: 'Luxury Weddings', href: '/services/weddings' },
    { name: 'Private Venues', href: '/services/venues' }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/98 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="relative z-10">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <span className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                PARTYON
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center space-x-10">
            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button className={`font-medium transition-all duration-300 flex items-center gap-1 ${
                isScrolled ? 'text-gray-700 hover:text-brand-blue' : 'text-white hover:text-brand-yellow'
              }`}>
                Services
                <svg className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden"
                  >
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-brand-blue transition-colors duration-200"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/about" className={`font-medium transition-all duration-300 ${
              isScrolled ? 'text-gray-700 hover:text-brand-blue' : 'text-white hover:text-brand-yellow'
            }`}>
              About
            </Link>

            <Link href="/contact" className={`font-medium transition-all duration-300 ${
              isScrolled ? 'text-gray-700 hover:text-brand-blue' : 'text-white hover:text-brand-yellow'
            }`}>
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden lg:block"
          >
            <Link href="/consultation">
              <button className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                isScrolled 
                  ? 'bg-brand-blue text-white hover:bg-blue-700' 
                  : 'bg-yellow-500 text-gray-900 hover:bg-brand-yellow'
              }`}>
                Get Started
              </button>
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t shadow-lg"
          >
            <div className="px-6 py-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Services</p>
                {services.map((service) => (
                  <Link
                    key={service.name}
                    href={service.href}
                    className="block py-2 pl-4 text-gray-700 hover:text-brand-blue"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
              <Link href="/about" className="block py-3 text-gray-700 font-medium hover:text-brand-blue" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/contact" className="block py-3 text-gray-700 font-medium hover:text-brand-blue" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
              <Link href="/consultation" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-3 bg-brand-blue text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}