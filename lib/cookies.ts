import { cookies, type UnsafeUnwrappedCookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Cookie options with security defaults
 */
export interface SecureCookieOptions
  extends Omit<ResponseCookie, "name" | "value"> {
  // Override defaults if needed
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

// Default secure cookie options
const DEFAULT_SECURE_OPTIONS: SecureCookieOptions = {
  httpOnly: true, // Prevents JavaScript from reading the cookie
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // Restricts sending cookies with cross-origin requests
  path: "/", // Cookie available across the entire site
  maxAge: 60 * 60 * 24 * 7, // Default to 1 week
};

/**
 * Set a cookie with secure defaults
 * @param name Cookie name
 * @param value Cookie value
 * @param options Override default options
 */
export function setSecureCookie(
  name: string,
  value: string,
  options: SecureCookieOptions = {},
): void {
  const cookieStore = cookies() as unknown as UnsafeUnwrappedCookies;

  // Merge default options with provided options
  const cookieOptions = {
    ...DEFAULT_SECURE_OPTIONS,
    ...options,
  };

  // Set the cookie
  cookieStore.set(name, value, cookieOptions);
}

/**
 * Get a cookie value
 * @param name Cookie name
 * @returns Cookie value or undefined if not found
 */
export function getCookie(name: string): string | undefined {
  const cookieStore = cookies() as unknown as UnsafeUnwrappedCookies;
  const cookie = cookieStore.get(name);
  return cookie?.value;
}

/**
 * Delete a cookie
 * @param name Cookie name
 * @param options Cookie options (path must match the one used when setting)
 */
export function deleteCookie(
  name: string,
  options: SecureCookieOptions = {},
): void {
  const cookieStore = cookies() as unknown as UnsafeUnwrappedCookies;

  // Merge default path with provided options
  const cookieOptions = {
    path: DEFAULT_SECURE_OPTIONS.path,
    ...options,
    // Set max age to 0 to delete the cookie
    maxAge: 0,
  };

  // Set empty value with immediate expiration to delete
  cookieStore.set(name, "", cookieOptions);
}

/**
 * Create a consent cookie (for analytics, marketing, etc.)
 * @param consentType Type of consent (analytics, marketing, etc.)
 * @param value true for granted, false for denied
 */
export function setConsentCookie(consentType: string, value: boolean): void {
  setSecureCookie(`consent_${consentType}`, value ? "true" : "false", {
    // Consent cookies should last longer (6 months)
    maxAge: 60 * 60 * 24 * 180,
  });
}

/**
 * Check if a specific consent has been granted
 * @param consentType Type of consent to check
 * @returns true if consent granted, false otherwise
 */
export function hasConsent(consentType: string): boolean {
  const value = getCookie(`consent_${consentType}`);
  return value === "true";
}

/**
 * Parse cookies from a string (for client-side use)
 * @param cookieString The document.cookie string
 * @returns Object with cookie name-value pairs
 */
export function parseClientCookies(
  cookieString: string,
): Record<string, string> {
  return cookieString
    .split(";")
    .map((v) => v.split("="))
    .reduce(
      (acc, [key, value]) => {
        if (key && value) {
          acc[decodeURIComponent(key.trim())] = decodeURIComponent(
            value.trim(),
          );
        }
        return acc;
      },
      {} as Record<string, string>,
    );
}
