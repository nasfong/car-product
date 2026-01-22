import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  experimental: {
    serverActions: {
      bodySizeLimit: '100gb'
    },
    proxyClientMaxBodySize: '100gb',
  },
  
  serverExternalPackages: ['@prisma/client'],
  
  // Next.js 16 uses SWC by default for minification
  webpack: (config, { dev }) => {
    if (!dev) {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    return config;
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'cdn.nasfong.site',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Changed from 1 year - too aggressive
    // Only unoptimize in dev, optimize in production
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Enable compression
  compress: true,
  
  // Turbopack configuration (Next.js 16+ default)
  turbopack: {
    // Add any Turbopack-specific config here if needed
  },
  
  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production' 
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production'
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // Cache optimized images
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production'
              ? 'public, max-age=31536000, immutable'
              : 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // Cache HTML pages (ISR with 60s revalidation)
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=120'
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=120'
          },
        ],
      },
      // Security headers for production
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            },
            {
              key: 'Accept-Encoding',
              value: 'gzip, deflate, br'
            },
          ],
        }
      ] : []),
    ];
  },
};

export default nextConfig;