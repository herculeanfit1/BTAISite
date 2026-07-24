// Status endpoint, ported from the Azure Functions app (api/src/functions/status.ts).
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const startTime = Date.now();

export function GET(request: NextRequest): NextResponse {
  return NextResponse.json(
    {
      status: "online",
      environment: process.env.NODE_ENV || "production",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
      uptime: (Date.now() - startTime) / 1000,
      // TEMPORARY diagnostic (preview-safety investigation) — removed before merge.
      _diag: {
        host: request.headers.get("host"),
        xForwardedHost: request.headers.get("x-forwarded-host"),
        xOriginalHost: request.headers.get("x-original-host"),
        xForwardedFor: request.headers.get("x-forwarded-for"),
        previewBuildFlag: process.env.PREVIEW_BUILD ?? null,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
