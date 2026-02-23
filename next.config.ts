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
        hostname: 'partyondelivery.com',
        pathname: '/images/**',
      },
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
      // Venue image domains
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.squarespace-cdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.showit.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.simpleviewinc.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3-media0.fl.yelpcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.yelpcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lirp.cdn-website.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cdn-website.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.gov',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**.com',
        pathname: '/**',
      },
    ],
  },

  // Enable build-time compression
  compress: true,

  // Optimize CSS and JS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'date-fns'],
  },

  // Production source maps for better debugging (can disable for smaller bundles)
  productionBrowserSourceMaps: false,

  // Optimize webpack bundle
  webpack: (config, { isServer }) => {
    // Analyze bundle size warnings
    config.performance = {
      maxAssetSize: 512000, // 512KB
      maxEntrypointSize: 512000,
      hints: 'warning',
    };

    // Optimize chunk splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // 301 Redirects for SEO (from SEMrush audit - January 2025)
  async redirects() {
    return [
      // Group order v2 slug rename
      {
        source: '/group-v2/:path*',
        destination: '/group/:path*',
        permanent: true,
      },

      // Main ordering page redirects
      {
        source: '/products',
        destination: '/order',
        permanent: true,
      },
      {
        source: '/quick-order',
        destination: '/order',
        permanent: true,
      },

      // ALL blog URL truncation redirects REMOVED - they were blocking real blog posts
      // The :suffix* pattern matches ZERO or more chars, so it was catching exact URLs

      // Truncated partial URLs (only match if there's actual truncation, not the valid /products page)
      {
        source: '/bach-parties/products:suffix+',  // Changed from * to + (requires at least 1 char)
        destination: '/bach-parties',
        permanent: true,
      },
      {
        source: '/boat-partie(s)?$',  // Only match /boat-partie or /boat-parties at root (not /blog/boat-parties)
        destination: '/boat-parties',
        permanent: true,
      },

      // Non-existent pages - redirect to relevant sections
      {
        source: '/captains',
        destination: '/boat-parties',
        permanent: true,
      },
      {
        source: '/download-app',
        destination: '/',
        permanent: true,
      },
      {
        source: '/downloa:suffix*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/fast-deliver:suffix*',
        destination: '/delivery-areas',
        permanent: true,
      },
      {
        source: '/safety',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/weather',
        destination: '/',
        permanent: true,
      },

      // Catch-all for blog truncations with various patterns (only match obvious truncation artifacts)
      {
        source: '/blog/:slug*(November[0-9]|0\\.06|0\\.07|0\\.04|0\\.01)$',
        destination: '/blog',
        permanent: true,
      },
    ];
  },

  // Headers for caching, performance, and security
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
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.shopify.com *.myshopify.com *.google-analytics.com *.googletagmanager.com cdn.vercel-insights.com vercel.live connect.facebook.net *.doubleclick.net www.googleadservices.com *.google.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: http: *.shopify.com *.myshopify.com images.unsplash.com *.squarespace-cdn.com *.wixstatic.com *.showit.co *.googleapis.com *.website-files.com *.simpleviewinc.com *.facebook.com www.facebook.com",
              "connect-src 'self' *.shopify.com *.myshopify.com *.google-analytics.com *.googletagmanager.com vitals.vercel-insights.com hooks.zapier.com connect.facebook.net *.facebook.com *.doubleclick.net www.googleadservices.com *.google.com",
              "frame-src 'self' *.shopify.com *.myshopify.com *.youtube.com *.youtube-nocookie.com *.recomsale.com vercel.live *.googletagmanager.com *.instagram.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' *.shopify.com *.myshopify.com",
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
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
