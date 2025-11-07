import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Enable WebP and AVIF formats
    formats: ['image/avif', 'image/webp'],
    
    // Set device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Minimize images during build
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    
    // Enable image optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    
    // Allow external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  
  // Enable build-time compression
  compress: true,
  
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', '@heroicons/react'],
  },
  
  // Headers for caching and security
  async headers() {
    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.shopify.com *.google-analytics.com *.googletagmanager.com cdn.vercel-insights.com vercel.live",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: *.shopify.com images.unsplash.com",
              "connect-src 'self' *.shopify.com *.google-analytics.com *.googletagmanager.com vitals.vercel-insights.com",
              "frame-src 'self' *.shopify.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' *.shopify.com",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
      // Cache headers for images
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache headers for static files
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
