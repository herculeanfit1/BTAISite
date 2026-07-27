// Client-IP extraction and the shared bounded rate-limit store.
//
// Client identity is attacker-influenced by construction: `x-forwarded-for` is a
// chain the client can prefill. The old parser took the LEFTMOST entry, which is
// precisely the value a client controls — so rotating one header defeated every
// per-IP limit and wrote attacker-chosen strings into the `submission_ip` field
// of both HubSpot and the classification queue.
//
// This parser walks the chain from the RIGHT and returns the first PUBLIC
// address. Infrastructure appends as a request travels inward, so the rightmost
// entries are the ones added closest to the origin and the leftmost is whatever
// the client invented.
//
// Why this is safe even if the platform does not append: if the chain is passed
// through verbatim, the rightmost value is attacker-chosen — exactly as the
// leftmost was before. This change is never worse than what it replaces, and is
// materially better whenever a hop appends.

/** Strip a trailing `:port` from a bare IPv4 address, or from a bracketed IPv6 `[::1]:port`. */
function stripPort(value: string): string {
  const v4 = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/.exec(value);
  if (v4) return v4[1];
  const v6 = /^\[([0-9a-fA-F:]+)\](?::\d+)?$/.exec(value);
  if (v6) return v6[1];
  return value;
}

/**
 * True for addresses that cannot identify an internet client: loopback, private
 * ranges, link-local, and IPv6 unique-local. A proxy hop inside the platform
 * network shows up as one of these, so they are skipped when walking the chain.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if ([a, b, Number(v4[3]), Number(v4[4])].some((n) => n > 255)) return true;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a >= 224) return true; // multicast + reserved
    return false;
  }

  const lower = ip.toLowerCase();
  if (!lower.includes(":")) return true; // neither IPv4 nor IPv6 — not a usable identity
  if (lower === "::1" || lower === "::") return true;
  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true; // fc00::/7 unique-local
  if (/^fe[89ab][0-9a-f]:/.test(lower)) return true; // fe80::/10 link-local
  return false;
}

/** Rightmost public entry of an `x-forwarded-for` chain, or null if there is none. */
export function rightmostPublicXff(xff: string): string | null {
  const parts = xff
    .split(",")
    .map((p) => stripPort(p.trim()))
    .filter(Boolean);

  for (const candidate of parts.reverse()) {
    if (!isPrivateOrReservedIp(candidate)) return candidate;
  }
  return null;
}

export function getClientIp(headers: Headers): string {
  // Cloudflare fronts the apex and overwrites this header on every request it
  // proxies. Kept first because that is the path real users take.
  const cf = headers.get("cf-connecting-ip");
  if (cf && cf.trim()) return cf.trim();

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const best = rightmostPublicXff(xff);
    if (best) return best;
  }

  const real = headers.get("x-real-ip");
  if (real && real.trim()) return real.trim();

  return "unknown";
}

// ── Shared bounded rate-limit store ──────────────────────────────────
//
// One implementation, several configs. Previously each limiter kept its own
// module-level Map with no eviction, so every distinct identity was remembered
// forever — and since identity was attacker-controlled, an attacker could grow
// the map without bound on a memory-metered plan. The cap makes that a fixed
// cost instead of a lever.

/** Hard ceiling on tracked identities. Oldest insertion is evicted at the cap. */
export const MAX_TRACKED_IDENTITIES = 10_000;

interface Bucket {
  count: number;
  resetTime: number;
}

const stores = new Map<string, Map<string, Bucket>>();

function storeFor(namespace: string): Map<string, Bucket> {
  let s = stores.get(namespace);
  if (!s) {
    s = new Map();
    stores.set(namespace, s);
  }
  return s;
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  /** Separate namespaces keep one limiter's traffic from evicting another's. */
  namespace: string;
}

/**
 * Record a hit and report whether the caller is over its limit.
 *
 * Fail-open for `"unknown"`: a proxy that strips client-IP headers must not
 * cause every visitor behind it to share one bucket and lock each other out.
 */
export function isRateLimited(key: string, config: RateLimitConfig): boolean {
  if (key === "unknown") return false;

  const store = storeFor(config.namespace);
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetTime) {
    // Evict expired entries opportunistically, then enforce the cap. Map
    // iterates in insertion order, so the first key is the oldest.
    if (store.size >= MAX_TRACKED_IDENTITIES) {
      for (const [k, v] of store) {
        if (now > v.resetTime) store.delete(k);
      }
      while (store.size >= MAX_TRACKED_IDENTITIES) {
        const oldest = store.keys().next();
        if (oldest.done) break;
        store.delete(oldest.value);
      }
    }
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return false;
  }

  if (existing.count >= config.limit) return true;

  existing.count++;
  return false;
}

/** Test seam: current tracked-identity count for a namespace. */
export function trackedIdentityCount(namespace: string): number {
  return stores.get(namespace)?.size ?? 0;
}

/** Test seam: drop all state for a namespace. */
export function resetRateLimitStore(namespace: string): void {
  stores.delete(namespace);
}
