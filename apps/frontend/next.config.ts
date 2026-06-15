import type { NextConfig } from 'next';
import path from 'path';

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

const nextConfig: NextConfig = {
  // ── Build settings ──────────────────────────────────────────────────────────
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  transpilePackages: ['framer-motion'],

  // ── Performance: Enable gzip/brotli response compression ────────────────────
  compress: true,

  // ── Security: Remove the X-Powered-By header ────────────────────────────────
  poweredByHeader: false,

  // ── Workspace: pin tracing root to suppress workspace warning ───────────────
  outputFileTracingRoot: path.join(__dirname, '..', '..'),

  // ── Turbopack dev server root ───────────────────────────────────────────────
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },

  // ── Optimize heavy package imports (tree-shake barrel exports) ──────────────
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@tanstack/react-query',
    ],
  },

  devIndicators: false,

  // ── Image optimization ───────────────────────────────────────────────────────
  images: {
    // Serve modern AVIF first (40-50% smaller than WebP), fall back to WebP
    formats: ['image/avif', 'image/webp'],
    // Cover all standard screen widths including 4K
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Responsive image sizes for layout-aware rendering
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum TTL for cached optimized images (1 hour)
    minimumCacheTTL: 3600,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000' },
      { protocol: 'http', hostname: 'localhost', port: '4000' },
    ],
  },

  // ── HTTP Headers ─────────────────────────────────────────────────────────────
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    return [
      {
        // In production: cache static assets aggressively (1 year, immutable).
        // In development: no caching so HMR/updated chunks are always fetched fresh.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev
              ? 'no-store, no-cache, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Never cache auth API endpoints
        source: '/api/auth/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },

  // ── API proxy rewrites ────────────────────────────────────────────────────────
  async rewrites() {
    return {
      fallback: [
        { source: '/api/core/:path*', destination: `${backendUrl}/api/:path*` },
        { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
        { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` },
      ]
    };
  },

  // ── Redirects for legacy/missing top-level routes ───────────────────────────
  async redirects() {
    return [
      {
        source: '/tickets',
        destination: '/core/tickets',
        permanent: false,
      },
      {
        source: '/analytics',
        destination: '/core/analytics',
        permanent: false,
      },
      {
        source: '/registrations',
        destination: '/core/registrations',
        permanent: false,
      },
      {
        source: '/events/create',
        destination: '/core/events/create',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
