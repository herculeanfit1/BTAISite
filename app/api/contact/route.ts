// Contact form endpoint, served by the Next.js managed hybrid backend (replaces
// the linked Azure Functions app). Thin adapter over the tested orchestration in
// src/lib/api/contact-handler.ts. Response contracts are byte-identical to the
// Functions handler — the frontend and the CI detection step both parse them.
import { NextRequest, NextResponse } from "next/server";
import { handleContact } from "@/src/lib/api/contact-handler";
import { corsHeaders } from "@/src/lib/api/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const result = await handleContact({
    method: "OPTIONS",
    headers: request.headers,
    readBody: () => request.json(),
  });
  return new NextResponse(null, {
    status: result.status,
    headers: corsHeaders(result.corsOrigin),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const result = await handleContact({
    method: "POST",
    headers: request.headers,
    readBody: () => request.json(),
  });
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { ...corsHeaders(result.corsOrigin), "Cache-Control": "no-store" },
  });
}
