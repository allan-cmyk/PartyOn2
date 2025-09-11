'use client';

import React, { useEffect, useState } from 'react';
import { useGroupCartSync } from '@/hooks/useGroupCartSync';
import Cart from '@/components/shopify/Cart';
import MobileCart from '@/components/mobile/MobileCart';
import MobileNavigation from '@/components/mobile/MobileNavigation';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  
  // Sync cart totals with group order if in a group
  useGroupCartSync();
  
  useEffect(() => {
    // Check if mobile on client side
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Don't render cart until we know if mobile or not (prevents hydration mismatch)
  if (isMobile === null) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }
  
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