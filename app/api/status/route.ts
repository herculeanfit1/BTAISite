import { NextResponse } from "next/server";

/**
 * @route GET /api/status
 * @desc Returns the API status and basic system information
 * @access Public
 */
export async function GET() {
  const status = {
    status: "online",
    environment: process.env.NEXT_PUBLIC_ENV || "development",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    uptime: process.uptime(),
  };

  return NextResponse.json(status, { status: 200 });
}

// Add dynamic export for static generation
export const dynamic = "force-static";
