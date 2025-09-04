/**
 * Next.js Middleware for Static Export Compatibility
 *
 * IMPORTANT: This middleware is designed to be compatible with 'output: export' in next.config.js.
 * It provides minimal functionality that works in static export mode, with all security headers
 * moved to staticwebapp.config.json.
 * 
 * For server-side middleware functionality, see middleware.ts.bak-hybrid
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware function compatible with static exports
 * 
 * Note: In static export mode, this middleware only runs during development,
 * not in the final static build. All production security headers are handled
 * by staticwebapp.config.json.
 */
export function middleware(request: NextRequest) {
  // Get the default response
  const response = NextResponse.next();
  
  // Add development header only in development environment
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Development-Mode', 'true');
    // Log the request path to utilize the request parameter
    console.warn(`Processing request to: ${request.nextUrl.pathname}`);
  }
  
  return response;
}

// Only run on minimal paths in development, as middleware is ignored in static exports
export const config = {
  matcher: [
    // Only match root path in development for minimal overhead
    '/'
  ],
}; 