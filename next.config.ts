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

  // Optimize CSS and JS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable SWC minification for smaller bundles
  swcMinify: true,

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'date-fns'],
    // Optimize CSS
    optimizeCss: true,
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

  // Headers for caching and performance
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
