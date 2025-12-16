'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import CartButton from '@/components/shopify/CartButton';
import ProductSearch from '@/components/ProductSearch';
import { useCustomerContext } from '@/contexts/CustomerContext';
import CustomerAuth from '@/components/CustomerAuth';

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

interface OldFashionedNavigationProps {
  forceScrolled?: boolean;
}

export default function OldFashionedNavigation({ forceScrolled = false }: OldFashionedNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(forceScrolled);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isRentalsOpen, setIsRentalsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { customer, isAuthenticated, logout } = useCustomerContext();

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(forceScrolled || window.scrollY > 50);
    };
    
    // Set initial scroll state
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [forceScrolled]);

  // Prevent hydration mismatch by using consistent initial state
  if (!isMounted) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        forceScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center -ml-4">
              <img 
                src="/images/pod-logo-2025.svg" 
                alt="Party On Delivery"
                className="h-16 w-auto"
              />
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const services = [
    { href: '/weddings', label: 'WEDDINGS' },
    { href: '/boat-parties', label: 'BOAT PARTIES' },
    { href: '/bach-parties', label: 'CELEBRATIONS' },
    { href: '/corporate', label: 'CORPORATE' },
  ];

  const rentals = [
    { href: '/rentals/chair-rentals-austin', label: 'CHAIR RENTALS' },
    { href: '/rentals/cocktail-table-rentals-austin', label: 'TABLE RENTALS' },
    { href: '/rentals/cooler-rentals-austin', label: 'COOLER RENTALS' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-20">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center -ml-4">
              <img 
                src="/images/pod-logo-2025.svg" 
                alt="Party On Delivery"
                className="h-20 w-auto"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-12">

              <NavLink href="/products" isScrolled={isScrolled}>PRODUCTS</NavLink>

              {/* Services Dropdown - CSS animations instead of Framer Motion */}
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

                {/* Dropdown Menu with CSS transition */}
                <div
                  className={`absolute top-full left-0 mt-2 w-48 bg-white shadow-lg transition-all duration-200 ${
                    isServicesOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
                  }`}
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
                </div>
              </div>

              {/* Rentals Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center text-sm tracking-[0.15em] transition-all duration-300 ${
                    isScrolled
                      ? 'text-gray-700 hover:text-gold-600'
                      : 'text-white/90 hover:text-gold-400'
                  }`}
                  onMouseEnter={() => setIsRentalsOpen(true)}
                  onMouseLeave={() => setIsRentalsOpen(false)}
                >
                  RENTALS
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>

                {/* Dropdown Menu with CSS transition */}
                <div
                  className={`absolute top-full left-0 mt-2 w-56 bg-white shadow-lg transition-all duration-200 ${
                    isRentalsOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
                  }`}
                  onMouseEnter={() => setIsRentalsOpen(true)}
                  onMouseLeave={() => setIsRentalsOpen(false)}
                >
                  {rentals.map((rental) => (
                    <Link
                      key={rental.href}
                      href={rental.href}
                      className="block px-6 py-3 text-sm tracking-[0.1em] text-gray-700 hover:bg-gray-50 hover:text-gold-600 transition-colors"
                    >
                      {rental.label}
                    </Link>
                  ))}
                </div>
              </div>

              <NavLink href="/contact" isScrolled={isScrolled}>CONTACT</NavLink>
              <NavLink href="/partners" isScrolled={isScrolled}>PARTNERS</NavLink>
              
              {/* Search */}
              <ProductSearch isScrolled={isScrolled} />
              
              {/* Cart Button */}
              <CartButton isScrolled={isScrolled} />

              {/* Account Section */}
              {isAuthenticated && customer ? (
                <div className="relative group">
                  <button 
                    className={`flex items-center text-sm tracking-[0.15em] transition-all duration-300 ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-gold-600' 
                        : 'text-white/90 hover:text-gold-400'
                    }`}
                  >
                    {customer.firstName || 'ACCOUNT'}
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link 
                      href="/account"
                      className="block px-6 py-3 text-sm tracking-[0.1em] text-gray-700 hover:bg-gray-50 hover:text-gold-600 transition-colors"
                    >
                      MY ACCOUNT
                    </Link>
                    <Link 
                      href="/account/orders"
                      className="block px-6 py-3 text-sm tracking-[0.1em] text-gray-700 hover:bg-gray-50 hover:text-gold-600 transition-colors"
                    >
                      ORDER HISTORY
                    </Link>
                    <button 
                      onClick={() => logout()}
                      className="block w-full text-left px-6 py-3 text-sm tracking-[0.1em] text-gray-700 hover:bg-gray-50 hover:text-gold-600 transition-colors border-t"
                    >
                      SIGN OUT
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className={`text-sm tracking-[0.15em] transition-all duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-gold-600' 
                      : 'text-white/90 hover:text-gold-400'
                  }`}
                >
                  SIGN IN
                </button>
              )}

              {/* Order CTA */}
              <Link href="/order">
                <button className={`px-8 py-3 text-sm tracking-[0.15em] border transition-all duration-300 ${
                  isScrolled 
                    ? 'border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-gray-900' 
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

      {/* Mobile Menu - CSS animations instead of Framer Motion */}
      <div
        className={`fixed inset-0 bg-white z-[100] md:hidden transition-all duration-300 ${
          isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-8">
            <Link href="/" className="flex items-center">
              <img
                src="/images/pod-logo-2025.svg"
                alt="Party On Delivery"
                className="h-12 w-auto"
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-900 text-3xl font-light"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 space-y-8">
            {/* Search Bar for Mobile */}
            <div className="pt-4">
              <ProductSearch isScrolled={true} />
            </div>

            <Link
              href="/products"
              className="text-2xl font-light tracking-[0.15em] text-gray-900 hover:text-gold-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              PRODUCTS
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

            {/* Rentals Section */}
            <div className="space-y-4">
              <p className="text-2xl font-light tracking-[0.15em] text-gray-900">RENTALS</p>
              <div className="pl-6 space-y-3">
                {rentals.map((rental) => (
                  <Link
                    key={rental.href}
                    href={rental.href}
                    className="block text-lg font-light tracking-[0.1em] text-gray-600 hover:text-gold-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {rental.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/contact"
              className="text-2xl font-light tracking-[0.15em] text-gray-900 hover:text-gold-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              CONTACT
            </Link>
            <Link
              href="/partners"
              className="text-2xl font-light tracking-[0.15em] text-gray-900 hover:text-gold-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              PARTNERS
            </Link>

            <Link href="/order" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full mt-8 px-8 py-4 text-sm tracking-[0.15em] border-2 border-gold-600 text-gray-900 hover:bg-gold-600 hover:text-gray-900 transition-all duration-300">
                ORDER NOW
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Auth Modal */}
      <CustomerAuth 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}