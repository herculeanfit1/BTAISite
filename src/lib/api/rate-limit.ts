// Client-IP extraction for rate limiting, adapted from the Azure Functions
// helper (api/src/lib/rate-limit.ts) to read from a standard Headers object
// (NextRequest.headers) instead of an Azure HttpRequest.
//
// Order reflects the Phase 0 production finding: behind Cloudflare, the trusted
// client IP arrives clean (no port) in `cf-connecting-ip`, while
// `x-forwarded-for` is a multi-hop, client-spoofable chain whose first entry can
// carry a `:port`. Prefer cf-connecting-ip; fall back to the first XFF entry with
// its port stripped, then x-real-ip.

/** Strip a trailing `:port` from a bare IPv4 address (e.g. `1.2.3.4:5678`). Leaves IPv6 and clean IPs untouched. */
function stripPort(value: string): string {
  const m = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/.exec(value);
  return m ? m[1] : value;
}

export function getClientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf && cf.trim()) return cf.trim();

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return stripPort(first);
  }

  const real = headers.get("x-real-ip");
  if (real && real.trim()) return real.trim();

  return "unknown";
}
