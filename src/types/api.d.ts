/**
 * Type definitions for API responses and requests
 */

// Type for generic API responses with success/error status and data
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Type for handling contact form submissions
interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  phone?: string;
  honeypot?: string;
}

// Type for newsletter subscription data
interface NewsletterData {
  email: string;
  name?: string;
  honeypot?: string;
}

// Type for validating form data with error messages
interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

// Type for API route handlers with rate limiting
interface RateLimitedResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

// Type for image optimization configuration
interface ImageOptimizationConfig {
  sizes: string;
  deviceSizes: number[];
  imageSizes: number[];
  domains: string[];
  formats: string[];
  dangerouslyAllowSVG: boolean;
  contentSecurityPolicy: string;
  remotePatterns: {
    protocol: string;
    hostname: string;
    port?: string;
    pathname?: string;
  }[];
}

// Type for blog article metadata
interface BlogArticleMetadata {
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
  image?: string;
  slug: string;
}
