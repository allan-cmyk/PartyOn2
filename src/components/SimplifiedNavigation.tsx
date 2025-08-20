'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SimplifiedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-bold transition-colors ${
              isScrolled ? 'text-black' : 'text-white'
            }`}>
              PartyOn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/services" className={`font-medium transition-colors hover:text-blue-600 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}>
              Services
            </Link>
            <Link href="/shop" className={`font-medium transition-colors hover:text-blue-600 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}>
              Shop
            </Link>
            <Link href="/about" className={`font-medium transition-colors hover:text-blue-600 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}>
              About
            </Link>
            <Link href="/contact" className={`font-medium transition-colors hover:text-blue-600 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}>
              Contact
            </Link>
            <Link href="/book" className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              isScrolled 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}>
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isScrolled ? 'text-black' : 'text-white'}`}
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
        <div className="md:hidden bg-white border-t">
          <div className="px-6 py-4 space-y-3">
            <Link href="/services" className="block py-2 text-gray-700 font-medium">
              Services
            </Link>
            <Link href="/shop" className="block py-2 text-gray-700 font-medium">
              Shop
            </Link>
            <Link href="/about" className="block py-2 text-gray-700 font-medium">
              About
            </Link>
            <Link href="/contact" className="block py-2 text-gray-700 font-medium">
              Contact
            </Link>
            <Link href="/book" className="block py-3 px-6 bg-blue-600 text-white text-center rounded-lg font-semibold">
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}