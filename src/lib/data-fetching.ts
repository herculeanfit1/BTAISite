// This file provides utility functions for server-side data fetching
// with revalidation strategies

// Define options type for data fetching
type FetchOptions = {
  // Time in seconds for cache revalidation (ISR)
  revalidate?: number | false;
  // Force cache usage or bypass
  cache?: "force-cache" | "no-store";
  // HTTP request options
  requestOptions?: RequestInit;
};

// Default options
const defaultOptions: FetchOptions = {
  revalidate: 3600, // Default revalidation: 1 hour
  cache: "force-cache",
};

/**
 * Fetches data from an API with proper caching and revalidation
 * @param url The URL to fetch from
 * @param options Fetch options including revalidation strategy
 * @returns The parsed JSON data
 */
export async function fetchData<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  // Merge with default options
  const mergedOptions = { ...defaultOptions, ...options };

  const { revalidate, cache, requestOptions } = mergedOptions;

  // Prepare cache options for Next.js
  const nextOptions: RequestInit & { next?: { revalidate?: number | false } } =
    {
      ...requestOptions,
    };

  // Set Next.js cache behavior
  if (revalidate !== undefined) {
    nextOptions.next = { revalidate };
  }

  if (cache) {
    nextOptions.cache = cache as RequestCache;
  }

  try {
    const response = await fetch(url, nextOptions);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
}

/**
 * Fetches data with no caching (for dynamic or personalized data)
 * @param url The URL to fetch from
 * @param requestOptions Additional fetch options
 * @returns The parsed JSON data
 */
export async function fetchDynamicData<T>(
  url: string,
  requestOptions: RequestInit = {}
): Promise<T> {
  return fetchData<T>(url, {
    cache: "no-store",
    requestOptions,
  });
}

/**
 * Fetches data with ISR caching
 * @param url The URL to fetch from
 * @param revalidate Time in seconds for revalidation
 * @param requestOptions Additional fetch options
 * @returns The parsed JSON data
 */
export async function fetchRevalidatedData<T>(
  url: string,
  revalidate: number = 3600,
  requestOptions: RequestInit = {}
): Promise<T> {
  return fetchData<T>(url, {
    revalidate,
    requestOptions,
  });
}
