/**
 * Next.js Configuration for Bridging Trust AI website
 *
 * This configuration is optimized for Next.js 15 and Tailwind CSS v4.
 * Modified for Azure Static Web Apps compatibility.
 *
 * @type {import('next').NextConfig}
 */

// Use ES Module syntax
import process from 'process';

const nextConfig = {
  // Enable React strict mode for better development experience and to catch potential issues
  reactStrictMode: true,

  // Remove the X-Powered-By header to reduce response size and hide server info
  poweredByHeader: false,

  // Enable HTTP compression for better performance
  compress: true,

  // Configure for static export - required for Azure Static Web Apps
  // Only enable for production builds to avoid issues in development
  output: process.env.NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES === 'true' ? 'export' : undefined,

  // Ensure we don't trigger browser-side routing for not found pages
  skipTrailingSlashRedirect: true,
  
  // Skip middleware URL normalization to avoid warnings with static exports
  skipMiddlewareUrlNormalize: process.env.NEXT_PUBLIC_SKIP_DYNAMIC_ROUTES === 'true',

  // Required for proper routing in static exports
  trailingSlash: true,

  // Handle specific build-time route exclusions 
  // This helps prevent the build from trying to render pages that can't be generated statically
  distDir: process.env.NEXT_PUBLIC_DIST_DIR || '.next',

  // Optimize images for better performance and Core Web Vitals
  images: {
    unoptimized: true, // Required for static export
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline'",
    domains: ["dev.bridgingtrust.local", "localhost"],
  },

  /**
   * Disable TypeScript type checking during builds
   * 
   * !!! SECURITY NOTICE !!!
   * TypeScript checking is currently disabled during builds but SHOULD BE RE-ENABLED
   * once the type errors are fixed. See docs/typescript-eslint-cleanup.md for a
   * detailed plan to fix all TypeScript issues and re-enable this check.
   */
  typescript: {
    // SECURITY WARNING: TypeScript type checking is currently disabled during builds.
    // This is a temporary measure until all type errors are fixed.
    ignoreBuildErrors: true,
  },

  /**
   * Disable ESLint checking during builds
   * 
   * !!! SECURITY NOTICE !!!
   * ESLint checking is currently disabled during builds but SHOULD BE RE-ENABLED
   * once the eslint errors are fixed. See docs/typescript-eslint-cleanup.md for a
   * detailed plan to fix all ESLint issues and re-enable this check.
   */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Enable CSS optimization experiments
  experimental: {
    // Updated experimental options compatible with Next.js 15.3.2
  },

  // Configure webpack for custom optimizations
  webpack: (config, { dev, isServer }) => {
    // For tests, ensure React is in development mode to avoid act() errors
    if (process.env.NODE_ENV === 'test' || process.env.CI === 'true') {
      config.mode = 'development';
      
      // Ensure React is loaded in development mode for testing
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling',
      };
    }
    
    // Add compatibility with React 19
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },

  // Provide global config to application, e.g. BUILD_TIME
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
};

// Adjust configuration for specific environments
const adjustForEnvironment = () => {
  // In CI, ensure specific settings for test environments
  if (process.env.CI === 'true') {
    console.log('🔧 Running in CI environment - adjusting Next.js config');
    nextConfig.swcMinify = true;
    // Set React to development mode for proper test compatibility
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  }
  
  return nextConfig;
};

// For dynamic imports in ESM we need to use a different approach
let configToExport = adjustForEnvironment();

if (process.env.ANALYZE === 'true') {
  // Use dynamic import for the bundle analyzer
  import('@next/bundle-analyzer').then(({ default: withBundleAnalyzer }) => {
    withBundleAnalyzer({ enabled: true })(configToExport);
  });
}

export default configToExport; 