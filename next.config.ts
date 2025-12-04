import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    },
    proxyClientMaxBodySize: '50mb'
  },
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minio.nasfong.site',
      },
      {
        protocol: 'https',
        hostname: 'minio-api.nasfong.site',
      },
    ],
  },
};

export default nextConfig;