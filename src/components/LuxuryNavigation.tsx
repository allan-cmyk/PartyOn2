'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LuxuryNavigation({ variant = 'minimal' }: { variant?: 'minimal' | 'centered' | 'hidden' }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (variant === 'hidden') {
    return (
      <>
        {/* Hidden Menu - Only hamburger visible */}
        <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
          <div className="flex justify-between items-center p-8">
            <Link href="/" className="text-2xl font-light tracking-[0.2em] text-white">
              PARTYON
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              <div className="space-y-2">
                <span className="block w-8 h-0.5 bg-white"></span>
                <span className="block w-8 h-0.5 bg-white"></span>
              </div>
            </button>
          </div>
        </nav>

        {/* Full Screen Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-royal-900 z-[100] flex items-center justify-center"
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-8 right-8 text-white text-4xl font-light"
              >
                ×
              </button>
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link href="/services" className="block text-5xl font-light text-white mb-8 hover:text-gold-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Services
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link href="/portfolio" className="block text-5xl font-light text-white mb-8 hover:text-gold-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Portfolio
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/delivery" className="block text-5xl font-light text-white mb-8 hover:text-gold-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Delivery
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link href="/contact" className="block text-5xl font-light text-white hover:text-gold-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Contact
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (variant === 'centered') {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}>
        <div className="flex justify-center items-center h-24">
          <div className="flex items-center space-x-16">
            <Link href="/services" className={`text-sm tracking-[0.2em] uppercase transition-colors ${
              isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-300'
            }`}>
              Spirits
            </Link>
            <Link href="/portfolio" className={`text-sm tracking-[0.2em] uppercase transition-colors ${
              isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-300'
            }`}>
              Cocktails
            </Link>
            <Link href="/" className={`text-2xl font-light tracking-[0.3em] mx-8 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              PARTYON
            </Link>
            <Link href="/delivery" className={`text-sm tracking-[0.2em] uppercase transition-colors ${
              isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-300'
            }`}>
              Delivery
            </Link>
            <Link href="/contact" className={`text-sm tracking-[0.2em] uppercase transition-colors ${
              isScrolled ? 'text-gray-800 hover:text-gray-600' : 'text-white hover:text-gray-300'
            }`}>
              Contact
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Default minimal variant
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="max-w-full mx-auto px-8 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className={`text-xl font-light tracking-[0.3em] transition-colors ${
            isScrolled ? 'text-gray-900' : 'text-white'
          }`}>
            PARTYON
          </Link>
          
          <div className="hidden md:flex items-center space-x-12">
            <Link href="/services" className={`text-sm tracking-[0.1em] transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
            }`}>
              Spirits
            </Link>
            <Link href="/delivery" className={`text-sm tracking-[0.1em] transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
            }`}>
              Delivery
            </Link>
            <Link href="/contact" className={`text-sm tracking-[0.1em] transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
            }`}>
              Contact
            </Link>
            <Link href="/order-now">
              <button className={`px-6 py-2 text-sm tracking-[0.1em] border transition-all duration-300 ${
                isScrolled 
                  ? 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white' 
                  : 'border-white text-white hover:bg-white hover:text-gray-900'
              }`}>
                ORDER NOW
              </button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`space-y-1.5 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              <span className="block w-6 h-0.5 bg-current"></span>
              <span className="block w-6 h-0.5 bg-current"></span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}