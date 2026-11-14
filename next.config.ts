import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Switch to Content-Security-Policy once the console shows no violations.
const cspHeader = `default-src 'self'; img-src 'self' data: https://images.unsplash.com; media-src 'self' https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`;

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.4', 'localhost:5500', '192.168.4.6'],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '200kb',
      allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : undefined,
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Switch to Content-Security-Policy once the console shows no violations.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
