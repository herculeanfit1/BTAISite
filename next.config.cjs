/**
 * Next.js Configuration for Bridging Trust AI website
 *
 * This configuration is optimized for Next.js 15 and Tailwind CSS v4.
 *
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  // Enable React strict mode for better development experience and to catch potential issues
  reactStrictMode: true,

  // Remove the X-Powered-By header to reduce response size and hide server info
  poweredByHeader: false,

  // Enable HTTP compression for better performance
  compress: true,

  // Enabling static export configuration
  output: 'export',
  // skipTrailingSlashRedirect: true,
  // skipMiddlewareUrlNormalize: true,
  // trailingSlash: false,

  // Handle specific build-time route exclusions 
  // This helps prevent the build from trying to render pages that can't be generated statically
  distDir: process.env.NEXT_PUBLIC_DIST_DIR || '.next',

  // Optimize images for better performance and Core Web Vitals
  images: {
    unoptimized: true, // Required for static export compatibility
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline'",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev.bridgingtrust.local',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'bridgingtrust.ai',
      },
      {
        protocol: 'https',
        hostname: 'www.bridgingtrust.ai',
      }
    ],
  },

  /**
   * TypeScript type checking during builds
   * 
   * Re-enabled as part of security improvements.
   * See docs/security-improvements.md for details.
   */
  typescript: {
    // Re-enabled type checking for enhanced security and code quality
    ignoreBuildErrors: false,
  },

  /**
   * ESLint checking during builds
   * 
   * We allow ESLint warnings but fail on errors.
   * See docs/security-improvements.md for details on the plan to fix all ESLint issues.
   */
  eslint: {
    // Don't fail the build on ESLint warnings, but still report them
    ignoreDuringBuilds: false,
  },

  // Enable CSS optimization experiments
  experimental: {
    optimizeCss: true,
  },

  // Configure webpack for custom optimizations
  webpack(config) {
    return config;
  },
};

module.exports = nextConfig; 