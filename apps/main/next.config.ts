// apps/main/next.config.ts
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
  //prod ready settings
  reactStrictMode: true,

  // Development settings
  ...(process.env.NODE_ENV === 'development' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: false,
    },
  }),

  // Tambahkan untuk production deployment
  ...(process.env.NODE_ENV === 'production' && {
    typescript: {
      ignoreBuildErrors: true, // ← Tambah ini
    },
    eslint: {
      ignoreDuringBuilds: true, // ← Tambah ini
    },
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
  }),
}

export default nextConfig;