import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  experimental: {
    serverActions: {
      bodySizeLimit: '100gb'
    },
    middlewareClientMaxBodySize: '100gb',
  },
  
  serverExternalPackages: ['@prisma/client'],
  
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
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache optimized images
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
          ],
        }
      ] : []),
    ];
  },
};

export default nextConfig;