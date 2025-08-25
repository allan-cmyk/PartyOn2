'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import Cart from '@/components/shopify/Cart';
import MobileCart from '@/components/mobile/MobileCart';
import MobileNavigation from '@/components/mobile/MobileNavigation';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Use mobile or desktop cart based on screen size */}
      {isMobile ? <MobileCart /> : <Cart />}
      
      {/* Add mobile navigation for mobile devices */}
      {isMobile && <MobileNavigation />}
      
      {/* Main content with padding for mobile navigation */}
      <main className={`min-h-screen ${isMobile ? 'pb-20' : ''}`}>
        {children}
      </main>
    </>
  );
}