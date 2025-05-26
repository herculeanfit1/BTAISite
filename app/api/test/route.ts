import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../../../lib/rate-limit";

/**
 * Simple test endpoint that returns a success response
 * This is used for testing rate limiting and other security features
 */
async function handler(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Test API endpoint working successfully",
    timestamp: new Date().toISOString(),
    method: request.method,
  });
}

// Apply rate limiting: 3 requests per 10 seconds for easy testing
export const GET = withRateLimit(handler, {
  limit: 3,
  windowMs: 10 * 1000, // 10 seconds
  message:
    "Too many requests to test endpoint. Please try again in a few seconds.",
});

// Also implement POST for testing form submissions
export const POST = withRateLimit(handler, {
  limit: 3,
  windowMs: 10 * 1000, // 10 seconds
  message:
    "Too many requests to test endpoint. Please try again in a few seconds.",
});

// Make this file compatible with static exports by setting it to force-static instead of force-dynamic
// This is needed for Azure Static Web Apps

export const dynamic = "force-static";
