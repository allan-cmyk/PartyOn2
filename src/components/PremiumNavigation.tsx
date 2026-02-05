'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PremiumNavigation() {
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
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className={`text-2xl font-heading tracking-wide transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                PartyOn
              </span>
              <span className={`ml-2 text-xs font-medium tracking-widest transition-colors duration-300 ${
                isScrolled ? 'text-brand-yellow' : 'text-brand-yellow'
              }`}>
                PREMIUM
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {['Services', 'About', 'Contact'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link 
                  href={`/${item.toLowerCase()}`} 
                  className={`relative font-medium tracking-wide transition-colors duration-300 ${
                    isScrolled ? 'text-slate-700 hover:text-brand-blue' : 'text-white/90 hover:text-white'
                  }`}
                >
                  <span>{item}</span>
                  <motion.span
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/consultation">
                <button className={`px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  isScrolled 
                    ? 'bg-blue-500 text-white hover:bg-brand-blue shadow-md' 
                    : 'bg-yellow-500 text-gray-900 hover:bg-brand-yellow'
                }`}>
                  Get Started
                </button>
              </Link>
            </motion.div>
          </div>

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
      <motion.div
        className={`lg:hidden bg-white border-t border-gray-100 ${
          isMobileMenuOpen ? 'block' : 'hidden'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isMobileMenuOpen ? 1 : 0, y: isMobileMenuOpen ? 0 : -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 py-6 space-y-4">
          {['Services', 'About', 'Contact'].map((item) => (
            <Link 
              key={item}
              href={`/${item.toLowerCase()}`} 
              className="block py-3 text-slate-700 font-medium hover:text-brand-blue transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link 
            href="/consultation" 
            className="block py-3 px-8 bg-blue-500 text-white text-center rounded-full font-medium hover:bg-brand-blue transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
}