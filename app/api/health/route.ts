// Health endpoint, served by the Next.js managed hybrid backend.
//
// Response shape is byte-identical to the Azure Functions health endpoint it
// replaces (api/src/functions/health.ts returned `{ status: "ok" }`), because
// the CI post-deployment verification step and all incident tooling grep the
// body for `"status"`. Do not change the shape without updating those.
//
// `force-dynamic` + `Cache-Control: no-store` keep this off any edge cache, so
// a cached 200 can never masquerade as a live handler (plan Q8).
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
