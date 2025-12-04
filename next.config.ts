import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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