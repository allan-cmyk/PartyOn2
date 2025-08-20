'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfessionalNavigation() {
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
      isScrolled ? 'bg-white shadow-md' : 'bg-slate-900/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-light tracking-wide transition-colors ${
              isScrolled ? 'text-slate-800' : 'text-white'
            }`}>
              PARTYON
            </span>
            <span className={`ml-2 text-xs font-medium tracking-widest ${
              isScrolled ? 'text-amber-600' : 'text-amber-500'
            }`}>
              PREMIUM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/services" className={`font-light transition-colors hover:text-amber-600 ${
              isScrolled ? 'text-slate-700' : 'text-gray-200'
            }`}>
              Services
            </Link>
            <Link href="/portfolio" className={`font-light transition-colors hover:text-amber-600 ${
              isScrolled ? 'text-slate-700' : 'text-gray-200'
            }`}>
              Portfolio
            </Link>
            <Link href="/partners" className={`font-light transition-colors hover:text-amber-600 ${
              isScrolled ? 'text-slate-700' : 'text-gray-200'
            }`}>
              Partners
            </Link>
            <Link href="/about" className={`font-light transition-colors hover:text-amber-600 ${
              isScrolled ? 'text-slate-700' : 'text-gray-200'
            }`}>
              About
            </Link>
            <Link href="/consultation" className={`px-6 py-2.5 font-medium transition-all ${
              isScrolled 
                ? 'bg-amber-500 text-slate-900 hover:bg-amber-600' 
                : 'bg-amber-500 text-slate-900 hover:bg-amber-400'
            }`}>
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isScrolled ? 'text-slate-800' : 'text-white'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-6 py-6 space-y-4">
            <Link href="/services" className="block py-2 text-slate-700 font-light">
              Services
            </Link>
            <Link href="/portfolio" className="block py-2 text-slate-700 font-light">
              Portfolio
            </Link>
            <Link href="/partners" className="block py-2 text-slate-700 font-light">
              Partners
            </Link>
            <Link href="/about" className="block py-2 text-slate-700 font-light">
              About
            </Link>
            <Link href="/consultation" className="block py-3 px-6 bg-amber-500 text-slate-900 text-center font-medium">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}