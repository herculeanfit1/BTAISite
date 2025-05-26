import { NextRequest, NextResponse } from "next/server";

// Define interface for rate limiting configuration
export interface RateLimitConfig {
  limit: number; // Maximum number of requests
  windowMs: number; // Time window in milliseconds
  message?: string; // Custom error message
}

// Rate limit entry type
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Use a Map instead of plain object for more secure property access
const ipStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 1000 * 60 * 10; // 10 minutes
setInterval(() => {
  const now = Date.now();
  // Safely iterate through Map entries
  for (const [ip, entry] of ipStore.entries()) {
    if (entry.resetTime < now) {
      ipStore.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limiting middleware for API routes
 * @param config Rate limiting configuration
 * @returns A function that implements rate limiting
 */
export function rateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(request: NextRequest) {
    // Get client IP - use X-Forwarded-For in production
    // Note: request.ip is deprecated in Next.js 15+
    let ip = request.headers.get("x-forwarded-for") || "unknown-ip";

    // If we're behind a proxy, get the real IP
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // Create a rate limit identifier (IP-based in this example)
    // For production, consider combining IP with other factors
    const identifier = ip;

    // Current timestamp
    const now = Date.now();

    // Get existing entry or create a new one
    let entry = ipStore.get(identifier);

    // Initialize tracking for new IPs
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      ipStore.set(identifier, entry);
    }

    // Reset count if the time window has passed
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.limit) {
      const remainingMs = entry.resetTime - now;
      const remainingSec = Math.ceil(remainingMs / 1000);

      return NextResponse.json(
        {
          success: false,
          message:
            config.message ||
            `Too many requests, please try again after ${remainingSec} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": remainingSec.toString(),
            "X-RateLimit-Limit": config.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(entry.resetTime / 1000).toString(),
          },
        }
      );
    }

    // Return null to continue to the API route
    return null;
  };
}

/**
 * Applies rate limiting to an API route handler
 * @param handler The original API route handler
 * @param config Rate limiting configuration
 * @returns A new handler with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: RateLimitConfig
) {
  return async function rateLimitHandler(request: NextRequest) {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(config)(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Continue to the original handler if not rate limited
    return handler(request);
  };
}
