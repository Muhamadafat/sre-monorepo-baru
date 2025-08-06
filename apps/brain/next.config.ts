// apps/brain/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan allowedDevOrigins untuk mengatasi warning
  // allowedDevOrigins: process.env.NODE_ENV === 'development' ? [
  //   'http://localhost:3000',
  //   'http://localhost:3001', 
  //   'http://brain.lvh.me:3001',
  //   'http://main.lvh.me:3000',
  //   'brain.lvh.me:3001',
  //   'main.lvh.me:3000',
  // ] : undefined,

  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://brain.lvh.me:3001',
      'http://main.lvh.me:3000',
      'brain.lvh.me:3001',
      'main.lvh.me:3000',
    ]
  }),

  reactStrictMode: true,
  transpilePackages: ['@sre-monorepo/lib', '@sre-monorepo/components'],

  // Production-ready settings
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
  }),
  
  // Headers configuration untuk CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' 
              ? 'http://main.lvh.me:3000,http://brain.lvh.me:3001' 
              : 'https://yourdomain.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      }
    ]
  },

  // Development settings
  ...(process.env.NODE_ENV === 'development' && {
    typescript: {
      ignoreBuildErrors: false,
    },
    eslint: {
      ignoreDuringBuilds: false,
    },
  }),
}

export default nextConfig;