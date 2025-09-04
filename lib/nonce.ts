import { headers } from 'next/headers';

/**
 * Get the CSP nonce for the current request
 * This can only be used in Server Components
 */
export async function getNonce(): Promise<string> {
  const headersList = await headers();
  const nonce = headersList.get('x-csp-nonce');
  
  if (!nonce) {
    // Fallback nonce for development or edge cases
    console.warn('No CSP nonce found in headers, using fallback');
    return 'fallback-nonce-' + Math.random().toString(36).substr(2, 9);
  }
  
  return nonce;
}
