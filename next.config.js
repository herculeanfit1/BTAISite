/**
 * Next.js Configuration for Bridging Trust AI website
 *
 * This configuration is optimized for Next.js 15 and Tailwind CSS v4.
 *
 * @type {import('next').NextConfig}
 */

// Import process from node:process for ESM compatibility
import { env } from "node:process";

/**
 * Content Security Policy.
 *
 * Delivered from here because staticwebapp.config.json's `globalHeaders` is
 * silently ignored by the Azure Static Web Apps Next.js hybrid adapter — the
 * site served no CSP at all until this was added. (Redirects in that file DO
 * work and stay there; only response headers moved.)
 *
 * Two deliberate relaxations, both forced by the current codebase:
 *
 *  - script-src 'unsafe-inline': Next's inline bootstrap scripts run on the
 *    statically prerendered routes and there is no working nonce path — the
 *    middleware that once generated nonces never executed in this runtime.
 *    Removing it blanks the site.
 *  - style-src 'unsafe-inline': components use inline `style=` attributes
 *    throughout. Migrating those to Tailwind utilities would let this tighten.
 *
 * The Google Analytics and Application Insights hosts are pre-allowed so the
 * deferred analytics work needs no CSP change when it lands. Neither service
 * currently loads.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.applicationinsights.azure.com https://*.monitor.azure.com",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/**
 * Deliberately no Strict-Transport-Security: the hosting platform already
 * serves `max-age=31536000; includeSubDomains`. Emitting a second, differing
 * HSTS header is worse than emitting none.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig = {
  // Enable React strict mode for better development experience and to catch potential issues
  reactStrictMode: true,

  // Security response headers for every route. See CONTENT_SECURITY_POLICY above.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },

  // Remove the X-Powered-By header to reduce response size and hide server info
  poweredByHeader: false,

  // Enable HTTP compression for better performance
  compress: true,

  // Removed static export to enable API routes for email functionality
  // This allows Next.js API routes to work properly with Azure Static Web Apps

  // Handle specific build-time route exclusions
  // This helps prevent the build from trying to render pages that can't be generated statically
  distDir: process.env.NEXT_PUBLIC_DIST_DIR || ".next",

  // Optimize images for better performance and Core Web Vitals
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline'",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev.bridgingtrust.local",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "bridgingtrust.ai",
      },
      {
        protocol: "https",
        hostname: "www.bridgingtrust.ai",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  // Enable CSS optimization experiments
  experimental: {
    // optimizeCss: false, // Disable this to avoid lightningcss issues
  },

  // Configure webpack for custom optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },

  env: {
    NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES: process.env.NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES || 'false',
  },
};

export default nextConfig;
