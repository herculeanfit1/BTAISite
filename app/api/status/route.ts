// Status endpoint, ported from the Azure Functions app (api/src/functions/status.ts).
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const startTime = Date.now();

export function GET(): NextResponse {
  return NextResponse.json(
    {
      status: "online",
      environment: process.env.NODE_ENV || "production",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
      uptime: (Date.now() - startTime) / 1000,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
