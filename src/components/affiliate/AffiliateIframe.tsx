'use client';

import { useState, useEffect } from 'react';

export default function AffiliateIframe() {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState('100vh');

  useEffect(() => {
    // Listen for messages from iframe to adjust height
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Recomsale domain
      if (event.origin !== 'https://store.recomsale.com') return;

      if (event.data.height) {
        setIframeHeight(`${event.data.height}px`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative w-full bg-white">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-heading text-lg">Loading affiliate signup form...</p>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        id="recomsale-affiliate-signup"
        src="https://store.recomsale.com/signup?shop=premier-concierge.myshopify.com"
        title="Affiliate Signup Form"
        className={`w-full border-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          minHeight: iframeHeight,
          height: iframeHeight,
        }}
        onLoad={handleLoad}
        allow="payment; fullscreen"
      />
    </div>
  );
}
