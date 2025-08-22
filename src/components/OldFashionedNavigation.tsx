'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isScrolled: boolean;
  onClick?: () => void;
}

function NavLink({ href, children, isScrolled, onClick }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className={`text-sm tracking-[0.15em] transition-all duration-300 ${
        isScrolled 
          ? 'text-gray-700 hover:text-gold-600' 
          : 'text-white/90 hover:text-gold-400'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export default function OldFashionedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { href: '/weddings', label: 'WEDDINGS' },
    { href: '/boat-parties', label: 'BOAT PARTIES' },
    { href: '/bach-parties', label: 'CELEBRATIONS' },
    { href: '/corporate', label: 'CORPORATE' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link href="/" className={`text-2xl font-light tracking-[0.3em] transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              PARTYON
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              <NavLink href="/" isScrolled={isScrolled}>HOME</NavLink>
              <NavLink href="/about" isScrolled={isScrolled}>ABOUT</NavLink>
              
              {/* Services Dropdown */}
              <div className="relative group">
                <button 
                  className={`flex items-center text-sm tracking-[0.15em] transition-all duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-gold-600' 
                      : 'text-white/90 hover:text-gold-400'
                  }`}
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  SERVICES
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg"
                      onMouseEnter={() => setIsServicesOpen(true)}
                      onMouseLeave={() => setIsServicesOpen(false)}
                    >
                      {services.map((service) => (
                        <Link 
                          key={service.href}
                          href={service.href}
                          className="block px-6 py-3 text-sm tracking-[0.1em] text-gray-700 hover:bg-gray-50 hover:text-gold-600 transition-colors"
                        >
                          {service.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <NavLink href="/delivery-areas" isScrolled={isScrolled}>COVERAGE</NavLink>
              <NavLink href="/contact" isScrolled={isScrolled}>CONTACT</NavLink>
              
              {/* Order CTA */}
              <Link href="/order">
                <button className={`px-8 py-3 text-sm tracking-[0.15em] border transition-all duration-300 ${
                  isScrolled 
                    ? 'border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white' 
                    : 'border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-gray-900'
                }`}>
                  ORDER NOW
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className={`space-y-1.5 ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                <span className="block w-6 h-0.5 bg-current"></span>
                <span className="block w-6 h-0.5 bg-current"></span>
                <span className="block w-6 h-0.5 bg-current"></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[100] md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-8">
                <Link href="/" className="text-2xl font-light tracking-[0.3em] text-gray-900">
                  PARTYON
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-900 text-3xl font-light"
                >
                  ×
                </button>
              </div>
              
              <div className="flex-1 flex flex-col justify-center px-8 space-y-8">
                <Link href="/" className="text-2xl font-light tracking-[0.15em] text-gray-900 hover:text-gold-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  HOME
                </Link>
                <Link href="/about" className="text-2xl font-light tracking-[0.15em] text-gray-900 hover:text-gold-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  ABOUT
                </Link>
                
                {/* Services Section */}
                <div className="space-y-4">
                  <p className="text-2xl font-light tracking-[0.15em] text-gray-900">SERVICES</p>
                  <div className="pl-6 space-y-3">
                    {services.map((service) => (
                      <Link 
                        key={service.href}
                        href={service.href}
                        className="block text-lg font-light tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <Link href="/delivery-areas" className="text-2xl font-light tracking-[0.15em] text-gray-900 hover:text-gold-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  COVERAGE
                </Link>
                <Link href="/contact" className="text-2xl font-light tracking-[0.15em] text-gray-900 hover:text-gold-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  CONTACT
                </Link>
                
                <Link href="/order" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full mt-8 px-8 py-4 text-sm tracking-[0.15em] border-2 border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-all duration-300">
                    ORDER NOW
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}