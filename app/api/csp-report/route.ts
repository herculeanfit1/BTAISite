/**
 * CSP Report API Endpoint
 *
 * This endpoint collects and logs Content Security Policy violation reports
 * as part of our security monitoring infrastructure.
 */

// Make this file compatible with static exports by setting it to force-static instead of force-dynamic
// This is needed for Azure Static Web Apps

export const dynamic = "force-static";

import { NextRequest, NextResponse } from "next/server";

/**
 * CSP Violation Report Endpoint
 *
 * This API route handles Content Security Policy violation reports sent by browsers.
 * When a browser detects a violation of the site's Content Security Policy,
 * it sends a report to this endpoint with details about the violation.
 *
 * The reports are logged for analysis and can be used to:
 * 1. Identify legitimate CSP issues that need fixing
 * 2. Detect potential XSS or injection attacks
 * 3. Fine-tune the CSP policy based on real-world usage
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the CSP report from the request body
    const body = await request.json();
    const report = body["csp-report"];

    // Log the CSP violation details
    console.warn("CSP Violation:", {
      blockedUri: report["blocked-uri"],
      violatedDirective: report["violated-directive"],
      documentUri: report["document-uri"],
      originalPolicy: report["original-policy"],
      disposition: report.disposition,
      effectiveDirective: report["effective-directive"],
      timeStamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    });

    // TODO: In production, implement more sophisticated handling:
    // - Send to logging/monitoring service
    // - Store in database for analysis
    // - Send alerts for suspicious violations

    // Return a 204 No Content response
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error processing CSP report:", error);

    // Return a generic error response
    return NextResponse.json(
      { error: "Failed to process CSP report" },
      { status: 500 }
    );
  }
}

// Configure the route handler
export const config = {
  // Disable static optimizations for this API route
  // This ensures it always runs on the server
  runtime: "edge", // Use edge runtime for best performance
  regions: ["all"], // Deploy to all regions
};
