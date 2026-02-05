'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartContext } from '@/contexts/CartContext';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import MobileSearchModal from './MobileSearchModal';

export default function MobileNavigation() {
  const pathname = usePathname();
  const { cart, openCart } = useCartContext();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cartIconControls = useAnimation();
  const prevItemCount = useRef(0);

  const itemCount = cart?.totalQuantity || 0;

  // Animate cart icon when item count changes
  useEffect(() => {
    if (itemCount > prevItemCount.current && itemCount > 0) {
      // Item was added - bounce animation
      cartIconControls.start({
        scale: [1, 1.2, 0.9, 1.1, 1],
        transition: { duration: 0.5, type: "spring" }
      });
    }
    prevItemCount.current = itemCount;
  }, [itemCount, cartIconControls]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
      )
    },
    {
      href: '/order',
      label: 'Order',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
          />
        </svg>
      )
    },
    {
      action: () => setIsSearchOpen(true),
      label: 'Search',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )
    },
    {
      action: openCart,
      label: 'Cart',
      icon: (
        <motion.div className="relative" animate={cartIconControls}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
            />
          </svg>
          {itemCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-brand-yellow text-gray-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
            >
              {itemCount}
            </motion.span>
          )}
        </motion.div>
      )
    },
    {
      href: '/account',
      label: 'Account',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
      )
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom shadow-lg"
          >
            <nav className="flex items-center justify-around h-[72px]">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;

                if (item.action) {
                  return (
                    <button
                      key={index}
                      onClick={item.action}
                      className="flex flex-col items-center justify-center px-3 py-2 flex-1 min-w-0 active:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className={`transition-colors ${isActive ? 'text-brand-yellow' : 'text-gray-600'}`}>
                        {item.icon}
                      </div>
                      <span className={`text-xs mt-1 tracking-[0.05em] font-medium ${isActive ? 'text-brand-yellow' : 'text-gray-600'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex flex-col items-center justify-center px-3 py-2 flex-1 min-w-0 active:bg-gray-50 transition-colors rounded-lg"
                  >
                    <div className={`transition-colors ${isActive ? 'text-brand-yellow' : 'text-gray-600'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs mt-1 tracking-[0.05em] font-medium ${isActive ? 'text-brand-yellow' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <MobileSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}