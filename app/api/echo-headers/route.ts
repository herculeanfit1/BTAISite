// TEMPORARY Phase 0 spike route — REMOVE IN PHASE 3 (plan A5).
//
// Purpose: confirm empirically, through SWA + Cloudflare, that (a) the managed
// hybrid Next.js backend serves /api/* with NO linked backend, and (b) a usable
// client IP reaches the Next runtime, which Phase 3's rate limiter depends on.
//
// Safety (plan A5): this returns request header NAMES and the VALUES of the
// client-IP headers ONLY. It never returns the value of any other header, so no
// cookies and no authorization material can leak. A per-request timestamp lets
// two calls prove the handler actually executed rather than being edge-cached
// (plan Q8).
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The only header values safe to echo — none carry credentials. Used by the
// ported rate limiter to derive the client IP behind SWA + Cloudflare.
const CLIENT_IP_HEADERS = [
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "true-client-ip",
  "forwarded",
] as const;

type IpHeaderName = (typeof CLIENT_IP_HEADERS)[number];

export function GET(request: NextRequest) {
  const headerNames = Array.from(request.headers.keys()).sort();

  // Built via Object.fromEntries (not dynamic bracket assignment) so the values
  // come only from the fixed allow-list above.
  const clientIp = Object.fromEntries(
    CLIENT_IP_HEADERS.map(
      (name) => [name, request.headers.get(name)] as const,
    ).filter(
      (entry): entry is readonly [IpHeaderName, string] => entry[1] !== null,
    ),
  );

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      headerNames,
      clientIp,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
