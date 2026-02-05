'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PolishedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`text-3xl font-heading tracking-tight transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              PartyOn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <Link href="/services" className={`font-medium transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-brand-blue' : 'text-white hover:text-brand-yellow'
            }`}>
              Services
            </Link>
            <Link href="/about" className={`font-medium transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-brand-blue' : 'text-white hover:text-brand-yellow'
            }`}>
              About
            </Link>
            <Link href="/contact" className={`font-medium transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-brand-blue' : 'text-white hover:text-brand-yellow'
            }`}>
              Contact
            </Link>
            <Link href="/consultation">
              <button className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                isScrolled 
                  ? 'bg-brand-blue text-white hover:bg-blue-700' 
                  : 'bg-yellow-500 text-gray-900 hover:bg-brand-yellow'
              }`}>
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isScrolled ? 'text-gray-900' : 'text-white'}`}
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
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t shadow-lg"
        >
          <div className="px-6 py-6 space-y-4">
            <Link href="/services" className="block py-3 text-gray-700 font-medium">
              Services
            </Link>
            <Link href="/about" className="block py-3 text-gray-700 font-medium">
              About
            </Link>
            <Link href="/contact" className="block py-3 text-gray-700 font-medium">
              Contact
            </Link>
            <Link href="/consultation" className="block">
              <button className="w-full py-3 bg-brand-blue text-white rounded-full font-semibold">
                Get Started
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}