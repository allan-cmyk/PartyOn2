'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useGroupCartSync } from '@/hooks/useGroupCartSync';
import Cart from '@/components/shopify/Cart';
import MobileCart from '@/components/mobile/MobileCart';
import MobileNavigation from '@/components/mobile/MobileNavigation';

// Pages where MobileNavigation should be hidden (they have their own nav)
const HIDE_MOBILE_NAV_PATHS = ['/order'];
// Path prefixes where MobileNavigation should be hidden
const HIDE_MOBILE_NAV_PREFIXES = ['/group-v2'];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const pathname = usePathname();

  // Sync cart totals with group order if in a group
  useGroupCartSync();

  const hiddenByPrefix = pathname ? HIDE_MOBILE_NAV_PREFIXES.some((p) => pathname.startsWith(p)) : false;
  const showMobileNav = isMobile && pathname && !HIDE_MOBILE_NAV_PATHS.includes(pathname) && !hiddenByPrefix;
  
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

      {/* Add mobile navigation for mobile devices (hidden on certain pages) */}
      {showMobileNav && <MobileNavigation />}

      {/* Main content with padding for mobile navigation */}
      <main className={`min-h-screen ${showMobileNav ? 'pb-20' : ''}`}>
        {children}
      </main>
    </>
  );
}