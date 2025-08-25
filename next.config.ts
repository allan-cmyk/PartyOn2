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
  
  // Performance optimizations
  swcMinify: true, // Use SWC for faster minification
  
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', '@heroicons/react'],
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
