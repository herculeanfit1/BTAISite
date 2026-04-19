import { HttpRequest, HttpResponseInit } from "@azure/functions";

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const ipStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipStore.entries()) {
    if (entry.resetTime < now) {
      ipStore.delete(ip);
    }
  }
}, 1000 * 60 * 10);

export function getClientIp(request: HttpRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig,
): HttpResponseInit | null {
  const now = Date.now();

  let entry = ipStore.get(ip);

  if (!entry) {
    entry = { count: 0, resetTime: now + config.windowMs };
    ipStore.set(ip, entry);
  }

  if (entry.resetTime < now) {
    entry.count = 0;
    entry.resetTime = now + config.windowMs;
  }

  entry.count++;

  if (entry.count > config.limit) {
    const remainingSec = Math.ceil((entry.resetTime - now) / 1000);
    return {
      status: 429,
      jsonBody: {
        success: false,
        message:
          config.message ||
          `Too many requests, please try again after ${remainingSec} seconds.`,
      },
      headers: {
        "Retry-After": remainingSec.toString(),
        "X-RateLimit-Limit": config.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(entry.resetTime / 1000).toString(),
      },
    };
  }

  return null;
}
