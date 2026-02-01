import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ferf1mheo22r9ira.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Optimize images for faster loading
    formats: ['image/avif', 'image/webp'],
  },

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Optimize production builds
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ⚡ PERFORMANCE: Experimental features for better performance
  experimental: {
    // Enable optimistic client cache
    optimisticClientCache: true,

    // ⚡ PERFORMANCE: Optimize package imports to reduce bundle size
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
    
    // ⚡ PERFORMANCE: Use separate worker for webpack builds (faster builds)
    webpackBuildWorker: true,

    // Enable partial prerendering (if using Next.js 14+)
    // ppr: true,
  },

  // ⚡ PERFORMANCE: Turbopack configuration
  // Turbopack (Next.js 16 default) handles chunk splitting and optimization automatically
  // No custom webpack config needed - Turbopack is faster and more efficient!
  turbopack: {},
}

export default config